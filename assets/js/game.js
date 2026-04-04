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

const mapImg = new Image();
mapImg.src = "assets/sprites/mapsprite.png";

const player = {
  x: 500,
  y: 800,
  width: 32,
  height: 32,
  speed: 4,
  img: new Image()
};
player.img.src = "assets/sprites/blueberry.png";

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function update() {
  if (keys["w"] || keys["W"]) player.y -= player.speed;
  if (keys["s"] || keys["S"]) player.y += player.speed;
  if (keys["a"] || keys["A"]) player.x -= player.speed;
  if (keys["d"] || keys["D"]) player.x += player.speed;

  if (player.y < GROUND_Y) player.y = GROUND_Y;
  if (player.y + player.height > MAP_HEIGHT) player.y = MAP_HEIGHT - player.height;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > MAP_WIDTH) player.x = MAP_WIDTH - player.width;
}

function getCamera() {
  let camX = player.x + player.width / 2 - VIEW_W / 2;
  let camY = player.y + player.height / 2 - VIEW_H / 2;

  camX = Math.max(0, Math.min(camX, MAP_WIDTH - VIEW_W));
  camY = Math.max(0, Math.min(camY, MAP_HEIGHT - VIEW_H));

  return { x: camX, y: camY };
}

function draw() {
  const cam = getCamera();
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  if (mapImg.complete) {
    ctx.drawImage(mapImg, cam.x, cam.y, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
  }

  if (player.img.complete) {
    ctx.drawImage(player.img, player.x - cam.x, player.y - cam.y, player.width, player.height);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

mapImg.onload = () => gameLoop();