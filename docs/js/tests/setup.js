// Mock THREE.js
global.THREE = {
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    WebGLRenderer: jest.fn(),
    Vector3: jest.fn(() => ({
        add: jest.fn(),
        copy: jest.fn(),
        clone: jest.fn().mockReturnThis(),
        multiplyScalar: jest.fn().mockReturnThis(),
        normalize: jest.fn().mockReturnThis(),
        applyAxisAngle: jest.fn().mockReturnThis(),
        distanceTo: jest.fn().mockReturnValue(0.4)
    })),
    BoxGeometry: jest.fn(),
    MeshPhongMaterial: jest.fn(),
    Mesh: jest.fn(() => ({
        position: { x: 0, y: 0, z: 0 },
        rotation: { z: 0 }
    })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(),
    TorusGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn()
};

// Mock CheeseTextureLoader
global.CheeseTextureLoader = jest.fn(() => ({
    loadTexture: jest.fn().mockResolvedValue({})
}));

// Mock document
global.document = {
    getElementById: jest.fn().mockReturnValue({
        play: jest.fn().mockResolvedValue(undefined),
        classList: {
            remove: jest.fn()
        }
    })
};
