// 3D Snake Game Implementation with Hyperbolic Geometry
class Snake3D {
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Canvas element is required');
        }
        if (!window.THREE) {
            throw new Error('THREE.js is required');
        }
        if (!window.THREE.SVGLoader) {
            throw new Error('THREE.SVGLoader is required');
        }
        
        // Initialize scene and renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        
        // Initialize death counter for autoplay
        this.deathCount = 0;
        this.autoplayEnabled = false;
        
        // Initialize properties
        this.segments = [];
        this.snakeGeometry = new THREE.BoxGeometry(1, 1, 0.2);
        this.cheeseLoader = new CheeseTextureLoader();
        this.headMaterial = null;
        this.bodyMaterial = null;
        this.tailMaterial = null;
        this.foodMaterial = null;
        this.food = null;
        
        // Game state
        this.score = 0;
        this.gems = 0;
        this.level = 1;
        this.speedBoostActive = false;
        this.pointMultiplier = 1;
        
        // Movement state
        this.direction = new THREE.Vector3(1, 0, 0);
        this.position = new THREE.Vector3(0, 0, 0);
        this.speed = 0.1;
        this.yRotation = 0;
        
        // Camera position in hyperbolic space
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
    }
    
    async init() {
        try {
            // Setup lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            this.scene.add(ambientLight, directionalLight);
            
            // Setup hyperbolic grid
            const gridGeometry = new THREE.TorusGeometry(10, 0.1, 16, 100);
            const gridMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
            this.hyperbolicGrid = new THREE.Mesh(gridGeometry, gridMaterial);
            this.scene.add(this.hyperbolicGrid);

            // Load textures
            this.headMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                map: await this.cheeseLoader.loadTexture('swiss')
            });
            
            this.bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                map: await this.cheeseLoader.loadTexture('cheddar')
            });
            
            this.tailMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                map: await this.cheeseLoader.loadTexture('gouda')
            });
            
            this.foodMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                map: await this.cheeseLoader.loadTexture('cheezus')
            });
            
            // Start game
            this.spawnFood();
            this.animate();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            throw error; // Re-throw to notify game.html
        }
    }
    
    // Create a new segment with the appropriate cheese texture and rotation
    createSegment(type = 'body', direction = new THREE.Vector3(1, 0, 0)) {
        const material = type === 'head' ? this.headMaterial.clone() :
                        type === 'tail' ? this.tailMaterial.clone() :
                        this.bodyMaterial.clone();
        
        const segment = new THREE.Mesh(this.snakeGeometry, material);
        
        // Apply rotation based on direction
        if (direction.z !== 0) {
            // Handle up/down rotation
            segment.rotation.z = direction.z > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            // Handle left/right rotation
            segment.rotation.z = direction.x < 0 ? Math.PI : 0;
        }
        
        return segment;
    }
    
    // Update segment rotations based on movement
    updateSegmentRotations() {
        if (this.segments.length === 0) return;
        
        // Update head rotation based on movement direction
        const headRotation = this.calculateRotation(this.direction);
        this.segments[0].rotation.z = headRotation;
        
        // Update body and tail rotations based on relative positions
        for (let i = 1; i < this.segments.length; i++) {
            const curr = this.segments[i].position;
            const prev = this.segments[i-1].position;
            const direction = new THREE.Vector3()
                .subVectors(prev, curr)
                .normalize();
            
            // Apply same rotation logic to all segments
            this.segments[i].rotation.z = this.calculateRotation(direction);
        }
    }
    
    // Calculate rotation angle based on direction
    calculateRotation(direction) {
        if (direction.z < 0) { // UP
            return -Math.PI / 2; // -90 degrees
        } else if (direction.z > 0) { // DOWN
            return Math.PI / 2;  // 90 degrees
        } else if (direction.x < 0) { // LEFT
            return Math.PI;      // 180 degrees
        }
        return 0;               // RIGHT: 0 degrees
    }

    // Calculate distance between two points in hyperbolic space
    distanceInHyperbolicSpace(pos1, pos2) {
        const h1 = this.applyHyperbolicTransform(pos1);
        const h2 = this.applyHyperbolicTransform(pos2);
        return h1.distanceTo(h2);
    }

    // Spawn food in hyperbolic space
    spawnFood() {
        if (this.food) {
            this.scene.remove(this.food);
        }
        
        const food = new THREE.Mesh(this.snakeGeometry, this.foodMaterial.clone());
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 5 + 2; // Random radius between 2 and 7
        
        food.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
        
        this.food = food;
        this.scene.add(food);
    }

    // Check for collisions in hyperbolic space
    checkCollision(position) {
        if (!position || !this.food) return null;
        
        const hyperbolicPos = this.applyHyperbolicTransform(position);
        
        // Check food collision
        if (this.distanceInHyperbolicSpace(hyperbolicPos, this.food.position) < 0.5) {
            this.score += 10 * this.pointMultiplier;
            this.gems++;
            
            // Add new segment
            const lastSegment = this.segments[this.segments.length - 1];
            const newSegment = this.createSegment('body', this.direction);
            newSegment.position.copy(lastSegment.position);
            this.segments.push(newSegment);
            this.scene.add(newSegment);
            
            this.spawnFood();
            return 'food';
        }
        
        // Check self collision
        if (this.segments.length > 1 && this.segments.slice(1).some(segment => 
            this.distanceInHyperbolicSpace(hyperbolicPos, segment.position) < 0.5)) {
            return 'self';
        }
        return null;
    }
    
    animate() {
        if (!this.scene || !this.renderer || !this.camera) return;
        requestAnimationFrame(() => this.animate());
        this.update();
        try {
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Failed to render scene:', error);
            document.getElementById('overlay').classList.remove('hidden');
        }
    }
    
    // Apply hyperbolic transformation
    applyHyperbolicTransform(position) {
        const r = Math.sqrt(position.x * position.x + position.z * position.z);
        const scale = 2.0 / (1.0 + r * r);
        return new THREE.Vector3(
            position.x * scale,
            position.y,
            position.z * scale
        );
    }

    update() {
        if (!this.segments || !this.scene) return;
        
        // Handle autoplay if enabled
        if (this.autoplayEnabled) {
            this.handleBotMove();
        }
        
        // Create a copy of direction for position update to avoid modifying the original
        const moveDir = this.direction.clone().multiplyScalar(this.speed);
        this.position.add(moveDir);
        const hyperbolicPos = this.applyHyperbolicTransform(this.position);
        
        // Check collisions
        const collision = this.checkCollision(this.position);
        if (collision === 'self') {
            this.deathCount++;
            if (this.deathCount >= 5) {
                this.autoplayEnabled = true;
            }
            try {
                const sound = document.getElementById('vineBoomSound');
                if (sound) {
                    sound.play().catch(console.error); // Handle autoplay restrictions
                }
            } catch (error) {
                console.error('Failed to play sound:', error);
            }
            document.getElementById('overlay').classList.remove('hidden');
            return;
        }
        
        // Update snake segments
        if (this.segments.length === 0) {
            const segment = this.createSegment('head', this.direction);
            segment.position.copy(hyperbolicPos);
            this.segments.push(segment);
            this.scene.add(segment);
        } else {
            // Update positions with hyperbolic transform
            for (let i = this.segments.length - 1; i > 0; i--) {
                const pos = this.segments[i-1].position.clone();
                const hyperbolicPos = this.applyHyperbolicTransform(pos);
                this.segments[i].position.copy(hyperbolicPos);
            }
            
            // Update head position
            this.segments[0].position.copy(hyperbolicPos);
            
            // Update all segment rotations based on movement direction
            this.updateSegmentRotations();
        }
        
        // Update hyperbolic grid rotation for visual effect
        if (this.hyperbolicGrid) {
            this.hyperbolicGrid.rotation.y += 0.001;
        }
    }
    
    handleInput(key) {
        if (!key || this.autoplayEnabled) return;
        
        const dir = new THREE.Vector3();
        dir.copy(this.direction);
        
        switch(key) {
            case 'arrowup':
            case 'w':
            case 'k':
                dir.z = -1;
                break;
            case 'arrowdown':
            case 's':
            case 'j':
                dir.z = 1;
                break;
            case 'arrowleft':
            case 'a':
            case 'h':
                dir.x = -1;
                break;
            case 'arrowright':
            case 'd':
            case 'l':
                dir.x = 1;
                break;
            case 'r': // Move up
                dir.y = 1;
                break;
            case 'f': // Move down
                dir.y = -1;
                break;
            case 'q': // Roll left
                this.yRotation = (this.yRotation - Math.PI / 2) % (Math.PI * 2);
                break;
            case 'e': // Roll right
                this.yRotation = (this.yRotation + Math.PI / 2) % (Math.PI * 2);
                break;
            default:
                return; // Ignore unknown keys
        }
        
        // Apply rotation
        dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yRotation);
        this.direction.copy(dir.normalize());
    }

    handleBotMove() {
        if (!this.food) return;
        
        const foodPos = this.food.position;
        const snakePos = this.position;
        
        // Calculate direction to food
        const dirToFood = new THREE.Vector3()
            .subVectors(foodPos, snakePos)
            .normalize();
        
        // Avoid self-collision
        for (const segment of this.segments) {
            const dirToSegment = new THREE.Vector3()
                .subVectors(segment.position, snakePos)
                .normalize();
            if (dirToSegment.dot(dirToFood) > 0.9) {
                // Too close to segment, turn perpendicular
                dirToFood.cross(new THREE.Vector3(0, 1, 0));
            }
        }
        
        // Update direction based on food position
        this.direction.copy(dirToFood);
    }


    reset() {
        // Reset position and rotation
        this.position.set(0, 0, 0);
        this.direction.set(1, 0, 0);
        this.yRotation = 0;
        
        // Reset game state
        this.score = 0;
        this.gems = 0;
        this.level = 1;
        this.speedBoostActive = false;
        this.pointMultiplier = 1;
        
        // Clear segments
        this.segments.forEach(segment => this.scene.remove(segment));
        this.segments = [];
        
        // Reset food
        if (this.food) {
            this.scene.remove(this.food);
            this.food = null;
        }
        
        // Spawn new food
        this.spawnFood();
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Snake3D;
}
