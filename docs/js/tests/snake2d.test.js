const Snake2D = require('../snake2d.js');

describe('Snake2D', () => {
    let canvas;
    let game;

    beforeEach(() => {
        canvas = {
            width: 600,
            height: 600,
            getContext: () => ({
                fillStyle: '',
                fillRect: jest.fn(),
                clearRect: jest.fn()
            })
        };
        game = new Snake2D(canvas);
    });

    test('constructor initializes with required dependencies', () => {
        expect(() => new Snake2D()).toThrow('Canvas element is required');
    });

    test('handleInput updates direction correctly', () => {
        game.handleInput('ArrowUp');
        expect(game.direction).toEqual({x: 0, y: -1});
        
        game.handleInput('ArrowDown');
        expect(game.direction).toEqual({x: 0, y: -1});
        
        game.handleInput('ArrowLeft');
        expect(game.direction).toEqual({x: -1, y: 0});
        
        game.handleInput('ArrowRight');
        expect(game.direction).toEqual({x: 1, y: 0});
    });

    test('checkCollision detects wall collision', () => {
        expect(game.checkCollision(-1, 0)).toBe('wall');
        expect(game.checkCollision(game.canvas.width / game.gridSize, 0)).toBe('wall');
        expect(game.checkCollision(0, -1)).toBe('wall');
        expect(game.checkCollision(0, game.canvas.height / game.gridSize)).toBe('wall');
    });

    test('checkCollision detects self collision', () => {
        game.segments = [{x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}];
        expect(game.checkCollision(2, 2)).toBe('self');
    });

    test('checkCollision detects food collision', () => {
        game.food = {x: 5, y: 5};
        expect(game.checkCollision(5, 5)).toBe('food');
    });

    test('reset restores initial game state', () => {
        game.score = 100;
        game.gems = 50;
        game.segments = [{x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}];
        game.reset();
        
        expect(game.score).toBe(0);
        expect(game.gems).toBe(0);
        expect(game.segments.length).toBe(1);
        expect(game.direction).toEqual({x: 1, y: 0});
    });
});
