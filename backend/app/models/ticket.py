from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Ticket(BaseModel):
    title:str
    description:str
    priority:str
    status:str="open"
    tag:Optional[str]= None
    embedding:Optional[List[float]] = None
    assigned_agent_id:Optional[str] = None
    suggested_reply:Optional[str] = None