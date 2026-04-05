const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
canvas.width = VIEW_W * scale;
canvas.height = VIEW_H * scale;
ctx.scale(scale, scale);

let gameState = "select";
let selectedIndex = 0;
let carouselOffset = 0;
let targetOffset = 0;

let player = null;
let boss = null;
let currentBossIndex = 0;
const bossTypes = ["potato", "cucumber", "jalapeno"];
let transitionTimer = 0;
let unlockedCharacters = [0, 1, 2]; // Start with first 3 characters unlocked
let testUnlockAll = false; // Toggle for UNLOCK ALL button
let minions = [];
let projectiles = [];
let puddles = [];
let bluBots = [];
let spawnTimer = 0;

const keys = {};

function getNextUnlockedCharacter(currentIndex, direction) {
  let newIndex = currentIndex;
  do {
    newIndex = (newIndex + direction + characters.length) % characters.length;
  } while (!unlockedCharacters.includes(newIndex));
  return newIndex;
}

document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (gameState === "select") {
    if (e.key === "ArrowLeft") {
      selectedIndex = getNextUnlockedCharacter(selectedIndex, -1);
      targetOffset = selectedIndex * 200;
    }
    if (e.key === "ArrowRight") {
      selectedIndex = getNextUnlockedCharacter(selectedIndex, 1);
      targetOffset = selectedIndex * 200;
    }
    if (e.key === "Enter") startGame();
  }

  if (gameState === "playing") {
    if (e.key === " ") {
      if (player.charIndex === 0) {
        // Blueberry toggle mushy mode
        player.mushyMode = !player.mushyMode;
      } else if (player.charIndex === 1 && player.abilityCooldown === 0) {
        // Tomato place puddle
        placePuddle();
        player.abilityCooldown = PUDDLE_COOLDOWN;
      } else if (player.charIndex === 3 && player.abilityCooldown === 0) {
        // Robo-Berry deploy BluBots
        deployBluBots();
        player.abilityCooldown = 180; // 3 seconds cooldown
      }
    }
    if (e.key === "Escape") {
      returnToMenu();
    }
  }

  if (e.key === "Escape" && (gameState === "gameover" || gameState === "win")) {
    returnToMenu();
  }
});

document.addEventListener("keyup", e => keys[e.key] = false);

canvas.addEventListener("click", e => {
  if (gameState !== "select") return;

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / scale;
  const my = (e.clientY - rect.top) / scale;
  
  // Check UNLOCK ALL button
  if (mx >= 10 && mx <= 90 && my >= 10 && my <= 40) {
    testUnlockAll = !testUnlockAll;
    if (testUnlockAll) {
      unlockedCharacters = [0, 1, 2, 3];
    } else {
      unlockedCharacters = [0, 1, 2];
    }
    return;
  }

  // Left arrow
  if (mx >= 60 && mx <= 120 && my >= 170 && my <= 230) {
    selectedIndex = getNextUnlockedCharacter(selectedIndex, -1);
    targetOffset = selectedIndex * 200;
  }
  // Right arrow
  if (mx >= 380 && mx <= 440 && my >= 170 && my <= 230) {
    selectedIndex = getNextUnlockedCharacter(selectedIndex, 1);
    targetOffset = selectedIndex * 200;
  }
  // Start button
  if (mx >= 175 && mx <= 325 && my >= 420 && my <= 460) startGame();
});

function startGame() {
  fadeOutMainMenu();
  currentBossIndex = 0;
  startBossBattle();
}

function startBossBattle() {
  const bossType = bossTypes[currentBossIndex];
  playBattleMusic(bossType);
  if (!player) {
    player = createPlayer(selectedIndex);
  }
  boss = createBoss(bossType);
  minions = [];
  projectiles = [];
  puddles = [];
  bluBots = [];
  spawnTimer = 0;
  gameState = "playing";
  
  // Reset unlock state when starting game
  testUnlockAll = false;
  unlockedCharacters = [0, 1, 2];
}

function returnToMenu() {
  // Fade out battle music and fade in main menu music
  fadeOutBattleMusic(() => {
    startMainMenuMusic();
  });
  
  // Reset game state
  gameState = "select";
  player = null;
  boss = null;
  currentBossIndex = 0;
  minions = [];
  projectiles = [];
  puddles = [];
  bluBots = [];
  spawnTimer = 0;
}

function deployBluBots() {
  if (bluBots.length >= 5) return; // Max 5 BluBots
  
  // Deploy 1 BluBot that will target nearest enemy
  bluBots.push({
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    angle: Math.random() * 2 * Math.PI, // Random starting angle
    radius: 40,
    speed: 2,
    kills: 0, // Track enemy kills
    isBroken: false,
    target: null, // Current target enemy
    laserActive: false,
    laserSoundPlaying: false
  });
}

function updateBluBots() {
  let anyLaserActive = false;
  
  for (let i = bluBots.length - 1; i >= 0; i--) {
    const bot = bluBots[i];
    
    // Find nearest enemy
    let nearestEnemy = null;
    let nearestDist = Infinity;
    
    // Check boss
    if (boss && boss.hp > 0) {
      const dist = distEntities(bot, boss);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestEnemy = boss;
      }
    }
    
    // Check minions
    for (const minion of minions) {
      if (minion.hp > 0) { // Only target alive minions
        const dist = distEntities(bot, minion);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestEnemy = minion;
        }
      }
    }
    
    if (nearestEnemy && nearestDist < 150) { // Max targeting range
      // Check if current target is still alive
      if (bot.target && bot.target.hp <= 0) {
        bot.target = null;
        bot.laserActive = false;
      }
      
      // Set new target if we have one
      if (nearestEnemy !== bot.target) {
        bot.target = nearestEnemy;
      }
      
      if (bot.target) {
        // Orbit around the target
        const dx = bot.x - bot.target.x - bot.target.width / 2;
        const dy = bot.y - bot.target.y - bot.target.height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
          bot.angle = Math.atan2(dy, dx);
          // Move towards target if too far
          if (dist > bot.radius) {
            bot.x -= (dx / dist) * bot.speed;
            bot.y -= (dy / dist) * bot.speed;
          } else {
            // Orbit
            bot.angle += bot.speed * 0.1;
            bot.x = bot.target.x + bot.target.width / 2 + Math.cos(bot.angle) * bot.radius;
            bot.y = bot.target.y + bot.target.height / 2 + Math.sin(bot.angle) * bot.radius;
          }
        }
        
        // Fire laser
        bot.laserActive = true;
        anyLaserActive = true;
        
        // Damage target continuously
        if (bot.isBroken) {
          bot.target.hp -= 0.4; // Broken bots do more damage
        } else {
          bot.target.hp -= 0.2;
        }
        
        // Check if enemy died
        if (bot.target.hp <= 0) {
          bot.kills++;
          
          if (bot.kills >= 2) {
            // BluBot dies after 2 kills
            bluBots.splice(i, 1);
            continue;
          } else if (bot.kills >= 1 && !bot.isBroken) {
            // Become broken after 1 kill
            bot.isBroken = true;
          }
          
          bot.target = null;
          bot.laserActive = false;
        }
      }
    } else {
      // No target, orbit around player
      bot.angle += bot.speed * 0.05;
      bot.x = player.x + player.width / 2 + Math.cos(bot.angle) * bot.radius;
      bot.y = player.y + player.height / 2 + Math.sin(bot.angle) * bot.radius;
      
      // Stop laser
      bot.target = null;
      bot.laserActive = false;
    }
  }
  
  // Handle laser sound - play if any BluBot is firing, stop if none are
  if (anyLaserActive && bluBotLaserSound.paused) {
    bluBotLaserSound.currentTime = 0;
    bluBotLaserSound.loop = true;
    bluBotLaserSound.play();
  } else if (!anyLaserActive && !bluBotLaserSound.paused) {
    bluBotLaserSound.pause();
    bluBotLaserSound.currentTime = 0;
  }
}

function distEntities(a, b) {
  const dx = (a.x + a.width / 2) - (b.x + b.width / 2);
  const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
  return Math.sqrt(dx * dx + dy * dy);
}

function isColliding(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function getCamera() {
  let camX = player.x + player.width / 2 - VIEW_W / 2;
  let camY = player.y + player.height / 2 - VIEW_H / 2;
  camX = Math.max(0, Math.min(camX, MAP_WIDTH - VIEW_W));
  camY = Math.max(0, Math.min(camY, MAP_HEIGHT - VIEW_H));
  return { x: camX, y: camY };
}

function update() {
  if (gameState === "select") {
    carouselOffset += (targetOffset - carouselOffset) * 0.15;
  }

  if (gameState === "playing") {
    updatePlayer();
    updatePuddles();
    updateProjectiles();
    if (boss && boss.hp <= 0) {
      if (currentBossIndex < bossTypes.length - 1) {
        gameState = "bossTransition";
        transitionTimer = 5; // 5 seconds
      } else {
        gameState = "win";
        if (!unlockedCharacters.includes(3)) {
          unlockedCharacters.push(3); // Unlock Robo-Berry
        }
      }
    } else {
      updateBoss();
      updateBluBots();
      if (boss.name === "Potato") {
        spawnTimer++;
        if (spawnTimer >= SPAWN_INTERVAL) {
          spawnFries();
          spawnTimer = 0;
        }
        updateMinions();
      }
    }
  }

  if (gameState === "bossTransition") {
    transitionTimer -= 1/60; // Assuming 60 FPS
    if (transitionTimer <= 0) {
      currentBossIndex++;
      startBossBattle();
    }
  }
}

function draw() {
  if (gameState === "select") drawSelectScreen();
  if (gameState === "playing") drawGame();
  if (gameState === "bossTransition") drawBossTransition();
  if (gameState === "gameover") { drawGame(); drawGameOver(); }
  if (gameState === "win") { drawGame(); drawWin(); }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}