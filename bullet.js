class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.angle = angle;
    this.radius = 2;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  }
}
export { Bullet };