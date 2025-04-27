from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, HttpUrl
from backend.fact_checker.service import FactCheckerService
from backend.fact_checker.service import JobStore
import re

router = APIRouter(prefix="/fact_checker", tags=["fact_checker"])

job_store = JobStore()
fact_checker_service = FactCheckerService(job_store)


class URLRequest(BaseModel):
    url: HttpUrl


def validate_instagram_shortcode(url: str):
    pattern = r"instagram\.com/(p|tv|reel)/[a-zA-Z0-9_-]+"
    if not re.search(pattern, url):
        raise HTTPException(status_code=400, detail="URL must contain a valid Instagram shortcode")


@router.post("/checker")
def check_content(request: URLRequest, background_tasks: BackgroundTasks):
    url = str(request.url)
    validate_instagram_shortcode(url)

    try:
        job_id = fact_checker_service.create_job(url)
        # Add background task to process the job
        background_tasks.add_task(fact_checker_service.process_job, job_id, url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating job: {str(e)}")

    return {"jobId": job_id}


@router.get("/status/{job_id}")
def get_status(job_id: str):
    status, result = fact_checker_service.get_status(job_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": status, "result": result}


@router.post("/checker_url")
def check_content_url(request: URLRequest):
    url = str(request.url)
    validate_instagram_shortcode(url)

    try:
        result = fact_checker_service.process_url(url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing url: {str(e)}")

    return result
