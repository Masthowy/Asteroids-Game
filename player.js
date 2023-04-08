class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.angle = 0;
        this.speed = 1;
        this.radius = 15;
    }

    collidesWith(asteroid) {
        const dx = this.x - asteroid.x;
        const dy = this.y - asteroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.radius + asteroid.radius;
    }

    update() {
        if (!playerFrozen) {
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.radius * 1.5; // Set a minimum distance from the player to the mouse

            if (distance >= minDistance) {
                this.angle = Math.atan2(dy, dx);
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
            }

            // Edge handling
            if (this.x < 0) {
                this.x = 0;
            } else if (this.x > canvas.width) {
                this.x = canvas.width;
            }

            if (this.y < 0) {
                this.y = 0;
            } else if (this.y > canvas.height) {
                this.y = canvas.height;
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw the circle
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw the small triangle (direction indicator)
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(this.radius - 10, 5);
        ctx.lineTo(this.radius - 10, -5);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();

        ctx.restore();
    }
}

function endGame(score) {
    // Handle end game logic
}

export { Player, endGame };
