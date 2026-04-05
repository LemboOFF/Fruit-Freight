const PUDDLE_DURATION = 300;

function placePuddle() {
  tomatoSplatSound.currentTime = 0;
  tomatoSplatSound.play();
  puddles.push({
    x: player.x + player.width / 2 - 25,
    y: player.y + player.height / 2 - 25,
    width: 50,
    height: 50,
    effectiveY: 26,
    timer: PUDDLE_DURATION
  });
}

function updatePuddles() {
  puddles = puddles.filter(p => p.timer > 0);
  for (const puddle of puddles) {
    puddle.timer--;
  }
}

function isInPuddle(entity, puddle) {
  const px = puddle.x;
  const py = puddle.y + puddle.effectiveY;
  const pw = puddle.width;
  const ph = puddle.height - puddle.effectiveY;

  return entity.x < px + pw &&
         entity.x + entity.width > px &&
         entity.y < py + ph &&
         entity.y + entity.height > py;
}