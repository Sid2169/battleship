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

  it('accepts an optional name identifying its fleet type', () => {
    const ship = new Ship(4, 'Battleship');
    expect(ship.name).toBe('Battleship');
  });

  it('defaults the name to a generic label', () => {
    const ship = new Ship(2);
    expect(ship.name).toBe('Ship');
  });
});