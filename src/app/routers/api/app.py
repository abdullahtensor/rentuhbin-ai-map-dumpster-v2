"""FastAPI for combining the SAM and dumpster placement code"""
import os
import math

# pylint: disable=E1101
import cv2  # type: ignore
import numpy as np
import supervision as sv  # type: ignore

# import uvicorn
import torch  # type: ignore
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator  # type: ignore

# from fastapi import FastAPI
from fastapi import File, UploadFile, HTTPException, Form  # type: ignore

# from fastapi.responses import StreamingResponse  # type: ignore
from fastapi.responses import JSONResponse
from fastapi import APIRouter  # type: ignore
from enum import Enum


class PlacementError(Enum):
    HEIGHT_TOO_SMALL = "Height should be greater than or equal to 2"
    WIDTH_TOO_SMALL = "Width should be greater than or equal to 2"
    HEIGHT_TOO_LARGE = "Height should be less than or equal to 40"
    WIDTH_TOO_LARGE = "Width should be less than or equal to 40"
    COORDINATES_TOO_SMALL = "Coordinates should be greater than or equal to 0"
    COORDINATES_TOO_LARGE_X = "Coordinates should be less than or equal to 450"
    COORDINATES_TOO_LARGE_Y = "Coordinates should be less than or equal to 250"
    IMAGE_NAME_NONE = "Image name cannot be None"
    NOT_DRAWING_OBJECT = "Condition Not Met: Not Drawing Object"
    TILT = "Tilt can't be greater than 90 deg or less than -90"
    DRAWING_OBJECT = "Condition Met: Drawing Object"


class PlacementStatus(Enum):
    DRAWING_OBJECT = ("Condition Met: Drawing Object", 200)
    NOT_DRAWING_OBJECT = ("Condition Not Met: Not Drawing Object", 411)
    OBJECT_CANNOT_BE_PLACED = ("Object cannot be placed entirely within the image", 412)


router = APIRouter(
    prefix="",
    tags=["Combined"],
    dependencies=[],
    responses={},
)


# Helper functions
def meters_to_yards(distance_in_meters: float) -> float:
    """
    Convert distance from meters to yards.

    Args:
    - distance_in_meters (float): Distance in meters to be converted to yards.

    Returns:
    - float: Equivalent distance in yards.
    """
    yards_conversion_factor = 1.09361
    distance_in_yards = distance_in_meters * yards_conversion_factor
    return distance_in_yards


def feet_to_meters(feet):
    """
    Convert length from feet to meters.

    Args:
    - feet (float): Length in feet to be converted to meters.

    Returns:
    - float: Equivalent length in meters.
    """
    meters = feet * 0.305
    return meters


def draw_rectangle(
    bg_image_path,
    org_path,
    height_in_feet,
    width_in_feet,
    x_coordinate,
    y_coordinate,
    tilt,
):
    """
    Draw a rectangle on an image based on given parameters.

    Args:
    - bg_image_path: Path to the background image.
    - org_path: Path to the original image.
    - height_in_feet (float): Height of the rectangle in feet.
    - width_in_feet (float): Width of the rectangle in feet.
    - x_coordinate (float): X-coordinate of the center of the rectangle.
    - y_coordinate (float): Y-coordinate of the center of the rectangle.
    - tilt (float): Tilt angle of the rectangle.

    Returns:
    - tuple: Resized image with the rectangle drawn on it and a status message.
    """
    x_coordinate = math.ceil(x_coordinate)  # Define your desired x-coordinate here
    y_coordinate = math.ceil(y_coordinate)

    height_in_feet = math.ceil(height_in_feet)  # Define your desired x-coordinate here
    width_in_feet = math.ceil(width_in_feet)

    bg_image = cv2.cvtColor(bg_image_path, cv2.COLOR_BGR2RGB)
    bg_image = cv2.resize(bg_image, (491, 255))

    org_image = cv2.cvtColor(org_path, cv2.COLOR_BGR2RGB)
    org_image = cv2.resize(org_image, (491, 255))
    purple_area = 0

    while True:
        if height_in_feet >= 3:
            purple_area = 0
            break
        if height_in_feet == 2:
            purple_area = 2
            break

    while True:
        if width_in_feet >= 3:
            purple_area = 0
            break
        if width_in_feet == 2:
            purple_area = 2
            break

    # Read the background image
    bg_image = cv2.resize(bg_image, (491, 255))

    object_height = feet_to_meters(height_in_feet)
    object_width = feet_to_meters(width_in_feet)

    image_height_pixels = bg_image.shape[0]
    image_width_pixels = bg_image.shape[1]

    object_height_meters = meters_to_yards(object_height)
    object_width_meters = meters_to_yards(object_width)

    # object_height_pixels = int(object_height_meters * (image_height_pixels / 35))
    # object_width_pixels = int(object_width_meters * (image_width_pixels / 90))
    # @10%
    # object_height_pixels =  int(object_height_meters * (image_height_pixels / 49.5))
    # object_width_pixels = int(object_width_meters * (image_width_pixels / 90))

    # @15%
    object_height_pixels = int(object_height_meters * (image_height_pixels / 46.75))
    object_width_pixels = int(object_width_meters * (image_width_pixels / 85))

    rect_center = (x_coordinate, y_coordinate)
    rect_size = (object_width_pixels, object_height_pixels)
    angle = tilt

    if (
        rect_center[0] - object_width_pixels // 2 >= 0
        and rect_center[0] + object_width_pixels // 2 <= image_width_pixels
        and rect_center[1] - object_height_pixels // 2 >= 0
        and rect_center[1] + object_height_pixels // 2 <= image_height_pixels
    ):
        start_x = rect_center[0] - object_width_pixels // 2
        end_x = rect_center[0] + object_width_pixels // 2
        start_y = rect_center[1] - object_height_pixels // 2
        end_y = rect_center[1] + object_height_pixels // 2

        roi = bg_image[start_y:end_y, start_x:end_x]
        roi_hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        lower_purple = np.array([120, 50, 50])
        upper_purple = np.array([150, 255, 255])

        purple_mask = cv2.inRange(roi_hsv, lower_purple, upper_purple)
        purple_area = np.sum(purple_mask == 255) + purple_area

        object_area_pixels = int(
            object_height_meters
            * object_width_meters
            * (image_height_pixels / 55)
            * (image_width_pixels / 100)
        )

        if purple_area >= object_area_pixels:
            rect_points = cv2.boxPoints(
                ((rect_center[0], rect_center[1]), (rect_size[0], rect_size[1]), angle)
            )
            rect_points = np.int0(rect_points)

            org = org_image
            resized_image = cv2.resize(org, (491, 255))
            resized_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)
            cv2.drawContours(
                resized_image, [rect_points], 0, (0, 255, 0), 1, cv2.LINE_AA
            )
            # status_message = "Condition Met: Drawing Object"
            status_message = PlacementError.DRAWING_OBJECT.value
            # status_code = PlacementStatus.DRAWING_OBJECT.value[1]
            placeable = "True"
            # Return the response as a dictionary
            response_dict = {
                "status_message": status_message,
                "placeable": placeable,
            }
        else:
            #     raise HTTPException(
            #     status_code=410, detail="Condition Not Met: Not Drawing Object"
            # , headers={"error-code": PlacementError.NOT_DRAWING_OBJECT.value}
            # )
            # status_message = PlacementStatus.NOT_DRAWING_OBJECT.value
            # status_message = "Condition Not Met: Not Drawing Object"
            org = org_image
            resized_image = cv2.resize(org, (491, 255))
            resized_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)

            status_message = PlacementError.NOT_DRAWING_OBJECT.value
            placeable = "False"
            # Return the response as a dictionary
            response_dict = {
                "status_message": status_message,
                "placeable": placeable,
            }

            # raise HTTPException(
            #     status_code=218,
            #     detail={
            #         "Schema": [
            #             {
            #                 "loc": ["Error code", 218],
            #                 "msg": " Condition Not Met: Not Drawing Object ",
            #                 "type": "218 No Content",
            #             }
            #         ]
            #     },
            #     # detail="Coordinates should be less than or equal to 250",
            #     headers={"error-code": PlacementError.NOT_DRAWING_OBJECT.value},
            # )

    else:
        org = org_image
        resized_image = cv2.resize(org, (491, 255))
        resized_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)
        # raise HTTPException(
        #     status_code=200,
        #     detail={
        #         "Schema": [
        #             {
        #                 "loc": ["Error code", 200],
        #                 "msg": " Condition Not Met: Not Drawing Object ",
        #                 "type": "206 Not Acceptable",
        #             }
        #         ]
        #     },
        #     # detail="Coordinates should be less than or equal to 250",
        #     headers={"error-code": PlacementStatus.OBJECT_CANNOT_BE_PLACED.value},
        # )

        status_message = PlacementError.OBJECT_CANNOT_BE_PLACED.value
        placeable = "False"
        # Return the response as a dictionary
        response_dict = {
            "status_message": status_message,
            "placeable": placeable,
        }
        # status_message = "Object cannot be placed entirely within the image"

    # return resized_image, status_message
    return response_dict


def process_image(org_image, org_image_cv2: np.ndarray) -> str:
    """Process an input image using the SAM model.

    Args:
    - org_image (str): Path to the original image file.
    - org_image_cv2 (np.ndarray): The original image in NumPy array format (BGR).

    Returns:
    - str: Path to the modified image file.
    """
    # Change the input type to np.ndarray
    home = os.getcwd()
    data_directory = os.path.abspath(os.path.join(home, ".."))
    checkpoint_path = os.path.join(
        data_directory, "data/model_weights", "sam_vit_h_4b8939.pth"
    )
    model_type = "vit_h"
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    sam = sam_model_registry[model_type](checkpoint=checkpoint_path).to(device=device)
    mask_generator = SamAutomaticMaskGenerator(sam)

    # Assuming the image is already in BGR format, no need for cv2.cvtColor
    image_rgb = cv2.cvtColor(org_image_cv2, cv2.COLOR_BGR2RGB)
    sam_result = mask_generator.generate(image_rgb)

    mask_annotator = sv.MaskAnnotator(color_lookup=sv.ColorLookup.INDEX)
    detections = sv.Detections.from_sam(sam_result=sam_result)
    annotated_image = mask_annotator.annotate(
        scene=org_image_cv2.copy(), detections=detections
    )

    masks = [
        mask["segmentation"]
        for mask in sorted(sam_result, key=lambda x: x["area"], reverse=True)
    ]
    composite_mask = np.zeros_like(masks[0], dtype=bool)
    for mask in masks:
        composite_mask |= mask

    background_mask = ~composite_mask
    modified_image = annotated_image.copy()
    background_color = [0, 0, 0]

    modified_image[composite_mask] = background_color
    modified_image[background_mask] = [128, 0, 128]  # Non-masked color
    # Save the path of the uploaded image for processing
    # return modified_image
    modified_image_path = org_image
    cv2.imwrite(modified_image_path, cv2.cvtColor(modified_image, cv2.COLOR_BGR2RGB))
    return modified_image_path


@router.post("/combined")
async def process_image_endpoint(
    org_image: UploadFile = File(...),
    height_in_feet: float = Form(...),
    width_in_feet: float = Form(...),
    x_coordinate: float = Form(...),
    y_coordinate: float = Form(...),
    tilt: float = Form(...),
):
    """
    Process an image based on provided parameters and draw a rectangle on it.

    Args:
    - org_image (UploadFile): The uploaded image file.
    - height_in_feet (float): Height of the rectangle in feet (default: 18).
    - width_in_feet (float): Width of the rectangle in feet (default: 7.5).
    - x_coordinate (float): X-coordinate for the rectangle (default: 97).
    - y_coordinate (float): Y-coordinate for the rectangle (default: 133).
    - tilt (float): Tilt angle for the rectangle (default: -15).

    Raises:
    - HTTPException: Raises HTTP 400 if input values are invalid.

    Returns:
    - StreamingResponse: A streaming response containing the processed image or
    a JSON object with the status.

    """
    # error code with enum
    if height_in_feet <= 2:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": " Height should be greater than or equal to 6 ",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            headers={"error-code": PlacementError.HEIGHT_TOO_SMALL.value},
        )

    if width_in_feet <= 2:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": " Width should be greater than or equal to 4 ",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            # detail="Width should be greater than or equal to 2",
            headers={"error-code": PlacementError.WIDTH_TOO_SMALL.value},
        )
    if height_in_feet > 30:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": " Height should be less than or equal to 30 ",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            # detail="Height should be less than or equal to 40",
            headers={"error-code": PlacementError.HEIGHT_TOO_LARGE.value},
        )

    if width_in_feet > 30:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": " Width should be less than or equal to 30 ",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            # detail="Width should be less than or equal to 40",
            headers={"error-code": PlacementError.WIDTH_TOO_LARGE.value},
        )

    if x_coordinate < 0 or y_coordinate < 0:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": " Coordinates should be greater than or equal to 0 ",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            # detail="Coordinates should be greater than or equal to 0",
            headers={"error-code": PlacementError.COORDINATES_TOO_SMALL.value},
        )

    if x_coordinate >= 450:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": " X coordinates should be less than or equal to 450 ",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            # detail="Coordinates should be less than or equal to 450",
            headers={"error-code": PlacementError.COORDINATES_TOO_LARGE_X.value},
        )

    if y_coordinate >= 250:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": " Y coordinates should be less than or equal to 250 ",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            # detail="Coordinates should be less than or equal to 250",
            headers={"error-code": PlacementError.COORDINATES_TOO_LARGE_Y.value},
        )
    if tilt < -90 or tilt > 90:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": "Tilt can't be greater than 90 deg or less than -90 deg",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            # detail="Tilt can't be greater than 90 deg or less than -90 deg",
            headers={"error-code": PlacementError.TILT.value},
        )

    org_image_name = org_image.filename  # Get the original uploaded image name

    if org_image_name is None:
        raise HTTPException(
            status_code=406,
            detail={
                "Schema": [
                    {
                        "loc": ["Error code", 406],
                        "msg": " Image name cannot be None ",
                        "type": "406 Not Acceptable",
                    }
                ]
            },
            # detail="Image name cannot be None",
            headers={"error-code": PlacementError.IMAGE_NAME_NONE.value},
        )
    home = os.getcwd()
    data_directory = os.path.abspath(os.path.join(home, ".."))

    # Save the path of the uploaded image for processing
    existing_segmented_image_path = os.path.join(
        data_directory, "data/Image_data", org_image_name
    )

    if os.path.isfile(existing_segmented_image_path):
        bg_image_cv2 = cv2.imread(existing_segmented_image_path)

        # Assuming `org_image` is the uploaded image
        org_image_data = await org_image.read()
        org_image_array = np.frombuffer(org_image_data, np.uint8)
        org_image_cv2 = cv2.imdecode(org_image_array, cv2.IMREAD_COLOR)
        # processed_image, status = draw_rectangle(
        #     bg_image_cv2,
        #     org_image_cv2,
        #     height_in_feet,
        #     width_in_feet,
        #     x_coordinate,
        #     y_coordinate,
        #     tilt,
        # )
        # if processed_image is not None:
        #     img_bytes = cv2.imencode(".png", processed_image)[1].tobytes()
        #     headers = {
        #         "status": str(status)
        #     }  # Convert status to string if it's not already a string
        #     return StreamingResponse(
        #         io.BytesIO(img_bytes),
        #         media_type="image/png",
        #         status_code=200,
        #         headers=headers,
        #     )
        # return {"status": status}
        processed_result = draw_rectangle(
            bg_image_cv2,
            org_image_cv2,
            height_in_feet,
            width_in_feet,
            x_coordinate,
            y_coordinate,
            tilt,
        )

        return JSONResponse(content=processed_result)

    # If the existing segmented image doesn't exist, process the uploaded image
    org_image_data = await org_image.read()
    org_image_array = np.frombuffer(org_image_data, np.uint8)
    org_image_cv2 = cv2.imdecode(
        org_image_array, cv2.IMREAD_COLOR
    )  # Decode the uploaded image

    # Process the original image and get the modified image path
    modified_image_path = process_image(existing_segmented_image_path, org_image_cv2)

    # Read the processed image to create bg_image
    bg_image_cv2 = cv2.imread(modified_image_path)
    processed_result = draw_rectangle(
        bg_image_cv2,
        org_image_cv2,
        height_in_feet,
        width_in_feet,
        x_coordinate,
        y_coordinate,
        tilt,
    )

    return JSONResponse(content=processed_result)

    # processed_image, status = draw_rectangle(
    #     bg_image_cv2,
    #     org_image_cv2,
    #     height_in_feet,
    #     width_in_feet,
    #     x_coordinate,
    #     y_coordinate,
    #     tilt,
    # )

    # if processed_image is not None:
    #     img_bytes = cv2.imencode(".png", processed_image)[1].tobytes()
    #     return StreamingResponse(
    #         io.BytesIO(img_bytes),
    #         media_type="image/png",
    #         status_code=200,
    #         headers={"status": status},
    #     )
    # return {"status": status}


# Run the FastAPI application
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)

# Taking one input not storing mask input

# def process_image(
#     org_image_cv2: np.ndarray,
# ) -> str:  # Change the input type to np.ndarray
#     """Process an input image using the SAM model.

#     Args:
#     - org_image (str): Path to the original image file.
#     - org_image_cv2 (np.ndarray): The original image in NumPy array format (BGR).

#     Returns:
#     - str: Path to the modified image file.
#     """
#     HOME = os.getcwd()
#     data_directory = os.path.abspath(os.path.join(HOME, '..'))

#     CHECKPOINT_PATH = os.path.join(data_directory,
#     "data/model_weights", "sam_vit_h_4b8939.pth")
#     MODEL_TYPE = "vit_h"
#     DEVICE = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

#     sam = sam_model_registry[MODEL_TYPE](checkpoint=CHECKPOINT_PATH).to(device=DEVICE)
#     mask_generator = SamAutomaticMaskGenerator(sam)

#     # Assuming the image is already in BGR format, no need for cv2.cvtColor
#     image_rgb = cv2.cvtColor(org_image_cv2, cv2.COLOR_BGR2RGB)
#     sam_result = mask_generator.generate(image_rgb)

#     mask_annotator = sv.MaskAnnotator(color_lookup=sv.ColorLookup.INDEX)
#     detections = sv.Detections.from_sam(sam_result=sam_result)
#     annotated_image = mask_annotator.annotate(
#         scene=org_image_cv2.copy(), detections=detections
#     )

#     masks = [
#         mask["segmentation"]
#         for mask in sorted(sam_result, key=lambda x: x["area"], reverse=True)
#     ]
#     composite_mask = np.zeros_like(masks[0], dtype=bool)
#     for mask in masks:
#         composite_mask |= mask

#     background_mask = ~composite_mask
#     modified_image = annotated_image.copy()
#     background_color = [0, 0, 0]

#     modified_image[composite_mask] = background_color
#     modified_image[background_mask] = [128, 0, 128]  # Non-masked color
#     modified_image_path = os.path.join(data_directory,
#     "data/Image_data", "modified_image.png")
#     cv2.imwrite(modified_image_path, cv2.cvtColor(modified_image, cv2.COLOR_BGR2RGB))
#     return modified_image_path


# error code without enums

# if height_in_feet < 2:
#     raise HTTPException(
#         status_code=400, detail="Height should be greater than or equal to 2"
#     )

# if width_in_feet < 2:
#     raise HTTPException(
#         status_code=400, detail="Width should be greater than or equal to 2"
#     )
# if height_in_feet >= 40:
#     raise HTTPException(
#         status_code=400, detail="Height should be less than or equal to 40"
#     )

# if width_in_feet >= 40:
#     raise HTTPException(
#         status_code=400, detail="Width should be less than or equal to 40"
#     )

# if x_coordinate < 0 or y_coordinate < 0:
#     raise HTTPException(
#         status_code=400, detail="Coordinates should be greater than or equal to 0"
#     )

# if x_coordinate >= 450:
#     raise HTTPException(
#         status_code=400, detail="Coordinates should be less than or equal to 450"
#     )

# if y_coordinate >= 250:
#     raise HTTPException(
#         status_code=400, detail="Coordinates should be less than or equal to 250"
#     )

# org_image_name = org_image.filename  # Get the original uploaded image name

# if org_image_name is None:
#     # Handle the case where org_image_name is None
#     # This could involve setting a default name or raising an error
#     raise ValueError("org_image_name cannot be None")

# org_image_data = await org_image.read()
# org_image_array = np.frombuffer(org_image_data, np.uint8)
# org_image_cv2 = cv2.imdecode(
#     org_image_array, cv2.IMREAD_COLOR
# )  # Decode the uploaded image

# # Process the original image and get the modified image path
# modified_image_path = process_image(org_image_cv2)

# # Read the processed image to create bg_image
# bg_image_cv2 = cv2.imread(modified_image_path)

# processed_image, status = draw_rectangle(
#     bg_image_cv2,
#     org_image_cv2,
#     height_in_feet,
#     width_in_feet,
#     x_coordinate,
#     y_coordinate,
#     tilt,
# )

# if processed_image is not None:
#     img_bytes = cv2.imencode(".png", processed_image)[1].tobytes()
#     return StreamingResponse(
#         io.BytesIO(img_bytes),
#         media_type="image/png",
#         status_code=200,
#         headers={"status": status},
#     )
# else:
#     return {"status": status}
