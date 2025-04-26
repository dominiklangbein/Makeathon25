from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from backend.fact_checker.service import check_url
import re

router = APIRouter(
    prefix="/fact_checker",
    tags=["fact_checker"]
)


class URLRequest(BaseModel):
    url: HttpUrl


def validate_instagram_shortcode(url: str):
    pattern = r"instagram\.com/(p|tv|reel)/[a-zA-Z0-9_-]+"
    if not re.search(pattern, url):
        raise HTTPException(status_code=400, detail="URL must contain a valid Instagram shortcode")


@router.post("/checker")
def check_content(request: URLRequest):
    url = str(request.url)
    validate_instagram_shortcode(url)
    try:
        result = check_url(url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing URL: {str(e)}")

    return {"result": result}
