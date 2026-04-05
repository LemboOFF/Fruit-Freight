const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const MAP_WIDTH = 1000;
const MAP_HEIGHT = 1500;
const GROUND_Y = 584;

const VIEW_W = 500;
const VIEW_H = 500;

const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
canvas.width = VIEW_W * scale;
canvas.height = VIEW_H * scale;
ctx.scale(scale, scale);

let gameState = "select";

const heartImg = new Image();
const heartEmptyImg = new Image();
const heartHalfImg = new Image();
const damageImg = new Image();
const speedImg = new Image();
const markingImg = new Image();

heartImg.src = "assets/sprites/heart-sprite.png";
heartEmptyImg.src = "assets/sprites/heart-empty-sprite.png";
heartHalfImg.src = "assets/sprites/heart-half-sprite.png";
damageImg.src = "assets/sprites/damage-sprite.png";
speedImg.src = "assets/sprites/speed-sprite.png";
markingImg.src = "assets/sprites/marking-sprite.png";

const characters = [
  {
    name: "Blueberry",
    ability: "Heals near allies or slowly in Mushy Mode",
    img: new Image(),
    attackImg: new Image(),
    maxHearts: 4,
    damage: 5,
    speed: 4,
    damageLevel: 1,
    speedLevel: 2,
  },
  {
    name: "Tomato",
    ability: "Places a puddle that slows enemies and speeds up allies",
    img: new Image(),
    attackImg: new Image(),
    maxHearts: 4,
    damage: 15,
    speed: 2,
    damageLevel: 3,
    speedLevel: 1,
  },
  {
    name: "Banana",
    ability: "Places a peel that damages enemies and minions",
    img: new Image(),
    attackImg: new Image(),
    maxHearts: 4,
    damage: 5,
    speed: 6,
    damageLevel: 1,
    speedLevel: 3,
  }
];

characters[0].img.src = "assets/sprites/blueberry.png";
characters[1].img.src = "assets/sprites/tomato.png";
characters[2].img.src = "assets/sprites/banana.png";
characters[0].attackImg.src = "assets/sprites/blueberry-attack.png";
characters[1].attackImg.src = "assets/sprites/tomato-attack.png";
characters[2].attackImg.src = "assets/sprites/banana-attack.png";

const mapImg = new Image();
mapImg.src = "assets/sprites/mapsprite.png";

const potatoImg = new Image();
potatoImg.src = "assets/sprites/bosses/potatoboss1.png";

const fryImg = new Image();
fryImg.src = "assets/sprites/bosses/minions/fry-minion.png";

let selectedIndex = 0;
let carouselOffset = 0;
let targetOffset = 0;

let player = null;
let boss = null;
let minions = [];
let projectiles = [];
let spawnTimer = 0;

const SPAWN_INTERVAL = 480;
const CHASE_RANGE = 150;
const FRY_DAMAGE_COOLDOWN = 60;
const ATTACK_COOLDOWN = 30;

function createPlayer(charIndex) {
  const char = characters[charIndex];
  return {
    x: 500,
    y: 800,
    width: 32,
    height: 32,
    speed: char.speed,
    damage: char.damage,
    charIndex: charIndex,
    halfHearts: char.maxHearts * 2,
    maxHalfHearts: char.maxHearts * 2,
    damageCooldown: 0,
    attackCooldown: 0
  };
}

function createBoss() {
  return {
    x: 500 - 125,
    y: 1040 - 125,
    width: 250,
    height: 250,
    hp: 300,
    maxHp: 300
  };
}

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
      speed: 0.6,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      damageCooldown: 0,
      facingLeft: false
    });
  }
}

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

const keys = {};
document.addEventListener("keydown", e => {
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
});
document.addEventListener("keyup", e => keys[e.key] = false);

canvas.addEventListener("click", e => {
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
  if (mx >= 175 && mx <= 325 && my >= 370 && my <= 410) startGame();
});

function startGame() {
  player = createPlayer(selectedIndex);
  boss = createBoss();
  minions = [];
  projectiles = [];
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

function update() {
  if (gameState === "select") {
    carouselOffset += (targetOffset - carouselOffset) * 0.15;
  }

  if (gameState === "playing") {
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

    if (player.attackCooldown === 0) {
      if (keys["ArrowLeft"])  { fireProjectile(-1, 0); player.attackCooldown = ATTACK_COOLDOWN; }
      if (keys["ArrowRight"]) { fireProjectile(1, 0);  player.attackCooldown = ATTACK_COOLDOWN; }
      if (keys["ArrowUp"])    { fireProjectile(0, -1); player.attackCooldown = ATTACK_COOLDOWN; }
      if (keys["ArrowDown"])  { fireProjectile(0, 1);  player.attackCooldown = ATTACK_COOLDOWN; }
    }

    projectiles = projectiles.filter(p =>
      p.x > 0 && p.x < MAP_WIDTH && p.y > 0 && p.y < MAP_HEIGHT
    );

    for (const p of projectiles) {
      p.x += p.dx;
      p.y += p.dy;

      if (boss && isColliding(p, boss)) {
        boss.hp -= p.damage;
        p.x = -999;
        if (boss.hp <= 0) {
          boss.hp = 0;
          gameState = "win";
        }
      }

      for (const fry of minions) {
        if (isColliding(p, fry)) {
          fry.hp -= p.damage;
          p.x = -999;
        }
      }
    }

    spawnTimer++;
    if (spawnTimer >= SPAWN_INTERVAL) {
      spawnFries();
      spawnTimer = 0;
    }

    minions = minions.filter(fry => fry.hp > 0);
    for (const fry of minions) {
      if (fry.damageCooldown > 0) fry.damageCooldown--;

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
}

function getCamera() {
  let camX = player.x + player.width / 2 - VIEW_W / 2;
  let camY = player.y + player.height / 2 - VIEW_H / 2;
  camX = Math.max(0, Math.min(camX, MAP_WIDTH - VIEW_W));
  camY = Math.max(0, Math.min(camY, MAP_HEIGHT - VIEW_H));
  return { x: camX, y: camY };
}

function drawHearts() {
  const startX = 10;
  const startY = 10;
  const size = 20;
  const gap = 4;
  const maxHearts = characters[player.charIndex].maxHearts;

  for (let i = 0; i < maxHearts; i++) {
    const x = startX + i * (size + gap);
    const filledHalves = player.halfHearts - i * 2;

    if (filledHalves >= 2) {
      ctx.drawImage(heartImg, x, startY, size, size);
    } else if (filledHalves === 1) {
      ctx.drawImage(heartHalfImg, x, startY, size, size);
    } else {
      ctx.drawImage(heartEmptyImg, x, startY, size, size);
    }
  }
}

function drawStats() {
  const char = characters[selectedIndex];
  const startX = VIEW_W / 2 - 80;
  const startY = 345;
  const iconSize = 16;
  const markSize = 8;
  const gap = 4;

  ctx.drawImage(heartImg, startX, startY, iconSize, iconSize);
  for (let i = 0; i < char.maxHearts; i++) {
    ctx.drawImage(markingImg, startX + iconSize + gap + i * (markSize + 2), startY + 4, markSize, markSize);
  }

  ctx.drawImage(damageImg, startX, startY + iconSize + gap, iconSize, iconSize);
  for (let i = 0; i < char.damageLevel; i++) {
    ctx.drawImage(markingImg, startX + iconSize + gap + i * (markSize + 2), startY + iconSize + gap + 4, markSize, markSize);
  }

  ctx.drawImage(speedImg, startX, startY + (iconSize + gap) * 2, iconSize, iconSize);
  for (let i = 0; i < char.speedLevel; i++) {
    ctx.drawImage(markingImg, startX + iconSize + gap + i * (markSize + 2), startY + (iconSize + gap) * 2 + 4, markSize, markSize);
  }
}

function drawImageFlipped(img, x, y, w, h, flipped) {
  ctx.save();
  if (flipped) {
    ctx.scale(-1, 1);
    ctx.drawImage(img, -x - w, y, w, h);
  } else {
    ctx.drawImage(img, x, y, w, h);
  }
  ctx.restore();
}

function drawHPBar(x, y, width, current, max, color) {
  const barH = 6;
  ctx.fillStyle = "#333333";
  ctx.fillRect(x, y, width, barH);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * (current / max), barH);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, barH);
}

function drawSelectScreen() {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Fruit Freight", VIEW_W / 2, 60);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText("Choose your character", VIEW_W / 2, 90);

  const cardW = 120;
  const cardH = 140;
  const cardY = 130;
  const spacing = 200;
  const centerX = VIEW_W / 2;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const cardX = centerX + (i * spacing) - carouselOffset - cardW / 2;

    if (cardX + cardW < -50 || cardX > VIEW_W + 50) continue;

    const isSelected = i === selectedIndex;

    ctx.fillStyle = isSelected ? "#2e2e5e" : "#16162a";
    ctx.strokeStyle = isSelected ? "#ffffff" : "#444466";
    ctx.lineWidth = isSelected ? 3 : 1;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(char.img, cardX + 28, cardY + 10, 64, 64);

    ctx.fillStyle = isSelected ? "#ffffff" : "#aaaaaa";
    ctx.font = isSelected ? "bold 13px sans-serif" : "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(char.name, cardX + cardW / 2, cardY + cardH - 15);
  }

  drawArrow(90, 200, "left");
  drawArrow(410, 200, "right");

  const char = characters[selectedIndex];
  ctx.fillStyle = "#cccccc";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  wrapText(ctx, char.ability, VIEW_W / 2, 295, 300, 20);

  drawStats();

  ctx.fillStyle = "#3a3aaa";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(175, 420, 150, 40, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Play!", VIEW_W / 2, 446);

  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888888";
  ctx.fillText("← → to browse  |  Enter to confirm", VIEW_W / 2, 480);
}

function drawArrow(x, y, dir) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  if (dir === "left") {
    ctx.moveTo(x + 20, y - 20);
    ctx.lineTo(x - 10, y);
    ctx.lineTo(x + 20, y + 20);
  } else {
    ctx.moveTo(x - 20, y - 20);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x - 20, y + 20);
  }
  ctx.closePath();
  ctx.fill();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function drawGame() {
  const cam = getCamera();
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  if (mapImg.complete) {
    ctx.drawImage(mapImg, cam.x, cam.y, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
  }

  ctx.drawImage(potatoImg, boss.x - cam.x, boss.y - cam.y, boss.width, boss.height);
  drawHPBar(boss.x - cam.x, boss.y - cam.y - 12, boss.width, boss.hp, boss.maxHp, "#ff4444");
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Potato", boss.x - cam.x + boss.width / 2, boss.y - cam.y - 16);

  for (const fry of minions) {
    drawImageFlipped(fryImg, fry.x - cam.x, fry.y - cam.y, fry.width, fry.height, fry.facingLeft);
    drawHPBar(fry.x - cam.x, fry.y - cam.y - 8, fry.width, fry.hp, fry.maxHp, "#ffaa00");
  }

  for (const p of projectiles) {
    ctx.drawImage(p.img, p.x - cam.x, p.y - cam.y, p.width, p.height);
  }

  const char = characters[player.charIndex];
  ctx.drawImage(char.img, player.x - cam.x, player.y - cam.y, player.width, player.height);

  drawHearts();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Potato", VIEW_W - 10, 22);
  drawHPBar(VIEW_W - 165, 10, 150, boss.hp, boss.maxHp, "#ff4444");
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", VIEW_W / 2, VIEW_H / 2 - 20);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText("Refresh to try again", VIEW_W / 2, VIEW_H / 2 + 20);
}

function drawWin() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = "#ffff44";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("You Win!", VIEW_W / 2, VIEW_H / 2 - 20);
  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText("Refresh to play again", VIEW_W / 2, VIEW_H / 2 + 20);
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

let imgsLoaded = 0;
const totalImgs = 15;

function onImgLoad() {
  imgsLoaded++;
  if (imgsLoaded >= totalImgs) gameLoop();
}

mapImg.onload = onImgLoad;
potatoImg.onload = onImgLoad;
fryImg.onload = onImgLoad;
heartImg.onload = onImgLoad;
heartEmptyImg.onload = onImgLoad;
heartHalfImg.onload = onImgLoad;
damageImg.onload = onImgLoad;
speedImg.onload = onImgLoad;
markingImg.onload = onImgLoad;
characters[0].img.onload = onImgLoad;
characters[1].img.onload = onImgLoad;
characters[2].img.onload = onImgLoad;
characters[0].attackImg.onload = onImgLoad;
characters[1].attackImg.onload = onImgLoad;
characters[2].attackImg.onload = onImgLoad;