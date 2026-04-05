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
let minions = [];
let projectiles = [];
let puddles = [];
let spawnTimer = 0;

const keys = {};

document.addEventListener("keydown", e => {
  tryStartMusic();
  keys[e.key] = true;

  if (gameState === "select") {
    if (e.key === "ArrowLeft") {
      selectedIndex = (selectedIndex - 1 + characters.length) % characters.length;
      targetOffset = selectedIndex * 200;
    }
    if (e.key === "ArrowRight") {
      selectedIndex = (selectedIndex + 1) % characters.length;
      targetOffset = selectedIndex * 200;
    }
    if (e.key === "Enter") startGame();
  }

  if (gameState === "playing") {
    if (e.key === " " && player.charIndex === 1 && player.abilityCooldown === 0) {
      placePuddle();
      player.abilityCooldown = PUDDLE_COOLDOWN;
    }
  }
});

document.addEventListener("keyup", e => keys[e.key] = false);

canvas.addEventListener("click", e => {
  tryStartMusic();
  if (gameState !== "select") return;

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / scale;
  const my = (e.clientY - rect.top) / scale;

  if (mx >= 60 && mx <= 120 && my >= 170 && my <= 230) {
    selectedIndex = (selectedIndex - 1 + characters.length) % characters.length;
    targetOffset = selectedIndex * 200;
  }
  if (mx >= 380 && mx <= 440 && my >= 170 && my <= 230) {
    selectedIndex = (selectedIndex + 1) % characters.length;
    targetOffset = selectedIndex * 200;
  }
  if (mx >= 175 && mx <= 325 && my >= 420 && my <= 460) startGame();
});

function startGame() {
  fadeOutMainMenu();
  playBattleMusic("potato");
  player = createPlayer(selectedIndex);
  boss = createBoss();
  minions = [];
  projectiles = [];
  puddles = [];
  spawnTimer = 0;
  gameState = "playing";
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
    updateBoss();
    spawnTimer++;
    if (spawnTimer >= SPAWN_INTERVAL) {
      spawnFries();
      spawnTimer = 0;
    }
    updateMinions();
  }
}

function draw() {
  if (gameState === "select") drawSelectScreen();
  if (gameState === "playing") drawGame();
  if (gameState === "gameover") { drawGame(); drawGameOver(); }
  if (gameState === "win") { drawGame(); drawWin(); }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}