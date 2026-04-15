from fastapi import FastAPI
from api.routes import auth, event
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.INFO)


app = FastAPI(title="Mis Eventos API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(event.router, prefix="/event", tags=["event"])
app.include_router(event.router, prefix="/events", tags=["events"])