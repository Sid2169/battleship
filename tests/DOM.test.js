/**
 * @jest-environment jsdom
 */
import { renderBoard } from '../src/ui/DOM.js';
import { Board } from '../src/core/Board.js';
import { Ship } from '../src/core/Ship.js';

function buildBoard() {
  const board = new Board(10);
  board.placeShip(new Ship(3, 'Cruiser'), 2, 2, false);    // cols 2-4
  board.placeShip(new Ship(2, 'Destroyer'), 6, 6, true);   // rows 6-7, col 6
  return board;
}

function shipCellCount(container) {
  return container.querySelectorAll('.cell.ship').length;
}

describe('renderBoard fleet visibility', () => {
  it('hides the enemy fleet while the game is in progress', () => {
    const container = document.createElement('div');
    renderBoard(container, buildBoard(), { enemy: true, revealed: false });
    expect(container.querySelectorAll('.cell').length).toBe(100);
    expect(shipCellCount(container)).toBe(0);
  });

  it('reveals the enemy fleet at game over', () => {
    const container = document.createElement('div');
    renderBoard(container, buildBoard(), { enemy: true, revealed: true });
    expect(shipCellCount(container)).toBe(5); // 3 + 2 ship cells
  });

  it('shows the player fleet as revealed', () => {
    const container = document.createElement('div');
    renderBoard(container, buildBoard(), { enemy: false, revealed: true });
    expect(shipCellCount(container)).toBe(5);
  });
});
