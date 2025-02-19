mod game;

use warp::Filter;
use tokio::sync::broadcast;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use futures::{FutureExt, StreamExt};
use game::{GameState, Direction};

type Players = Arc<Mutex<HashMap<String, GameState>>>;

#[derive(Debug, Serialize, Deserialize)]
struct ClientMessage {
    action: String,
    direction: Option<Direction>,
    ml_training: Option<bool>,
}

#[tokio::main]
async fn main() {
    let players: Players = Arc::new(Mutex::new(HashMap::new()));
    let (tx, _) = broadcast::channel(1000); // Channel for game state updates

    // Serve static files from assets directory
    let assets = warp::path("assets").and(warp::fs::dir("assets"));
    
    // WebSocket handler
    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(with_players(players.clone()))
        .and(with_tx(tx.clone()))
        .map(|ws: warp::ws::Ws, players, tx| {
            ws.on_upgrade(move |socket| handle_ws_client(socket, players, tx))
        });

    let routes = assets.or(ws_route);
    
    println!("Server starting on port 8000...");
    warp::serve(routes).run(([127, 0, 0, 1], 8000)).await;
}

fn with_players(players: Players) -> impl Filter<Extract = (Players,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || players.clone())
}

fn with_tx(tx: broadcast::Sender<String>) -> impl Filter<Extract = (broadcast::Sender<String>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || tx.clone())
}

async fn handle_ws_client(ws: warp::ws::WebSocket, players: Players, tx: broadcast::Sender<String>) {
    let (ws_sender, mut ws_receiver) = ws.split();
    let player_id = uuid::Uuid::new_v4().to_string();
    
    // Initialize player's game state
    {
        let mut players = players.lock().await;
        players.insert(player_id.clone(), GameState::new((30, 30)));
    }

    // Game loop
    let game_loop = tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(100));
        loop {
            interval.tick().await;
            let mut players = players.lock().await;
            if let Some(state) = players.get_mut(&player_id) {
                state.update((30, 30));
                if let Ok(state_json) = serde_json::to_string(&state) {
                    let _ = tx.send(state_json);
                }
            }
        }
    });

    // Handle incoming messages
    while let Some(result) = ws_receiver.next().await {
        match result {
            Ok(msg) => {
                if let Ok(text) = msg.to_str() {
                    if let Ok(client_msg) = serde_json::from_str::<ClientMessage>(text) {
                        let mut players = players.lock().await;
                        if let Some(state) = players.get_mut(&player_id) {
                            match client_msg.action.as_str() {
                                "direction" => {
                                    if let Some(direction) = client_msg.direction {
                                        state.snake.set_direction(direction);
                                        if state.ml_training {
                                            state.bot_moves.push(direction);
                                        }
                                    }
                                }
                                "toggle_ml_training" => {
                                    if let Some(training) = client_msg.ml_training {
                                        state.ml_training = training;
                                        if training {
                                            state.bot_moves.clear();
                                        }
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                }
            }
            Err(_) => break,
        }
    }

    // Cleanup
    game_loop.abort();
    let mut players = players.lock().await;
    players.remove(&player_id);
}
