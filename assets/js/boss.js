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
    },
    jalapeno: {
      x: 500 - 125,
      y: 1040 - 125,
      width: 250,
      height: 250,
      hp: 2800,
      maxHp: 2800,
      name: "Jalapeño",
      img: jalapenoImg,
      attackImg: jalapenoAttackImg,
      minionImg: jalapenoMinionImg,
      attackTimer: 0,
      minionTimer: 0,
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
  } else if (boss.name === "Jalapeño") {
    updateJalapeno();
    
    if (isColliding(boss, player) && player.damageCooldown === 0) {
      player.halfHearts -= 2;
      player.damageCooldown = 120;
      if (player.halfHearts <= 0) {
        player.halfHearts = 0;
        gameState = "gameover";
      }
    }
  }
}

function updateJalapeno() {
  if (!boss.canAttack) return;

  boss.minionTimer -= 1/60;
  boss.attackTimer -= 1/60;

  const fireX = boss.x + boss.width / 2;
  const fireY = boss.y + boss.height * 0.55;

  if (boss.minionTimer <= 0) {
    boss.minionTimer = 3.5; // Spawn a minion every 3.5 seconds
    minions.push({
      x: fireX - 16,
      y: fireY - 16,
      width: 28,
      height: 28,
      hp: 30,
      maxHp: 30,
      baseSpeed: 1.2,
      speed: 1.2,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      damageCooldown: 0,
      facingLeft: false,
      speedDebuffTimer: 0,
      img: boss.minionImg
    });
  }

  if (boss.attackTimer <= 0) {
    boss.attackTimer = 1.5; // Fire a homing pepper projectile
    const targetX = player.x + player.width / 2;
    const targetY = player.y + player.height / 2;
    const dx = targetX - fireX;
    const dy = targetY - fireY;
    const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const speed = 5;

    projectiles.push({
      x: fireX - 10,
      y: fireY - 10,
      width: 18,
      height: 18,
      baseSize: 18,
      dx: (dx / dist) * speed,
      dy: (dy / dist) * speed,
      img: boss.attackImg,
      baseDamage: 12,
      damage: 12,
      framesAlive: 0,
      source: 'boss',
      homing: true
    });
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