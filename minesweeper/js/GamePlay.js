export class GamePlay {
  constructor(gameUi, gameSetup) {
    this.gameUi = gameUi;
    this.gameSetup = gameSetup;
    this.level = 'easy';
  }

  setStats = () => {
    this.result = '';
    this.clicks = 0;
    this.opened = 0;
    this.seconds = 0;
    this.playing = false;
    clearInterval(this.timer);
    this.minesLeft = this.gameSetup.minesNum;
  }

  loadGame = () => {
    this.setStats();
    const field = this.gameSetup.generateField(this.level);
    this.gameUi.renderField(field);
    this.gameUi.displayMinesLeft(this.minesLeft);
    this.gameUi.displayTime(this.seconds);
    this.gameUi.gameContainer.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener('click', this.handleLeftClickOnCell);
      cell.addEventListener('contextmenu', this.handleRightClickOnCell);
    });
    this.gameUi.gameContainer.querySelector('.new-game-btn').addEventListener('click', this.loadGame);
  }

  startGame = (cellId) => {
    this.playing = true;
    this.gameSetup.generateMines(cellId);
    this.gameSetup.getNearbyMinesCount();
    this.timer = setInterval(() => {
      this.seconds++;
      this.gameUi.displayTime(this.seconds);
    }, 1000);
  }

  handleLeftClickOnCell = (e) => {
    this.clicks++;
    if (!this.playing) this.startGame(e.target.id);
    const y = +e.target.closest('.cell').id.split('_')[1];
    const x = +e.target.closest('.cell').id.split('_')[2];
    const cell = this.gameSetup.field[y][x];
    if (cell.value === 0) this.openNearbyCells(cell);
    else this.openCell(cell, true);
    // if (cell.isFlagged) this.unflagCell(cell);
    if (cell.isMine) {
      this.result = 'lose';
      this.endGame();
      return;
    }
    if (this.opened === this.gameSetup.size ** 2 - this.gameSetup.minesNum) {
      this.result = 'win';
      this.endGame();
      this.gameUi.displayMinesLeft(0);
      return;
    }
  }

  handleRightClickOnCell = (e) => {
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
    this.gameUi.toggleCellFlag(cell);
    this.gameUi.displayMinesLeft(this.minesLeft);
  }

  unflagCell = (cell) => {
    cell.isFlagged = false;
    this.minesLeft += 1;
    this.gameUi.toggleCellFlag(cell);
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

  endGame = () => {
    this.playing = false;
    clearInterval(this.timer);
    if (this.result === 'lose') this.gameUi.displayMessage('Game over<br>Try again');
    if (this.result === 'win') this.gameUi.displayMessage(`Hooray! You found all mines in ${this.seconds} seconds and ${this.clicks} moves!`);
    this.gameSetup.field.forEach(row => row.forEach(cell => {
      if (cell.isMine) this.openCell(cell);
      else if (cell.isFlagged) this.gameUi.highlightWrongFlags(cell);
    }));
  }
}