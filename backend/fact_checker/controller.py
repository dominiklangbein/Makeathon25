from fastapi import APIRouter

router = APIRouter(
    prefix="/fact_checker",
    tags=["fact_checker"]
)

@router.get("/test")
def check_content():
    return {"message": "Hello World!"}
