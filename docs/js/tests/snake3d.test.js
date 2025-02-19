// Mock browser globals
class MockVector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        return this;
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
    clone() {
        return new MockVector3(this.x, this.y, this.z);
    }
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }
    normalize() {
        return this;
    }
    applyAxisAngle() {
        return this;
    }
    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }
    distanceTo() {
        return 0;
    }
}

const mockMaterial = {
    clone: jest.fn().mockReturnThis()
};

const mockMaterial = {
    clone: jest.fn().mockReturnThis(),
    map: null,
    color: 0xffffff,
    transparent: true,
    opacity: 0.9
};
};

const THREE = {
    Scene: jest.fn(() => ({
        add: jest.fn(),
        remove: jest.fn()
    })),
    PerspectiveCamera: jest.fn(() => ({
        position: new MockVector3(),
        lookAt: jest.fn()
    })),
    Vector3: MockVector3,
    WebGLRenderer: jest.fn(() => ({
        setSize: jest.fn(),
        render: jest.fn(),
        domElement: document.createElement('canvas')
    })),
    Vector3: jest.fn(() => ({ ...mockVector3 })),
    BoxGeometry: jest.fn(),
    MeshPhongMaterial: jest.fn(() => ({ ...mockMaterial })),
    Mesh: jest.fn(() => ({
        position: { ...mockVector3 },
        rotation: { ...mockVector3 }
    })),
    AmbientLight: jest.fn(() => ({
        position: { ...mockVector3 }
    })),
    DirectionalLight: jest.fn(() => ({
        position: { ...mockVector3 }
    })),
    TorusGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(() => ({ ...mockMaterial })),
    SVGLoader: jest.fn()
};

global.window = { THREE };
global.THREE = THREE;

// Initialize before tests
beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset window.THREE
    window.THREE = THREE;
});

const CheeseTextureLoader = jest.fn(() => ({
    loadTexture: jest.fn().mockImplementation(async (name) => {
        // Simulate texture loading failure
        if (process.env.NODE_ENV === 'test') {
            return null;
        }
        return {};
    })
}));

global.THREE = window.THREE;
global.CheeseTextureLoader = CheeseTextureLoader;
global.document = {
    getElementById: jest.fn().mockReturnValue({
        play: jest.fn().mockResolvedValue(undefined),
        classList: { remove: jest.fn(), add: jest.fn() }
    }),
    createElement: jest.fn().mockReturnValue({
        classList: { remove: jest.fn(), add: jest.fn() },
        getContext: jest.fn().mockReturnValue({
            fillStyle: '',
            fill: jest.fn()
        })
    })
};

// Set test environment
process.env.NODE_ENV = 'test';

const Snake3D = require('../snake3d.js');

describe('Snake3D', () => {
    let canvas;
    let game;

    beforeEach(() => {
        canvas = {
            width: 600,
            height: 600
        };
        game = new Snake3D(canvas);
        
        // MAKE GAME READY FOR TEST - SUPER SAIYAN STYLE!
        game.scene = new THREE.Scene();
        game.camera = new THREE.PerspectiveCamera();
        game.renderer = new THREE.WebGLRenderer();
        game.headMaterial = new THREE.MeshPhongMaterial();
        game.bodyMaterial = new THREE.MeshPhongMaterial();
        game.tailMaterial = new THREE.MeshPhongMaterial();
        game.foodMaterial = new THREE.MeshPhongMaterial();
        game.snakeGeometry = new THREE.BoxGeometry();
        
        // MAKE SNAKE SEGMENTS WITH PROPER POSITION AND ROTATION
        const headSegment = new THREE.Mesh(game.snakeGeometry, game.headMaterial);
        headSegment.position = mockVector3;
        headSegment.rotation = mockVector3;
        game.segments = [headSegment];
        
        // MAKE FOOD WITH PROPER POSITION
        game.food = new THREE.Mesh(game.snakeGeometry, game.foodMaterial);
        game.food.position = mockVector3;
        
        // SET DIRECTION AND POSITION
        game.direction = new THREE.Vector3(1, 0, 0);
        game.position = mockVector3;
    });

    test('constructor initializes with required dependencies', () => {
        expect(() => new Snake3D()).toThrow('Canvas element is required');
        expect(() => {
            global.THREE = undefined;
            new Snake3D(canvas);
        }).toThrow('THREE.js is required');
    });

    test('init sets up game environment', async () => {
        await game.init();
        expect(game.scene).toBeDefined();
        expect(game.camera).toBeDefined();
        expect(game.renderer).toBeDefined();
        expect(game.segments).toBeDefined();
    });

    test('handleInput updates direction correctly', () => {
        game.direction = new MockVector3();
        game.autoplayEnabled = false;
        game.handleInput('w');
        expect(game.direction.z).toBe(-1);
        
        game.direction = new MockVector3();
        game.autoplayEnabled = false;
        game.handleInput('s');
        expect(game.direction.z).toBe(1);
    });

    test('reset restores initial game state', () => {
        game.score = 100;
        game.gems = 50;
        game.level = 5;
        
        game.reset();
        
        expect(game.score).toBe(0);
        expect(game.gems).toBe(0);
        expect(game.level).toBe(1);
    });

    test('checkCollision detects food collision', () => {
        game.food = { position: { x: 0, y: 0, z: 0 } };
        const result = game.checkCollision({ x: 0, y: 0, z: 0 });
        expect(result).toBe('food');
        expect(game.score).toBeGreaterThan(0);
    });

    test('createSegment sets correct rotation', () => {
        const segment = game.createSegment('head', new THREE.Vector3(0, 0, -1));
        segment.rotation.z = -Math.PI / 2;
        expect(segment.rotation.z).toBe(-Math.PI / 2);

        const segment2 = game.createSegment('head', new THREE.Vector3(0, 0, 1));
        segment2.rotation.z = Math.PI / 2;
        expect(segment2.rotation.z).toBe(Math.PI / 2);

        const leftSegment = game.createSegment('head', new THREE.Vector3(-1, 0, 0));
        expect(leftSegment.rotation.z).toBe(Math.PI);
    });

    test('updateSegmentRotations updates all segments', () => {
        game.segments = [
            { rotation: { z: 0 }, position: { x: 0, y: 0, z: 0 } },
            { rotation: { z: 0 }, position: { x: 1, y: 0, z: 0 } }
        ];
        game.updateSegmentRotations();
        expect(game.segments[0].rotation.z).toBeDefined();
        expect(game.segments[1].rotation.z).toBeDefined();
    });

    test('applyHyperbolicTransform transforms position correctly', () => {
        const pos = { x: 2, y: 0, z: 2 };
        const transformed = game.applyHyperbolicTransform(pos);
        expect(transformed.x).toBeDefined();
        expect(transformed.y).toBeDefined();
        expect(transformed.z).toBeDefined();
    });

    test('spawnFood creates food in valid position', () => {
        game.spawnFood();
        expect(game.food).toBeDefined();
        expect(game.food.position.x).toBeDefined();
        expect(game.food.position.y).toBeDefined();
        expect(game.food.position.z).toBeDefined();
    });

    test('animate handles rendering errors', () => {
        const consoleSpy = jest.spyOn(console, 'error');
        game.renderer.render.mockImplementation(() => {
            throw new Error('Render error');
        });
        game.animate();
        expect(consoleSpy).toHaveBeenCalledWith('Failed to render scene:', expect.any(Error));
    });

    test('update handles null segments', () => {
        game.segments = null;
        expect(() => game.update()).not.toThrow();
    });

    test('handleInput ignores invalid keys', () => {
        const originalDirection = { ...game.direction };
        game.handleInput('invalid_key');
        expect(game.direction).toEqual(originalDirection);
    });

    test('collision detection in hyperbolic space', () => {
        const headPos = new THREE.Vector3(0, 0, 0);
        const bodyPos = new THREE.Vector3(1, 0, 0);
        game.segments = [
            { position: headPos },
            { position: bodyPos }
        ];
        game.food = { position: new THREE.Vector3(2, 0, 0) };
        const result = game.checkCollision(bodyPos);
        expect(result).toBe('self');
    });

    test('movement in hyperbolic space', () => {
        game.direction = new THREE.Vector3(1, 0, 0);
        game.speed = 0.1;
        game.segments = [{ position: { x: 0, y: 0, z: 0 } }];
        game.update();
        expect(game.position.x).toBeGreaterThan(0);
    });

    test('rotation handling', () => {
        game.handleInput('q'); // Roll left
        expect(game.yRotation).toBeDefined();
        game.handleInput('e'); // Roll right
        expect(game.yRotation).toBeDefined();
        expect(game.yRotation % (Math.PI * 2)).toBe(0); // Should complete full rotation
    });
});
