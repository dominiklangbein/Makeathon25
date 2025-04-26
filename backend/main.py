from fastapi import FastAPI
from backend.fact_checker.controller import router as fact_checker_router

app = FastAPI()

# Include router
app.include_router(fact_checker_router)
