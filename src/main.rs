use warp::Filter;
use tokio::sync::broadcast;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use rand::Rng;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Player {
    id: String,
    score: u32,
    primeagems: u32,
    snake: Vec<(i32, i32)>,
    direction: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct GameState {
    players: HashMap<String, Player>,
    food: (i32, i32),
}

type Players = Arc<Mutex<HashMap<String, Player>>>;

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
    // WebSocket connection handler implementation
    println!("New WebSocket client connected");
}
