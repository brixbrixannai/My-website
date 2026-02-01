/**
 * Drop by Drop - Clean Water Game for charity: water
 * Two game modes: Puzzle (connect chains) and Catch (collect drops)
 * Features: Sound effects for drop catches and game over
 */

// ==================== AUDIO SYSTEM ====================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine', volume = 0.3) {
  try {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.log('Audio context not available');
  }
}

function playCatchSound() {
  // Happy catch: ascending notes C5 -> E5 -> G5
  playSound(523.25, 0.1, 'sine', 0.2);
  setTimeout(() => playSound(659.25, 0.1, 'sine', 0.2), 50);
  setTimeout(() => playSound(783.99, 0.15, 'sine', 0.2), 100);
}

function playGameOverSound() {
  // Sad game over: descending notes C5 -> A4 -> F4
  playSound(523.25, 0.2, 'sine', 0.3);
  setTimeout(() => playSound(440, 0.2, 'sine', 0.3), 150);
  setTimeout(() => playSound(349.23, 0.3, 'sine', 0.3), 300);
}

function playWinSound() {
  // Victory: triumphant notes
  playSound(523.25, 0.15, 'sine', 0.25);
  setTimeout(() => playSound(523.25, 0.15, 'sine', 0.25), 120);
  setTimeout(() => playSound(783.99, 0.3, 'sine', 0.25), 240);
}

// ==================== GAME STATE ====================
let gameState = {
  currentMode: null,
  puzzle: {
    tiles: [],
    playerSequence: [],
    usedTileIndices: [],
    score: 0,
    chainsCompleted: 0,
    maxChains: 3,
    combo: 0,
    gameActive: true
  },
  catch: {
    score: 0,
    missed: 0,
    timeRemaining: 30,
    gameActive: false,
    drops: [],
    bucketX: 0
  }
};

// ==================== MODE SELECTION ====================
function selectMode(mode) {
  gameState.currentMode = mode;
  document.getElementById('modeSelector').style.display = 'none';

  if (mode === 'puzzle') {
    initPuzzleGame();
    document.getElementById('puzzleWrapper').style.display = 'block';
  } else if (mode === 'catch') {
    initCatchGame();
    document.getElementById('catchWrapper').style.display = 'block';
  }
}

function backToMenu() {
  gameState.currentMode = null;
  document.getElementById('modeSelector').style.display = 'grid';
  document.getElementById('puzzleWrapper').style.display = 'none';
  document.getElementById('catchWrapper').style.display = 'none';

  if (gameState.catch.gameActive) {
    stopCatchGame();
  }

  resetPuzzleState();
}

// ==================== PUZZLE GAME ====================
function initPuzzleGame() {
  gameState.puzzle = {
    tiles: [],
    playerSequence: [],
    usedTileIndices: [],
    score: 0,
    chainsCompleted: 0,
    maxChains: 3,
    combo: 0,
    gameActive: true
  };

  createTiles();
  updatePuzzleDisplay();
}

function createTiles() {
  const gameBoard = document.getElementById('gameBoard');
  gameBoard.innerHTML = '';
  gameState.puzzle.tiles = [];

  const tileTypes = [
    { special: 'source', label: 'Source' },
    { special: 'filter', label: 'Filter' },
    { special: 'tap', label: 'Tap' },
    { special: null, label: 'Empty' },
    { special: 'source', label: 'Source' },
    { special: 'filter', label: 'Filter' },
    { special: 'tap', label: 'Tap' },
    { special: null, label: 'Empty' },
    { special: null, label: 'Empty' },
    { special: 'source', label: 'Source' },
    { special: 'filter', label: 'Filter' },
    { special: 'tap', label: 'Tap' },
    { special: null, label: 'Empty' },
    { special: null, label: 'Empty' },
    { special: null, label: 'Empty' },
    { special: null, label: 'Empty' },
  ];

  const shuffled = shuffleArray([...tileTypes]);

  shuffled.forEach((tileData, index) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.index = index;
    tile.dataset.special = tileData.special || '';

    const content = createTileContent(tileData);
    tile.appendChild(content);

    tile.addEventListener('click', () => handleTileClick(tile, tileData));
    gameBoard.appendChild(tile);

    gameState.puzzle.tiles.push({
      element: tile,
      data: tileData
    });
  });
}

function createTileContent(tileData) {
  const div = document.createElement('div');
  div.className = 'tile-content';

  if (tileData.special === 'source') {
    const img = document.createElement('img');
    img.src = 'assets/jerry_can_yellow.png';
    img.className = 'icon';
    img.alt = 'Water source';
    div.appendChild(img);
  } else if (tileData.special === 'filter') {
    const filterLabel = document.createElement('span');
    filterLabel.className = 'filter-label';
    filterLabel.textContent = 'FILTER';
    div.appendChild(filterLabel);
  } else if (tileData.special === 'tap') {
    const img = document.createElement('img');
    img.src = 'assets/jerry_can_black.png';
    img.className = 'icon';
    img.alt = 'Clean water tap';
    div.appendChild(img);
  }

  const label = document.createElement('span');
  label.className = 'tile-label';
  label.textContent = tileData.label;
  div.appendChild(label);

  return div;
}

function handleTileClick(tile, tileData) {
  if (!gameState.puzzle.gameActive) return;
  if (tile.style.display === 'none') return; // Prevent clicking disappeared tiles

  const typeMap = { 'source': 0, 'filter': 1, 'tap': 2 };
  const typeValue = typeMap[tileData.special];

  if (typeValue === undefined) return; // Skip empty tiles

  // Check if this matches the expected next step in sequence
  const expectedSequence = [0, 1, 2]; // source, filter, tap
  const expectedStep = gameState.puzzle.playerSequence.length;
  
  if (expectedStep >= 3) return; // Already have 3, shouldn't click
  
  if (typeValue !== expectedSequence[expectedStep]) {
    // Wrong sequence - reset and allow retry
    gameState.puzzle.playerSequence = [];
    gameState.puzzle.combo = 0;
    updatePuzzleDisplay();
    return;
  }

  // Valid click - add to sequence
  const tileIndex = gameState.puzzle.tiles.findIndex(t => t.element === tile);
  gameState.puzzle.playerSequence.push(typeValue);
  gameState.puzzle.usedTileIndices.push(tileIndex);
  tile.classList.add('disappearing');
  
  // Make tile disappear with animation
  setTimeout(() => {
    tile.style.display = 'none';
  }, 300);

  // Check if we completed a chain
  if (gameState.puzzle.playerSequence.length === 3) {
    completePuzzleChain();
  }
}

function completePuzzleChain() {
  const chainPoints = 100 * (gameState.puzzle.combo + 1);
  gameState.puzzle.score += chainPoints;
  gameState.puzzle.combo++;
  gameState.puzzle.chainsCompleted++;

  // Play success sound
  playCatchSound();

  updatePuzzleDisplay();

  setTimeout(() => {
    if (gameState.puzzle.chainsCompleted >= gameState.puzzle.maxChains) {
      winPuzzleGame();
    } else {
      // Ready for next chain - reset sequence but keep disappearing tiles gone
      gameState.puzzle.playerSequence = [];
      updatePuzzleDisplay();
    }
  }, 500);
}

function winPuzzleGame() {
  gameState.puzzle.gameActive = false;
  const finalScore = gameState.puzzle.score;

  // Play victory sound
  playWinSound();

  setTimeout(() => {
    alert(
      `🎉 YOU WIN! 🎉\n\n` +
      `Final Score: ${finalScore}\n` +
      `Chains: ${gameState.puzzle.chainsCompleted}/3\n` +
      `Best Combo: ${gameState.puzzle.combo}x\n\n` +
      `Clean water delivered! 💧\n` +
      `771 million people still need access.\n` +
      `Learn more at charitywater.org`
    );
    resetPuzzle();
  }, 300);
}

function resetPuzzleSequence() {
  gameState.puzzle.playerSequence = [];
  gameState.puzzle.combo = 0;
  // Only show tiles that haven't been permanently used
  gameState.puzzle.tiles.forEach((t, index) => {
    if (!gameState.puzzle.usedTileIndices.includes(index)) {
      t.element.classList.remove('active', 'disappearing');
      t.element.style.display = 'flex'; // Reset display
    }
  });
  updatePuzzleDisplay();
}

function resetPuzzle() {
  resetPuzzleState();
  initPuzzleGame();
}

function resetPuzzleState() {
  gameState.puzzle = {
    tiles: [],
    playerSequence: [],
    usedTileIndices: [],
    score: 0,
    chainsCompleted: 0,
    maxChains: 3,
    combo: 0,
    gameActive: true
  };
}

function updatePuzzleDisplay() {
  document.getElementById('puzzleScore').textContent = gameState.puzzle.score;
  document.getElementById('puzzleChains').textContent = `${gameState.puzzle.chainsCompleted}/3`;
  document.getElementById('puzzleCombo').textContent = gameState.puzzle.combo > 0 ? `${gameState.puzzle.combo}x` : '0x';
}

// ==================== CATCH GAME ====================
function initCatchGame() {
  gameState.catch = {
    score: 0,
    missed: 0,
    timeRemaining: 30,
    gameActive: true,
    drops: [],
    bucketX: 180
  };

  const catchGame = document.getElementById('catchGame');
  const bucket = document.getElementById('bucket');
  catchGame.addEventListener('mousemove', (e) => moveBucketMouse(e, bucket));
  catchGame.addEventListener('touchmove', (e) => moveBucketTouch(e, bucket));

  startCatchGame(bucket);
}

function moveBucketMouse(e, bucket) {
  const rect = e.currentTarget.getBoundingClientRect();
  let newX = e.clientX - rect.left - 30;
  newX = Math.max(0, Math.min(newX, rect.width - 60));
  gameState.catch.bucketX = newX;
  bucket.style.left = newX + 'px';
}

function moveBucketTouch(e, bucket) {
  const rect = e.currentTarget.getBoundingClientRect();
  const touch = e.touches[0];
  let newX = touch.clientX - rect.left - 30;
  newX = Math.max(0, Math.min(newX, rect.width - 60));
  gameState.catch.bucketX = newX;
  bucket.style.left = newX + 'px';
}

function startCatchGame(bucket) {
  const catchGame = document.getElementById('catchGame');
  bucket.style.left = gameState.catch.bucketX + 'px';

  const dropInterval = setInterval(() => {
    if (!gameState.catch.gameActive) {
      clearInterval(dropInterval);
      return;
    }
    spawnDrop(catchGame);
  }, 400);

  const timerInterval = setInterval(() => {
    gameState.catch.timeRemaining--;
    document.getElementById('catchTimer').textContent = gameState.catch.timeRemaining;

    if (gameState.catch.timeRemaining <= 0) {
      clearInterval(timerInterval);
      stopCatchGame();
      endCatchGame();
    }
  }, 1000);

  gameState.catch.gameActive = true;
}

function spawnDrop(catchGame) {
  const drop = document.createElement('div');
  drop.className = 'catch-drop';
  drop.textContent = '💧';

  const randomX = Math.random() * (catchGame.offsetWidth - 20);
  drop.style.left = randomX + 'px';
  drop.style.top = '0px';

  const duration = 2 + Math.random() * 1.5; // Slightly faster, 2-3.5 seconds
  drop.style.animationDuration = duration + 's';

  catchGame.appendChild(drop);

  const dropId = Date.now() + Math.random();
  gameState.catch.drops.push({ id: dropId, x: randomX, element: drop });

  setTimeout(() => {
    // Better collision detection - bucket is 60px wide, drop is ~20px wide
    const bucketLeft = gameState.catch.bucketX;
    const bucketRight = bucketLeft + 60;
    const dropLeft = randomX;
    const dropRight = randomX + 20;

    // Check if drop overlaps with bucket
    if (dropRight >= bucketLeft && dropLeft <= bucketRight) {
      gameState.catch.score++;
      // PLAY CATCH SOUND
      playCatchSound();
      drop.remove();
    } else {
      if (drop.parentElement) {
        gameState.catch.missed++;
        drop.remove();
      }
    }

    updateCatchDisplay();
  }, duration * 1000);
}

function updateCatchDisplay() {
  document.getElementById('catchScore').textContent = gameState.catch.score;
  document.getElementById('catchMissed').textContent = gameState.catch.missed;
}

function stopCatchGame() {
  gameState.catch.gameActive = false;
}

function endCatchGame() {
  const accuracy = gameState.catch.score + gameState.catch.missed > 0
    ? Math.round((gameState.catch.score / (gameState.catch.score + gameState.catch.missed)) * 100)
    : 0;

  // PLAY GAME OVER SOUND
  playGameOverSound();

  setTimeout(() => {
    alert(
      `Game Over!\n\n` +
      `Caught: ${gameState.catch.score}\n` +
      `Missed: ${gameState.catch.missed}\n` +
      `Accuracy: ${accuracy}%\n\n` +
      `Every drop of clean water matters! 💧`
    );
    backToMenu();
  }, 500);
}

// ==================== UTILITIES ====================
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Drop by Drop game initialized');
});

