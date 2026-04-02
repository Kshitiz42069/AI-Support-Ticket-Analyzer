from fastapi import APIRouter, HTTPException, Depends
from app.models.ticket import Ticket
from app.database import tickets_collection
from bson import ObjectId
from bson.errors import InvalidId
from app.dependencies.auth import get_current_user
from datetime import datetime

router = APIRouter()

# create ticket
@router.post('/')
def create_tickets(ticket:Ticket, current_user=Depends(get_current_user)):
    ticket_dict = ticket.dict()
    ticket_dict["user_id"] = current_user["user_id"]
    ticket_dict["assigned_agent_id"] = None
    ticket_dict["createdAt"] = datetime.utcnow()
    result = tickets_collection.insert_one(ticket_dict)

    return {"id":str(result.inserted_id)}

#Display all tickets based on role
@router.get('/')
def get_tickets(current_user=Depends(get_current_user)):
    if current_user["role"] == "admin":
        tickets = list(tickets_collection.find())
    elif current_user["role"] == "customer":
        tickets = list(tickets_collection.find({"user_id":current_user["user_id"]}))
    elif current_user["role"] == "agent":
        tickets = list(tickets_collection.find({"assigned_agent_id":current_user["user_id"]}))
    else:
        raise HTTPException(status_code=403, detail="Invalid Role")
    for ticket in tickets:
        ticket["_id"] = str(ticket["_id"])
    return tickets

#get one ticket
@router.get("/{ticket_id}")
def get_one_ticket(ticket_id:str, current_user=Depends(get_current_user)):
    try:
        obj_id = ObjectId(ticket_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    ticket = tickets_collection.find_one({"_id": obj_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if current_user["role"] == "customer" and ticket["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="unauthorized")
    
    elif current_user["role"] == "agent" and ticket.get("assigned_agent_id") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="unauthorized")
    elif current_user["role"] == "admin":
        pass
    else:
        raise HTTPException(status_code=403, detail="Invalid Role")
    
    ticket["_id"] = str(ticket["_id"])
    

# delete ticket
@router.delete("/{ticket_id}")
def delete_ticket(ticket_id:str, current_user=Depends(get_current_user)):
    try:
        obj_id = ObjectId(ticket_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    ticket = tickets_collection.find_one({"_id": obj_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if ticket["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    tickets_collection.delete_one({"_id": ObjectId(ticket_id)})
    return {"message":"ticket Deleted Successfully!"}

# update ticket
@router.put("/{ticket_id}")
def update_ticket(ticket_id:str, ticket:Ticket, current_user=Depends(get_current_user)):
    try:
        obj_id = ObjectId(ticket_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    existing_ticket = tickets_collection.find_one({"_id": obj_id})
    if not existing_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if existing_ticket["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    ticket_dict = ticket.dict()

    ticket_dict.pop("user_id", None)
    ticket_dict.pop("assigned_agent_id", None)

    tickets_collection.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": ticket_dict}
    )
    return {"message":"Updated the tickets"}
