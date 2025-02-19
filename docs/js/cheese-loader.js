class CheeseTextureLoader {
    constructor() {
        this.loader = new THREE.SVGLoader();
        this.textures = new Map();
    }

    async loadTexture(name) {
        if (this.textures.has(name)) {
            return this.textures.get(name);
        }

        const svgData = await this.loader.loadAsync(`assets/images/cheese/${name}.svg`);
        const texture = new THREE.CanvasTexture(this.svgToCanvas(svgData));
        this.textures.set(name, texture);
        return texture;
    }

    svgToCanvas(svgData) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        svgData.paths.forEach((path) => {
            const shapes = path.toShapes(true);
            shapes.forEach((shape) => {
                ctx.fillStyle = path.color;
                ctx.fill(new Path2D(shape.toString()));
            });
        });
        
        return canvas;
    }
}
