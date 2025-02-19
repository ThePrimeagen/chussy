// 3D Snake Game Implementation
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
        
        // Setup grid for reference
        const gridHelper = new THREE.GridHelper(20, 20);
        this.scene.add(gridHelper);
        
        // Initialize snake segments
        this.segments = [];
        this.snakeGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.snakeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        
        // Camera position
        this.camera.position.set(0, 15, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Game state
        this.direction = new THREE.Vector3(1, 0, 0);
        this.position = new THREE.Vector3(0, 0, 0);
        this.speed = 0.1;
        
        // Start animation loop
        this.animate();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    update() {
        // Update snake position
        this.position.add(this.direction.multiplyScalar(this.speed));
        
        // Update snake segments
        if (this.segments.length === 0) {
            const segment = new THREE.Mesh(this.snakeGeometry, this.snakeMaterial);
            segment.position.copy(this.position);
            this.segments.push(segment);
            this.scene.add(segment);
        } else {
            for (let i = this.segments.length - 1; i > 0; i--) {
                this.segments[i].position.copy(this.segments[i-1].position);
            }
            this.segments[0].position.copy(this.position);
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
