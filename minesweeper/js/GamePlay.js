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
      this.setInitialState();
      this.gameSetup.setMinesNum(this.level);
      this.loadGame();
    });
    this.gameUi.minesInput.addEventListener('change', (e) => {
      (e.target.value > 9 && e.target.value < 100)
        ? this.gameSetup.minesNum = e.target.value
        : this.gameUi.setMinesInputValue(this.gameSetup.minesNum);
    });
    this.gameUi.gameField.addEventListener('click', this.handleLeftClick);
    this.gameUi.gameField.addEventListener('contextmenu', this.handleRightClick);
    this.gameUi.soundBtn.addEventListener('click', () => {
      this.soundOn = !this.soundOn;
      this.gameUi.toggleSound(this.soundOn);
    });
    window.addEventListener('beforeunload', () => set('state', JSON.stringify([this.gameSetup.field, this.gameSetup.minesNum, this.level, this.clicks, this.opened, this.seconds, this.playing, this.soundOn])));

  }

  setSavedState = (state) => {
    [this.gameSetup.field, this.gameSetup.minesNum, this.level, this.clicks, this.opened, this.seconds, this.playing, this.soundOn] = state;
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
    if (!this.playing) this.gameSetup.setMinesNum(this.level);
    this.gameUi.setLevel(this.level);
    this.gameUi.setMinesInputValue(this.gameSetup.minesNum);
    this.gameUi.toggleMinesInputDisable(this.playing);
    const field = this.gameSetup.field.length ? this.gameSetup.field : this.gameSetup.generateField();
    this.gameUi.renderField(field);
    this.gameUi.displayClicks(this.clicks);
    this.gameUi.displayTime(this.seconds);
    this.gameUi.toggleSound(this.soundOn);
    if (this.playing) {
      field.flat().forEach(cell => {
        this.gameUi.renderCellFlag(cell);
        this.gameUi.renderOpenCell(cell);
      });
      this.startTimer();
    }
  }

  startGame = (id) => {
    this.playing = true;
    this.gameSetup.generateMines(id);
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

  getCell = (id) => {
    const y = +id.split('_')[1];
    const x = +id.split('_')[2];
    return this.gameSetup.field[y][x];
  }

  handleLeftClick = (e) => {
    if (!e.target.classList.contains('cell')) return;
    if (!this.playing) this.startGame(e.target.id);
    const cell = this.getCell(e.target.id);
    if (!cell.isOpen) this.openCell(cell, true);
    this.gameUi.displayClicks(this.clicks);
    if (cell.isMine) this.endGame('lose');
    else if (this.opened === this.gameSetup.size ** 2 - this.gameSetup.minesNum) this.endGame('win');
  }

  handleRightClick = (e) => {
    e.preventDefault();
    if (!e.target.classList.contains('cell')) return;
    // this.clicks++;
    // this.gameUi.displayClicks(this.clicks);
    // if (!this.playing) this.startGame(e.target.id);
    const cell = this.getCell(e.target.id);
    if (!cell.isOpen) cell.isFlagged ? this.unflagCell(cell, true) : this.flagCell(cell);
  }

  flagCell = (cell) => {
    cell.isFlagged = true;
    if (this.soundOn) this.gameUi.playSound('flag');
    this.gameUi.renderCellFlag(cell);
  }

  unflagCell = (cell, isClicked) => {
    cell.isFlagged = false;
    if (isClicked && this.soundOn) this.gameUi.playSound('unflag');
    this.gameUi.renderCellFlag(cell);
  }

  openCell = (cell, isClicked) => {
    cell.isOpen = true;
    this.opened++;
    if (isClicked) this.clicks++;
    if (!cell.isMine && isClicked && this.soundOn) this.gameUi.playSound('open');
    if (cell.isFlagged) this.unflagCell(cell);
    this.gameUi.renderOpenCell(cell, isClicked);
    if (cell.value === 0) {
      this.gameSetup.getNearbyCells(cell.id).forEach(cell => {
        if (!cell.isOpen) this.openCell(cell);
      })
    }
  }

  endGame = (result) => {
    this.playing = false;
    clearInterval(this.timer);
    if (result === 'lose') {
      this.gameUi.displayMessage('Game over<br>Try again');
      if (this.soundOn) this.gameUi.playSound('lose');
    }
    if (result === 'win') {
      this.gameUi.displayMessage(`Hooray! You found all mines in ${this.seconds} seconds and ${this.clicks} moves!`);
      if (this.soundOn) this.gameUi.playSound('win');
    }
    this.gameSetup.field.flat().forEach(cell => {
      if (cell.isMine) this.openCell(cell);
      else if (cell.isFlagged) this.gameUi.highlightWrongFlags(cell);
    });
    this.gameUi.toggleMinesInputDisable(this.playing);
    this.setInitialState();
  }
}