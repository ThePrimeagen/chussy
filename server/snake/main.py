"""FastAPI WebSocket server for managing player states and PrimeAgems balances."""

import logging
import json  # Standard library imports first
import asyncio
from typing import Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException  # Third-party imports
from fastapi.middleware.cors import CORSMiddleware


# Configure logging
logging.basicConfig(filename='server.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

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
    """Handles WebSocket connections for players."""
    try:
        await websocket.accept()
        connected_players[player_id] = websocket
        primeagems_balances.setdefault(player_id, 0)
        logging.info(f"Player {player_id} connected")

        try:
            while True:
                try:
                    data = await websocket.receive_json()
                    logging.debug(f"Received data from player {player_id}: {data}")

                    # Update player state
                    player_states[player_id] = data

                    # Broadcast state to all players
                    state_update = {
                        "type": "state_update",
                        "players": player_states
                    }

                    # Broadcast to all connected players
                    for other_player_id, player in connected_players.items():
                        try:
                            await player.send_json(state_update)
                            logging.debug(f"Sent state update to player {other_player_id}")
                        except Exception as e:
                            logging.error(f"Error sending state update to player {other_player_id}: {e}")

                except json.JSONDecodeError:
                    logging.warning(f"Received invalid JSON from player {player_id}")
                    # Consider sending an error message back to the client

                except WebSocketDisconnect:
                    # Let the outer except block handle the disconnect
                    raise

                except Exception as e:
                    logging.exception(f"Error processing message from player {player_id}: {e}")  # Use logging.exception to include traceback
                    # Consider sending an error message back to the client

        except WebSocketDisconnect:
            logging.info(f"Player {player_id} disconnected")

    except Exception as e:
        logging.exception(f"Unexpected error for player {player_id}: {e}")

    finally:
        # Ensure cleanup even if errors occur
        if player_id in connected_players:
            del connected_players[player_id]
        if player_id in player_states:
            del player_states[player_id]

        # Notify remaining players
        disconnect_message = {
            "type": "player_disconnected",
            "player_id": player_id
        }
        for other_player_id, player in connected_players.items():
            try:
                await player.send_json(disconnect_message)
                logging.debug(f"Sent disconnect message to player {other_player_id}")
            except Exception as e:
                logging.error(f"Error notifying player {other_player_id} about disconnection: {e}")


@app.post("/primeagems/{player_id}/purchase")
async def purchase_primeagems(player_id: str, amount: int):
    """Allows a player to purchase PrimeAgems."""
    try:
        if amount <= 0:
            logging.warning(f"Invalid purchase amount {amount} for player {player_id}")
            raise HTTPException(status_code=400, detail="Amount must be positive")

        current_balance = primeagems_balances.get(player_id, 0)
        primeagems_balances[player_id] = current_balance + amount
        logging.info(f"Player {player_id} purchased {amount} PrimeAgems. New balance: {primeagems_balances[player_id]}")
        return {"balance": primeagems_balances[player_id]}

    except HTTPException as http_ex:
        # Re-raise HTTPExceptions to be handled by FastAPI's default error handling
        raise http_ex

    except Exception as e:
        logging.exception(f"Error processing PrimeAgems purchase for player {player_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/primeagems/{player_id}/balance")
async def get_primeagems_balance(player_id: str):
    """Retrieves the PrimeAgems balance for a player."""
    try:
        balance = primeagems_balances.get(player_id, 0)
        logging.info(f"Balance request for player {player_id}: {balance}")
        return {"balance": balance}

    except Exception as e:
        logging.exception(f"Error retrieving PrimeAgems balance for player {player_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
