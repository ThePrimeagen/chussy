// 3D Snake Game Implementation with Hyperbolic Geometry
class Snake3D {
    constructor(canvas) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        
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
        
        // Initialize snake segments with cheese textures
        this.segments = [];
        this.snakeGeometry = new THREE.BoxGeometry(1, 1, 0.2);
        this.cheeseLoader = new CheeseTextureLoader();
        
        // Create materials for different segments
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
        
        // Camera position in hyperbolic space
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
        
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
        this.currentRotation = 0;
        
        // Initialize food with special cheese texture
        this.foodMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            map: await this.cheeseLoader.loadTexture('cheezus')
        });
        
        // Start animation loop
        this.animate();
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
        if (this.direction.z !== 0) {
            this.segments[0].rotation.z = this.direction.z > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            this.segments[0].rotation.z = this.direction.x < 0 ? Math.PI : 0;
        }
        
        // Update body and tail rotations based on relative positions
        for (let i = 1; i < this.segments.length; i++) {
            const curr = this.segments[i].position;
            const prev = this.segments[i-1].position;
            const direction = new THREE.Vector3()
                .subVectors(prev, curr)
                .normalize();
            
            // Apply rotation based on movement direction
            if (direction.z !== 0) {
                this.segments[i].rotation.z = direction.z > 0 ? Math.PI / 2 : -Math.PI / 2;
            } else {
                this.segments[i].rotation.z = direction.x < 0 ? Math.PI : 0;
            }
        }
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
        const hyperbolicPos = this.applyHyperbolicTransform(position);
        
        // Check food collision
        if (this.food && this.distanceInHyperbolicSpace(hyperbolicPos, this.food.position) < 0.5) {
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
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
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

    // Update snake rotation based on direction
    updateRotation() {
        let targetRotation = 0;
        if (this.direction.z < 0) { // UP
            targetRotation = -Math.PI / 2;
        } else if (this.direction.z > 0) { // DOWN
            targetRotation = Math.PI / 2;
        } else if (this.direction.x < 0) { // LEFT
            targetRotation = Math.PI;
        }
        
        // Smoothly interpolate rotation
        this.currentRotation += (targetRotation - this.currentRotation) * 0.2;
    }

    update() {
        // Update snake position
        this.position.add(this.direction.multiplyScalar(this.speed));
        const hyperbolicPos = this.applyHyperbolicTransform(this.position);
        
        // Check collisions
        const collision = this.checkCollision(this.position);
        if (collision === 'self') {
            document.getElementById('vineBoomSound').play();
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
        switch(key) {
            case 'arrowup':
            case 'w':
            case 'k':
                this.direction.set(0, 0, -1);
                break;
            case 'arrowdown':
            case 's':
            case 'j':
                this.direction.set(0, 0, 1);
                break;
            case 'arrowleft':
            case 'a':
            case 'h':
                this.direction.set(-1, 0, 0);
                break;
            case 'arrowright':
            case 'd':
            case 'l':
                this.direction.set(1, 0, 0);
                break;
        }
    }
}
