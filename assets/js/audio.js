const mainMenuSound = new Audio("assets/sounds/main-menu-sound.ogg");
const tomatoSplatSound = new Audio("assets/sounds/tomato-splat.ogg");
const battleSounds = {
  potato: new Audio("assets/sounds/battle-potato.ogg"),
  cucumber: new Audio("assets/sounds/battle-cucumber.ogg"),
  jalapeno: new Audio("assets/sounds/battle-jalapeno.ogg"),
  broccoli: new Audio("assets/sounds/battle-broccoli.ogg")
};

mainMenuSound.loop = true;
mainMenuSound.volume = 1;
for (const key in battleSounds) {
  battleSounds[key].loop = true;
  battleSounds[key].volume = 1;
}

let menuStarted = false;
let currentBattleSound = null;

function tryStartMusic() {
  if (!menuStarted) {
    menuStarted = true;
    mainMenuSound.play();
  }
}

function fadeOutMainMenu() {
  const fadeInterval = setInterval(() => {
    if (mainMenuSound.volume > 0.05) {
      mainMenuSound.volume -= 0.05;
    } else {
      mainMenuSound.pause();
      mainMenuSound.volume = 0;
      clearInterval(fadeInterval);
    }
  }, 50);
}

function playBattleMusic(bossName) {
  if (currentBattleSound) {
    currentBattleSound.pause();
    currentBattleSound.currentTime = 0;
  }
  currentBattleSound = battleSounds[bossName];
  currentBattleSound.play();
}

function fadeOutBattleMusic() {
  if (!currentBattleSound) return;
  const sound = currentBattleSound;
  const fadeInterval = setInterval(() => {
    if (sound.volume > 0.05) {
      sound.volume -= 0.05;
    } else {
      sound.pause();
      sound.volume = 0;
      clearInterval(fadeInterval);
    }
  }, 50);
}