const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverText = document.getElementById("gameOverText");

const scoreValue = document.getElementById("scoreValue");
const bestValue = document.getElementById("bestValue");
const statusValue = document.getElementById("statusValue");

const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const restartBtn = document.getElementById("restartBtn");

const HIGH_SCORE_KEY = "flappyBestScore";

const game = {
  width: canvas.width,
  height: canvas.height,
  state: "start",
  score: 0,
  bestScore: Number(localStorage.getItem(HIGH_SCORE_KEY) || 0),
  gravity: 0.42,
  flapStrength: -7.2,
  pipeSpeed: 2.7,
  pipeSpawnInterval: 1400,
  pipeGap: 180,
  groundHeight: 90,
  lastTime: 0,
  timeSincePipe: 0,
  bird: {
    x: 110,
    y: 260,
    width: 34,
    height: 26,
    velocityY: 0,
    rotation: 0,
  },
  pipes: [],
};

function updateHud() {
  scoreValue.textContent = String(game.score);
  bestValue.textContent = String(game.bestScore);
  statusValue.textContent =
    game.state === "playing"
      ? "Playing"
      : game.state === "paused"
        ? "Paused"
        : game.state === "gameover"
          ? "Game Over"
          : "Ready";
}

function showOnlyOverlay(element) {
  [startScreen, gameOverScreen].forEach((screen) => {
    screen.classList.toggle("visible", screen === element);
  });
}

function hideOverlays() {
  [startScreen, gameOverScreen].forEach((screen) => screen.classList.remove("visible"));
}

function resetBird() {
  game.bird.x = 110;
  game.bird.y = 260;
  game.bird.velocityY = 0;
  game.bird.rotation = 0;
}

function resetRound() {
  game.score = 0;
  game.pipes = [];
  game.timeSincePipe = 0;
  resetBird();
  updateHud();
}

function startGame() {
  resetRound();
  game.state = "playing";
  hideOverlays();
  playTone(520, 0.08, "triangle", 0.05);
  updateHud();
}

function retryGame() {
  startGame();
}

function restartGame() {
  game.bestScore = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
  startGame();
}

function saveBestScore() {
  if (game.score > game.bestScore) {
    game.bestScore = game.score;
    localStorage.setItem(HIGH_SCORE_KEY, String(game.bestScore));
  }
}

function flap() {
  if (game.state === "start") {
    startGame();
  }

  if (game.state !== "playing") {
    return;
  }

  game.bird.velocityY = game.flapStrength;
  game.bird.rotation = -0.45;
  playTone(700, 0.04, "square", 0.03);
}

function togglePause() {
  if (game.state === "playing") {
    game.state = "paused";
    playTone(260, 0.05, "triangle", 0.03);
  } else if (game.state === "paused") {
    game.state = "playing";
    playTone(340, 0.05, "triangle", 0.03);
  }
  updateHud();
}

function spawnPipePair() {
  const minTop = 90;
  const maxTop = game.height - game.groundHeight - game.pipeGap - 90;
  const topHeight = Math.random() * (maxTop - minTop) + minTop;

  game.pipes.push({
    x: game.width + 20,
    width: 72,
    topHeight,
    gap: game.pipeGap,
    passed: false,
  });
}

function collidesRect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function triggerGameOver() {
  game.state = "gameover";
  saveBestScore();
  gameOverText.textContent = `You scored ${game.score}. Best: ${game.bestScore}.`;
  showOnlyOverlay(gameOverScreen);
  playTone(180, 0.12, "sawtooth", 0.06);
  playTone(120, 0.12, "sawtooth", 0.05, 0.12);
  updateHud();
}

function updateBird() {
  game.bird.velocityY += game.gravity;
  game.bird.y += game.bird.velocityY;

  const targetRotation = Math.max(-0.5, Math.min(1.2, game.bird.velocityY / 10));
  game.bird.rotation += (targetRotation - game.bird.rotation) * 0.2;

  if (game.bird.y < 0) {
    game.bird.y = 0;
    game.bird.velocityY = 0;
  }

  if (game.bird.y + game.bird.height >= game.height - game.groundHeight) {
    game.bird.y = game.height - game.groundHeight - game.bird.height;
    triggerGameOver();
  }
}

function updatePipes(deltaMs) {
  game.timeSincePipe += deltaMs;
  if (game.timeSincePipe >= game.pipeSpawnInterval) {
    game.timeSincePipe = 0;
    spawnPipePair();
  }

  const birdRect = {
    x: game.bird.x,
    y: game.bird.y,
    width: game.bird.width,
    height: game.bird.height,
  };

  for (let i = game.pipes.length - 1; i >= 0; i -= 1) {
    const pipe = game.pipes[i];
    pipe.x -= game.pipeSpeed;

    const topPipe = { x: pipe.x, y: 0, width: pipe.width, height: pipe.topHeight };
    const bottomPipe = {
      x: pipe.x,
      y: pipe.topHeight + pipe.gap,
      width: pipe.width,
      height: game.height - game.groundHeight - (pipe.topHeight + pipe.gap),
    };

    if (collidesRect(birdRect, topPipe) || collidesRect(birdRect, bottomPipe)) {
      triggerGameOver();
      return;
    }

    if (!pipe.passed && pipe.x + pipe.width < game.bird.x) {
      pipe.passed = true;
      game.score += 1;
      if (game.score > game.bestScore) {
        game.bestScore = game.score;
      }
      playTone(920, 0.03, "triangle", 0.02);
      updateHud();
    }

    if (pipe.x + pipe.width < -10) {
      game.pipes.splice(i, 1);
    }
  }
}

function update(deltaMs) {
  if (game.state !== "playing") {
    return;
  }

  updateBird();
  if (game.state === "playing") {
    updatePipes(deltaMs);
  }
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, game.height);
  gradient.addColorStop(0, "#7ad7ff");
  gradient.addColorStop(0.7, "#c9f2ff");
  gradient.addColorStop(1, "#e8fbff");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  drawCloud(60, 110, 32);
  drawCloud(260, 150, 26);
  drawCloud(180, 80, 22);
}

function drawCloud(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.arc(x + radius * 0.8, y + 2, radius * 0.8, 0, Math.PI * 2);
  ctx.arc(x - radius * 0.7, y + 5, radius * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  for (const pipe of game.pipes) {
    drawPipe(pipe.x, 0, pipe.width, pipe.topHeight, true);
    drawPipe(
      pipe.x,
      pipe.topHeight + pipe.gap,
      pipe.width,
      game.height - game.groundHeight - (pipe.topHeight + pipe.gap),
      false,
    );
  }
}

function drawPipe(x, y, width, height, isTop) {
  if (height <= 0) {
    return;
  }

  ctx.fillStyle = "#56c253";
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = "#3a9d38";
  ctx.fillRect(x + width - 10, y, 10, height);

  const capHeight = 20;
  const capY = isTop ? y + height - capHeight : y;
  ctx.fillStyle = "#4daf49";
  ctx.fillRect(x - 4, capY, width + 8, capHeight);
}

function drawGround() {
  const y = game.height - game.groundHeight;
  ctx.fillStyle = "#9a6a38";
  ctx.fillRect(0, y, game.width, game.groundHeight);

  ctx.fillStyle = "#6ad26a";
  ctx.fillRect(0, y, game.width, 28);
}

function drawBird() {
  const bird = game.bird;

  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(bird.rotation);

  ctx.fillStyle = "#ffe66e";
  ctx.beginPath();
  ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffb248";
  ctx.beginPath();
  ctx.moveTo(bird.width / 2 - 1, -2);
  ctx.lineTo(bird.width / 2 + 12, 2);
  ctx.lineTo(bird.width / 2 - 1, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(6, -6, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#15334f";
  ctx.beginPath();
  ctx.arc(7, -6, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f7c848";
  ctx.beginPath();
  ctx.ellipse(-8, 5, 7, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPausedText() {
  if (game.state !== "paused") {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 46px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Paused", game.width / 2, game.height / 2);
  ctx.font = "20px 'Segoe UI', sans-serif";
  ctx.fillText("Press P to continue", game.width / 2, game.height / 2 + 34);
}

function render() {
  drawSky();
  drawPipes();
  drawGround();
  drawBird();
  drawPausedText();
}

function gameLoop(timestamp) {
  if (!game.lastTime) {
    game.lastTime = timestamp;
  }

  const deltaMs = Math.min(40, timestamp - game.lastTime);
  game.lastTime = timestamp;

  update(deltaMs);
  render();

  requestAnimationFrame(gameLoop);
}

let audioContext = null;

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTone(frequency, duration, type = "sine", volume = 0.04, delay = 0) {
  ensureAudioContext();

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  const start = audioContext.currentTime + delay;
  const end = start + duration;

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(start);
  oscillator.stop(end);
}

function handleActionInput() {
  flap();
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    handleActionInput();
    return;
  }

  if (event.code === "KeyP") {
    event.preventDefault();
    togglePause();
  }
});

canvas.addEventListener("pointerdown", () => {
  handleActionInput();
});

startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", retryGame);
restartBtn.addEventListener("click", restartGame);

showOnlyOverlay(startScreen);
updateHud();
requestAnimationFrame(gameLoop);
