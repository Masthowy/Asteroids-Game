class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1; // Random size between 1 and 3
        this.speed = Math.random() * 3 + 1; // Random speed between 1 and 4
        this.directionAngle = Math.random() * (Math.PI * 2); // Random direction
        this.direction = {
            x: Math.cos(this.directionAngle) * this.speed,
            y: Math.sin(this.directionAngle) * this.speed
        };
        this.life = 100; // Particle life in frames
    }

    update() {
        this.x += this.direction.x;
        this.y += this.direction.y;
        this.life -= 1;
    }

    draw(ctx) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"; // White with 30% opacity
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isDead() {
        return this.life >= this.maxLife;
    }
}

export { Particle };
