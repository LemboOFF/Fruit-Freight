const mainMenuSound = new Audio("assets/sounds/main-menu-sound.ogg");
const tomatoSplatSound = new Audio("assets/sounds/tomato-splat.ogg");
mainMenuSound.loop = true;
mainMenuSound.volume = 1;

let menuStarted = false;

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