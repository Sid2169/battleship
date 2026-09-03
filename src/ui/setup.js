import { Game, FLEET } from '../core/Game.js';
import { Ship } from '../core/Ship.js';
import { renderBoard } from './DOM.js';
import { SHIP_SPRITES } from './ships.js';

const CELL = 34;
const GAP = 2;
const FRAME = CELL + GAP;

/**
 * Manages the board setup screen: rendering the palette and board,
 * allowing ships to be dragged or clicked-and-clicked onto the board,
 * rotated, picked back up, randomized, or cleared.
 */
export function initSetupScreen({ startEl, onStart }) {
  const game = new Game();
  const boardEl = document.getElementById('setup-board');
  const paletteEl = document.getElementById('setup-palette');
  const rotateBtn = document.getElementById('rotate-btn');
  const randomBtn = document.getElementById('random-btn');
  const resetBtn = document.getElementById('reset-btn');
  const statusEl = document.getElementById('setup-status');
  const [startBtn] = [startEl];

  // The ship being placed (from the palette or a picked-up ship).
  // null when nothing is being placed.
  let active = null;
  let previewCells = [];

  function cellKey(r, c) { return `${r},${c}`; }

  function occupiedSet() {
    const set = new Set();
    for (let r = 0; r < game.size; r += 1) {
      for (let c = 0; c < game.size; c += 1) {
        if (game.humanBoard.grid[r][c]) set.add(cellKey(r, c));
      }
    }
    return set;
  }

  function isPlacementValid(length, row, col, isVertical) {
    const occ = occupiedSet();
    for (let i = 0; i < length; i += 1) {
      const r = isVertical ? row + i : row;
      const c = isVertical ? col : col + i;
      if (r < 0 || r >= game.size || c < 0 || c >= game.size) return false;
      if (occ.has(cellKey(r, c))) return false;
    }
    return true;
  }

  function shipCells(length, row, col, isVertical) {
    const cells = [];
    for (let i = 0; i < length; i += 1) {
      cells.push(isVertical ? [row + i, col] : [row, col + i]);
    }
    return cells;
  }

  function unplacedFleet() {
    const placed = new Set(game.humanBoard.ships.map((s) => s.name));
    return FLEET.filter((f) => !placed.has(f.name));
  }

  function renderPalette() {
    paletteEl.replaceChildren();
    const remaining = unplacedFleet();
    if (remaining.length === 0) {
      const done = document.createElement('div');
      done.className = 'palette-done';
      done.textContent = 'All ships placed!';
      paletteEl.appendChild(done);
      return;
    }
    remaining.forEach(({ name, length }) => {
      const item = document.createElement('div');
      item.className = 'palette-ship';
      item.draggable = true;
      item.dataset.name = name;
      item.innerHTML = `
        <span class="palette-ship-label">${name}</span>
        <span class="palette-ship-art" style="
          display:block; width:${length * FRAME - GAP}px; height:${FRAME - 2}px;
          background-image:url('${SHIP_SPRITES[name]}');
          background-size:${length * FRAME - GAP}px ${FRAME - 2}px;
          background-repeat:no-repeat;">
        </span>`;
      paletteEl.appendChild(item);
    });
  }

  function clearPreview() {
    previewCells.forEach(([r, c]) => {
      const cell = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (cell) cell.classList.remove('setup-valid', 'setup-invalid');
    });
    previewCells = [];
  }

  function updatePreview(row, col) {
    clearPreview();
    if (!active) return;
    const cells = shipCells(active.length, row, col, active.isVertical);
    const valid = isPlacementValid(active.length, row, col, active.isVertical);
    previewCells = cells.filter(([r, c]) =>
      r >= 0 && r < game.size && c >= 0 && c < game.size
    );
    previewCells.forEach(([r, c]) => {
      const cell = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (cell) cell.classList.add(valid ? 'setup-valid' : 'setup-invalid');
    });
  }

  function renderSetupBoard() {
    renderBoard(boardEl, game.humanBoard, { revealed: true });
  }

  function refresh() {
    renderSetupBoard();
    renderPalette();
    updateStatus();
  }

  function updateStatus() {
    const remaining = unplacedFleet();
    statusEl.textContent =
      remaining.length === 0
        ? 'Fleet ready!'
        : `Place ${remaining.length} more ship${remaining.length > 1 ? 's' : ''} to begin.`;
    startBtn.disabled = remaining.length !== 0;
  }

  // ── placement ────────────────────────────────────────────────
  function attemptPlace(row, col) {
    if (!active) return false;
    if (!isPlacementValid(active.length, row, col, active.isVertical)) return false;
    game.humanBoard.placeShip(active, row, col, active.isVertical);
    active = null;
    clearPreview();
    refresh();
    return true;
  }

  function removeShipAt(row, col) {
    const entry = game.humanBoard.grid[row][col];
    if (!entry) return;
    const ship = entry.ship;
    // find all cells belonging to this ship by reference
    const cells = [];
    for (let r = 0; r < game.size; r += 1) {
      for (let c = 0; c < game.size; c += 1) {
        const cell = game.humanBoard.grid[r][c];
        if (cell && cell.ship === ship) {
          game.humanBoard.grid[r][c] = null;
          cells.push([r, c]);
        }
      }
    }
    ship._cells = cells;
    game.humanBoard.ships = game.humanBoard.ships.filter((s) => s !== ship);
    active = ship;
    refresh();
  }

  // ── palette interactions ─────────────────────────────────────
  function armShipFromPalette(name) {
    const spec = FLEET.find((f) => f.name === name);
    if (!spec) return;
    active = new Ship(spec.length, spec.name);
    active.isVertical = false;
  }

  function handlePaletteClick(e) {
    const item = e.target.closest('.palette-ship');
    if (!item) return;
    armShipFromPalette(item.dataset.name);
    boardEl.classList.add('placing');
    updateStatusMessage(`Placing ${active.name}. Click a cell or drag onto the board.`);
  }

  // cache for dragstart (drag doesn't carry pointer coords nicely)
  let draggingFromRight = false;

  function handlePaletteDragStart(e) {
    const item = e.target.closest('.palette-ship');
    if (!item) return;
    armShipFromPalette(item.dataset.name);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', item.dataset.name);
    draggingFromRight = false;
  }

  // ── board interactions ───────────────────────────────────────
  function findCell(event) {
    const cell = event.target.closest('.cell');
    if (!cell) return null;
    return {
      row: Number(cell.dataset.row),
      col: Number(cell.dataset.col),
    };
  }

  function handleBoardClick(e) {
    const pos = findCell(e);
    if (!pos) return;
    attemptPlace(pos.row, pos.col);
  }

  function handleBoardMove(e) {
    if (!active) return;
    const pos = findCell(e);
    if (!pos) { clearPreview(); return; }
    updatePreview(pos.row, pos.col);
  }

  function handleBoardLeave() {
    clearPreview();
  }

  function handleDragOver(e) {
    if (!active) return; // require names encoded via setData
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const pos = findCell(e);
    if (pos) updatePreview(pos.row, pos.col);
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!active) return;
    const pos = findCell(e);
    if (pos) attemptPlace(pos.row, pos.col);
  }

  function handleContextMenu(e) {
    const pos = findCell(e);
    if (pos) {
      e.preventDefault();
      removeShipAt(pos.row, pos.col);
    }
  }

  // ── rotate ───────────────────────────────────────────────────
  function rotateActive() {
    if (!active) return;
    active.isVertical = !active.isVertical;
    const msg = active.isVertical ? 'vertical' : 'horizontal';
    updateStatusMessage(`${active.name} oriented ${msg}.`);
    // keep preview visible for current hover
    const hover = boardEl.querySelector('.cell:hover');
    if (hover) {
      updatePreview(Number(hover.dataset.row), Number(hover.dataset.col));
    }
  }

  function updateStatusMessage(msg) {
    statusEl.textContent = msg;
    // don't override the fleet-ready status if nothing active
    if (!active) updateStatus();
  }

  function randomize() {
    clearPreview();
    const fresh = new Game();
    fresh.placeHumanFleet(null);
    game.humanBoard = fresh.humanBoard;
    game.fleet = fresh.fleet;
    active = null;
    refresh();
  }

  // ── reset ────────────────────────────────────────────────────
  function resetBoard() {
    clearPreview();
    // replace with a fresh game so both boards start clean
    const fresh = new Game();
    game.humanBoard = fresh.humanBoard;
    game.computerBoard = fresh.computerBoard;
    game.fleet = fresh.fleet;
    game.currentPlayer = fresh.currentPlayer;
    game.winner = fresh.winner;
    active = null;
    refresh();
  }

  // ── wire up ──────────────────────────────────────────────────
  boardEl.addEventListener('click', handleBoardClick);
  boardEl.addEventListener('mousemove', handleBoardMove);
  boardEl.addEventListener('mouseleave', handleBoardLeave);
  boardEl.addEventListener('dragover', handleDragOver);
  boardEl.addEventListener('drop', handleDrop);
  boardEl.addEventListener('contextmenu', handleContextMenu);
  paletteEl.addEventListener('click', handlePaletteClick);
  paletteEl.addEventListener('dragstart', handlePaletteDragStart);
  rotateBtn.addEventListener('click', rotateActive);
  randomBtn.addEventListener('click', randomize);
  resetBtn.addEventListener('click', resetBoard);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') rotateActive();
  });

  startBtn.addEventListener('click', () => {
    onStart(game);
  });

  // render initial state
  refresh();

  return {
    reset() { resetBoard(); },
  };
}
