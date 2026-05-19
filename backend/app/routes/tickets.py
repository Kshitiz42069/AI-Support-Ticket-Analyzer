from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from app.models.ticket import Ticket, TicketUpdate, AssignTicket
from app.database import tickets_collection, users_collection
from bson import ObjectId
from bson.errors import InvalidId
from app.dependencies.auth import get_current_user
from datetime import datetime, timezone
from app.services.ai_service import analyze_ticket

router = APIRouter()

# create ticket
@router.post('/')
def create_tickets(ticket:Ticket, current_user=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    ticket_dict = ticket.model_dump()
    ai_result = analyze_ticket(ticket.title, ticket.description)
    ticket_dict["user_id"] = current_user["user_id"]
    ticket_dict["assigned_agent_id"] = None
    ticket_dict["createdAt"] = now
    ticket_dict["updatedAt"] = now
    ticket_dict["priority"] = ai_result["priority"]
    ticket_dict["tags"] = ai_result["tags"]
    ticket_dict["suggested_reply"] = ai_result["suggested_reply"]
    result = tickets_collection.insert_one(ticket_dict)

    return {"id":str(result.inserted_id)}

#Display all tickets based on role
@router.get('/')
def get_tickets(current_user=Depends(get_current_user),
                status:Optional[str] = None,
                priority:Optional[str] = None,
                tag:Optional[str] = None,
                skip: int = 0,
                limit: int = 20,
                ):
    if current_user["role"] == "admin":
        query = {}
    elif current_user["role"] == "customer":
        query = {"user_id" : current_user["user_id"]}
    elif current_user["role"] == "agent":
        query = {"assigned_agent_id" : current_user["user_id"]}
    else:
        raise HTTPException(status_code=403, detail="Invalid Role")
    
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if tag:
        query["tags"] = tag

    total = tickets_collection.count_documents(query)
    cursor = tickets_collection.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    tickets = list(cursor)

    for ticket in tickets:
        ticket["_id"] = str(ticket["_id"])

    return {
        "total":total,
        "skip":skip,
        "limit":limit,
        "items":tickets
    }


@router.get("/stats")
def get_stats(current_user = Depends(get_current_user)):
    if current_user['role'] != "admin":
        raise HTTPException(status_code=403, detail="Access Denied")
    
    total = tickets_collection.count_documents({})

    status_pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    status_result = list(tickets_collection.aggregate(status_pipeline))
    by_status = {row["_id"]:row["count"] for row in status_result}

    priority_pipeline = [
        {"$group": {"_id": "$priority", "count": {"$sum": 1}}},
    ]
    priority_result = list(tickets_collection.aggregate(priority_pipeline))
    by_priority = {row["_id"]:row["count"] for row in priority_result}

    tag_pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    tag_result = list(tickets_collection.aggregate(tag_pipeline))
    top_tags = [{"tag": row["_id"], "count": row["count"]} for row in tag_result]


    return {
        "total": total,
        "by_status": by_status,
        "by_priority": by_priority,
        "top_tags": top_tags,
    }

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
    
    isOwner = ticket["user_id"] == current_user["user_id"]
    isAgent = current_user["role"] == "agent" and ticket.get("assigned_agent_id") == current_user["user_id"]
    isAdmin = current_user["role"] == "admin"
    if not (isOwner or isAgent or isAdmin):
        raise HTTPException(status_code=403, detail="Invalid Role")
    
    ticket["_id"] = str(ticket["_id"])
    return ticket
    

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
    if ticket["user_id"] != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    tickets_collection.delete_one({"_id": ObjectId(ticket_id)})
    return {"message":"ticket Deleted Successfully!"}

# update ticket
@router.put("/{ticket_id}")
def update_ticket(ticket_id:str, ticket:TicketUpdate, current_user=Depends(get_current_user)):
    try:
        obj_id = ObjectId(ticket_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    existing_ticket = tickets_collection.find_one({"_id": obj_id})
    if not existing_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    isUser = existing_ticket["user_id"] == current_user["user_id"]
    isAgent = current_user["role"] == "agent" and existing_ticket.get("assigned_agent_id") == current_user["user_id"]
    isAdmin = current_user["role"] == "admin"
    if not (isUser or isAdmin or isAgent):
        raise HTTPException(status_code=403, detail="Unauthorized")
    ticket_dict = ticket.model_dump(exclude_unset=True)

    ticket_dict.pop("user_id", None)
    ticket_dict.pop("assigned_agent_id", None)

    if not ticket_dict:
        raise HTTPException(status_code=400, detail="No field provided for update")
    ticket_dict["updatedAt"] = datetime.now(timezone.utc)
    tickets_collection.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": ticket_dict},
    )
    return {"message":"Ticket updated successfully!!"}

@router.post("/{ticket_id}/reanalyze")
def reanalyze_ticket(ticket_id: str, current_user=Depends(get_current_user)):
    try:
        obj_id = ObjectId(ticket_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Ticket Id")
    ticket = tickets_collection.find_one({"_id":obj_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    isOwner = ticket["user_id"] == current_user["user_id"]
    isAgent = current_user["role"] == "agent" and ticket.get("assigned_agent_id") == current_user["user_id"]
    isAdmin = current_user["role"] == "admin"
    if not (isOwner or isAgent or isAdmin):
        raise HTTPException(status_code=403, detail="Invalid Role")
    ai_result = analyze_ticket(ticket["title"], ticket["description"])
    tickets_collection.update_one(
        {"_id": obj_id},
        {"$set": {
            "priority": ai_result["priority"],
            "tags": ai_result["tags"],
            "suggested_reply": ai_result["suggested_reply"],
            "updatedAt": datetime.now(timezone.utc),
        }},
    )
    return {"message": "Ticket re-analyzed", "ai": ai_result}

#patch to assign ticket
@router.patch("/{ticket_id}/assign")
def assignAgent(ticket_id:str, body:AssignTicket, current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can assign tickets")
    
    try:
        obj_id = ObjectId(ticket_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid ticket ID")
    ticket = tickets_collection.find_one({"_id":obj_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    try:
        agent_obj_id = ObjectId(body.agent_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid Agent ID")
    
    agent = users_collection.find_one({"_id":agent_obj_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.get("role") != "agent":
        raise HTTPException(status_code=400, detail="User is not agent")
    
    tickets_collection.update_one(
        {"_id": obj_id},
        {"$set": {
            "assigned_agent_id": body.agent_id,
            "updatedAt": datetime.now(timezone.utc),
        }},
    )
    return {"message": "Ticket assigned", "ticket_id": ticket_id, "agent_id": body.agent_id}