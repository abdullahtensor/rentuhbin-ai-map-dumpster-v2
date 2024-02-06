"""FastAPI for combining the SAM and dumpster placement code"""
import math

# pylint: disable=E1101
import cv2  # type: ignore
import numpy as np


# from fastapi import FastAPI
from fastapi import File, UploadFile, HTTPException, Form
from fastapi import APIRouter  # type: ignore
from enum import Enum
import base64


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
    OBJECT_CANNOT_BE_PLACED = "Object cannot be placed entirely within the image"


class PlacementStatus(Enum):
    DRAWING_OBJECT = ("Condition Met: Drawing Object", 200)
    NOT_DRAWING_OBJECT = ("Condition Not Met: Not Drawing Object", 411)
    OBJECT_CANNOT_BE_PLACED = ("Object cannot be placed entirely within the image", 412)


router = APIRouter(
    prefix="",
    tags=["placement"],
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


@router.post("/placement")
async def draw_rectangle(
    # bg_image_path,
    # org_path,
    # height_in_feet,
    # width_in_feet,
    # x_coordinate,
    # y_coordinate,
    # tilt,
    bg_image_path: UploadFile = File(...),
    org_path: UploadFile = File(...),
    height_in_feet: float = Form(...),
    width_in_feet: float = Form(...),
    x_coordinate: float = Form(...),
    y_coordinate: float = Form(...),
    tilt: float = Form(...),
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
    - dict: Resized image with the rectangle drawn on it and a status message.
    """
    # placeable=False
    bg_content = await bg_image_path.read()

    # Convert the content to a NumPy array
    bg_nparr = np.frombuffer(bg_content, np.uint8)

    # Decode the image using OpenCV
    bg_image = cv2.imdecode(bg_nparr, cv2.IMREAD_COLOR)

    org_content = await org_path.read()

    # Convert the content to a NumPy array
    org_nparr = np.frombuffer(org_content, np.uint8)

    # Decode the image using OpenCV
    org_image = cv2.imdecode(org_nparr, cv2.IMREAD_COLOR)

    x_coordinate = math.ceil(x_coordinate)  # Define your desired x-coordinate here
    y_coordinate = math.ceil(y_coordinate)

    height_in_feet = math.ceil(height_in_feet)  # Define your desired x-coordinate here
    width_in_feet = math.ceil(width_in_feet)

    # resize both images to whatever you like, rectangle will be drawn according to it.
    # bg_image = cv2.cvtColor(bg_image_path, cv2.COLOR_BGR2RGB)
    bg_image = cv2.resize(bg_image, (848, 480))

    # org_image = cv2.cvtColor(org_path, cv2.COLOR_BGR2RGB)
    org_image = cv2.resize(org_image, (848, 480))
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
            # rect_points = np.int0(rect_points)
            rect_points = rect_points.astype(int)

            # org = org_image
            # resized_image = cv2.resize(org, (848, 480))
            # resized_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)
            cv2.drawContours(org_image, [rect_points], 0, (0, 255, 0), 1, cv2.LINE_AA)
            # cv2.rectangle(resized_image, tuple(rect_points[1]),
            # tuple(rect_points[3]), (0, 255, 0), 1, cv2.LINE_AA)

            _, img_encoded = cv2.imencode(".png", org_image)

            if not _:
                # Handle the case where image encoding failed
                raise HTTPException(status_code=500, detail="Failed to encode image.")

            img_base64 = base64.b64encode(img_encoded.tobytes()).decode("utf-8")
            status_message = PlacementError.DRAWING_OBJECT.value
            placeable = "True"
            # Return the response as a dictionary
            response_dict = {
                "image": img_base64,
                "status_message": status_message,
                "placeable": placeable,
            }

            # status_message = "Condition Met: Drawing Object"
            # status_message = PlacementError.DRAWING_OBJECT.value
            # status_code = PlacementStatus.DRAWING_OBJECT.value[1]
        else:
            #     raise HTTPException(
            #     status_code=410, detail="Condition Not Met: Not Drawing Object",
            # headers={"error-code": PlacementError.NOT_DRAWING_OBJECT.value}
            # )
            # status_message = PlacementStatus.NOT_DRAWING_OBJECT.value
            # status_message = "Condition Not Met: Not Drawing Object"

            # org = org_image
            # resized_image = cv2.resize(org, (491, 255))
            # resized_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)
            _, img_encoded = cv2.imencode(".png", org_image)

            if not _:
                # Handle the case where image encoding failed
                raise HTTPException(status_code=500, detail="Failed to encode image.")

            img_base64 = base64.b64encode(img_encoded.tobytes()).decode("utf-8")
            status_message = PlacementError.NOT_DRAWING_OBJECT.value
            placeable = "False"

            # Return the response as a dictionary
            response_dict = {
                "image": img_base64,
                "status_message": status_message,
                "placeable": placeable,
            }

            # status_message = PlacementError.NOT_DRAWING_OBJECT.value

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
        # org = org_image
        # resized_image = cv2.resize(org, (491, 255))
        # resized_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)
        _, img_encoded = cv2.imencode(".png", org_image)

        if not _:
            # Handle the case where image encoding failed
            raise HTTPException(status_code=500, detail="Failed to encode image.")

        img_base64 = base64.b64encode(img_encoded.tobytes()).decode("utf-8")
        status_message = PlacementError.OBJECT_CANNOT_BE_PLACED.value
        placeable = "False"

        # Return the response as a dictionary
        response_dict = {
            "image": img_base64,
            "status_message": status_message,
            "placeable": placeable,
        }
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

        # status_message = "Object cannot be placed entirely within the image"

    # return resized_image, status_message
    return response_dict
