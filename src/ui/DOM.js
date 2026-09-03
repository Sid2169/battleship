import { applyShipBackground } from './ships.js';

export function renderBoard(container, board, { enemy = false, revealed = false } = {}) {
  container.innerHTML = '';
  container.replaceChildren();

  for (let r = 0; r < board.size; r += 1) {
    for (let c = 0; c < board.size; c += 1) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (enemy) cell.classList.add('enemy');

      const state = getCellState(board, r, c);
      applyCellState(cell, state, { enemy, revealed });

      // render the fleet sprite underneath hit/miss markers
      if (!enemy || revealed) renderShipOnCell(cell, board, r, c);

      container.appendChild(cell);
    }
  }
}

function renderShipOnCell(cell, board, row, col) {
  const entry = board.grid[row][col];
  if (!entry) return;
  const { ship, index } = entry;
  applyShipBackground(cell, ship.name, index, ship.length, ship.isVertical);
}

export function getCellState(board, row, col) {
  const shot = board.shots.has(`${row},${col}`);
  const occupied = board.grid[row][col] !== null;
  if (shot && occupied) return 'hit';
  if (shot && !occupied) return 'miss';
  return occupied ? 'ship' : 'empty';
}

export function applyCellState(cell, state, { enemy, revealed } = {}) {
  cell.classList.remove('ship', 'hit', 'miss', 'attacked');
  if (state === 'hit') {
    cell.classList.add('hit', 'attacked');
  } else if (state === 'miss') {
    cell.classList.add('miss', 'attacked');
  } else if (state === 'ship' && (!enemy || revealed)) {
    cell.classList.add('ship');
  }
}
