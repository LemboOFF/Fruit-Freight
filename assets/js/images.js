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

heartImg.src = "assets/sprites/heart-sprite.png";
heartEmptyImg.src = "assets/sprites/heart-empty-sprite.png";
heartHalfImg.src = "assets/sprites/heart-half-sprite.png";
damageImg.src = "assets/sprites/damage-sprite.png";
speedImg.src = "assets/sprites/speed-sprite.png";
markingImg.src = "assets/sprites/marking-sprite.png";
tomatoPuddleImg.src = "assets/sprites/tomato-puddle.png";
bluBotImg.src = "assets/sprites/bluebot-droid.png";

const mapImg = new Image();
mapImg.src = "assets/sprites/mapsprite.png";

const potatoImg = new Image();
potatoImg.src = "assets/sprites/bosses/potatoboss1.png";

const cucumberImg = new Image();
cucumberImg.src = "assets/sprites/bosses/cucumberboss2.png";

const cucumberAttackImg = new Image();
cucumberAttackImg.src = "assets/sprites/cucumber-attack.png";

const fryImg = new Image();
fryImg.src = "assets/sprites/bosses/minions/fry-minion.png";

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
characters[1].img.src = "assets/sprites/tomato.png";
characters[2].img.src = "assets/sprites/banana.png";
characters[3].img.src = "assets/sprites/robo-berry.png";
characters[0].attackImg.src = "assets/sprites/blueberry-attack.png";
characters[1].attackImg.src = "assets/sprites/tomato-attack.png";
characters[2].attackImg.src = "assets/sprites/banana-attack.png";
characters[3].attackImg.src = "assets/sprites/blueberry-attack.png";

let imgsLoaded = 0;
const totalImgs = 20;

function onImgLoad() {
  imgsLoaded++;
  if (imgsLoaded >= totalImgs) gameLoop();
}

mapImg.onload = onImgLoad;
potatoImg.onload = onImgLoad;
cucumberImg.onload = onImgLoad;
cucumberAttackImg.onload = onImgLoad;
fryImg.onload = onImgLoad;
heartImg.onload = onImgLoad;
heartEmptyImg.onload = onImgLoad;
heartHalfImg.onload = onImgLoad;
damageImg.onload = onImgLoad;
speedImg.onload = onImgLoad;
markingImg.onload = onImgLoad;
tomatoPuddleImg.onload = onImgLoad;
bluBotImg.onload = onImgLoad;
characters[0].img.onload = onImgLoad;
characters[1].img.onload = onImgLoad;
characters[2].img.onload = onImgLoad;
characters[3].img.onload = onImgLoad;
characters[0].attackImg.onload = onImgLoad;
characters[1].attackImg.onload = onImgLoad;
characters[2].attackImg.onload = onImgLoad;