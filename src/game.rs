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
}

impl Snake {
    pub fn new(start_pos: Position) -> Self {
        let mut body = VecDeque::new();
        body.push_back(start_pos);
        Snake {
            body,
            direction: Direction::Right,
            growing: false,
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
        if self.body.iter().skip(1).any(|pos| pos.x == new_head.x && pos.y == new_head.y) {
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
        // Prevent 180-degree turns
        let invalid_turn = match (self.direction, new_direction) {
            (Direction::Up, Direction::Down) |
            (Direction::Down, Direction::Up) |
            (Direction::Left, Direction::Right) |
            (Direction::Right, Direction::Left) => true,
            _ => false,
        };

        if !invalid_turn {
            self.direction = new_direction;
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
        }
    }

    pub fn update(&mut self, bounds: (i32, i32)) {
        if self.game_over {
            return;
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
        
        // Test right movement
        snake.move_forward((10, 10));
        assert_eq!(snake.body.len(), 1);
        assert_eq!(snake.body.front().unwrap().x, 6);
        
        // Test down movement
        snake.set_direction(Direction::Down);
        snake.move_forward((10, 10));
        assert_eq!(snake.body.front().unwrap().y, 6);
        
        // Test left movement
        snake.set_direction(Direction::Left);
        snake.move_forward((10, 10));
        assert_eq!(snake.body.front().unwrap().x, 5);
        
        // Test up movement
        snake.set_direction(Direction::Up);
        snake.move_forward((10, 10));
        assert_eq!(snake.body.front().unwrap().y, 5);
    }

    #[test]
    fn test_snake_growth() {
        let mut snake = Snake::new(Position { x: 5, y: 5 });
        snake.grow();
        snake.move_forward((10, 10));
        assert_eq!(snake.body.len(), 2);
        
        // Test multiple growth
        snake.grow();
        snake.move_forward((10, 10));
        assert_eq!(snake.body.len(), 3);
    }

    #[test]
    fn test_snake_collision() {
        let mut snake = Snake::new(Position { x: 5, y: 5 });
        
        // Create a snake long enough to collide with itself
        for _ in 0..3 {
            snake.grow();
            snake.move_forward((10, 10));
        }
        
        // Make the snake turn into itself
        snake.set_direction(Direction::Down);
        snake.move_forward((10, 10));
        snake.set_direction(Direction::Left);
        snake.move_forward((10, 10));
        snake.set_direction(Direction::Up);
        
        // Should collide with itself
        assert!(!snake.move_forward((10, 10)));
    }

    #[test]
    fn test_game_state() {
        let mut game = GameState::new((10, 10));
        assert_eq!(game.score, 0);
        assert_eq!(game.primeagems, 0);
        assert!(!game.game_over);

        // Force food position for testing
        game.food = Position { x: 6, y: 5 };
        let start_pos = game.snake.body.front().unwrap().clone();
        assert_eq!(start_pos.x, 5); // Snake starts at (5,5)
        assert_eq!(start_pos.y, 5);

        // Move snake to food
        game.update((10, 10)); // Move right to (6,5)
        assert_eq!(game.score, 10);
        assert_eq!(game.primeagems, 1);
        
        // Verify new food spawned
        assert!(game.food.x != 6 || game.food.y != 5);
    }

    #[test]
    fn test_invalid_direction_change() {
        let mut snake = Snake::new(Position { x: 5, y: 5 });
        snake.grow();
        snake.move_forward((10, 10));

        // Cannot turn 180 degrees
        snake.set_direction(Direction::Left);
        assert_eq!(snake.direction, Direction::Right);
    }
}
