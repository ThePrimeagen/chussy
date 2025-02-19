// 3D Snake Game with Combat System
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
        
        // Initialize weapons
        this.bullets = [];
        this.bulletGeometry = new THREE.SphereGeometry(0.2);
        this.bulletMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        
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
    
    shoot() {
        const bullet = new THREE.Mesh(this.bulletGeometry, this.bulletMaterial);
        bullet.position.copy(this.segments[0].position);
        bullet.direction = this.direction.clone();
        this.bullets.push(bullet);
        this.scene.add(bullet);
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
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.add(bullet.direction.multiplyScalar(0.5));
            
            // Remove bullets that are too far
            if (bullet.position.length() > 20) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}
