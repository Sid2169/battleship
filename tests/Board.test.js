// tests/Board.test.js
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
});

// tests/AIPlayer.test.js
describe('HuntTargetStrategy', () => {
  it('enqueues neighbors after a hit', () => {
    const strategy = new HuntTargetStrategy(10);
    strategy.onResult(5, 5, 'hit');
    expect(strategy.targetQueue.length).toBeGreaterThan(0);
  });

  it('clears queue after a sunk', () => {
    const strategy = new HuntTargetStrategy(10);
    strategy.onResult(5, 5, 'hit');
    strategy.onResult(5, 6, 'sunk');
    expect(strategy.targetQueue.length).toBe(0);
  });
});