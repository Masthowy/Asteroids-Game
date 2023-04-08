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

import { Player, endGame } from './player.js';
import { Asteroid } from './asteroid.js';
import { Bullet } from './bullet.js';
import { handleAsteroidCollision } from './asteroidcollision.js';
import { Particle } from './particle.js';


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

collidesWithBullet(bullet) {
    const dx = this.x - bullet.x;
    const dy = this.y - bullet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius) {
        this.health -= 1;

        // Generate particles
        const numParticles = 10;
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle(bullet.x, bullet.y));
        }

        const numCracks = 5; // Number of cracks in the spiderweb pattern
        const maxHealth = Math.floor(this.size / 10) + 1;
        const healthFraction = this.health / maxHealth;
        const collisionAngle = Math.atan2(dy, dx);

        for (let i = 0; i < numCracks; i++) {
            const angleOffset = (Math.PI * 2) / numCracks;
            const angle = collisionAngle + (Math.random() * angleOffset - angleOffset / 2); // Random angle for each crack around the collision point

            const maxCrackLength = this.radius * 2;
            const crackSegments = 5; // Number of segments in each crack
            const segmentLength = (Math.random() * maxCrackLength * (1 - healthFraction)) / crackSegments;

            let startX = bullet.x - this.x;
            let startY = bullet.y - this.y;
            let endX, endY;

            for (let j = 0; j < crackSegments; j++) {
                const segmentAngle = angle + Math.random() * 0.2 - 0.1; // Add a random angle offset to each segment
                endX = startX + Math.cos(segmentAngle) * segmentLength;
                endY = startY + Math.sin(segmentAngle) * segmentLength;

                this.cracks.push({ startX, startY, endX, endY });

                startX = endX;
                startY = endY;
            }
        }

        if (this.health <= 0) {
            this.destroyed = true;
        }
        return true;
    } else {
        return false;
    }
  }
}


let player;
let asteroids = [];
let particles = [];


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
        endGame(score);
        gameEnded = true;
        return;
    }

    // Check for collisions between asteroids
    let collisionDetected = false;
    for (let j = i + 1; j < asteroids.length; j++) {
        handleAsteroidCollision(asteroids[i], asteroids[j], (hasCollided) => {
            if (hasCollided) {
                collisionDetected = true;
            }
        });
        if (collisionDetected) {
            break;
        }
    }
}

    // Update and draw bullets
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].update();
        bullets[i].draw();

        for (let j = 0; j < asteroids.length; j++) {
            if (asteroids[j].collidesWithBullet(bullets[i])) {
                score += Math.round(asteroids[j].size);
                if (asteroids[j].destroyed) {
                    asteroids.splice(j, 1);
                }
                bullets.splice(i, 1);
                break;
            }
        }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();

        // Check if the particle is dead and remove it
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        } else {
            particles[i].draw(ctx);
        }
    }

    drawScore(score);
    respawnAsteroids();

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
