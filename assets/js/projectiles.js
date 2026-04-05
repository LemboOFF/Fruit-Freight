function fireProjectile(dirX, dirY) {
  const char = characters[player.charIndex];
  projectiles.push({
    x: player.x + player.width / 2 - 8,
    y: player.y + player.height / 2 - 8,
    width: 16,
    height: 16,
    dx: dirX * 8,
    dy: dirY * 8,
    img: char.attackImg,
    damage: player.damage,
    framesAlive: 0,
    source: 'player'
  });
}

function updateProjectiles() {
  projectiles = projectiles.filter(p =>
    p.x > 0 && p.x < MAP_WIDTH && p.y > 0 && p.y < MAP_HEIGHT
  );

  for (const p of projectiles) {
    if (p.homing && p.source === 'boss') {
      const targetX = player.x + player.width / 2;
      const targetY = player.y + player.height / 2;
      const tx = targetX - p.x;
      const ty = targetY - p.y;
      const dist = Math.max(1, Math.sqrt(tx * tx + ty * ty));
      const desiredSpeed = 5;
      const desiredX = (tx / dist) * desiredSpeed;
      const desiredY = (ty / dist) * desiredSpeed;
      p.dx += (desiredX - p.dx) * 0.08;
      p.dy += (desiredY - p.dy) * 0.08;
      const speed = Math.sqrt(p.dx * p.dx + p.dy * p.dy) || 1;
      p.dx = (p.dx / speed) * desiredSpeed;
      p.dy = (p.dy / speed) * desiredSpeed;
    }

    p.x += p.dx;
    p.y += p.dy;
    p.framesAlive++;

    if (p.homing) {
      const sizeMultiplier = Math.max(0.4, 1 - p.framesAlive * 0.01);
      p.width = Math.max(8, p.baseSize * sizeMultiplier);
      p.height = Math.max(8, p.baseSize * sizeMultiplier);
      p.damage = Math.max(4, p.baseDamage - Math.floor(p.framesAlive / 15));
    }

    if (boss && isColliding(p, boss) && p.framesAlive > 5 && p.source !== 'boss') {
      boss.hp -= p.damage;
      p.x = -999;
    }

    // Check collision with player (for boss projectiles)
    if (isColliding(p, player) && p.framesAlive > 5 && p.source === 'boss' && player.damageCooldown === 0) {
      player.halfHearts -= 1;
      player.damageCooldown = 120; // 2 seconds hit immunity
      p.x = -999;
      if (player.halfHearts <= 0) {
        player.halfHearts = 0;
        gameState = "gameover";
      }
    }

    for (const fry of minions) {
      if (isColliding(p, fry)) {
        fry.hp -= p.damage;
        p.x = -999;
      }
    }
  }
}