/**
 * @jest-environment jsdom
 */

class AudioStub {
  constructor() {
    this.paused = true;
    this.loop = false;
    this.volume = 1;
    this.src = '';
  }
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
}
global.Audio = AudioStub;
window.Audio = AudioStub;

function installHtml() {
  document.body.innerHTML = `
    <section id="screen-home" class="screen home">
      <button id="play-btn"></button>
    </section>
    <section id="screen-setup" class="screen setup hidden">
      <div id="setup-palette"></div>
      <button id="rotate-btn"></button>
      <button id="random-btn"></button>
      <button id="reset-btn"></button>
      <div id="setup-board" class="board"></div>
      <span id="setup-status"></span>
      <button id="start-game-btn" disabled></button>
    </section>
    <section id="screen-game" class="screen game hidden">
      <p id="turn-indicator"></p>
      <div id="human-board" class="board"></div>
      <div id="computer-board" class="board"></div>
      <button id="restart-btn"></button>
      <div id="game-over-modal" class="modal hidden">
        <h2 id="result-title"></h2>
        <p id="result-message"></p>
        <button id="modal-restart-btn"></button>
      </div>
    </section>
  `;
}

describe('game start flow (regression)', () => {
  it('repopulates the boards when starting battle from setup', () => {
    delete require.cache[require.resolve('../src/index.js')];
    installHtml();
    require('../src/index.js');

    document.getElementById('play-btn').click();

    const names = [...document.querySelectorAll('.palette-ship')].map((s) => s.dataset.name);
    names.forEach((name, i) => {
      const item = [...document.querySelectorAll('.palette-ship')].find((s) => s.dataset.name === name);
      item.dispatchEvent(new window.Event('click', { bubbles: true }));
      const cell = document.querySelector(`#setup-board .cell[data-row="${i}"][data-col="0"]`);
      cell.dispatchEvent(new window.Event('click', { bubbles: true }));
    });

    document.getElementById('start-game-btn').click();

    expect(document.querySelectorAll('#human-board .cell').length).toBe(100);
    expect(document.querySelectorAll('#computer-board .cell').length).toBe(100);
    expect(document.getElementById('screen-game').classList.contains('hidden')).toBe(false);
  });
});
