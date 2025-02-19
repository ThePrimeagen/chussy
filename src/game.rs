use serde::{Serialize, Deserialize};
use rand::Rng;
use std::collections::VecDeque;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub struct Position {
    pub x: i32,
    pub y: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snake {
    pub body: VecDeque<Position>,
    pub direction: Direction,
    pub growing: bool,
    #[serde(skip)]
    last_direction_change: Option<std::time::Instant>,
}

impl Snake {
    pub fn new(start_pos: Position) -> Self {
        let mut body = VecDeque::new();
        body.push_back(start_pos);
        Snake {
            body,
            direction: Direction::Right,
            growing: false,
            last_direction_change: None,
        }
    }

    pub fn move_forward(&mut self, bounds: (i32, i32)) -> bool {
        let head = self.body.front().unwrap();
        let new_head = match self.direction {
            Direction::Up => Position { x: head.x, y: (head.y - 1).rem_euclid(bounds.1) },
            Direction::Down => Position { x: head.x, y: (head.y + 1).rem_euclid(bounds.1) },
            Direction::Left => Position { x: (head.x - 1).rem_euclid(bounds.0), y: head.y },
            Direction::Right => Position { x: (head.x + 1).rem_euclid(bounds.0), y: head.y },
        };

        // Check self-collision
        if self.body.iter().any(|pos| pos.x == new_head.x && pos.y == new_head.y) {
            return false;
        }

        self.body.push_front(new_head);
        if !self.growing {
            self.body.pop_back();
        }
        self.growing = false;
        true
    }

    pub fn grow(&mut self) {
        self.growing = true;
    }

    pub fn set_direction(&mut self, new_direction: Direction) {
        // Prevent 180-degree turns and too rapid direction changes
        let invalid_turn = match (self.direction, new_direction) {
            (Direction::Up, Direction::Down) |
            (Direction::Down, Direction::Up) |
            (Direction::Left, Direction::Right) |
            (Direction::Right, Direction::Left) => true,
            _ => false,
        };

        let now = std::time::Instant::now();
        let can_change = self.last_direction_change
            .map(|last| now.duration_since(last).as_millis() >= 50) // Minimum 50ms between direction changes
            .unwrap_or(true);

        if !invalid_turn && can_change {
            self.direction = new_direction;
            self.last_direction_change = Some(now);
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    pub snake: Snake,
    pub food: Position,
    pub score: u32,
    pub primeagems: u32,
    pub game_over: bool,
    pub ml_training: bool,
    pub bot_moves: Vec<Direction>,
    pub death_count: u32,
    pub autoplay_enabled: bool,
}

impl GameState {
    pub fn new(bounds: (i32, i32)) -> Self {
        let start_pos = Position { x: bounds.0 / 2, y: bounds.1 / 2 };
        let mut rng = rand::thread_rng();
        let food = Position {
            x: rng.gen_range(0..bounds.0),
            y: rng.gen_range(0..bounds.1),
        };

        GameState {
            snake: Snake::new(start_pos),
            food,
            score: 0,
            primeagems: 0,
            game_over: false,
            ml_training: false,
            bot_moves: Vec::new(),
            death_count: 0,
            autoplay_enabled: false,
        }
    }

    fn calculate_bot_move(&self, bounds: (i32, i32)) -> Direction {
        let head = self.snake.body.front().unwrap();
        let food = &self.food;
        
        // Simple pathfinding: Try to align with food on one axis first
        if head.x != food.x {
            if (food.x > head.x && self.snake.direction != Direction::Left) ||
               (food.x < head.x && self.snake.direction != Direction::Right) {
                return if food.x > head.x { Direction::Right } else { Direction::Left };
            }
        }
        if head.y != food.y {
            if (food.y > head.y && self.snake.direction != Direction::Up) ||
               (food.y < head.y && self.snake.direction != Direction::Down) {
                return if food.y > head.y { Direction::Down } else { Direction::Up };
            }
        }
        
        // If we can't move directly toward food, try to avoid walls and self
        let mut available_directions = vec![
            Direction::Up,
            Direction::Down,
            Direction::Left,
            Direction::Right,
        ];
        available_directions.retain(|&dir| {
            let next_pos = match dir {
                Direction::Up => Position { x: head.x, y: (head.y - 1).rem_euclid(bounds.1) },
                Direction::Down => Position { x: head.x, y: (head.y + 1).rem_euclid(bounds.1) },
                Direction::Left => Position { x: (head.x - 1).rem_euclid(bounds.0), y: head.y },
                Direction::Right => Position { x: (head.x + 1).rem_euclid(bounds.0), y: head.y },
            };
            !self.snake.body.iter().any(|pos| pos.x == next_pos.x && pos.y == next_pos.y)
        });
        
        if !available_directions.is_empty() {
            available_directions[0]
        } else {
            self.snake.direction // Last resort: keep current direction
        }
    }

    pub fn update(&mut self, bounds: (i32, i32)) {
        if self.game_over {
            self.death_count += 1;
            if self.death_count >= 5 {
                self.autoplay_enabled = true;
            }
            self.game_over = false;
            self.snake = Snake::new(Position { x: bounds.0 / 2, y: bounds.1 / 2 });
            return;
        }

        if self.autoplay_enabled {
            let bot_move = self.calculate_bot_move(bounds);
            self.snake.set_direction(bot_move);
        }

        if !self.snake.move_forward(bounds) {
            self.game_over = true;
            return;
        }

        let head = self.snake.body.front().unwrap();
        if head.x == self.food.x && head.y == self.food.y {
            self.snake.grow();
            self.score += 10;
            self.primeagems += 1;

            // Spawn new food
            let mut rng = rand::thread_rng();
            self.food = Position {
                x: rng.gen_range(0..bounds.0),
                y: rng.gen_range(0..bounds.1),
            };
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_snake_movement() {
        let mut snake = Snake::new(Position { x: 5, y: 5 });
        assert_eq!(snake.body.len(), 1);
        
        snake.move_forward((10, 10));
        assert_eq!(snake.body.len(), 1);
        assert_eq!(snake.body.front().unwrap().x, 6);
    }

    #[test]
    fn test_snake_growth() {
        let mut snake = Snake::new(Position { x: 5, y: 5 });
        snake.grow();
        snake.move_forward((10, 10));
        assert_eq!(snake.body.len(), 2);
    }

    #[test]
    fn test_snake_collision() {
        let mut snake = Snake::new(Position { x: 5, y: 5 });
        snake.grow();
        snake.move_forward((10, 10));
        snake.set_direction(Direction::Down);
        snake.move_forward((10, 10));
        snake.set_direction(Direction::Left);
        snake.move_forward((10, 10));
        snake.set_direction(Direction::Up);
        assert!(!snake.move_forward((10, 10)));
    }
}
