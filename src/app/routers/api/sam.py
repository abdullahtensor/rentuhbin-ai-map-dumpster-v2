"""FastAPI for combining the SAM and dumpster placement code"""
import os

# pylint: disable=E1101
import cv2  # type: ignore
import numpy as np
import supervision as sv  # type: ignore

# import uvicorn
import torch  # type: ignore
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator  # type: ignore

# from fastapi import FastAPI
from fastapi import File, UploadFile, HTTPException  # type: ignore
from fastapi.responses import JSONResponse
from fastapi import APIRouter  # type: ignore
import base64


router = APIRouter(
    prefix="",
    tags=["sam"],
    dependencies=[],
    responses={},
)


@router.post("/sam")
def sam(org_image_cv2: UploadFile = File(...)):
    """Process an input image using the SAM model.

    Args:
    - org_image (str): Path to the original image file.
    - org_image_cv2 (np.ndarray): The original image in NumPy array format (BGR).

    Returns:
    - str: Path to the modified image file.
    """
    # Change the input type to np.ndarray

    content = org_image_cv2.file.read()

    # Convert the content to a NumPy array
    nparr = np.frombuffer(content, np.uint8)

    # Decode the image using OpenCV
    org_image_cv2 = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    home = os.getcwd()
    data_directory = os.path.abspath(os.path.join(home, ".."))
    checkpoint_path = os.path.join(
        data_directory, "data/model_weights", "sam_vit_h_4b8939.pth"
    )
    model_type = "vit_h"
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    sam_model = sam_model_registry[model_type](checkpoint=checkpoint_path).to(
        device=device
    )
    mask_generator = SamAutomaticMaskGenerator(sam_model)

    # Assuming the image is already in BGR format, no need for cv2.cvtColor
    image_rgb = cv2.cvtColor(org_image_cv2, cv2.COLOR_BGR2RGB)
    sam_result = mask_generator.generate(image_rgb)

    mask_annotator = sv.MaskAnnotator(color_lookup=sv.ColorLookup.INDEX)
    detections = sv.Detections.from_sam(sam_result=sam_result)
    annotated_image = mask_annotator.annotate(
        scene=org_image_cv2, detections=detections
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
    _, img_encoded = cv2.imencode(".png", modified_image)

    if not _:
        # Handle the case where image encoding failed
        raise HTTPException(status_code=500, detail="Failed to encode image.")

    img_base64 = base64.b64encode(img_encoded.tobytes()).decode("utf-8")

    # Return the base64-encoded image as JSON response
    return JSONResponse(content={"image": img_base64}, media_type="application/json")
    # return modified_image
    # modified_image_path = org_image
    # cv2.imwrite(modified_image_path, cv2.cvtColor(modified_image, cv2.COLOR_BGR2RGB))
    # return modified_image_path
