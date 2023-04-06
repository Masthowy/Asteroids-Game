const homeScreen = document.getElementById('home-screen');
const lastScoreElement = document.getElementById('last-score');
const highScoreElement = document.getElementById('high-score');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const waveScreen = document.getElementById('wave-screen');
const waveNumberElement = document.getElementById('wave-number');
const startButton = document.getElementById('start-button');
const mainMenuButton = document.getElementById('restart-button');


let gameEnded = true;
let lastScore = 0;
let highScore = 0;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let respawning = false;
let playerFrozen = false;
let gameStarted = false;

startButton.addEventListener('click', () => {
    homeScreen.style.display = 'none';
    canvas.style.display = 'block';

    // Call the startGame() function to start/reset the game
    startGame();
});

mainMenuButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    homeScreen.style.display = 'block';
});

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

class Asteroid {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = .94 * (30 + 20) / this.size; // Calculate speed based on size
    this.angle = Math.random() * Math.PI * 2;
    this.radius = size;
    this.health = Math.floor(size / 10) + 1; // Calculate health based on size
    this.destroyed = false;
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
  }

  collidesWithBullet(bullet) {
    const dx = this.x - bullet.x;
    const dy = this.y - bullet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius) {
      this.health -= 1; // Decrease health when hit by bullet
      if (this.health <= 0) {
        this.destroyed = true; // Set destroyed flag if health is zero or less
      }
      return true;
    } else {
      return false;
    }
  }

  split() {
    if (this.size / 2 >= 15) {
      const newSize = this.size / 2;
      const newSpeed = this.speed * .97;
      const asteroid1 = new Asteroid(this.x, this.y, newSize, newSpeed);
      const asteroid2 = new Asteroid(this.x, this.y, newSize, newSpeed);

      asteroids.push(asteroid1, asteroid2);
    }
  }
}

let player;
let asteroids = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createRandomAsteroids(count) {
  const playerSize = 2 * player.radius; // double the player radius to get its diameter
  const minSpawnDistance = playerSize * 6; // minimum distance from player for asteroid to spawn

  for (let i = 0; i < count; i++) {
    let x, y, size, speed, asteroid, distance;

    // keep generating new asteroids until they are far enough away from the player
    do {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
      size = Math.random() * 20 + 30;
      speed = Math.random() * 2 + 1;

      asteroid = new Asteroid(x, y, size, speed); // Pass the speed to the constructor
      distance = Math.sqrt(
        (player.x - asteroid.x) ** 2 + (player.y - asteroid.y) ** 2
      );
    } while (distance < minSpawnDistance);

    asteroids.push(asteroid);
  }
}

let score = 0;

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
}

function handleKeyDown(e) {
    keysPressed[e.key] = true;
}

function handleKeyUp(e) {
    delete keysPressed[e.key];
}


function startGame() {
    gameEnded = false;
    gameStarted = true;
    
    player = new Player(canvas.width / 2, canvas.height / 2);

    // Reset the player score
    score = 0;

    // Create asteroids
    asteroids = [];
    createRandomAsteroids(10);

    gameRunning = true;

    // Add any game-related event listeners (e.g., keyboard input, mouse movement)
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Remove the unnecessary gameLoop() call
    requestAnimationFrame(gameLoop);
}

function endGame(score) {
    gameRunning = false;
    gameEnded = true;
    lastScore = score;
    if (score > highScore) {
        highScore = score;
    }

    lastScoreElement.innerText = lastScore; // Update the Last Score on the main menu
    highScoreElement.innerText = highScore; // Update the High Score on the main menu

    asteroids = []; // clear the asteroids array
    bullets = []; // clear the bullets array
    canvas.style.display = 'none';
    gameOverScreen.style.display = 'block';
    finalScoreElement.innerText = lastScore; // Update the Final Score on the Game Over screen
}

const keysPressed = {};

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    const bullet = new Bullet(player.x + Math.cos(player.angle) * player.radius,
      player.y + Math.sin(player.angle) * player.radius, player.angle);
    bullets.push(bullet);
  }
});

let gameRunning = true;

let bullets = [];

document.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    const bullet = new Bullet(player.x + Math.cos(player.angle) * player.radius,
      player.y + Math.sin(player.angle) * player.radius, player.angle);
    bullets.push(bullet);
  }
});

function drawScore(score) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);
}

function updateScore(score) {
    const scoreElement = document.getElementById("score");
    scoreElement.innerText = score;
}

let currentWave = 1;
let waveNumber = 1;

function respawnAsteroids() {
    if (asteroids.length === 0 && !respawning) {
        respawning = true;
        playerFrozen = true; // Freeze the player during the wave transition
        waveNumber++;
        waveNumberElement.innerText = waveNumber;
        waveScreen.style.display = "block";

        setTimeout(() => {
            waveScreen.style.display = "none";
            createRandomAsteroids(10 + (waveNumber - 1) * 2);
            playerFrozen = false; // Unfreeze the player after spawning the new wave
            respawning = false;
        }, 2000);
    }
}


function gameLoop() {
  if (!gameRunning || gameEnded) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.update();
  player.draw();

  // Update and draw asteroids
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].update();
    asteroids[i].draw();

    // Check for collision with the player
    if (player.collidesWith(asteroids[i])) {
      console.log("Player collided with an asteroid!");
      console.log(player, asteroids[i]);
      endGame(score);
      gameEnded = true; // Set gameEnded to true when the game ends
      return;
    }
  }

  // Update and draw bullets
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].update();
    bullets[i].draw();

    for (let j = 0; j < asteroids.length; j++) {
      if (asteroids[j].collidesWithBullet(bullets[i])) {
        score += Math.round(asteroids[j].size);
        asteroids[j].split();
        asteroids.splice(j, 1);
        bullets.splice(i, 1);
        break;
      }
    }
  }

  respawnAsteroids();
  drawScore(score);
  requestAnimationFrame(gameLoop);
}

function endGame(score) {
    gameRunning = false;
    gameEnded = true;
    lastScore = score;
    if (score > highScore) {
        highScore = score;
    }

    lastScoreElement.innerText = lastScore; // Update the Last Score on the main menu
    highScoreElement.innerText = highScore; // Update the High Score on the main menu

    asteroids = []; // clear the asteroids array
    bullets = []; // clear the bullets array
    canvas.style.display = 'none';

    // Show the game over screen and display the player's score
    finalScoreElement.innerText = score;
    gameOverScreen.style.display = 'block';

    return; // Add this line to stop the game loop
}
