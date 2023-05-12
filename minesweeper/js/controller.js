export class Controller {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.clicks = 0;
    this.minesLeft = this.model.minesNum;
    this.opened = 0;
    this.seconds = 0;
    this.playing = false;
  }

  init = () => {
    this.view.renderField(this.model.generateField());
    this.view.displayMinesLeft(this.minesLeft);
    this.view.displayTime(this.seconds);
    this.field = document.querySelector('.field');
    this.field.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener('click', this.handleLeftClickOnCell);
      cell.addEventListener('contextmenu', this.handleRightClickOnCell);
    });
  }

  startGame = (cellId) => {
    this.playing = true;
    this.model.generateMines(cellId);
    this.model.getCellsMinesCount();
    this.timer = setInterval(() => {
      this.seconds++;
      this.view.displayTime(this.seconds);
    }, 1000);
  }

  handleLeftClickOnCell = (e) => {
    this.clicks++;
    if (!this.playing) this.startGame(e.target.id);
    const y = +e.target.closest('.cell').id.split('_')[1];
    const x = +e.target.closest('.cell').id.split('_')[2];
    const cell = this.model.field[y][x];
    if (cell.value === 0) this.openNearbyCells(cell);
    else this.openCell(cell, true);
    if (cell.isMine) {
      this.result = 'lose';
      this.endGame();
      return;
    }
    if (this.opened === this.model.size ** 2 - this.model.minesNum) {
      this.result = 'win';
      this.view.displayMinesLeft(0);
      this.endGame();
      return;
    }
  }

  handleRightClickOnCell = (e) => {
    e.preventDefault();
    this.clicks++;
    if (!this.playing) this.startGame(e.target.id);
    const y = +e.target.closest('.cell').id.split('_')[1];
    const x = +e.target.closest('.cell').id.split('_')[2];
    const cell = this.model.field[y][x];
    if (!cell.isOpen) {
      cell.isFlagged = !cell.isFlagged;
      this.minesLeft = cell.isFlagged ? this.minesLeft - 1 : this.minesLeft + 1;
      this.view.cellFlagToggle(cell);
      this.view.displayMinesLeft(this.minesLeft);
    }
  }

  openCell = (cell, isClicked) => {
    this.opened++;
    cell.isOpen = true;
    cell.isFlagged = false;
    this.view.renderOpenCell(cell, isClicked);
  }

  openNearbyCells = (cell) => {
    this.openCell(cell);
    if (cell.value === 0) {
      this.model.getNearbyCells(cell.id).forEach(cell => {
        if (!cell.isOpen) this.openNearbyCells(cell);
      })
    }
  }

  endGame = () => {
    this.playing = false;
    if (this.result === 'lose') this.view.displayMessage('Game over<br>Try again');
    if (this.result === 'win') this.view.displayMessage(`Hooray! You found all mines in ${this.seconds} seconds and ${this.clicks} moves!`);
    clearInterval(this.timer);
    this.model.field.forEach(row => row.forEach(cell => {
      if (cell.isMine) this.openCell(cell);
      else if (cell.isFlagged) this.view.highlightWrongFlags(cell);
    }));
  }
}