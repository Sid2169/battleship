import { Board } from './Board.js';
import { Ship } from './Ship.js';

export const FLEET = [
  { name: 'Carrier', length: 5 },
  { name: 'Battleship', length: 4 },
  { name: 'Cruiser', length: 3 },
  { name: 'Submarine', length: 3 },
  { name: 'Destroyer', length: 2 },
];

export class Game {
  constructor(size = 10) {
    this.size = size;
    this.humanBoard = new Board(size);
    this.computerBoard = new Board(size);
    this.currentPlayer = 'human';
    this.winner = null;
    this.fleet = FLEET.map((s) => ({ ...s }));
  }

  get fleetLengths() {
    return this.fleet.map((s) => s.length);
  }

  placeHumanFleet(placements) {
    if (placements) {
      placements.forEach(({ ship, row, col, isVertical }) =>
        this.humanBoard.placeShip(ship, row, col, isVertical)
      );
    } else {
      this.placeRandomFleet(this.humanBoard);
    }
  }

  placeComputerFleet() {
    this.placeRandomFleet(this.computerBoard);
  }

  placeRandomFleet(board) {
    this.fleet.forEach(({ name, length }) => {
      this.placeShipRandomly(board, length, name);
    });
  }

  placeShipRandomly(board, length, name) {
    let placed = false;
    while (!placed) {
      const isVertical = Math.random() < 0.5;
      const maxIndex = this.size - length;
      const row = Math.floor(Math.random() * this.size);
      const col = Math.floor(Math.random() * this.size);
      try {
        board.placeShip(new Ship(length, name), row, col, isVertical);
        placed = true;
      } catch (e) {
        // retry with a different random placement
      }
    }
  }

  humanAttack(row, col) {
    if (this.isOver() || this.currentPlayer !== 'human') {
      throw new Error('Not the human turn or game is over');
    }
    const result = this.computerBoard.receiveAttack(row, col);
    this.currentPlayer = 'computer';
    this._checkWinner();
    return result;
  }

  computerAttack() {
    if (this.isOver() || this.currentPlayer !== 'computer') {
      throw new Error('Not the computer turn or game is over');
    }
    const move = this._pickComputerMove();
    const result = this.humanBoard.receiveAttack(move.row, move.col);
    this.currentPlayer = 'human';
    this._checkWinner();
    return { ...move, result };
  }

  _pickComputerMove() {
    const untried = [];
    for (let r = 0; r < this.size; r += 1) {
      for (let c = 0; c < this.size; c += 1) {
        if (!this.humanBoard.shots.has(`${r},${c}`)) untried.push([r, c]);
      }
    }
    const [row, col] = untried[Math.floor(Math.random() * untried.length)];
    return { row, col };
  }

  _checkWinner() {
    if (this.computerBoard.allShipsSunk()) this.winner = 'human';
    else if (this.humanBoard.allShipsSunk()) this.winner = 'computer';
  }

  isOver() {
    return this.winner !== null;
  }
}
