import './styles.css';
import { Game } from './core/Game.js';
import { renderBoard } from './ui/DOM.js';

const humanBoardEl = document.getElementById('human-board');
const computerBoardEl = document.getElementById('computer-board');
const turnIndicator = document.getElementById('turn-indicator');
const restartBtn = document.getElementById('restart-btn');
const modal = document.getElementById('game-over-modal');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const modalRestartBtn = document.getElementById('modal-restart-btn');

let game;

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

function showModal(title, message) {
  resultTitle.textContent = title;
  resultMessage.textContent = message;
  modal.classList.remove('hidden');
}

function handleComputerTurn() {
  if (game.isOver()) {
    endGame();
    return;
  }
  turnIndicator.textContent = 'Enemy is firing...';
  setTimeout(() => {
    game.computerAttack();
    refreshBoards();
    if (game.isOver()) {
      endGame();
    } else {
      updateTurnIndicator();
    }
  }, 400);
}

function handleCellClick(event) {
  if (game.isOver() || game.currentPlayer !== 'human') return;
  if (event.target.classList.contains('enemy') === false) return;

  const row = Number(event.target.dataset.row);
  const col = Number(event.target.dataset.col);
  if (game.computerBoard.shots.has(`${row},${col}`)) return;

  game.humanAttack(row, col);
  refreshBoards();

  if (game.isOver()) {
    endGame();
  } else {
    handleComputerTurn();
  }
}

function endGame() {
  if (game.winner === 'human') {
    showModal('Victory!', 'You sank the entire enemy fleet.');
  } else if (game.winner === 'computer') {
    showModal('Defeat', 'The enemy sank your fleet.');
  } else {
    showModal('Game Over', 'The battle has ended.');
  }
}

function startNewGame() {
  game = new Game();
  game.placeHumanFleet();
  game.placeComputerFleet();
  modal.classList.add('hidden');
  refreshBoards();
  updateTurnIndicator();
}

computerBoardEl.addEventListener('click', handleCellClick);
restartBtn.addEventListener('click', startNewGame);
modalRestartBtn.addEventListener('click', startNewGame);

startNewGame();
