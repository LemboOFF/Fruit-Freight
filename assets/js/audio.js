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

function startMainMenuMusic() {
  if (!menuStarted) {
    menuStarted = true;
    mainMenuSound.volume = 0;
    mainMenuSound.play();
    // Fade in
    const fadeInterval = setInterval(() => {
      if (mainMenuSound.volume < 0.95) {
        mainMenuSound.volume += 0.05;
      } else {
        mainMenuSound.volume = 1;
        clearInterval(fadeInterval);
      }
    }, 50);
  }
}

function tryStartMusic() {
  // This function is now deprecated - music starts automatically
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
    // Fade out current battle music
    fadeOutBattleMusic(() => {
      // Then start new music
      startBattleMusic(bossName);
    });
  } else {
    startBattleMusic(bossName);
  }
}

function startBattleMusic(bossName) {
  currentBattleSound = battleSounds[bossName];
  currentBattleSound.volume = 0;
  currentBattleSound.play();
  // Fade in
  const fadeInterval = setInterval(() => {
    if (currentBattleSound.volume < 0.95) {
      currentBattleSound.volume += 0.05;
    } else {
      currentBattleSound.volume = 1;
      clearInterval(fadeInterval);
    }
  }, 50);
}

function fadeOutBattleMusic(callback) {
  if (!currentBattleSound) {
    if (callback) callback();
    return;
  }
  const sound = currentBattleSound;
  const fadeInterval = setInterval(() => {
    if (sound.volume > 0.05) {
      sound.volume -= 0.05;
    } else {
      sound.pause();
      sound.volume = 0;
      currentBattleSound = null;
      clearInterval(fadeInterval);
      if (callback) callback();
    }
  }, 50);
}

// Start main menu music when the script loads
startMainMenuMusic();