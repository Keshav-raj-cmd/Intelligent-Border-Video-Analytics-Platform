import asyncio
from typing import Dict, Any, List

class EventPublisher:
    def __init__(self):
        self.queues: List[asyncio.Queue] = []
        
    async def publish(self, event: Dict[str, Any]):
        """Publish an event to all connected SSE clients."""
        for q in self.queues:
            await q.put(event)
            
    async def subscribe(self) -> asyncio.Queue:
        """Subscribe to the event stream."""
        q = asyncio.Queue()
        self.queues.append(q)
        return q
        
    def unsubscribe(self, q: asyncio.Queue):
        if q in self.queues:
            self.queues.remove(q)

publisher = EventPublisher()
