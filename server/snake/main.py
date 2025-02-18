from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Dict, List
import asyncio

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
connected_players: Dict[str, WebSocket] = {}
player_states: Dict[str, dict] = {}
primeagems_balances: Dict[str, int] = {}

@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    await websocket.accept()
    connected_players[player_id] = websocket
    primeagems_balances.setdefault(player_id, 0)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Update player state
            player_states[player_id] = data
            
            # Broadcast state to all players
            state_update = {
                "type": "state_update",
                "players": player_states
            }
            
            # Broadcast to all connected players
            for player in connected_players.values():
                await player.send_json(state_update)
                
    except WebSocketDisconnect:
        del connected_players[player_id]
        del player_states[player_id]
        
        # Notify remaining players
        for player in connected_players.values():
            await player.send_json({
                "type": "player_disconnected",
                "player_id": player_id
            })

@app.post("/primeagems/{player_id}/purchase")
async def purchase_primeagems(player_id: str, amount: int):
    current_balance = primeagems_balances.get(player_id, 0)
    primeagems_balances[player_id] = current_balance + amount
    return {"balance": primeagems_balances[player_id]}

@app.get("/primeagems/{player_id}/balance")
async def get_primeagems_balance(player_id: str):
    return {"balance": primeagems_balances.get(player_id, 0)}
