from fastapi import APIRouter, HTTPException, Depends
from app.models.user import UserCreated, UserResponse, UserLogin
from app.database import users_collections
from app.services.auth_service import hashPassword, verifyPassword
from bson import ObjectId
from bson.errors import InvalidId
from app.utils.auth import create_access_token
from app.dependencies.auth import get_current_user
from datetime import datetime

router = APIRouter()

#registering the user
@router.post("/register")
def register(user:UserCreated):
    existingUser = users_collections.find_one({"email":user.email})
    if existingUser:
        raise HTTPException(status_code=400, detail="User already registered")
    hashedPw = hashPassword(user.password)
    user_data = {
        "name":user.name,
        "email":user.email,
        "hashedPassword":hashedPw,
        "role":user.role,
        "created_at":datetime.utcnow()
    }

    users_collections.insert_one(user_data)
    return {"message":"User created"}

#all the users
@router.get("/")
def allUserProfile(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access Denied")
    users = list(users_collections.find())
    for user in users:
        user["_id"] = str(user["_id"])
        user.pop("hashedPassword", None)
    return users

#to get one user
@router.get("/profile/{user_id}", response_model=UserResponse)
def getUserProfile(user_id:str, current_user=Depends(get_current_user)):
    try:
        obj_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Bad Request")
    user = users_collections.find_one({"_id":obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if current_user["role"] != "admin" and str(user["_id"]) != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorised")
    user["_id"] = str(user["_id"])
    return user

#to login the user
@router.post("/login")
def loginUser(user:UserLogin):
    db_user = users_collections.find_one({"email":user.email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verifyPassword(user.password, db_user["hashedPassword"]):
        raise HTTPException(status_code=400, detail="Entered Credentials are wrong")
    
    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "email":str(db_user["email"]),
        "role":str(db_user["role"])
    })
    
    return {"access_token":token}