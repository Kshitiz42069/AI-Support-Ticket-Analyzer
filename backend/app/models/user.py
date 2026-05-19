from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime


#for registration
class UserCreated(BaseModel):
    name:str
    email:EmailStr
    password:str
    role: Literal["customer", "agent", "admin"] = "customer"

# for login
class UserLogin(BaseModel):
    email:EmailStr
    password:str

# for storing in the db
class UserDB(BaseModel):
    name:str
    email:EmailStr
    hashedPassword:str
    role:str="customer"
    created_at:Optional[datetime]=None

# for the response in FE
class UserResponse(BaseModel):
    name:str
    email:EmailStr
    role:str
