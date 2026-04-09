from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import datetime

class Ticket(BaseModel):
    title:str
    description:str
    priority:Literal["low", "medium", "high", "critical"]
    status:Literal["in-progress", "open", "resolved", "closed"] = "open"
    tag:Optional[str]= None
    embedding:Optional[List[float]] = None
    assigned_agent_id:Optional[str] = None
    suggested_reply:Optional[str] = None