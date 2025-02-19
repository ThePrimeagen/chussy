// 2D Snake Game Implementation
class Snake2D {
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Canvas element is required');
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game state
        this.score = 0;
        this.gems = 0;
        this.level = 1;
        this.speedBoostActive = false;
        this.pointMultiplier = 1;
        this.deathCount = 0;
        this.autoplayEnabled = false;
        
        // Snake properties
        this.gridSize = 20;
        this.segments = [{x: 10, y: 10}];
        this.direction = {x: 1, y: 0};
        this.food = this.spawnFood();
        
        // Animation control
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 30; // 30 FPS
        
        // Colors
        this.colors = {
            head: '#ffeb3b',
            body: '#ffa726',
            food: '#4caf50',
            background: document.documentElement.classList.contains('dark') ? '#2d0059' : '#ffffe0'
        };
        
        // Start game
        this.animate();
    }
    
    spawnFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }
    
    checkCollision(x, y) {
        // Check wall collision
        if (x < 0 || x >= this.canvas.width / this.gridSize || 
            y < 0 || y >= this.canvas.height / this.gridSize) {
            return 'wall';
        }
        
        // Check self collision
        for (let i = 1; i < this.segments.length; i++) {
            if (this.segments[i].x === x && this.segments[i].y === y) {
                return 'self';
            }
        }
        
        // Check food collision
        if (this.food.x === x && this.food.y === y) {
            this.score += 10 * this.pointMultiplier;
            this.gems++;
            this.food = this.spawnFood();
            return 'food';
        }
        
        return null;
    }
    
    update() {
        const head = this.segments[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        const collision = this.checkCollision(newHead.x, newHead.y);
        if (collision === 'wall' || collision === 'self') {
            this.deathCount++;
            if (this.deathCount >= 5) {
                this.autoplayEnabled = true;
            }
            try {
                const sound = document.getElementById('vineBoomSound');
                if (sound) {
                    sound.currentTime = 0;
                    sound.play().catch(error => {
                        console.warn('Failed to play sound:', error);
                    });
                }
            } catch (error) {
                console.error('Error playing sound:', error);
            }
            document.getElementById('overlay').classList.remove('hidden');
            setTimeout(() => {
                this.reset();
                document.getElementById('overlay').classList.add('hidden');
            }, 3000);
            return;
        }
        
        this.segments.unshift(newHead);
        if (collision !== 'food') {
            this.segments.pop();
        }
        
        if (this.autoplayEnabled) {
            this.handleBotMove();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.segments.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? this.colors.head : this.colors.body;
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });
        
        // Draw food
        this.ctx.fillStyle = this.colors.food;
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }
    
    animate(currentTime = 0) {
        if (currentTime - this.lastFrameTime >= this.frameInterval) {
            this.update();
            this.draw();
            this.lastFrameTime = currentTime;
        }
        requestAnimationFrame(time => this.animate(time));
    }
    
    handleInput(key) {
        if (this.autoplayEnabled) return;
        
        const newDirection = {...this.direction};
        switch(key.toLowerCase()) {
            case 'arrowup':
            case 'w':
            case 'k':
                if (this.direction.y !== 1) newDirection.y = -1, newDirection.x = 0;
                break;
            case 'arrowdown':
            case 's':
            case 'j':
                if (this.direction.y !== -1) newDirection.y = 1, newDirection.x = 0;
                break;
            case 'arrowleft':
            case 'a':
            case 'h':
                if (this.direction.x !== 1) newDirection.x = -1, newDirection.y = 0;
                break;
            case 'arrowright':
            case 'd':
            case 'l':
                if (this.direction.x !== -1) newDirection.x = 1, newDirection.y = 0;
                break;
        }
        this.direction = newDirection;
    }
    
    handleBotMove() {
        const head = this.segments[0];
        const dx = this.food.x - head.x;
        const dy = this.food.y - head.y;
        
        // Try to move horizontally first
        if (dx !== 0) {
            const newDirection = {x: dx > 0 ? 1 : -1, y: 0};
            // Check if this move would cause collision
            const collision = this.checkCollision(head.x + newDirection.x, head.y);
            if (!collision || collision === 'food') {
                this.direction = newDirection;
                return;
            }
        }
        
        // Try to move vertically if horizontal movement isn't possible
        if (dy !== 0) {
            const newDirection = {x: 0, y: dy > 0 ? 1 : -1};
            const collision = this.checkCollision(head.x, head.y + newDirection.y);
            if (!collision || collision === 'food') {
                this.direction = newDirection;
                return;
            }
        }
        
        // If both direct paths are blocked, try to find an escape route
        const possibleDirections = [
            {x: 1, y: 0}, {x: -1, y: 0},
            {x: 0, y: 1}, {x: 0, y: -1}
        ].filter(dir => {
            const collision = this.checkCollision(head.x + dir.x, head.y + dir.y);
            return !collision || collision === 'food';
        });
        
        if (possibleDirections.length > 0) {
            this.direction = possibleDirections[0];
        }
    }
    
    reset() {
        this.segments = [{x: 10, y: 10}];
        this.direction = {x: 1, y: 0};
        this.food = this.spawnFood();
        this.score = 0;
        this.gems = 0;
        this.level = 1;
        this.speedBoostActive = false;
        this.pointMultiplier = 1;
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Snake2D;
}
