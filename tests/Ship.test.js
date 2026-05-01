import { Ship } from '../src/core/Ship';

describe('Ship', () => {
  it('tracks hits correctly', () => {
    const ship = new Ship(3);
    ship.hit(0);
    expect(ship.hits).toContain(0);
  });

  it('is sunk when all positions are hit', () => {
    const ship = new Ship(2);
    ship.hit(0); ship.hit(1);
    expect(ship.isSunk()).toBe(true);
  });

  it('is not sunk with partial hits', () => {
    const ship = new Ship(3);
    ship.hit(1);
    expect(ship.isSunk()).toBe(false);
  });
});