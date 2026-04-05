const MAP_WIDTH = 1000;
const MAP_HEIGHT = 1500;
const GROUND_Y = 584;
const VIEW_W = 500;
const VIEW_H = 500;

const heartImg = new Image();
const heartEmptyImg = new Image();
const heartHalfImg = new Image();
const damageImg = new Image();
const speedImg = new Image();
const markingImg = new Image();
const tomatoPuddleImg = new Image();
const bluBotImg = new Image();
const brokenBluBotImg = new Image();

heartImg.src = "assets/sprites/heart-sprite.png";
heartImg.onerror = onImgLoad;
heartEmptyImg.src = "assets/sprites/heart-empty-sprite.png";
heartEmptyImg.onerror = onImgLoad;
heartHalfImg.src = "assets/sprites/heart-half-sprite.png";
heartHalfImg.onerror = onImgLoad;
damageImg.src = "assets/sprites/damage-sprite.png";
damageImg.onerror = onImgLoad;
speedImg.src = "assets/sprites/speed-sprite.png";
speedImg.onerror = onImgLoad;
markingImg.src = "assets/sprites/marking-sprite.png";
markingImg.onerror = onImgLoad;
tomatoPuddleImg.src = "assets/sprites/tomato-puddle.png";
tomatoPuddleImg.onerror = onImgLoad;
bluBotImg.src = "assets/sprites/blubot.png";
bluBotImg.onerror = onImgLoad;
brokenBluBotImg.src = "assets/sprites/blubot-broken.png";
brokenBluBotImg.onerror = onImgLoad;

const mapImg = new Image();
mapImg.src = "assets/sprites/mapsprite.png";
mapImg.onerror = onImgLoad;

const potatoImg = new Image();
potatoImg.src = "assets/sprites/bosses/potatoboss1.png";
potatoImg.onerror = onImgLoad;

const cucumberImg = new Image();
cucumberImg.src = "assets/sprites/bosses/cucumberboss2.png";
cucumberImg.onerror = onImgLoad;

const cucumberAttackImg = new Image();
cucumberAttackImg.src = "assets/sprites/cucumber-attack.png";
cucumberAttackImg.onerror = onImgLoad;

const jalapenoImg = new Image();
jalapenoImg.src = "assets/sprites/bosses/jalapenoboss3.png";
jalapenoImg.onerror = onImgLoad;

const jalapenoAttackImg = new Image();
jalapenoAttackImg.src = "assets/sprites/jalapeno-attack.png";
jalapenoAttackImg.onerror = onImgLoad;

const jalapenoMinionImg = new Image();
jalapenoMinionImg.src = "assets/sprites/bosses/minions/jalapeno-minion.png";
jalapenoMinionImg.onerror = onImgLoad;

const cucumberTiredImg = new Image();
cucumberTiredImg.src = "assets/sprites/bosses/cucumbertired.png";
cucumberTiredImg.onerror = onImgLoad;

const fryImg = new Image();
fryImg.src = "assets/sprites/bosses/minions/fry-minion.png";
fryImg.onerror = onImgLoad;

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
    maxHearts: 3,
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
    maxHearts: 3,
    damage: 5,
    speed: 6,
    damageLevel: 1,
    speedLevel: 3,
  },
  {
    name: "Robo-Berry",
    ability: "Deploys BluBots that orbit and damage nearby enemies",
    img: new Image(),
    attackImg: new Image(),
    maxHearts: 5,
    damage: 5,
    speed: 2,
    damageLevel: 1,
    speedLevel: 1,
  }
];

characters[0].img.src = "assets/sprites/blueberry.png";
characters[0].img.onerror = onImgLoad;
characters[1].img.src = "assets/sprites/tomato.png";
characters[1].img.onerror = onImgLoad;
characters[2].img.src = "assets/sprites/banana.png";
characters[2].img.onerror = onImgLoad;
characters[3].img.src = "assets/sprites/robo-berry.png";
characters[3].img.onerror = onImgLoad;
characters[0].attackImg.src = "assets/sprites/blueberry-attack.png";
characters[0].attackImg.onerror = onImgLoad;
characters[1].attackImg.src = "assets/sprites/tomato-attack.png";
characters[1].attackImg.onerror = onImgLoad;
characters[2].attackImg.src = "assets/sprites/banana-attack.png";
characters[2].attackImg.onerror = onImgLoad;
characters[3].attackImg.src = "assets/sprites/blueberry-attack.png";
characters[3].attackImg.onerror = onImgLoad;

let imgsLoaded = 0;
const totalImgs = 26;

// Font loading
let fontLoaded = false;
const gameFont = new FontFace('GameFont', 'url(assets/font/GameFont.ttf)');

gameFont.load().then(function(loadedFont) {
  document.fonts.add(loadedFont);
  fontLoaded = true;
  checkAllLoaded();
}).catch(function(error) {
  console.warn('Font failed to load, using fallback:', error);
  fontLoaded = true; // Continue even if font fails
  checkAllLoaded();
});

function checkAllLoaded() {
  if (imgsLoaded >= totalImgs && fontLoaded) {
    gameLoop();
  }
}

function onImgLoad() {
  imgsLoaded++;
  checkAllLoaded();
}

mapImg.onload = onImgLoad;
potatoImg.onload = onImgLoad;
cucumberImg.onload = onImgLoad;
cucumberAttackImg.onload = onImgLoad;
cucumberTiredImg.onload = onImgLoad;
fryImg.onload = onImgLoad;
heartImg.onload = onImgLoad;
heartEmptyImg.onload = onImgLoad;
heartHalfImg.onload = onImgLoad;
damageImg.onload = onImgLoad;
speedImg.onload = onImgLoad;
markingImg.onload = onImgLoad;
tomatoPuddleImg.onload = onImgLoad;
bluBotImg.onload = onImgLoad;
brokenBluBotImg.onload = onImgLoad;
characters[0].img.onload = onImgLoad;
characters[1].img.onload = onImgLoad;
characters[2].img.onload = onImgLoad;
characters[3].img.onload = onImgLoad;
characters[0].attackImg.onload = onImgLoad;
characters[1].attackImg.onload = onImgLoad;
characters[2].attackImg.onload = onImgLoad;
characters[3].attackImg.onload = onImgLoad;
jalapenoImg.onload = onImgLoad;
jalapenoAttackImg.onload = onImgLoad;
jalapenoMinionImg.onload = onImgLoad;