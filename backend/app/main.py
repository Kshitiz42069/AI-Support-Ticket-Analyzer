from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import tickets, users

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins =["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(tickets.router, prefix='/tickets', tags=["Tickets"])
app.include_router(users.router,prefix="/users", tags=["Users"])

@app.get('/')
def root():
    return {"message":"Backend is running......"}