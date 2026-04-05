const SPAWN_INTERVAL = 480;
const CHASE_RANGE = 150;
const FRY_DAMAGE_COOLDOWN = 120; // 2 seconds hit immunity

function spawnFries() {
  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist2 = 60 + Math.random() * 40;
    minions.push({
      x: boss.x + boss.width / 2 + Math.cos(angle) * dist2,
      y: boss.y + boss.height / 2 + Math.sin(angle) * dist2,
      width: 32,
      height: 32,
      hp: 20,
      maxHp: 20,
      baseSpeed: 0.6,
      speed: 0.6,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      damageCooldown: 0,
      facingLeft: false,
      speedDebuffTimer: 0
    });
  }
}

function updateMinions() {
  minions = minions.filter(fry => fry.hp > 0);

  for (const fry of minions) {
    if (fry.damageCooldown > 0) fry.damageCooldown--;
    if (fry.speedDebuffTimer > 0) {
      fry.speedDebuffTimer--;
      if (fry.speedDebuffTimer === 0) {
        fry.speed = fry.baseSpeed;
      }
    }

    // Check if fry is in puddle
    for (const puddle of puddles) {
      if (isInPuddle(fry, puddle) && fry.speed === fry.baseSpeed) {
        fry.speed = Math.max(0.1, fry.baseSpeed - 2);
        fry.speedDebuffTimer = BUFF_DURATION;
      }
    }

    const d = distEntities(fry, player);
    if (d < CHASE_RANGE) {
      const angle = Math.atan2(
        (player.y + player.height / 2) - (fry.y + fry.height / 2),
        (player.x + player.width / 2) - (fry.x + fry.width / 2)
      );
      fry.dx = Math.cos(angle) * fry.speed;
      fry.dy = Math.sin(angle) * fry.speed;
    } else {
      if (Math.random() < 0.02) {
        const angle = Math.random() * Math.PI * 2;
        fry.dx = Math.cos(angle) * fry.speed;
        fry.dy = Math.sin(angle) * fry.speed;
      }
    }

    fry.facingLeft = (player.x + player.width / 2) < (fry.x + fry.width / 2);

    fry.x += fry.dx;
    fry.y += fry.dy;

    if (fry.y < GROUND_Y) fry.y = GROUND_Y;
    if (fry.y + fry.height > MAP_HEIGHT) fry.y = MAP_HEIGHT - fry.height;
    if (fry.x < 0) fry.x = 0;
    if (fry.x + fry.width > MAP_WIDTH) fry.x = MAP_WIDTH - fry.width;

    if (isColliding(fry, player) && player.damageCooldown === 0) {
      player.halfHearts -= 1;
      player.damageCooldown = FRY_DAMAGE_COOLDOWN;
      if (player.halfHearts <= 0) {
        player.halfHearts = 0;
        gameState = "gameover";
      }
    }
  }
}