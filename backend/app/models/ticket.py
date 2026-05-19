from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

class AssignTicket(BaseModel):
    agent_id: str

class Ticket(BaseModel):
    title:str
    description:str
    priority:Optional[Literal["low", "medium", "high", "critical"]] = None
    status:Literal["in-progress", "open", "resolved", "closed"] = "open"
    tags:Optional[List[str]]= []
    embedding:Optional[List[float]] = None
    assigned_agent_id:Optional[str] = None
    suggested_reply:Optional[str] = None

class TicketUpdate(BaseModel):
    title:Optional[str] = None
    description:Optional[str] = None
    priority:Optional[Literal["low", "medium", "high", "critical"]] = None
    status:Optional[Literal["in-progress", "open", "resolved", "closed"]] = None
    tags:Optional[List[str]]= None
    embedding:Optional[List[float]] = None
    assigned_agent_id:Optional[str] = None
    suggested_reply:Optional[str] = None