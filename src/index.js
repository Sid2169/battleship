import './styles.css';
import { renderBoard } from './ui/DOM.js';
import { initSetupScreen } from './ui/setup.js';
import { audio } from './audio/audio.js';

// Screen elements
const screenHome   = document.getElementById('screen-home');
const screenSetup  = document.getElementById('screen-setup');
const screenGame   = document.getElementById('screen-game');
const playBtn      = document.getElementById('play-btn');

// Game-screen elements
const humanBoardEl    = document.getElementById('human-board');
const computerBoardEl = document.getElementById('computer-board');
const turnIndicator  = document.getElementById('turn-indicator');
const restartBtn     = document.getElementById('restart-btn');
const modal          = document.getElementById('game-over-modal');
const resultTitle    = document.getElementById('result-title');
const resultMessage  = document.getElementById('result-message');
const modalRestartBtn = document.getElementById('modal-restart-btn');

let game;
let setup = null;

// ── screen routing ──────────────────────────────────────────────
function showScreen(target) {
  [screenHome, screenSetup, screenGame].forEach(s => s.classList.add('hidden'));
  target.classList.remove('hidden');
}

function openSetup() {
  showScreen(screenSetup);
  if (!setup) {
    setup = initSetupScreen({ startEl: document.getElementById('start-game-btn'), onStart: startGameFromSetup });
  }
}

// ── board helpers ───────────────────────────────────────────────
function refreshBoards() {
  renderBoard(humanBoardEl, game.humanBoard, { enemy: false, revealed: true });
  renderBoard(computerBoardEl, game.computerBoard, { enemy: true, revealed: false });
}

function updateTurnIndicator() {
  if (game.isOver()) return;
  turnIndicator.textContent =
    game.currentPlayer === 'human'
      ? 'Your turn. Fire at the enemy waters!'
      : 'Enemy is firing...';
}

// ── modal ───────────────────────────────────────────────────────
function showModal(title, message) {
  resultTitle.textContent = title;
  resultMessage.textContent = message;
  modal.classList.remove('hidden');
}

// ── computer turn ───────────────────────────────────────────────
function handleComputerTurn() {
  if (game.isOver()) { endGame(); return; }
  turnIndicator.textContent = 'Enemy is firing...';
  setTimeout(() => {
    game.computerAttack();
    refreshBoards();
    if (game.isOver()) endGame();
    else updateTurnIndicator();
  }, 400);
}

// ── human attack ────────────────────────────────────────────────
function handleCellClick(event) {
  if (game.isOver() || game.currentPlayer !== 'human') return;
  if (!event.target.classList.contains('enemy')) return;
  const row = Number(event.target.dataset.row);
  const col = Number(event.target.dataset.col);
  if (game.computerBoard.shots.has(`${row},${col}`)) return;

  audio.playSfx('fire');
  const result = game.humanAttack(row, col);
  audio.playSfx(result === 'hit' ? 'hit' : 'miss');
  refreshBoards();

  if (game.isOver()) endGame();
  else handleComputerTurn();
}

// ── end of game ─────────────────────────────────────────────────
function endGame() {
  audio.stopMusic();
  if (game.winner === 'human') {
    showModal('Victory!', 'You sank the entire enemy fleet.');
  } else if (game.winner === 'computer') {
    showModal('Defeat', 'The enemy sank your fleet.');
  } else {
    showModal('Game Over', 'The battle has ended.');
  }
}

// ── start / restart ─────────────────────────────────────────────
function beginBattle() {
  game.placeComputerFleet();
  audio.playMusic('battle');
  modal.classList.add('hidden');
  refreshBoards();
  updateTurnIndicator();
}

function startGameFromSetup() {
  showScreen(screenGame);
  beginBattle();
}

// ── event wiring ────────────────────────────────────────────────
playBtn.addEventListener('click', openSetup);

computerBoardEl.addEventListener('click', handleCellClick);
restartBtn.addEventListener('click', () => {
  audio.stopMusic();
  showScreen(screenHome);
  audio.playMusic('menu');
});
// After a game ends, return to setup to arrange a fresh fleet
modalRestartBtn.addEventListener('click', () => {
  audio.stopMusic();
  if (setup) setup.reset();
  openSetup();
});

// ── boot ────────────────────────────────────────────────────────
showScreen(screenHome);
audio.playMusic('menu');

