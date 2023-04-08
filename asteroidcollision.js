function handleAsteroidCollision(asteroid1, asteroid2) {
    const dx = asteroid1.x - asteroid2.x;
    const dy = asteroid1.y - asteroid2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radiusSum = asteroid1.radius + asteroid2.radius;

    if (distance < radiusSum) {
        // Normalize the distance vector
        const nx = dx / distance;
        const ny = dy / distance;

        // Calculate the velocity difference
        const dvx = asteroid2.speed * Math.cos(asteroid2.angle) - asteroid1.speed * Math.cos(asteroid1.angle);
        const dvy = asteroid2.speed * Math.sin(asteroid2.angle) - asteroid1.speed * Math.sin(asteroid1.angle);

        // Calculate the relative normal velocity
        const relNormalVel = dvx * nx + dvy * ny;

        // Only proceed if the asteroids are moving towards each other
        if (relNormalVel < 0) {
            const impulse = 2 * relNormalVel / (asteroid1.radius + asteroid2.radius);

            // Update the velocities of both asteroids
            asteroid1.angle += impulse * asteroid2.radius * nx;
            asteroid1.speed += impulse * asteroid2.radius * ny;
            asteroid2.angle -= impulse * asteroid1.radius * nx;
            asteroid2.speed -= impulse * asteroid1.radius * ny;

            // Adjust the positions of the asteroids so they are no longer overlapping
            const overlap = radiusSum - distance;
            const separation = overlap / 2;
            asteroid1.x -= separation * nx;
            asteroid1.y -= separation * ny;
            asteroid2.x += separation * nx;
            asteroid2.y += separation * ny;
        }
    }
}

export { handleAsteroidCollision };
