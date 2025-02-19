mod game;

use warp::Filter;
use tokio::sync::broadcast;
use serde::{ Serialize, Deserialize };
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use futures::{ FutureExt, StreamExt };
use game::{ GameState, Direction };
use log::{ info, error, debug }; // Import logging macros
use uuid::Uuid; // Import Uuid
use serde_json; // Import serde_json
use std::convert::Infallible; // Import Infallible
use warp::ws::{ WebSocket, Ws }; // Import WebSocket and Ws

type Players = Arc<Mutex<HashMap<String, GameState>>>;

#[derive(Debug, Serialize, Deserialize)]
struct ClientMessage {
    action: String,
    direction: Option<Direction>,
}

#[tokio::main]
async fn main() {
    // Initialize logging
    env_logger::init();

    let players: Players = Arc::new(Mutex::new(HashMap::new()));
    let (tx, _) = broadcast::channel(1000); // Channel for game state updates

    // Serve static files from assets directory
    let assets = warp::path("assets").and(warp::fs::dir("assets"));

    // WebSocket handler
    let ws_route = warp
        ::path("ws")
        .and(warp::ws())
        .and(with_players(players.clone()))
        .and(with_tx(tx.clone()))
        .map(|ws: Ws, players, tx| {
            // Explicitly specify types
            ws.on_upgrade(move |socket| handle_ws_client(socket, players, tx))
        });

    let routes = assets.or(ws_route);

    info!("Server starting on port 8000...");
    warp::serve(routes).run(([127, 0, 0, 1], 8000)).await;
}

fn with_players(players: Players) -> impl Filter<Extract = (Players,), Error = Infallible> + Clone {
    // Explicitly specify types
    warp::any().map(move || players.clone())
}

fn with_tx(
    tx: broadcast::Sender<String>
) -> impl Filter<Extract = (broadcast::Sender<String>,), Error = Infallible> + Clone {
    // Explicitly specify types
    warp::any().map(move || tx.clone())
}

async fn handle_ws_client(ws: WebSocket, players: Players, tx: broadcast::Sender<String>) {
    // Explicitly specify types
    let (mut ws_sender, mut ws_receiver) = ws.split();
    let player_id = Uuid::new_v4().to_string(); // Use Uuid directly
    info!("New WebSocket connection established for player: {}", player_id);

    // Initialize player's game state
    {
        let mut players = players.lock().await;
        players.insert(player_id.clone(), GameState::new((30, 30)));
        debug!("Initialized game state for player: {}", player_id);
    }

    // Clone necessary variables for the game loop
    let players_clone = players.clone();
    let player_id_clone = player_id.clone();
    let tx_clone = tx.clone();

    // Game loop
    let game_loop = tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(100));
        loop {
            interval.tick().await;
            let mut players = players_clone.lock().await;
            if let Some(state) = players.get_mut(&player_id_clone) {
                state.update((30, 30));
                match serde_json::to_string(&state) {
                    Ok(state_json) => {
                        debug!("Sending game state update for player: {}", player_id_clone);
                        if let Err(e) = tx_clone.send(state_json) {
                            error!(
                                "Failed to send game state update for player {}: {}",
                                player_id_clone,
                                e
                            );
                        }
                    }
                    Err(e) => {
                        error!(
                            "Failed to serialize game state for player {}: {}",
                            player_id_clone,
                            e
                        );
                    }
                }
            } else {
                debug!("Game state not found for player: {}", player_id_clone);
                break; // Exit the loop if the player's state is no longer available
            }
        }
        info!("Game loop terminated for player: {}", player_id_clone);
    });

    // Handle incoming messages
    while let Some(result) = ws_receiver.next().await {
        match result {
            Ok(msg) => {
                if let Ok(text) = msg.to_str() {
                    match serde_json::from_str::<ClientMessage>(text) {
                        Ok(client_msg) => {
                            let mut players = players.lock().await;
                            if let Some(state) = players.get_mut(&player_id) {
                                match client_msg.action.as_str() {
                                    "direction" => {
                                        if let Some(direction) = client_msg.direction {
                                            state.snake.set_direction(direction);
                                            debug!(
                                                "Updated snake direction for player {}: {:?}",
                                                player_id,
                                                direction
                                            );
                                        } else {
                                            debug!("Received direction action but no direction provided for player {}", player_id);
                                        }
                                    }
                                    _ => {
                                        debug!(
                                            "Unknown action received from player {}: {}",
                                            player_id,
                                            client_msg.action
                                        );
                                    }
                                }
                            } else {
                                error!("Game state not found for player {}.  Possible desync.", player_id);
                            }
                        }
                        Err(e) => {
                            error!(
                                "Failed to deserialize client message from player {}: {}",
                                player_id,
                                e
                            );
                        }
                    }
                } else {
                    error!("Failed to convert message to string from player {}", player_id);
                }
            }
            Err(e) => {
                error!("WebSocket error for player {}: {}", player_id, e);
                break; // Exit loop on WebSocket error
            }
        }
    }

    // Cleanup
    info!("Cleaning up resources for player: {}", player_id);
    game_loop.abort();
    let mut players = players.lock().await;
    players.remove(&player_id);
    info!("Player {} disconnected.  Game resources cleaned up.", player_id);
}
