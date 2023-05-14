import { set, get } from "./helpers/storage.js";

export class GamePlay {
  constructor(gameUi, gameSetup) {
    this.gameUi = gameUi;
    this.gameSetup = gameSetup;

  }

  init = () => {
    this.loadGame();
    this.gameUi.newGameButton.addEventListener('click', () => {
      this.setInitialState();
      this.loadGame();
    });
    this.gameUi.select.addEventListener('change', (e) => {
      this.level = e.target.value;
      this.gameSetup.setMinesNum(this.level);
      this.setInitialState();
      this.loadGame();
    });
    this.gameUi.minesInput.addEventListener('change', (e) => {
      if (e.target.value > 9 && e.target.value < 100) this.gameSetup.minesNum = e.target.value;
      else this.gameUi.setMinesInputValue(this.gameSetup.minesNum);
    });
    window.addEventListener('beforeunload', () => set('state', JSON.stringify([this.gameSetup.field, this.gameSetup.minesNum, this.level, this.clicks, this.opened, this.seconds, this.playing])));

  }

  setSavedState = (state) => {
    [this.gameSetup.field, this.gameSetup.minesNum, this.level, this.clicks, this.opened, this.seconds, this.playing] = state;
  }

  setInitialState = () => {
    if (!this.level) this.level = 'easy';
    this.clicks = 0;
    this.opened = 0;
    this.seconds = 0;
    this.playing = false;
    this.gameSetup.field = [];
    clearInterval(this.timer);
    set('state', '');
  }

  loadGame = () => {
    get('state') ? this.setSavedState(JSON.parse(get('state'))) : this.setInitialState();
    this.gameSetup.setFieldSize(this.level);
    if (!this.gameSetup.minesNum) this.gameSetup.setMinesNum(this.level);
    this.gameUi.setLevel(this.level);
    this.gameUi.setMinesInputValue(this.gameSetup.minesNum);
    this.gameUi.toggleMinesInputDisable(this.playing);
    const field = this.gameSetup.field.length ? this.gameSetup.field : this.gameSetup.generateField();
    this.gameUi.renderField(field);
    this.gameUi.displayClicks(this.clicks);
    this.gameUi.displayTime(this.seconds);
    if (this.playing) {
      field.flat().forEach(cell => {
        this.gameUi.renderCellFlag(cell);
        this.gameUi.renderOpenCell(cell);
      });
      this.startTimer();
    }
    this.gameUi.gameContainer.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener('click', this.handleLeftClick);
      cell.addEventListener('contextmenu', this.handleRightClick);
    });
  }

  startGame = (cellId) => {
    this.playing = true;
    this.gameSetup.generateMines(cellId);
    this.gameSetup.getNearbyMinesCount();
    this.startTimer();
    this.gameUi.toggleMinesInputDisable(this.playing);
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      this.seconds++;
      this.gameUi.displayTime(this.seconds);
      if (this.seconds === 9999) clearInterval(this.timer);
    }, 1000);
  }

  handleLeftClick = (e) => {
    if (!e.target.classList.contains('cell')) return;
    this.clicks++;
    this.gameUi.displayClicks(this.clicks);
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
      return;
    }
  }

  handleRightClick = (e) => {
    e.preventDefault();
    if (!e.target.classList.contains('cell')) return;
    this.clicks++;
    this.gameUi.displayClicks(this.clicks);
    if (!this.playing) this.startGame(e.target.id);
    const y = +e.target.closest('.cell').id.split('_')[1];
    const x = +e.target.closest('.cell').id.split('_')[2];
    const cell = this.gameSetup.field[y][x];
    if (!cell.isOpen) cell.isFlagged ? this.unflagCell(cell) : this.flagCell(cell);
  }

  flagCell = (cell) => {
    cell.isFlagged = true;
    this.gameUi.renderCellFlag(cell);
  }

  unflagCell = (cell) => {
    cell.isFlagged = false;
    this.gameUi.renderCellFlag(cell);
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
    this.gameUi.toggleMinesInputDisable(this.playing);
    this.setInitialState();
  }
}