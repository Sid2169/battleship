import { Game } from '../src/core/Game';
import { Board } from '../src/core/Board';

describe('Game', () => {
  it('creates one board per player', () => {
    const game = new Game();
    expect(game.humanBoard).toBeInstanceOf(Board);
    expect(game.computerBoard).toBeInstanceOf(Board);
  });

  it('places a complete fleet of ships', () => {
    const game = new Game();
    const lengths = game.fleetLengths;
    expect(lengths).toHaveLength(5);
    // sum of a standard fleet of 5 ships
    const total = lengths.reduce((a, b) => a + b, 0);
    expect(total).toBe(17);
  });

  it('places the computer fleet so every ship is on the board', () => {
    const game = new Game();
    game.placeComputerFleet();
    expect(game.computerBoard.ships).toHaveLength(5);
    expect(game.computerBoard.allShipsSunk()).toBe(false);
  });

  it('places the human fleet on the human board', () => {
    const game = new Game();
    game.placeHumanFleet();
    expect(game.humanBoard.ships).toHaveLength(5);
  });

  it('alternates turns when a player attacks', () => {
    const game = new Game();
    game.placeHumanFleet();
    game.placeComputerFleet();
    expect(game.currentPlayer).toBe('human');
    game.humanAttack(0, 0);
    expect(game.currentPlayer).toBe('computer');
    game.computerAttack();
    expect(game.currentPlayer).toBe('human');
  });

  it('detects a winner once every cell on both boards has been attacked', () => {
    const game = new Game();
    game.placeHumanFleet();
    game.placeComputerFleet();
    const positions = [];
    for (let r = 0; r < game.size; r += 1)
      for (let c = 0; c < game.size; c += 1) positions.push([r, c]);
    for (let i = 0; i < positions.length; i += 1) {
      if (game.isOver()) break;
      const [r, c] = positions[i];
      game.humanAttack(r, c);
      if (!game.isOver()) game.computerAttack();
    }
    expect(game.isOver()).toBe(true);
    expect(['human', 'computer']).toContain(game.winner);
  });

  it('does not end the game when not all ships are sunk', () => {
    const game = new Game();
    game.placeComputerFleet();
    expect(game.isOver()).toBe(false);
  });
});
