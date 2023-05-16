import { set, get } from "./helpers/storage.js";

export class GamePlay {
  constructor(gameUi, gameSetup) {
    this.gameUi = gameUi;
    this.gameSetup = gameSetup;
  }

  init = () => {
    get('state') ? this.setSavedState(JSON.parse(get('state'))) : this.resetState();
    this.loadGame();
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
    this.gameUi.minesInput.addEventListener('change', (e) => {
      (e.target.value > 9 && e.target.value < 100)
        ? this.gameSetup.minesNum = e.target.value
        : this.gameSetup.setMinesNum(this.level);
      this.gameUi.displayFlagsMinesLeft(this.flagged, this.gameSetup.minesNum);
      this.gameUi.setMinesInputValue(this.gameSetup.minesNum);
    });
    this.gameUi.gameField.addEventListener('click', this.handleLeftClick);
    this.gameUi.gameField.addEventListener('contextmenu', this.handleRightClick);
    this.gameUi.soundBtn.addEventListener('click', () => {
      this.soundOn = !this.soundOn;
      this.gameUi.toggleSound(this.soundOn);
    });
    this.gameUi.themeBtn.addEventListener('click', () => {
      this.themeLight = !this.themeLight;
      this.gameUi.toggleTheme(this.themeLight);
    });
    this.gameUi.scoreBtn.addEventListener('click', () => this.gameUi.toggleScoreDisplay(this.score));
    window.addEventListener('beforeunload', () => set('state', JSON.stringify(
      [
        this.gameSetup.field,
        this.gameSetup.minesNum,
        this.level,
        this.clicks,
        this.opened,
        this.flagged,
        this.seconds,
        this.playing,
        this.soundOn,
        this.themeLight,
        this.score
      ]
    )));
  }

  setSavedState = (state) => {
    [
      this.gameSetup.field,
      this.gameSetup.minesNum,
      this.level,
      this.clicks,
      this.opened,
      this.flagged,
      this.seconds,
      this.playing,
      this.soundOn,
      this.themeLight,
      this.score
    ] = state;
  }

  resetState = () => {
    this.gameSetup.field = [];
    this.level = this.level || 'easy';
    this.clicks = 0;
    this.opened = 0;
    this.flagged = 0;
    this.seconds = 0;
    this.playing = false;
    clearInterval(this.timer);
    // set('state', '');
  }

  loadGame = () => {
    this.gameSetup.setFieldSize(this.level);
    if (!this.gameSetup.minesNum) this.gameSetup.setMinesNum(this.level);
    this.flagged = this.playing ? this.flagged : 0;
    this.minesLeft = this.gameSetup.minesNum - this.flagged;
    this.gameUi.displayFlagsMinesLeft(this.flagged, this.minesLeft);
    const field = this.playing ? this.gameSetup.field : this.gameSetup.generateField();
    this.gameUi.renderField(field);
    if (this.playing) {
      field.forEach(row => row.forEach(cell => {
        this.gameUi.displayFlagged(cell);
        this.gameUi.displayOpen(cell);
      }));
      this.startTimer();
    }
    this.gameUi.toggleMinesInputDisable(this.playing);
    this.gameUi.setMinesInputValue(this.gameSetup.minesNum);
    this.gameUi.displayLevel(this.level);
    this.gameUi.displayClicks(this.clicks);
    this.gameUi.displayTime(this.seconds);
    this.gameUi.toggleSound(this.soundOn);
    this.gameUi.toggleTheme(this.themeLight);
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
    if (cell.isOpen) return;
    this.openCell(cell, true);
    this.gameUi.displayClicks(this.clicks);
    if (cell.isMine) this.endGame('lose');
    else if (this.opened === this.gameSetup.size ** 2 - this.gameSetup.minesNum) this.endGame('win');
  }

  handleRightClick = (e) => {
    e.preventDefault();
    if (!e.target.classList.contains('cell')) return;
    const cell = this.getCell(e.target.id);
    if (!cell.isOpen) cell.isFlagged ? this.unflagCell(cell, true) : this.flagCell(cell);
  }

  flagCell = (cell) => {
    if (this.soundOn) this.gameUi.playSound('flag');
    cell.isFlagged = true;
    this.flagged++;
    this.minesLeft--;
    this.gameUi.displayFlagged(cell);
    this.gameUi.displayFlagsMinesLeft(this.flagged, this.minesLeft);
  }

  unflagCell = (cell, isClicked) => {
    if (isClicked && this.soundOn) this.gameUi.playSound('unflag');
    cell.isFlagged = false;
    this.flagged--;
    this.minesLeft++;
    this.gameUi.displayFlagged(cell);
    this.gameUi.displayFlagsMinesLeft(this.flagged, this.minesLeft);
  }

  openCell = (cell, isClicked) => {
    cell.isOpen = true;
    this.opened++;
    if (isClicked) {
      this.clicks++;
      if (!cell.isMine && this.soundOn) this.gameUi.playSound('open');
      if (cell.isFlagged) this.unflagCell(cell);
    }
    this.gameUi.displayOpen(cell, isClicked);
    if (cell.value === 0) {
      this.gameSetup.getNearbyCells(cell.id).forEach(cell => {
        if (!cell.isOpen && !cell.isFlagged) this.openCell(cell);
      })
    }
  }

  updateScore = () => {
    this.score = this.score || [];
    if (this.score.length === 10) this.score.pop();
    this.score.unshift([this.level, this.gameSetup.minesNum, this.clicks, this.seconds]);
  }

  endGame = (result) => {
    this.playing = false;
    clearInterval(this.timer);
    if (result === 'lose') {
      if (this.soundOn) this.gameUi.playSound('lose');
      this.gameUi.displayMessage('Game over<br>Try again');
    }
    if (result === 'win') {
      this.updateScore();
      this.gameUi.displayMessage(`Hooray! You found all mines in ${this.seconds} seconds and ${this.clicks} moves!`);
      if (this.soundOn) this.gameUi.playSound('win');
    }
    this.gameSetup.field.forEach(row => row.forEach(cell => {
      if (cell.isMine) this.openCell(cell);
      else if (cell.isFlagged) this.gameUi.highlightWrongFlags(cell);
    }));
    this.gameUi.toggleMinesInputDisable(this.playing);
    this.resetState();
  }
}