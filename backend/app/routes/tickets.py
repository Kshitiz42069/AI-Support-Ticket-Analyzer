from fastapi import APIRouter, HTTPException
from app.models.ticket import Ticket
from app.database import tickets_collection
from bson import ObjectId

router = APIRouter()

# API to create a new ticket
@router.post('/')
def create_tickets(ticket:Ticket):
    ticket_dict = ticket.dict()
    result = tickets_collection.insert_one(ticket_dict)

    return {"id":str(result.inserted_id)}

# API to get all the tickets
@router.get('/')
def get_tickets():
    tickets = list(tickets_collection.find())
    for ticket in tickets:
        ticket["_id"] = str(ticket["_id"])
    return tickets

# API to get a single ticket
@router.get("/{ticket_id}")
def get_one_ticket(ticket_id:str):
    ticket = tickets_collection.find_one({"_id":ObjectId(ticket_id)})

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket["_id"] = str(ticket["_id"])

    return ticket
    

# API to delete a ticket
@router.delete("/{ticket_id}")
def delete_ticket(ticket_id:str):
    result = tickets_collection.delete_one({"_id": ObjectId(ticket_id)})
    if result.deleted_count==1:
        return {"message":"selected ticket is deleted"}
    return {"message":"ticket is not found"}

# API to update the ticket
@router.put("/{ticket_id}")
def update_ticket(ticket_id:str, ticket:Ticket):
    ticket_dict = ticket.dict()

    result = tickets_collection.update_one(
        {"_id":ObjectId(ticket_id)},
        {"$set":ticket_dict}
    )

    if result.modified_count==1:
        return {"message":"Updated the ticket"}
    return {"message":"ticket does not found"}
