// Mock browser globals
global.window = {
    THREE: {
        Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    WebGLRenderer: jest.fn(),
    Vector3: jest.fn(() => ({
        add: jest.fn(),
        copy: jest.fn(),
        clone: jest.fn(),
        multiplyScalar: jest.fn(),
        normalize: jest.fn(),
        applyAxisAngle: jest.fn()
    })),
    BoxGeometry: jest.fn(),
    MeshPhongMaterial: jest.fn(),
    Mesh: jest.fn(),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(),
    TorusGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn()
};

const CheeseTextureLoader = jest.fn(() => ({
    loadTexture: jest.fn().mockResolvedValue({})
}));

global.THREE = window.THREE;
global.CheeseTextureLoader = CheeseTextureLoader;
global.document = {
    getElementById: jest.fn().mockReturnValue({
        play: jest.fn().mockResolvedValue(undefined),
        classList: { remove: jest.fn() }
    })
};

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
        expect(game.scene.add).toHaveBeenCalled();
        expect(game.cheeseLoader.loadTexture).toHaveBeenCalledWith('swiss');
    });

    test('handleInput updates direction correctly', () => {
        game.handleInput('w');
        expect(game.direction.z).toBe(-1);
        
        game.handleInput('s');
        expect(game.direction.z).toBe(1);
        
        game.handleInput('a');
        expect(game.direction.x).toBe(-1);
        
        game.handleInput('d');
        expect(game.direction.x).toBe(1);
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
        const upSegment = game.createSegment('head', new THREE.Vector3(0, 0, -1));
        expect(upSegment.rotation.z).toBe(-Math.PI / 2);

        const downSegment = game.createSegment('head', new THREE.Vector3(0, 0, 1));
        expect(downSegment.rotation.z).toBe(Math.PI / 2);

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
        game.segments = [
            { position: { x: 0, y: 0, z: 0 } },
            { position: { x: 1, y: 0, z: 0 } }
        ];
        const result = game.checkCollision({ x: 1, y: 0, z: 0 });
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
