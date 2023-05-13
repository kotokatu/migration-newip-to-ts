import { set, get } from "./helpers/storage.js";

export class GamePlay {
  constructor(gameUi, gameSetup) {
    this.gameUi = gameUi;
    this.gameSetup = gameSetup;
    this.level = 'easy';
  }

  setGameState = (state) => {
    [this.gameSetup.field, this.gameSetup.size, this.clicks, this.opened, this.seconds, this.playing, this.minesLeft] = state;
  }

  setInitialState = () => {
    this.result = '';
    this.clicks = 0;
    this.opened = 0;
    this.seconds = 0;
    this.playing = false;
    this.minesLeft = this.gameSetup.minesNum;
    this.gameSetup.field = [];
    clearInterval(this.timer);
    set('state', '');
  }

  loadGame = () => {
    get('state') ? this.setGameState(JSON.parse(get('state'))) : this.setInitialState();
    const field = this.gameSetup.field.length ? this.gameSetup.field : this.gameSetup.generateField(this.level);
    this.gameUi.renderField(field);
    this.gameUi.displayMinesLeft(this.minesLeft);
    this.gameUi.displayTime(this.seconds);
    field.flat().forEach(cell => {
      this.gameUi.renderCellFlag(cell);
      this.gameUi.renderOpenCell(cell);
    });
    if (this.playing) this.startTimer();
    this.gameUi.gameContainer.querySelector('.new-game-btn').addEventListener('click', () => {
      this.setInitialState();
      this.loadGame();
    });
    this.gameUi.gameContainer.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener('click', this.handleLeftClick);
      cell.addEventListener('contextmenu', this.handleRightClick);
    });
    window.addEventListener('beforeunload', () => set('state', JSON.stringify([this.gameSetup.field, this.gameSetup.size, this.clicks, this.opened, this.seconds, this.playing, this.minesLeft])));
    window.addEventListener('load', () => get('state') ? this.setGameState(JSON.parse(get('state'))) : this.setInitialState());
  }

  startGame = (cellId) => {
    this.playing = true;
    this.gameSetup.generateMines(cellId);
    this.gameSetup.getNearbyMinesCount();
    this.startTimer();
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      this.seconds++;
      this.gameUi.displayTime(this.seconds);
      if (this.seconds === 9999) clearInterval(this.timer);
    }, 1000);
  }

  handleLeftClick = (e) => {
    this.clicks++;
    if (!this.playing) this.startGame(e.target.id);
    const y = +e.target.id.split('_')[1];
    const x = +e.target.id.split('_')[2];
    const cell = this.gameSetup.field[y][x];
    if (cell.value === 0) this.openNearbyCells(cell);
    else this.openCell(cell, true);
    if (cell.isMine) {
      this.endGame('lose');
      return;
    }
    if (this.opened === this.gameSetup.size ** 2 - this.gameSetup.minesNum) {
      this.endGame('win');
      this.gameUi.displayMinesLeft(0);
      return;
    }
  }

  handleRightClick = (e) => {
    e.preventDefault();
    this.clicks++;
    if (!this.playing) this.startGame(e.target.id);
    const y = +e.target.closest('.cell').id.split('_')[1];
    const x = +e.target.closest('.cell').id.split('_')[2];
    const cell = this.gameSetup.field[y][x];
    if (!cell.isOpen) cell.isFlagged ? this.unflagCell(cell) : this.flagCell(cell);
  }

  flagCell = (cell) => {
    cell.isFlagged = true;
    this.minesLeft -= 1;
    this.gameUi.renderCellFlag(cell);
    this.gameUi.displayMinesLeft(this.minesLeft);
  }

  unflagCell = (cell) => {
    cell.isFlagged = false;
    this.minesLeft += 1;
    this.gameUi.renderCellFlag(cell);
    this.gameUi.displayMinesLeft(this.minesLeft);
  }

  openCell = (cell, isClicked) => {
    this.opened++;
    cell.isOpen = true;
    if (cell.isFlagged) this.unflagCell(cell);
    this.gameUi.renderOpenCell(cell, isClicked);
  }

  openNearbyCells = (cell) => {
    this.openCell(cell);
    if (cell.value === 0) {
      this.gameSetup.getNearbyCells(cell.id).forEach(cell => {
        if (!cell.isOpen) this.openNearbyCells(cell);
      })
    }
  }

  endGame = (result) => {
    this.playing = false;
    clearInterval(this.timer);
    if (result === 'lose') this.gameUi.displayMessage('Game over<br>Try again');
    if (result === 'win') this.gameUi.displayMessage(`Hooray! You found all mines in ${this.seconds} seconds and ${this.clicks} moves!`);
    this.gameSetup.field.forEach(row => row.forEach(cell => {
      if (cell.isMine) this.openCell(cell);
      else if (cell.isFlagged) this.gameUi.highlightWrongFlags(cell);
    }));
  }
}