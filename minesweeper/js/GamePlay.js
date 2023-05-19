import { set, get } from "./helpers/storage.js";

export class GamePlay {
  constructor(gameUi, gameSetup) {
    this.gameUi = gameUi;
    this.gameSetup = gameSetup;
  }

  init() {
    get('state') ? this.setSavedState(JSON.parse(get('state'))) : this.resetState();
    this.loadGame();
    this.addListeners();
  }

  setSavedState(state) {
    [
      this.gameSetup.field,
      this.gameSetup.minesNum,
      this.gameUi.soundOn,
      this.gameUi.themeLight,
      this.level,
      this.clicks,
      this.opened,
      this.flagCount,
      this.seconds,
      this.playing,
      this.score
    ] = state;
  }

  resetState() {
    this.gameSetup.field = [];
    this.level = this.level || 'easy';
    this.clicks = 0;
    this.opened = 0;
    this.flagCount = 0;
    this.seconds = 0;
    this.playing = false;
    clearInterval(this.timer);
  }

  loadGame() {
    this.gameSetup.setFieldSize(this.level);
    if (!this.playing) this.gameSetup.generateField();
    this.gameUi.renderField(this.gameSetup.field);
    if (!this.gameSetup.minesNum) this.gameSetup.setMinesNum(this.level);
    this.flagCount = this.playing ? this.flagCount : 0;
    this.mineCount = this.gameSetup.minesNum - this.flagCount;
    this.gameUi.displayFlagCount(this.flagCount);
    this.gameUi.displayMineCount(this.mineCount);
    this.gameUi.toggleMinesInputDisable(this.playing);
    this.gameUi.setMinesInputValue(this.gameSetup.minesNum);
    this.gameUi.displayLevel(this.level);
    this.gameUi.displayClicks(this.clicks);
    this.gameUi.displayTime(this.seconds);
    this.gameUi.toggleSound();
    this.gameUi.toggleTheme();
    if (this.playing) {
      this.gameSetup.field.forEach(row => row.forEach(cell => {
        this.gameUi.displayFlagged(cell);
        this.gameUi.displayOpen(cell);
      }));
      this.startTimer();
    }
  }

  startGame(id) {
    this.playing = true;
    this.gameSetup.generateMines(id);
    this.gameSetup.getNearbyMinesCount();
    this.gameUi.toggleMinesInputDisable(this.playing);
    this.startTimer();
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.seconds++;
      this.gameUi.displayTime(this.seconds);
    }, 1000);
  }

  getCell(id) {
    const y = +id.split('_')[1];
    const x = +id.split('_')[2];
    return this.gameSetup.field[y][x];
  }

  handleLeftClick = (e) => {
    if (!e.target.classList.contains('cell')) return;
    const cell = this.getCell(e.target.id);
    if (cell.isOpen || cell.isFlagged) return;
    if (!this.playing) this.startGame(cell.id);
    this.clicks++;
    this.gameUi.displayClicks(this.clicks);
    this.openCell(cell, true);
    if (cell.isMine) {
      this.endGame('lose');
      return;
    }
    if (this.opened === this.gameSetup.size ** 2 - this.gameSetup.minesNum) {
      this.endGame('win');
      return;
    }
    if (this.gameUi.soundOn) this.gameUi.playSound('open');
  }

  handleRightClick = (e) => {
    e.preventDefault();
    if (!e.target.classList.contains('cell')) return;
    const cell = this.getCell(e.target.id);
    if (cell.isOpen) return;
    cell.isFlagged ? this.unflagCell(cell) : this.flagCell(cell);
  }

  flagCell(cell) {
    if (this.gameUi.soundOn) this.gameUi.playSound('flag');
    cell.isFlagged = true;
    this.gameUi.displayFlagged(cell);
    this.gameUi.displayFlagCount(++this.flagCount);
    this.gameUi.displayMineCount(--this.mineCount);
  }

  unflagCell(cell) {
    if (this.gameUi.soundOn) this.gameUi.playSound('unflag');
    cell.isFlagged = false;
    this.gameUi.displayFlagged(cell);
    this.gameUi.displayFlagCount(--this.flagCount);
    this.gameUi.displayMineCount(++this.mineCount);
  }

  openCell(cell, isClicked) {
    cell.isOpen = true;
    this.gameUi.displayOpen(cell, isClicked);
    this.opened++;
    if (cell.value === 0) this.gameSetup.getNearbyCells(cell.id).forEach(cell => {
      if (!cell.isFlagged && !cell.isOpen) this.openCell(cell, false);
    });
  }

  updateScore() {
    this.score = this.score || [];
    if (this.score.length === 10) this.score.pop();
    this.score.unshift([this.level, this.gameSetup.minesNum, this.clicks, this.seconds]);
  }

  endGame(result) {
    this.playing = false;
    if (this.gameUi.soundOn) this.gameUi.playSound(result);
    if (result === 'lose') this.gameUi.displayMessage('Game over<br>Try again');
    if (result === 'win') {
      this.updateScore();
      this.gameUi.displayMessage(`Hooray! You found all mines in ${this.seconds} seconds and ${this.clicks} moves!`);
    }
    this.gameSetup.field.forEach(row => row.forEach(cell => {
      if (cell.isMine) this.openCell(cell);
      else if (cell.isFlagged) this.gameUi.highlightWrongFlag(cell);
    }));
    this.gameUi.toggleMinesInputDisable(this.playing);
    this.resetState();
  }

  addListeners() {
    this.gameUi.gameField.addEventListener('click', this.handleLeftClick);
    this.gameUi.gameField.addEventListener('contextmenu', this.handleRightClick);
    this.gameUi.newGameButton.addEventListener('click', () => {
      this.resetState();
      this.loadGame();
    });
    this.gameUi.select.addEventListener('change', (e) => {
      this.level = e.target.value;
      this.resetState();
      this.gameSetup.setMinesNum(this.level);
      this.loadGame();
    });
    this.gameUi.minesInput.addEventListener('input', (e) => {
      (this.gameUi.minesInput.checkValidity())
        ? this.gameSetup.minesNum = e.target.value
        : this.gameSetup.minesNum = 0;
      this.mineCount = this.gameSetup.minesNum ? this.gameSetup.minesNum - this.flagCount : 0;
      this.gameUi.displayFlagCount(this.flagCount);
      this.gameUi.displayMineCount(this.mineCount);
    });
    this.gameUi.minesInput.addEventListener('focusout', () => {
      if (!this.gameUi.minesInput.checkValidity()) {
        this.gameSetup.setMinesNum(this.level);
        this.gameUi.setMinesInputValue(this.gameSetup.minesNum);
        this.mineCount = this.gameSetup.minesNum - this.flagCount;
        this.gameUi.displayFlagCount(this.flagCount);
        this.gameUi.displayMineCount(this.mineCount);
      }
    });
    this.gameUi.minesInput.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') this.gameUi.minesInput.blur();
    });
    this.gameUi.soundBtn.addEventListener('click', () => {
      this.gameUi.soundOn = !this.gameUi.soundOn;
      this.gameUi.toggleSound();
    });
    this.gameUi.themeBtn.addEventListener('click', () => {
      this.gameUi.themeLight = !this.gameUi.themeLight;
      this.gameUi.toggleTheme();
    });
    this.gameUi.scoreBtn.addEventListener('click', () => this.gameUi.toggleScoreDisplay(this.score));
    window.addEventListener('beforeunload', () => set('state', JSON.stringify(
      [
        this.gameSetup.field,
        this.gameSetup.minesNum,
        this.gameUi.soundOn,
        this.gameUi.themeLight,
        this.level,
        this.clicks,
        this.opened,
        this.flagCount,
        this.seconds,
        this.playing,
        this.score
      ]
    )));
  }
}