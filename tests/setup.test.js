/**
 * @jest-environment jsdom
 */
import { initSetupScreen } from '../src/ui/setup.js';

function setupDom() {
  document.body.innerHTML = `
    <div id="setup-palette"></div>
    <button id="rotate-btn"></button>
    <button id="random-btn"></button>
    <button id="reset-btn"></button>
    <div id="setup-board" class="board"></div>
    <span id="setup-status"></span>
    <button id="start-game-btn" disabled>Start Battle</button>
  `;
}

describe('initSetupScreen', () => {
  it('renders an empty board and lists all five ships', () => {
    setupDom();
    const started = jest.fn();
    initSetupScreen({ startEl: document.getElementById('start-game-btn'), onStart: started });
    expect(document.querySelectorAll('.cell').length).toBe(100);
    expect(document.querySelectorAll('.palette-ship').length).toBe(5);
    expect(document.getElementById('start-game-btn').disabled).toBe(true);
  });

  it('enables start and calls back once the full fleet is placed', () => {
    setupDom();
    let started;
    initSetupScreen({ startEl: document.getElementById('start-game-btn'), onStart: (g) => { started = g; } });
    const startBtn = document.getElementById('start-game-btn');
    expect(startBtn.disabled).toBe(true);

    // place each ship horizontally on its own row so nothing overlaps
    const list = () => document.querySelectorAll('.palette-ship');
    const names = [...list()].map((s) => s.dataset.name);
    names.forEach((name, i) => {
      const item = [...list()].find((s) => s.dataset.name === name);
      item.dispatchEvent(new window.Event('click', { bubbles: true }));
      const cell = document.querySelector(`.cell[data-row="${i}"][data-col="0"]`);
      cell.dispatchEvent(new window.Event('click', { bubbles: true }));
    });

    expect(startBtn.disabled).toBe(false);
    startBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(started).toBeTruthy();
    expect(started.humanBoard.ships.length).toBe(5);
  });
});
