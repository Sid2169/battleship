import { Board } from '../src/core/Board.js';
import { Ship } from '../src/core/Ship.js';
import { ComputerAI } from '../src/core/computerAI.js';

function sinkHumanFleetSmart() {
  const board = new Board(10);
  const lengths = [5, 4, 3, 3, 2];
  let attempt = 0;
  for (const length of lengths) {
    let placed = false;
    while (!placed) {
      const isVertical = Math.random() < 0.5;
      const r = Math.floor(Math.random() * 10);
      const c = Math.floor(Math.random() * 10);
      try { board.placeShip(new Ship(length), r, c, isVertical); placed = true; attempt = 0; }
      catch (e) { if (++attempt > 5000) throw e; }
    }
  }
  const ai = new ComputerAI(10);
  let shots = 0;
  while (!board.allShipsSunk() && shots < 200) {
    const m = ai.nextMove(board);
    ai.record(board, m.row, m.col, board.receiveAttack(m.row, m.col));
    shots += 1;
  }
  return shots;
}

function sinkHumanFleetRandom() {
  const board = new Board(10);
  const lengths = [5, 4, 3, 3, 2];
  let attempt = 0;
  for (const length of lengths) {
    let placed = false;
    while (!placed) {
      const isVertical = Math.random() < 0.5;
      const r = Math.floor(Math.random() * 10);
      const c = Math.floor(Math.random() * 10);
      try { board.placeShip(new Ship(length), r, c, isVertical); placed = true; attempt = 0; }
      catch (e) { if (++attempt > 5000) throw e; }
    }
  }
  const untried = [];
  for (let r = 0; r < 10; r += 1) for (let c = 0; c < 10; c += 1) untried.push([r, c]);
  let shots = 0;
  while (!board.allShipsSunk() && untried.length) {
    const idx = Math.floor(Math.random() * untried.length);
    const [r, c] = untried.splice(idx, 1)[0];
    board.receiveAttack(r, c);
    shots += 1;
  }
  return shots;
}

function mean(fn, n) {
  let total = 0;
  for (let i = 0; i < n; i += 1) total += fn();
  return total / n;
}

describe('ComputerAI', () => {
  it('opens with a parity checkerboard probe', () => {
    const board = new Board(10);
    const ai = new ComputerAI(10);
    const m1 = ai.nextMove(board);
    expect((m1.row + m1.col) % 2).toBe(0);
    board.receiveAttack(m1.row, m1.col);
    const m2 = ai.nextMove(board);
    expect((m2.row + m2.col) % 2).toBe(0);
  });

  it('targets an orthogonal neighbour after a hit', () => {
    const board = new Board(10);
    board.placeShip(new Ship(3, 'Cruiser'), 2, 2, false);
    const ai = new ComputerAI(10);
    ai.record(board, 2, 2, board.receiveAttack(2, 2));
    const m = ai.nextMove(board);
    expect(Math.abs(m.row - 2) + Math.abs(m.col - 2)).toBe(1);
  });

  it('extends along the line once two collinear hits confirm it', () => {
    const board = new Board(10);
    board.placeShip(new Ship(4, 'Battleship'), 5, 3, false); // cols 3-6
    const ai = new ComputerAI(10);
    ai.record(board, 5, 3, board.receiveAttack(5, 3));
    ai.record(board, 5, 4, board.receiveAttack(5, 4));
    const m = ai.nextMove(board);
    expect(m.row).toBe(5); // stays on the ship's row, extending the line
  });

  it('sinks a ship with no wasted shots once its orientation is known', () => {
    const board = new Board(10);
    const ship = new Ship(4, 'Battleship');
    board.placeShip(ship, 5, 3, false); // cols 3-6
    const ai = new ComputerAI(10);
    let orientationKnown = false;
    let missesAfterOrientation = 0;
    let guard = 0;
    while (!ship.isSunk() && guard < 300) {
      const m = ai.nextMove(board);
      const result = board.receiveAttack(m.row, m.col);
      ai.record(board, m.row, m.col, result);
      if (!orientationKnown && result === 'hit') {
        // two collinear hits pin down the ship's orientation
        const { row: r, col: c } = m;
        const aligned = (dr, dc) =>
          ai.hits.has(`${r + dr},${c + dc}`) || ai.hits.has(`${r - dr},${c - dc}`);
        if (aligned(1, 0) || aligned(0, 1)) orientationKnown = true;
      } else if (orientationKnown && result === 'miss') {
        missesAfterOrientation += 1;
      }
      guard += 1;
    }
    expect(ship.isSunk()).toBe(true);
    expect(missesAfterOrientation).toBe(0);
  });

  it('moves on to hunting after a ship is sunk', () => {
    const board = new Board(10);
    const ship = new Ship(2, 'Destroyer');
    board.placeShip(ship, 0, 0, false); // cells (0,0),(0,1)
    const ai = new ComputerAI(10);
    ai.record(board, 0, 0, board.receiveAttack(0, 0));
    ai.record(board, 0, 1, board.receiveAttack(0, 1));
    expect(ship.isSunk()).toBe(true);
    const m = ai.nextMove(board);
    expect((m.row + m.col) % 2).toBe(0);
  });

  it('sinks the whole fleet using fewer shots than purely random play', () => {
    const smart = mean(sinkHumanFleetSmart, 100);
    const random = mean(sinkHumanFleetRandom, 100);
    expect(smart).toBeLessThan(random - 5);
  });
});
