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
    
    // Create a new segment with the appropriate cheese texture
    createSegment(type = 'body') {
        const material = type === 'head' ? this.headMaterial.clone() :
                        type === 'tail' ? this.tailMaterial.clone() :
                        this.bodyMaterial.clone();
        
        const segment = new THREE.Mesh(this.snakeGeometry, material);
        return segment;
    }

    // Calculate distance between two points in hyperbolic space
    distanceInHyperbolicSpace(pos1, pos2) {
        const h1 = this.applyHyperbolicTransform(pos1);
        const h2 = this.applyHyperbolicTransform(pos2);
        return h1.distanceTo(h2);
    }

    // Check for collisions in hyperbolic space
    checkCollision(position) {
        const hyperbolicPos = this.applyHyperbolicTransform(position);
        
        // Check food collision
        if (this.food && this.distanceInHyperbolicSpace(hyperbolicPos, this.food.position) < 0.5) {
            this.score += 10 * this.pointMultiplier;
            this.gems++;
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
        
        // Update rotations
        this.updateRotation();
        
        // Update snake segments
        if (this.segments.length === 0) {
            const segment = new THREE.Mesh(this.snakeGeometry, this.snakeMaterial.clone());
            segment.material.map = this.headTexture;
            segment.position.copy(hyperbolicPos);
            segment.rotation.z = this.currentRotation;
            this.segments.push(segment);
            this.scene.add(segment);
        } else {
            // Update positions with hyperbolic transform
            for (let i = this.segments.length - 1; i > 0; i--) {
                const pos = this.segments[i-1].position.clone();
                const hyperbolicPos = this.applyHyperbolicTransform(pos);
                this.segments[i].position.copy(hyperbolicPos);
                
                // Update segment textures and rotations
                const material = this.segments[i].material;
                if (i === this.segments.length - 1) {
                    material.map = this.tailTexture;
                } else {
                    material.map = this.bodyTexture;
                }
                material.needsUpdate = true;
            }
            
            // Update head position and rotation
            this.segments[0].position.copy(hyperbolicPos);
            this.segments[0].rotation.z = this.currentRotation;
            this.segments[0].material.map = this.headTexture;
            this.segments[0].material.needsUpdate = true;
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
