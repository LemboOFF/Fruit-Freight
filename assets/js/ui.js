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

function drawSpeedEffectOnPlayer(cam) {
  if (!player.speedBuff && !player.speedDebuff) return;

  const iconSize = 10;
  const x = (player.x - cam.x) + player.width - iconSize + 4;
  const y = (player.y - cam.y) - iconSize - 2;

  ctx.save();
  ctx.drawImage(speedImg, x, y, iconSize, iconSize);
  if (player.speedBuff) {
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
  } else {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
  }
  ctx.fillRect(x, y, iconSize, iconSize);
  ctx.restore();
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

function drawSelectScreen() {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px GameFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Fruit Freight", VIEW_W / 2, 60);

  ctx.font = "16px GameFont, sans-serif";
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
    const isUnlocked = unlockedCharacters.includes(i);

    ctx.fillStyle = isSelected ? "#2e2e5e" : "#16162a";
    ctx.strokeStyle = isSelected ? "#ffffff" : "#444466";
    ctx.lineWidth = isSelected ? 3 : 1;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    if (isUnlocked) {
      ctx.drawImage(char.img, cardX + 28, cardY + 10, 64, 64);
      ctx.fillStyle = isSelected ? "#ffffff" : "#aaaaaa";
      ctx.font = isSelected ? "bold 13px GameFont, sans-serif" : "12px GameFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(char.name, cardX + cardW / 2, cardY + cardH - 15);
    } else {
      // Draw locked character
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(cardX + 28, cardY + 10, 64, 64);
      ctx.fillStyle = "#666666";
      ctx.font = "bold 13px GameFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LOCKED", cardX + cardW / 2, cardY + cardH - 15);
    }
  }

  drawArrow(90, 200, "left");
  drawArrow(410, 200, "right");

  const char = characters[selectedIndex];
  ctx.fillStyle = "#cccccc";
  ctx.font = "13px GameFont, sans-serif";
  ctx.textAlign = "center";
  wrapText(ctx, char.ability, VIEW_W / 2, 295, 300, 20);

  drawStats();

  // Draw UNLOCK ALL button at top left
  const unlockBtnX = 10;
  const unlockBtnY = 10;
  const unlockBtnW = 80;
  const unlockBtnH = 30;
  
  ctx.fillStyle = testUnlockAll ? "#44ff44" : "#888888";
  ctx.fillRect(unlockBtnX, unlockBtnY, unlockBtnW, unlockBtnH);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(unlockBtnX, unlockBtnY, unlockBtnW, unlockBtnH);
  
  ctx.fillStyle = "#000000";
  ctx.font = "bold 11px GameFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("UNLOCK", unlockBtnX + unlockBtnW / 2, unlockBtnY + unlockBtnH / 2 + 5);
  ctx.fillText("ALL", unlockBtnX + unlockBtnW / 2, unlockBtnY + unlockBtnH / 2 + 16);

  ctx.fillStyle = "#3a3aaa";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(175, 420, 150, 40, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px GameFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Play!", VIEW_W / 2, 446);

  ctx.font = "12px GameFont, sans-serif";
  ctx.fillStyle = "#888888";
  ctx.fillText("← → to browse  |  Enter to confirm", VIEW_W / 2, 480);
}

function drawGame() {
  const cam = getCamera();
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  if (mapImg.complete) {
    ctx.drawImage(mapImg, cam.x, cam.y, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);
  }

  // Puddles
  for (const puddle of puddles) {
    ctx.drawImage(tomatoPuddleImg, puddle.x - cam.x, puddle.y - cam.y, puddle.width, puddle.height);
  }

  // Boss
  if (boss.hp > 0) {
    ctx.drawImage(boss.img, boss.x - cam.x, boss.y - cam.y, boss.width, boss.height);
    drawHPBar(boss.x - cam.x, boss.y - cam.y - 12, boss.width, boss.hp, boss.maxHp, "#ff4444");
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px GameFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(boss.name, boss.x - cam.x + boss.width / 2, boss.y - cam.y - 16);
  }

  // Fries
  for (const fry of minions) {
    const minionImg = fry.img || fryImg;
    drawImageFlipped(minionImg, fry.x - cam.x, fry.y - cam.y, fry.width, fry.height, fry.facingLeft);
    drawHPBar(fry.x - cam.x, fry.y - cam.y - 8, fry.width, fry.hp, fry.maxHp, "#ffaa00");
  }

  // Projectiles
  for (const p of projectiles) {
    ctx.drawImage(p.img, p.x - cam.x, p.y - cam.y, p.width, p.height);
  }

  // BluBots
  for (const bot of bluBots) {
    const sprite = bot.isBroken ? brokenBluBotImg : bluBotImg;
    ctx.drawImage(sprite, bot.x - cam.x - 8, bot.y - cam.y - 8, 16, 16);
    
    // Draw laser if active
    if (bot.laserActive && bot.target) {
      ctx.strokeStyle = "#00FFFF"; // Cyan laser color
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bot.x - cam.x, bot.y - cam.y);
      ctx.lineTo(bot.target.x + bot.target.width / 2 - cam.x, bot.target.y + bot.target.height / 2 - cam.y);
      ctx.stroke();
    }
  }

  // Player
  const char = characters[player.charIndex];
  ctx.drawImage(char.img, player.x - cam.x, player.y - cam.y, player.width, player.height);
  
  // Blueberry Mushy Mode brown tint
  if (player.charIndex === 0 && player.mushyMode) {
    ctx.fillStyle = "rgba(139, 69, 19, 0.4)"; // Brown tint with transparency
    ctx.fillRect(player.x - cam.x, player.y - cam.y, player.width, player.height);
  }
  
  drawSpeedEffectOnPlayer(cam);

  // HUD
  drawHearts();

  // Ability status
  if (player.charIndex === 0) {
    ctx.fillStyle = player.mushyMode ? "#d4a574" : "#888888";
    ctx.font = "11px GameFont, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(player.mushyMode ? `Mushy Mode: ON` : "Mushy Mode: OFF", 10, 40);
  } else if (player.charIndex === 1) {
    const cooldownPct = player.abilityCooldown / PUDDLE_COOLDOWN;
    ctx.fillStyle = cooldownPct > 0 ? "#888888" : "#44ff44";
    ctx.font = "11px GameFont, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(cooldownPct > 0 ? `Puddle: ${Math.ceil(player.abilityCooldown / 60)}s` : "Puddle: Ready!", 10, 40);
  }

  // Boss HP bar top right
  if (boss.hp > 0) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px GameFont, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(boss.name, VIEW_W - 10, 22);
    drawHPBar(VIEW_W - 165, 10, 150, boss.hp, boss.maxHp, "#ff4444");
  }

  // BluBot Targeting Menu (top-middle)
  if (bluBots.length > 0) {
    const menuX = 150;
    const menuY = 15;
    const menuW = 200;
    const menuH = 20;
    
    // Main button
    ctx.fillStyle = "#1a3a3a";
    ctx.strokeStyle = "#00cccc";
    ctx.lineWidth = 2;
    ctx.fillRect(menuX, menuY, menuW, menuH);
    ctx.strokeRect(menuX, menuY, menuW, menuH);
    
    ctx.fillStyle = "#00cccc";
    ctx.font = "bold 11px GameFont, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`TARGETING: ${bluBotTargetMode}`, menuX + menuW / 2, menuY + 14);
    
    // Dropdown menu
    if (targetingMenuOpen) {
      for (let i = 0; i < targetingModes.length; i++) {
        const optionY = menuY + 20 + i * 20;
        const isSelected = targetingModes[i] === bluBotTargetMode;
        
        ctx.fillStyle = isSelected ? "#00aa88" : "#0a2a2a";
        ctx.strokeStyle = isSelected ? "#00ffff" : "#004488";
        ctx.lineWidth = 1;
        ctx.fillRect(160, optionY, 180, 18);
        ctx.strokeRect(160, optionY, 180, 18);
        
        ctx.fillStyle = isSelected ? "#ffffff" : "#00cccc";
        ctx.font = isSelected ? "bold 10px GameFont, sans-serif" : "10px GameFont, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(targetingModes[i], 250, optionY + 13);
      }
    }
  }
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px GameFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", VIEW_W / 2, VIEW_H / 2 - 20);
  ctx.font = "18px GameFont, sans-serif";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText("Refresh to try again", VIEW_W / 2, VIEW_H / 2 + 20);
}

function drawBossTransition() {
  ctx.fillStyle = "#808080"; // Gray background
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px GameFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("You beat Potato!", VIEW_W / 2, VIEW_H / 2 - 20);
  ctx.font = "bold 24px GameFont, sans-serif";
  ctx.fillText("Cucumber is coming next!", VIEW_W / 2, VIEW_H / 2 + 20);
}

function drawWin() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = "#ffff44";
  ctx.font = "bold 48px GameFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("You Win!", VIEW_W / 2, VIEW_H / 2 - 20);
  ctx.font = "18px GameFont, sans-serif";
  ctx.fillStyle = "#aaaaaa";
  ctx.fillText("Refresh to play again", VIEW_W / 2, VIEW_H / 2 + 20);
}
