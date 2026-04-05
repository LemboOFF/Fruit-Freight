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
    damage: player.damage
  });
}

function updateProjectiles() {
  projectiles = projectiles.filter(p =>
    p.x > 0 && p.x < MAP_WIDTH && p.y > 0 && p.y < MAP_HEIGHT
  );

  for (const p of projectiles) {
    p.x += p.dx;
    p.y += p.dy;

    if (boss && isColliding(p, boss)) {
      boss.hp -= p.damage;
      p.x = -999;
    }

    for (const fry of minions) {
      if (isColliding(p, fry)) {
        fry.hp -= p.damage;
        p.x = -999;
      }
    }
  }
}