const ATTACK_COOLDOWN = 30;
const BUFF_DURATION = 150;
const PUDDLE_COOLDOWN = 480;

function createPlayer(charIndex) {
  const char = characters[charIndex];
  return {
    x: 500,
    y: 800,
    width: 32,
    height: 32,
    baseSpeed: char.speed,
    speed: char.speed,
    damage: char.damage,
    charIndex: charIndex,
    halfHearts: char.maxHearts * 2,
    maxHalfHearts: char.maxHearts * 2,
    damageCooldown: 0,
    attackCooldown: 0,
    abilityCooldown: 0,
    speedBuff: false,
    speedDebuff: false,
    speedEffectTimer: 0,
    mushyMode: false,
    mushyModeTimer: 0,
    healingCooldown: 0
  };
}

function updatePlayer() {
  if (keys["w"] || keys["W"]) player.y -= player.speed;
  if (keys["s"] || keys["S"]) player.y += player.speed;
  if (keys["a"] || keys["A"]) player.x -= player.speed;
  if (keys["d"] || keys["D"]) player.x += player.speed;

  if (player.y < GROUND_Y) player.y = GROUND_Y;
  if (player.y + player.height > MAP_HEIGHT) player.y = MAP_HEIGHT - player.height;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > MAP_WIDTH) player.x = MAP_WIDTH - player.width;

  if (player.damageCooldown > 0) player.damageCooldown--;
  if (player.attackCooldown > 0) player.attackCooldown--;
  if (player.abilityCooldown > 0) player.abilityCooldown--;
  if (player.healingCooldown > 0) player.healingCooldown--;
  
  // Blueberry Mushy Mode
  if (player.charIndex === 0) {
    if (player.mushyMode) {
      player.mushyModeTimer++;
      if (player.healingCooldown === 0 && player.halfHearts < player.maxHalfHearts) {
        player.halfHearts += 0.5; // Heal 0.5 half-hearts per frame
        if (player.halfHearts > player.maxHalfHearts) {
          player.halfHearts = player.maxHalfHearts;
        }
        player.healingCooldown = 5; // Heal every 5 frames (12 times per second)
      }
    }
  }

  // Speed effect timer
  if (player.speedEffectTimer > 0) {
    player.speedEffectTimer--;
    if (player.speedEffectTimer === 0) {
      player.speedBuff = false;
      player.speedDebuff = false;
      player.speed = player.baseSpeed;
    }
  }

  // Check if player is in a puddle
  for (const puddle of puddles) {
    if (isInPuddle(player, puddle) && !player.speedBuff) {
      player.speedBuff = true;
      player.speedDebuff = false;
      player.speed = player.baseSpeed + 2;
      player.speedEffectTimer = BUFF_DURATION;
    }
  }

  // Shooting (except for Robo-Berry who doesn't shoot)
  if (player.charIndex !== 3 && player.attackCooldown === 0) {
    if (keys["ArrowLeft"]) {
      fireProjectile(-1, 0);
      player.attackCooldown = ATTACK_COOLDOWN;
    } else if (keys["ArrowRight"]) {
      fireProjectile(1, 0);
      player.attackCooldown = ATTACK_COOLDOWN;
    } else if (keys["ArrowUp"]) {
      fireProjectile(0, -1);
      player.attackCooldown = ATTACK_COOLDOWN;
    } else if (keys["ArrowDown"]) {
      fireProjectile(0, 1);
      player.attackCooldown = ATTACK_COOLDOWN;
    }
  }
}