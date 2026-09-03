import carrierUrl from '../assets/ships/carrier.png';
import battleshipUrl from '../assets/ships/battleship.png';
import cruiserUrl from '../assets/ships/cruiser.png';
import submarineUrl from '../assets/ships/submarine.png';
import destroyerUrl from '../assets/ships/destroyer.png';

// Map a ship's name to its sprite url.
export const SHIP_SPRITES = {
  Carrier: carrierUrl,
  Battleship: battleshipUrl,
  Cruiser: cruiserUrl,
  Submarine: submarineUrl,
  Destroyer: destroyerUrl,
};

export const SHIP_TYPES = Object.keys(SHIP_SPRITES);

const CELL = 34;

/**
 * Apply the graphical sprite for a ship to a single board cell that the
 * ship occupies. The sprites are pre-sized to one 34px frame per cell, so
 * the right slice is shown by offsetting the background.
 */
export function applyShipBackground(cellEl, shipName, index, length, isVertical) {
  const url = SHIP_SPRITES[shipName] || carrierUrl;
  cellEl.style.backgroundImage = `url("${url}")`;
  if (isVertical) {
    cellEl.style.backgroundSize = `${CELL}px ${length * CELL}px`;
    cellEl.style.backgroundPosition = `center ${-(index * CELL)}px`;
  } else {
    cellEl.style.backgroundSize = `${length * CELL}px ${CELL}px`;
    cellEl.style.backgroundPosition = `${-(index * CELL)}px center`;
  }
}

/**
 * Remove any ship background styling from a cell (e.g. when a ship is
 * moved or before re-rendering a board).
 */
export function clearShipBackground(cellEl) {
  cellEl.style.backgroundImage = '';
  cellEl.style.backgroundSize = '';
  cellEl.style.backgroundPosition = '';
}
