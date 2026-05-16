const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menuScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverText = document.getElementById("gameOverText");

const scoreValue = document.getElementById("scoreValue");
const livesValue = document.getElementById("livesValue");
const levelValue = document.getElementById("levelValue");

const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const restartBtn = document.getElementById("restartBtn");

const keys = {
  left: false,
  right: false,
};

const BRICK_COLORS = ["#00e7ff", "#8c7bff", "#ff3fd5", "#78ffb6"];

const game = {
  state: "menu",
  score: 0,
  lives: 5,
  level: 1,
  levelStartScore: 0,
  width: canvas.width,
  height: canvas.height,
  paddle: {
    width: 130,
    height: 16,
    speed: 9,
    x: 0,
    y: canvas.height - 34,
  },
  ball: {
    radius: 9,
    speed: 4.3,
    maxSpeed: 12,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
  },
  bricks: [],
};

function resetPaddle() {
  game.paddle.x = (game.width - game.paddle.width) / 2;
}

function resetBall(launch = true) {
  game.ball.x = game.paddle.x + game.paddle.width / 2;
  game.ball.y = game.paddle.y - game.ball.radius - 2;

  const angleRange = Math.PI / 3;
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * angleRange;
  const speed = game.ball.speed;

  game.ball.dx = launch ? Math.cos(angle) * speed : 0;
  game.ball.dy = launch ? Math.sin(angle) * speed : 0;
}

function createBricksForLevel(level) {
  const rows = Math.min(4 + Math.floor(level / 2), 9);
  const cols = 11;
  const padding = 10;
  const topOffset = 70;
  const sideOffset = 36;
  const brickWidth = (game.width - sideOffset * 2 - padding * (cols - 1)) / cols;
  const brickHeight = 24;

  const result = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const waveGap = (row + col + level) % 5 === 0;
      if (level > 1 && row % 2 === 1 && waveGap) {
        continue;
      }

      const armor = 1 + (level >= 4 && row < 2 ? 1 : 0) + (level >= 8 && row === 0 ? 1 : 0);
      result.push({
        x: sideOffset + col * (brickWidth + padding),
        y: topOffset + row * (brickHeight + padding),
        width: brickWidth,
        height: brickHeight,
        hp: armor,
        maxHp: armor,
      });
    }
  }

  game.bricks = result;
}

function setupLevel(level, keepScore = true) {
  if (!keepScore) {
    game.score = 0;
  }

  game.level = level;
  game.levelStartScore = game.score;
  game.ball.speed = Math.min(4 + level * 0.45, game.ball.maxSpeed);

  createBricksForLevel(level);
  resetPaddle();
  resetBall(true);
  updateHud();
}

function updateHud() {
  scoreValue.textContent = String(game.score);
  livesValue.textContent = String(game.lives);
  levelValue.textContent = String(game.level);
}

function showOnlyOverlay(element) {
  [menuScreen, gameOverScreen].forEach((screen) => {
    screen.classList.toggle("visible", screen === element);
  });
}

function hideOverlays() {
  [menuScreen, gameOverScreen].forEach((screen) => screen.classList.remove("visible"));
}

function startNewGame() {
  game.state = "playing";
  game.lives = 5;
  setupLevel(1, false);
  hideOverlays();
}

function retryCurrentLevel() {
  game.state = "playing";
  game.lives = 5;
  game.score = game.levelStartScore;
  setupLevel(game.level, true);
  hideOverlays();
}

function triggerGameOver() {
  game.state = "gameover";
  gameOverText.textContent = `You reached level ${game.level} with ${game.score} points.`;
  showOnlyOverlay(gameOverScreen);
  playTone(170, 0.22, "sawtooth", 0.08);
}

function nextLevel() {
  game.level += 1;
  setupLevel(game.level, true);
  playTone(680, 0.06, "triangle", 0.05);
  playTone(820, 0.1, "triangle", 0.06, 0.08);
}

function clampPaddle() {
  game.paddle.x = Math.max(0, Math.min(game.paddle.x, game.width - game.paddle.width));
}

function updatePaddle() {
  if (keys.left) {
    game.paddle.x -= game.paddle.speed;
  }
  if (keys.right) {
    game.paddle.x += game.paddle.speed;
  }
  clampPaddle();
}

function handleBallCollisions() {
  const ball = game.ball;
  const paddle = game.paddle;

  if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= game.width) {
    ball.dx *= -1;
    playTone(280, 0.03, "square", 0.03);
  }

  if (ball.y - ball.radius <= 0) {
    ball.dy *= -1;
    playTone(300, 0.03, "square", 0.03);
  }

  const withinPaddleX = ball.x >= paddle.x && ball.x <= paddle.x + paddle.width;
  const hitsPaddle = ball.y + ball.radius >= paddle.y && ball.y + ball.radius <= paddle.y + paddle.height;
  if (withinPaddleX && hitsPaddle && ball.dy > 0) {
    const relativeHit = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    const bounceAngle = relativeHit * (Math.PI / 3);
    const speed = Math.hypot(ball.dx, ball.dy);

    ball.dx = Math.sin(bounceAngle) * speed;
    ball.dy = -Math.cos(bounceAngle) * speed;
    ball.y = paddle.y - ball.radius - 1;
    playTone(420, 0.04, "triangle", 0.04);
  }

  for (let i = game.bricks.length - 1; i >= 0; i -= 1) {
    const brick = game.bricks[i];
    if (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    ) {
      const fromLeftOrRight = ball.x < brick.x || ball.x > brick.x + brick.width;
      if (fromLeftOrRight) {
        ball.dx *= -1;
      } else {
        ball.dy *= -1;
      }

      brick.hp -= 1;
      game.score += 10 * (brick.maxHp === 1 ? 1 : 2);
      playTone(560, 0.04, "square", 0.04);

      if (brick.hp <= 0) {
        game.bricks.splice(i, 1);
      }

      updateHud();
      break;
    }
  }

  if (ball.y - ball.radius > game.height) {
    game.lives -= 1;
    updateHud();
    playTone(160, 0.11, "sawtooth", 0.06);

    if (game.lives <= 0) {
      triggerGameOver();
      return;
    }

    resetPaddle();
    resetBall(true);
  }

  if (game.bricks.length === 0 && game.state === "playing") {
    nextLevel();
  }
}

function updateBall() {
  game.ball.x += game.ball.dx;
  game.ball.y += game.ball.dy;
}

function drawBackgroundGrid() {
  ctx.save();
  ctx.strokeStyle = "rgba(0, 231, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= game.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, game.height);
    ctx.stroke();
  }
  for (let y = 0; y <= game.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(game.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPaddle() {
  const paddle = game.paddle;
  ctx.save();
  ctx.fillStyle = "#00e7ff";
  ctx.shadowColor = "#00e7ff";
  ctx.shadowBlur = 16;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.restore();
}

function drawBall() {
  const ball = game.ball;
  ctx.save();
  ctx.fillStyle = "#ff3fd5";
  ctx.shadowColor = "#ff3fd5";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBricks() {
  game.bricks.forEach((brick) => {
    const colorIndex = Math.max(0, Math.min(BRICK_COLORS.length - 1, brick.maxHp + (brick.y / 100) % 3));
    const color = BRICK_COLORS[Math.floor(colorIndex)];

    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = brick.hp / brick.maxHp;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    ctx.restore();
  });
}

function render() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawBackgroundGrid();
  drawBricks();
  drawPaddle();
  drawBall();
}

function gameLoop() {
  if (game.state === "playing") {
    updatePaddle();
    updateBall();
    handleBallCollisions();
  }

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

function playTone(frequency, duration, type, volume = 0.05, delay = 0) {
  if (!audioContext) {
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const startTime = audioContext.currentTime + delay;
  const endTime = startTime + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(endTime);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = true;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    keys.right = false;
  }
});

startBtn.addEventListener("click", () => {
  ensureAudioContext();
  startNewGame();
  playTone(620, 0.08, "triangle", 0.05);
});

retryBtn.addEventListener("click", () => {
  ensureAudioContext();
  retryCurrentLevel();
  playTone(520, 0.08, "triangle", 0.05);
});

restartBtn.addEventListener("click", () => {
  ensureAudioContext();
  startNewGame();
  playTone(620, 0.08, "triangle", 0.05);
});

function init() {
  resetPaddle();
  createBricksForLevel(1);
  resetBall(false);
  updateHud();
  showOnlyOverlay(menuScreen);
  gameLoop();
}

init();
