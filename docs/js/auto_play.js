// Auto-play functionality for snake game
class SnakeBot {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.lastMoveTime = Date.now();
        this.moveInterval = 200; // Move every 200ms
    }

    activate() {
        this.isActive = true;
        if (this.indicator) {
            this.indicator.style.opacity = '1';
        }
        this.update();
    }

    deactivate() {
        this.isActive = false;
        if (this.indicator) {
            this.indicator.style.opacity = '0';
        }
    }

    update() {
        if (!this.isActive) return;

        const now = Date.now();
        if (now - this.lastMoveTime >= this.moveInterval) {
            this.makeMove();
            this.lastMoveTime = now;
        }

        requestAnimationFrame(() => this.update());
    }

    makeMove() {
        const head = this.game.snake[0];
        const food = this.game.food;
        const currentDirection = this.game.direction;

        // Calculate direction to food
        const dx = food.x - head.x;
        const dy = food.y - head.y;

        // Determine best move while avoiding walls and self
        let bestMove = this.findSafestMove(dx, dy);
        
        // Update game direction
        if (bestMove && bestMove !== this.game.direction) {
            this.game.directionQueue.push(bestMove);
        }
    }

    findSafestMove(dx, dy) {
        const possibleMoves = ['up', 'down', 'left', 'right'];
        const head = this.game.snake[0];
        
        // Filter out invalid moves (opposite direction)
        const validMoves = possibleMoves.filter(move => {
            switch(move) {
                case 'up': return this.game.direction !== 'down';
                case 'down': return this.game.direction !== 'up';
                case 'left': return this.game.direction !== 'right';
                case 'right': return this.game.direction !== 'left';
            }
        });

        // Score each move based on food direction and obstacles
        const scoredMoves = validMoves.map(move => {
            let score = 0;
            let newX = head.x;
            let newY = head.y;

            switch(move) {
                case 'up': newY--; break;
                case 'down': newY++; break;
                case 'left': newX--; break;
                case 'right': newX++; break;
            }

            // Check for collisions
            if (newX < 0 || newX >= this.game.canvas.width/20 || 
                newY < 0 || newY >= this.game.canvas.height/20) {
                return { move, score: -1000 };
            }

            // Check for self-collision
            if (this.game.snake.some(segment => segment.x === newX && segment.y === newY)) {
                return { move, score: -1000 };
            }

            // Score based on food direction
            if ((dx > 0 && move === 'right') || (dx < 0 && move === 'left')) {
                score += 10;
            }
            if ((dy > 0 && move === 'down') || (dy < 0 && move === 'up')) {
                score += 10;
            }

            return { move, score };
        });

        // Return the move with the highest score
        const bestMove = scoredMoves.reduce((best, current) => 
            current.score > best.score ? current : best
        );

        return bestMove.score > -1000 ? bestMove.move : null;
    }
}
