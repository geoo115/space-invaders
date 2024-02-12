const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;
const KEY_CODE_P = 80;
const KEY_CODE_R = 82;
const GAME_WIDTH = 100;
const GAME_HEIGHT = 100;
const CANNON_WIDTH = 7;
const CSHOT_COOLDOWN = 0.1;
let ALIENS_PER_ROW = 8;
const ALIEN_HORIZONAL_PADDING = 6;
const ALIEN_VERTICAL_PADDING = 6;
const ALIEN_VERTICAL_SPACING = 10;
const MAX_LEVEL = 5;

// Game state object
const GAME_STATE = {
  lastTime: Date.now(),
  leftPressed: false,
  rightPressed: false,
  spacePressed: false,
  cannonX: 0,
  cannonY: 0,
  cannonCooldown: 0,
  cShots: [],
  aliens: [],
  alienShots: [],
  score: 0,
  hiScore: 0,
  lives: 3,
  level: 1,
  totalSeconds: 0,
  timerInterval: null,
  isPaused: false,
  startTime: null,
  };

const rectsIntersect = (r1, r2) => {
  return !(r2.left > r1.right || 
    r2.right < r1.left ||
     r1.top > r2.bottom ||
      r2.bottom < r1.top);
} 

const setPosition = ($el, x, y) => {
  $el.style.left = `${x}%`;
  $el.style.bottom = `${y}%`;
}

const clamp = (v, min, max) => {
  if (v < min) {
    return min;
  } else if (v > max) {
    return max;
  } else {
    return v;
  }
}



const startTimer = () => {
  const currentTime = Date.now();
  if (!GAME_STATE.isPaused) {
    // Adjust the start time based on the total elapsed time and the time spent paused
    const elapsedPausedTime = GAME_STATE.isPaused ? currentTime - GAME_STATE.pauseStartTime : 0;
    GAME_STATE.startTime = currentTime - (GAME_STATE.totalSeconds * 1000) - elapsedPausedTime;
  }
  GAME_STATE.timerInterval = setInterval(() => {
    if (!GAME_STATE.isPaused) {
      // Calculate elapsed time in seconds, considering time spent paused
      const elapsedSeconds = Math.floor((Date.now() - GAME_STATE.startTime) / 1000);
      // Update totalSeconds, accounting for time spent paused
      GAME_STATE.totalSeconds = elapsedSeconds;
      // Update the timer display
      updateTimerDisplay();
    }
  }, 1000); // Update every second
};

const updateTimerDisplay = () => {
  const minutes = Math.floor(GAME_STATE.totalSeconds / 60).toString().padStart(2, '0'); // Format minutes with leading zero
  const seconds = (GAME_STATE.totalSeconds % 60).toString().padStart(2, '0'); // Format seconds with leading zero
  const timerSpan = document.getElementById('timerSpan');
  timerSpan.textContent = `${minutes}:${seconds}`; // Update timer display with formatted minutes and seconds
};

const createCannon = ($container) => {
  GAME_STATE.cannonX = GAME_WIDTH / 2; // 50% from the left of the square container
  GAME_STATE.cannonY = 4; // near the bottom of the square container
  const $cannon = document.createElement("img");
  $cannon.src = "images/cannon.png";
  $cannon.className = "cannon";
  $container.appendChild($cannon);
  setPosition($cannon, GAME_STATE.cannonX, GAME_STATE.cannonY);
}

const createAlien = ($container, x, y) => {
  const $element = document.createElement("img");
  $element.src = "images/lowAlien.png";
  $element.className = "lowAlien";
  $container.appendChild($element);
  const alien = {
    x,
    y,
    $element
  };
  GAME_STATE.aliens.push(alien);
  setPosition($element, x, y);
}

const createCShot = ($container, x, y) => {
  const $element = document.createElement("img");
  $element.src = "images/cannonShot.png";
  $element.className = "cannonShot";
  $container.appendChild($element);
  const cShot = { x, y, $element };
  GAME_STATE.cShots.push(cShot);
  setPosition($element, x, y);
  const audio = new Audio("sounds/fire1.wav");
  audio.play();
}

const createAlienShot = ($container, x, y) => {
  const $element = document.createElement("img");
  $element.src = "images/alienShot.png";
  $element.className = "alienShot";
  $container.appendChild($element);
  const alienShot = { x, y, $element };
  GAME_STATE.alienShots.push(alienShot);
  setPosition($element, x, y);
}

const destroyCShot = ($container, cShot) => {
  if ($container.contains(cShot.$element)) { // Check if the element is a child of the container
    $container.removeChild(cShot.$element);
    cShot.isDead = true;
  }
}

const destroyAlienShot = ($container, alienShot) => {
  if ($container.contains(alienShot.$element)) { // Check if the element is a child of the container
    $container.removeChild(alienShot.$element);
    alienShot.isDead = true;
  }
}

// Function to update the score display on the UI
const updateScoreDisplay = () => {
  const scoreSpan = document.getElementById('scoreSpan');
  scoreSpan.textContent = GAME_STATE.score;
}
// Function to update the level display on the UI
const updateLevelDisplay = () => {
  const levelSpan = document.getElementById('levelSpan');
  levelSpan.textContent = GAME_STATE.level; // Update level display with current level
}
const updateLivesDisplay = () => {
  const livesSpan = document.getElementById('livesSpan');
  livesSpan.textContent = GAME_STATE.lives;
}

const destroyAlien = ($container, alien) => {
  if ($container.contains(alien.$element)) { // Check if the element is a child of the container
    $container.removeChild(alien.$element);
    alien.isDead = true;
    GAME_STATE.score += 30; // Increment the score by 20 when an alien is destroyed
    updateScoreDisplay(); // Update the score display
  }
}

const updateCannon = (dt, $container) => {
  if (GAME_STATE.leftPressed) {
    GAME_STATE.cannonX -= 1;
  }
  if (GAME_STATE.rightPressed) {
    GAME_STATE.cannonX += 1;
  }

  GAME_STATE.cannonX = clamp(GAME_STATE.cannonX, CANNON_WIDTH, GAME_WIDTH - CANNON_WIDTH);

  if (GAME_STATE.spacePressed && GAME_STATE.cannonCooldown <= 0) {
    createCShot($container, GAME_STATE.cannonX, GAME_STATE.cannonY);
    GAME_STATE.cannonCooldown = CSHOT_COOLDOWN;
  }
  if (GAME_STATE.cannonCooldown > 0) {
    GAME_STATE.cannonCooldown -= dt;
  }

  const $cannon = document.querySelector(".cannon");
  setPosition($cannon, GAME_STATE.cannonX, GAME_STATE.cannonY);
}

const updateCShots = (dt, $container) => {
  const cShots = GAME_STATE.cShots;
  for (let i = 0; i < cShots.length; i++) {
    const cShot = cShots[i];
    cShot.y += 1;
    if (cShot.y > 100) {
      destroyCShot($container, cShot);
    }
    setPosition(cShot.$element, cShot.x, cShot.y);
    const r1 = cShot.$element.getBoundingClientRect();
    const aliens = GAME_STATE.aliens;
    for (let j = 0; j < aliens.length; j++) {
      const alien = aliens[j];
      if (alien.isDead) continue;
      const r2 = alien.$element.getBoundingClientRect();
      if (rectsIntersect(r1, r2)) {
        // Alien was hit
        destroyAlien($container, alien);
        destroyCShot($container, cShot);
        const audio = new Audio("sounds/hit.wav");
        audio.play();
        break;
      }
    }
  }
  GAME_STATE.cShots = GAME_STATE.cShots.filter(e => !e.isDead);
}

const updateAliens = (dt, $container) => {
  const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 4; // Calculate horizontal movement
  const dy = Math.cos(GAME_STATE.lastTime / 1000.0) * 6; // Calculate vertical movement

  const aliens = GAME_STATE.aliens;
  for (let i = 0; i < aliens.length; i++) {
    const alien = aliens[i];
    const x = alien.x + dx; // Update x-coordinate instead of y-coordinate
    const y = alien.y + dy;
    setPosition(alien.$element, x, y);
  }
  GAME_STATE.aliens = GAME_STATE.aliens.filter(e => !e.isDead);

  goToNextLevel(); // Call goToNextLevel function here
}

// Define a new state variable to track level transition
let isTransitioningLevel = false;

// Update the goToNextLevel function to handle level transition synchronization
const goToNextLevel = () => {
  if (!isTransitioningLevel && GAME_STATE.aliens.length === 0) { // Check if there are no aliens left and not already transitioning
    isTransitioningLevel = true; // Set transitioning flag to true
    ALIENS_PER_ROW++; // Increase the number of aliens per row for the next level
    GAME_STATE.level++; // Increment the level
    const $container = document.querySelector('.square');
    $container.innerHTML = ''; // Clear container
    setTimeout(() => { // Introduce a delay to synchronize with game loop
      init(); // Reinitialize the game after a short delay
      isTransitioningLevel = false; // Reset transitioning flag
    }, 1000); // Adjust delay as needed (1 second in this case)
  }
}

const getOverlappingBullet = () => {
  const r1 = document.querySelector(".cannon").getBoundingClientRect();
  for (let i = 0; i < GAME_STATE.alienShots.length; i++) {
    const alienShot = GAME_STATE.alienShots[i];
    const r2 = alienShot.$element.getBoundingClientRect();
    if (rectsIntersect(r1, r2)) {
      return alienShot; // Return the overlapping alien shot
    }
  }
  return null; // Return null if no overlapping alien shot is found
}

const updateAlienShots = (dt, $container) => {
  if (!GAME_STATE.isPaused && !GAME_STATE.isCannonHit) { // Check if the game is not paused and the cannon is not hit
    const alienShots = GAME_STATE.alienShots;
    for (let i = 0; i < alienShots.length; i++) {
      const alienShot = alienShots[i];
      alienShot.y -= 1;
      if (alienShot.y < 0) {
        destroyAlienShot($container, alienShot);
      }
      setPosition(alienShot.$element, alienShot.x, alienShot.y);
    }
    const overlappingBullet = getOverlappingBullet(); // Get overlapping alien shot
    if (overlappingBullet) {
      // Cannon was hit
      GAME_STATE.lives--; // Decrease the number of lives
      updateLivesDisplay(); // Update the lives display
      destroyAlienShot($container, overlappingBullet);

      // Change the cannon image to cannonExplode1.png
      const cannon = document.querySelector('.cannon');
      cannon.src = 'images/cannonExplode1.png';

      // Pause the game for one second
      GAME_STATE.isCannonHit = true;
      const audio = new Audio("sounds/explode.wav");
        audio.play();
      setTimeout(() => {
        GAME_STATE.cannonX = GAME_WIDTH / 2;
        cannon.src = 'images/cannon.png'; // Change the cannon image back to cannon.png
        GAME_STATE.isCannonHit = false;
      }, 1000);

      if (GAME_STATE.lives === 0) {
        endGame(); // End the game if no lives remaining
        return; // Stop further processing if the game is over
      }
    }
    GAME_STATE.alienShots = GAME_STATE.alienShots.filter(e => !e.isDead);
  }
}

const createAlienShotInterval = () => {
  setInterval(() => {
    if (!GAME_STATE.isPaused && !GAME_STATE.isCannonHit) { // Check if the game is not paused and the cannon is not hit
      const randomAlienIndex = Math.floor(Math.random() * GAME_STATE.aliens.length);
      const randomAlien = GAME_STATE.aliens[randomAlienIndex];
      if (randomAlien && !randomAlien.isDead) {
        const x = randomAlien.x;
        const y = randomAlien.y;
        createAlienShot(document.querySelector(".square"), x, y);
      }
    }
  }, 1500); // Adjust the interval as needed
}

let animationFrameId;
// Function to end the game
const endGame = () => {
  GAME_STATE.isPaused = true;
  // Stop the game loop
  cancelAnimationFrame(animationFrameId);
  // Stop the timer
  clearInterval(GAME_STATE.timerInterval);

  // Create a modal overlay
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  // Create the "Game Over" message
  const gameOverMessage = document.createElement("div");
  gameOverMessage.textContent = "GAME OVER";
  gameOverMessage.className = "game-over-message";

  // Append the message to the modal overlay
  modalOverlay.appendChild(gameOverMessage);

  // Append the modal overlay to the body
  document.body.appendChild(modalOverlay);
}

const update = () => {
  if (!GAME_STATE.isPaused) {
    const currentTime = Date.now();
    const dt = (currentTime - GAME_STATE.lastTime) / 1000;

    // Update totalSeconds
    GAME_STATE.totalSeconds += dt;

    const $container = document.querySelector(".square");
    updateCannon(dt, $container);
    updateCShots(dt, $container);
    updateAlienShots(dt, $container);
    updateAliens(dt, $container);

    GAME_STATE.lastTime = currentTime;
  }

  // Adjust the game loop to use requestAnimationFrame only when the game is not paused
  if (!GAME_STATE.isPaused) {
    window.requestAnimationFrame(update);
  }
}

// Function to initialize the game
const init = () => {
  const $container = document.querySelector(".square");
  createCannon($container); // Create cannon

  const numRows = GAME_STATE.level + 2; // Calculate number of rows based on current level
  const alienSpacing = (GAME_WIDTH - ALIEN_HORIZONAL_PADDING * 2) / (ALIENS_PER_ROW - 1);
  for (let j = 0; j < numRows; j++) {
    const y = 100 - ALIEN_VERTICAL_PADDING - j * ALIEN_VERTICAL_SPACING;
    for (let i = 0; i < ALIENS_PER_ROW; i++) {
      const x = i * alienSpacing + ALIEN_HORIZONAL_PADDING;
      createAlien($container, x, y); // Create aliens
    }
  }

  createAlienShotInterval(); // Create alien shot interval
  startTimer(); // Start timer

  updateLivesDisplay(); // Update lives display
  updateLevelDisplay(); // Update level display

  window.requestAnimationFrame(update); // Start game loop
};

// Event listener for the restart button
document.getElementById('restart-btn').addEventListener('click', () => {
  location.reload();
});

// Event listener for the pause button
document.getElementById('pause-btn').addEventListener('click', () => {
togglePause();
  
});
// Function to toggle pause/resume
const togglePause = () => {
  const pauseBtn = document.getElementById('pause-btn');
  if (GAME_STATE.isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

// Function to pause the game
const pauseGame = () => {
  if (!GAME_STATE.isPaused) {
    GAME_STATE.isPaused = true;
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.textContent = "Resume"; // Change button text to "Resume" when paused
    clearInterval(GAME_STATE.timerInterval); // Pause the timer
    cancelAnimationFrame(animationFrameId); // Pause the game loop
  }
}

// Function to resume the game
const resumeGame = () => {
  if (GAME_STATE.isPaused) {
    GAME_STATE.isPaused = false;
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.textContent = "Pause"; // Change button text to "Pause" when resumed
    startTimer(); // Resume the timer
    window.requestAnimationFrame(update); // Resume the game loop
  }
}

const onKeyDown = (e) => {
  console.log(`Key pressed: ${e.keyCode}`);
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = true;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = true;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = true;
  } else if (e.keyCode === KEY_CODE_P) {
    togglePause(); // Toggle pause/resume when 'P' key is pressed
  } else if (e.keyCode === KEY_CODE_R) {
    location.reload(); // Restart the game when 'R' key is pressed
  }
}

const onKeyUp = (e) => {
  console.log(`Key pressed: ${e.keyCode}`);
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = false;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = false;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = false;
  }
}

// Event listeners for keyboard controls
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

// Initialize the game
init();
