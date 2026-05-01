import { Ship } from './Ship.js';

export class Board {
  constructor(size = 10) {
    this.size = size;
    // Each cell: null | { ship, index }
    this.grid   = Array.from({ length: size }, () => Array(size).fill(null));
    this.shots  = new Set();  // "row,col" strings
    this.ships  = [];
  }

  placeShip(ship, row, col, isVertical) {
    const cells = this._getCells(ship.length, row, col, isVertical);
    if (!this._isPlacementValid(cells)) throw new Error('Invalid placement');
    cells.forEach(([r, c], i) => {
      this.grid[r][c] = { ship, index: i };
    });
    this.ships.push(ship);
  }

  receiveAttack(row, col) {
    const key = `${row},${col}`;
    if (this.shots.has(key)) throw new Error('Already attacked this cell');
    this.shots.add(key);
    const cell = this.grid[row][col];
    if (cell) { cell.ship.hit(cell.index); return 'hit'; }
    return 'miss';
  }

  allShipsSunk() { return this.ships.every(s => s.isSunk()); }

  _getCells(length, row, col, isVertical) {
    return Array.from({ length }, (_, i) =>
      isVertical ? [row + i, col] : [row, col + i]
    );
  }

  _isPlacementValid(cells) {
    return cells.every(([r, c]) =>
      r >= 0 && r < this.size &&
      c >= 0 && c < this.size &&
      this.grid[r][c] === null
    );
  }
}