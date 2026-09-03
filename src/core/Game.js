import { Board } from './Board.js';
import { Ship } from './Ship.js';
import { ComputerAI } from './computerAI.js';

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
    this.ai = new ComputerAI(size);
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
    const move = this.ai.nextMove(this.humanBoard);
    const result = this.humanBoard.receiveAttack(move.row, move.col);
    this.ai.record(this.humanBoard, move.row, move.col, result);
    this.currentPlayer = 'human';
    this._checkWinner();
    return { ...move, result };
  }

  // Clear the computer's targeting memory before a new battle begins.
  resetAI() {
    this.ai.reset();
  }

  _checkWinner() {
    if (this.computerBoard.allShipsSunk()) this.winner = 'human';
    else if (this.humanBoard.allShipsSunk()) this.winner = 'computer';
  }

  isOver() {
    return this.winner !== null;
  }
}
