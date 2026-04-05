function createBoss(bossType = "cucumber") {
  const bosses = {
    potato: {
      x: 500 - 125,
      y: 1040 - 125,
      width: 250,
      height: 250,
      hp: 1000,
      maxHp: 1000,
      name: "Potato",
      img: potatoImg
    },
    cucumber: {
      x: 500 - 125,
      y: 1040 - 125,
      width: 250,
      height: 250,
      hp: 2000,
      maxHp: 2000,
      name: "Cucumber",
      img: cucumberImg,
      attackImg: cucumberAttackImg,
      attackTimer: 0,
      burstTimer: 0,
      attacksInBurst: 0,
      canAttack: true
    }
  };

  return { ...bosses[bossType] };
}

function updateBoss() {
  if (boss.name === "Cucumber") {
    updateCucumber();
    
    // Contact damage for cucumber
    if (isColliding(boss, player) && player.damageCooldown === 0) {
      player.halfHearts -= 2; // Boss does more damage than minions
      player.damageCooldown = 120; // 2 seconds hit immunity
      if (player.halfHearts <= 0) {
        player.halfHearts = 0;
        gameState = "gameover";
      }
    }
  }
}

function updateCucumber() {
  if (!boss.canAttack) return;

  boss.burstTimer -= 1/60; // Assuming 60 FPS
  boss.attackTimer -= 1/60;

  if (boss.burstTimer <= 0) {
    // Start a new burst
    boss.burstTimer = 2.0; // Cooldown between bursts
    boss.attacksInBurst = 0;
    boss.attackTimer = 0.2; // First attack immediately
  }

  if (boss.attackTimer <= 0 && boss.attacksInBurst < 5) {
    // Fire 8 projectiles in all directions
    const directions = [
      [0, -1],   // N
      [1, -1],   // NE
      [1, 0],    // E
      [1, 1],    // SE
      [0, 1],    // S
      [-1, 1],   // SW
      [-1, 0],   // W
      [-1, -1]   // NW
    ];

    for (const [dx, dy] of directions) {
      projectiles.push({
        x: boss.x + boss.width / 2 - 8,
        y: boss.y + boss.height / 2 - 8,
        width: 16,
        height: 16,
        dx: dx * 6, // Slightly slower than player projectiles
        dy: dy * 6,
        img: boss.attackImg,
        damage: 10, // Boss damage
        framesAlive: 0,
        source: 'boss'
      });
    }

    boss.attacksInBurst++;
    boss.attackTimer = 0.2; // Next attack in 0.2 seconds

    if (boss.attacksInBurst >= 5) {
      // Burst complete, cooldown will continue from current burstTimer value
    }
  }
}