// src/core/computerAI.js
// A hunt-and-target AI that maximizes the computer's chances of winning.
//
// Strategy:
//  - Hunt phase: probe the board using a parity checkerboard pattern, which
//    guarantees every even-length ship is found and covers the board without
//    wasting shots on cells that no ship can occupy.
//  - Target phase: once a hit lands, prioritise cells adjacent to that hit,
//    and once a second collinear hit establishes the ship's orientation,
//    continue extending along that line until the ship is sunk.
//  - Cells belonging to already-sunk ships are excluded so no shots are
//    wasted re-probing a destroyed ship.

const DIRS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

export class ComputerAI {
  constructor(size = 10) {
    this.size = size;
    this.reset();
  }

  reset() {
    // Unsunk hit cells ("row,col" keys) currently being hunted.
    this.hits = new Set();
    // Cells ("row,col" keys) belonging to ships we have already sunk.
    this.sunkKeys = new Set();
  }

  nextMove(board) {
    // Finish sinking any ship we have already found.
    if (this.hits.size > 0) {
      const target = this._bestTarget(board);
      if (target) return target;
    }
    // Otherwise probe the board efficiently.
    return this._hunt(board);
  }

  record(board, row, col, result) {
    if (result !== 'hit') return;
    const key = `${row},${col}`;
    const ship = board.grid[row][col].ship;
    if (ship.isSunk()) {
      this._markShipSunk(board, ship);
      this.hits.delete(key);
    } else {
      this.hits.add(key);
    }
  }

  // Choose the most promising adjacent cell among all active hits.
  //
  // Once two orthogonally-adjacent hits reveal the ship's orientation, only
  // the cells immediately beyond each end of the run are worth firing at; the
  // far end is tried first so the ship is finished without scattering shots.
  // Before the orientation is known, any untried orthogonal neighbour is
  // probed to pin it down.
  _bestTarget(board) {
    const hits = [...this.hits];

    let axis = null; // 'h' (one row) or 'v' (one column)
    let fixed = -1;
    outer: for (let a = 0; a < hits.length; a += 1) {
      const [r1, c1] = hits[a].split(',').map(Number);
      for (let b = a + 1; b < hits.length; b += 1) {
        const [r2, c2] = hits[b].split(',').map(Number);
        if (r1 === r2 && Math.abs(c1 - c2) === 1) { axis = 'h'; fixed = r1; break outer; }
        if (c1 === c2 && Math.abs(r1 - r2) === 1) { axis = 'v'; fixed = c1; break outer; }
      }
    }

    if (axis) {
      let min;
      let max;
      for (const key of hits) {
        const [r, c] = key.split(',').map(Number);
        const idx = axis === 'h' ? c : r;
        if (min === undefined || idx < min) min = idx;
        if (max === undefined || idx > max) max = idx;
      }
      // Try the far end first, then the near end.
      const far = axis === 'h' ? [fixed, max + 1] : [max + 1, fixed];
      const near = axis === 'h' ? [fixed, min - 1] : [min - 1, fixed];
      for (const [r, c] of [far, near]) {
        if (r < 0 || r >= this.size || c < 0 || c >= this.size) continue;
        const key = `${r},${c}`;
        if (board.shots.has(key)) continue;
        if (this.sunkKeys.has(key)) continue;
        return { row: r, col: c };
      }
      return null;
    }

    // Orientation unknown: probe any untried orthogonal neighbour.
    for (const key of hits) {
      const [r, c] = key.split(',').map(Number);
      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= this.size || nc < 0 || nc >= this.size) continue;
        const nk = `${nr},${nc}`;
        if (board.shots.has(nk)) continue;
        if (this.sunkKeys.has(nk)) continue;
        return { row: nr, col: nc };
      }
    }
    return null;
  }

  _markShipSunk(board, ship) {
    for (let r = 0; r < this.size; r += 1) {
      for (let c = 0; c < this.size; c += 1) {
        const entry = board.grid[r][c];
        if (entry && entry.ship === ship) {
          const key = `${r},${c}`;
          this.sunkKeys.add(key);
          this.hits.delete(key);
        }
      }
    }
  }

  // Probe untried cells, preferring the parity checkerboard first so the
  // board is searched efficiently without wasting probes.
  _hunt(board) {
    for (let parity = 0; parity <= 1; parity += 1) {
      for (let r = 0; r < this.size; r += 1) {
        for (let c = 0; c < this.size; c += 1) {
          if (((r + c) % 2) !== parity) continue;
          const key = `${r},${c}`;
          if (board.shots.has(key)) continue;
          return { row: r, col: c };
        }
      }
    }
    for (let r = 0; r < this.size; r += 1) {
      for (let c = 0; c < this.size; c += 1) {
        const key = `${r},${c}`;
        if (board.shots.has(key)) continue;
        return { row: r, col: c };
      }
    }
    throw new Error('No untried cells remaining');
  }
}
