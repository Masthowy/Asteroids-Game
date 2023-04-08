class Asteroid {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = .94 * (30 + 20) / this.size;
        this.angle = Math.random() * Math.PI * 2;
        this.radius = size;
        this.health = Math.floor(size / 10) + 1;
        this.destroyed = false;
        this.cracks = []; // Add a new property to store crack line data
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Edge handling
        if (this.x < 0 - this.size) {
            this.x = canvas.width + this.size;
        } else if (this.x > canvas.width + this.size) {
            this.x = 0 - this.size;
        }

        if (this.y < 0 - this.size) {
            this.y = canvas.height + this.size;
        } else if (this.y > canvas.height + this.size) {
            this.y = 0 - this.size;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the cracks
        ctx.beginPath();
        for (const crack of this.cracks) {
            ctx.moveTo(this.x + crack.startX, this.y + crack.startY);
            ctx.lineTo(this.x + crack.endX, this.y + crack.endY);
        }
        ctx.stroke();
    }
}

export { Asteroid };
