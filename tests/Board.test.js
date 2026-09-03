// tests/Board.test.js
import { Board } from '../src/core/Board.js';
import { Ship } from '../src/core/Ship.js';

describe('Board.receiveAttack', () => {
  it('returns hit when a ship occupies the cell', () => {
    const board = new Board();
    const ship  = new Ship(3);
    board.placeShip(ship, 0, 0, false);
    expect(board.receiveAttack(0, 0)).toBe('hit');
  });

  it('throws on duplicate attack', () => {
    const board = new Board();
    board.receiveAttack(5, 5);
    expect(() => board.receiveAttack(5, 5)).toThrow();
  });

  it('detects all ships sunk', () => {
    const board = new Board();
    const ship  = new Ship(1);
    board.placeShip(ship, 0, 0, false);
    board.receiveAttack(0, 0);
    expect(board.allShipsSunk()).toBe(true);
  });

  describe('placeShip', () => {
    it('stores the ship orientation on the placed ship', () => {
      const board = new Board();
      const ship = new Ship(3, 'Battleship');
      board.placeShip(ship, 2, 4, true);
      expect(ship.isVertical).toBe(true);
    });

    it('rejects out-of-bounds placement', () => {
      const board = new Board();
      const ship = new Ship(4, 'Carrier');
      expect(() => board.placeShip(ship, 8, 8, false)).toThrow();
    });
  });
});