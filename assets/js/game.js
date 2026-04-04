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

// Game states
let gameState = "select"; // "select" or "playing"

// Characters
const characters = [
  {
    name: "Blueberry",
    ability: "Heals near allies or slowly in Mushy Mode",
    color: null,
    img: new Image(),
    useImg: true
  },
  {
    name: "Tomato",
    ability: "Places a puddle that slows enemies and speeds up allies",
    color: "#E03030",
    img: null,
    useImg: false
  },
  {
    name: "Banana",
    ability: "Places a peel that damages enemies and minions",
    color: "#FFE030",
    img: null,
    useImg: false
  }
];
characters[0].img.src = "assets/sprites/blueberry.png";

let selectedIndex = 0;
let carouselOffset = 0; // for smooth sliding animation
let targetOffset = 0;

// Arrow images (we'll draw them as triangles)
const ARROW_SIZE = 30;

// Map
const mapImg = new Image();
mapImg.src = "assets/sprites/mapsprite.png";

// Player
let player = null;

function createPlayer(charIndex) {
  return {
    x: 500,
    y: 800,
    width: 32,
    height: 32,
    speed: 4,
    charIndex: charIndex
  };
}

// Input
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
    if (e.key === "Enter") {
      startGame();
    }
  }
});
document.addEventListener("keyup", e => keys[e.key] = false);

// Mouse click for arrows and confirm
canvas.addEventListener("click", e => {
  if (gameState !== "select") return;

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) / scale;
  const my = (e.clientY - rect.top) / scale;

  // Left arrow: center - 150, center y ~200
  if (mx >= 60 && mx <= 120 && my >= 170 && my <= 230) {
    selectedIndex = (selectedIndex - 1 + characters.length) % characters.length;
    targetOffset = selectedIndex * 200;
  }

  // Right arrow
  if (mx >= 380 && mx <= 440 && my >= 170 && my <= 230) {
    selectedIndex = (selectedIndex + 1) % characters.length;
    targetOffset = selectedIndex * 200;
  }

  // Confirm button
  if (mx >= 175 && mx <= 325 && my >= 370 && my <= 410) {
    startGame();
  }
});

function startGame() {
  player = createPlayer(selectedIndex);
  gameState = "playing";
}

function update() {
  if (gameState === "select") {
    // Smooth carousel sliding
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
  }
}

function getCamera() {
  let camX = player.x + player.width / 2 - VIEW_W / 2;
  let camY = player.y + player.height / 2 - VIEW_H / 2;
  camX = Math.max(0, Math.min(camX, MAP_WIDTH - VIEW_W));
  camY = Math.max(0, Math.min(camY, MAP_HEIGHT - VIEW_H));
  return { x: camX, y: camY };
}

function drawSelectScreen() {
  // Background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Fruit Freight", VIEW_W / 2, 60);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText("Choose your character", VIEW_W / 2, 90);

  // Draw 3 character cards in a row, slide based on carouselOffset
  const cardW = 120;
  const cardH = 140;
  const cardY = 130;
  const spacing = 200;
  const centerX = VIEW_W / 2;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const cardX = centerX + (i * spacing) - carouselOffset - cardW / 2;

    // Only draw if somewhat visible
    if (cardX + cardW < -50 || cardX > VIEW_W + 50) continue;

    const isSelected = i === selectedIndex;

    // Card background
    ctx.fillStyle = isSelected ? "#2e2e5e" : "#16162a";
    ctx.strokeStyle = isSelected ? "#ffffff" : "#444466";
    ctx.lineWidth = isSelected ? 3 : 1;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    // Character sprite or placeholder
    if (char.useImg && char.img.complete) {
      ctx.drawImage(char.img, cardX + 28, cardY + 10, 64, 64);
    } else if (!char.useImg) {
      ctx.fillStyle = char.color;
      ctx.fillRect(cardX + 28, cardY + 10, 64, 64);
    }

    // Character name
    ctx.fillStyle = isSelected ? "#ffffff" : "#aaaaaa";
    ctx.font = isSelected ? "bold 13px sans-serif" : "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(char.name, cardX + cardW / 2, cardY + cardH - 15);
  }

  // Left arrow
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(120, 200);
  ctx.lineTo(70, 200);
  ctx.lineTo(95, 175);
  ctx.closePath();
  ctx.fill();
  // actually draw proper left/right arrows
  drawArrow(90, 200, "left");
  drawArrow(410, 200, "right");

  // Ability description
  const char = characters[selectedIndex];
  ctx.fillStyle = "#cccccc";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  wrapText(ctx, char.ability, VIEW_W / 2, 310, 300, 20);

  // Confirm button
  ctx.fillStyle = "#3a3aaa";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(175, 370, 150, 40, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Play!", VIEW_W / 2, 396);

  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#888888";
  ctx.fillText("← → to browse  |  Enter to confirm", VIEW_W / 2, 450);
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

  const char = characters[player.charIndex];
  if (char.useImg && char.img.complete) {
    ctx.drawImage(char.img, player.x - cam.x, player.y - cam.y, player.width, player.height);
  } else if (!char.useImg) {
    ctx.fillStyle = char.color;
    ctx.fillRect(player.x - cam.x, player.y - cam.y, player.width, player.height);
  }
}

function draw() {
  if (gameState === "select") drawSelectScreen();
  if (gameState === "playing") drawGame();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();