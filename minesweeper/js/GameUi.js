export class GameUI {
  constructor() {
    this.gameContainer = this.createNode('div', 'game-container');
    this.gameHeader = this.createNode('div', 'game-header');
    this.gameField = this.createNode('div', 'field');
    this.timeDisplay = this.createNode('span', 'time-display');
    this.minesDisplay = this.createNode('span', 'mines-display');
    this.button = this.createNode('button', 'new-game-btn', 'New Game');
    document.body.prepend(this.gameContainer);
    this.gameContainer.append(this.gameHeader);
    this.gameHeader.append(this.timeDisplay, this.button, this.minesDisplay);
    this.gameContainer.append(this.gameField);
  }

  createNode = (tag, className, content = null) => {
    const node = document.createElement(`${tag}`);
    node.className = className;
    node.innerHTML = content;
    return node;
  }

  renderField = (array) => {
    this.gameField.replaceChildren();
    array.forEach(rowArr => {
      this.gameField.append(this.createRow(rowArr));
    });
  }

  createRow = (rowArr) => {
    const row = this.createNode('div', 'row');
    rowArr.forEach(cell => {
      row.append(this.createCell(cell))
    });
    return row;
  }

  createCell = (cell) => {
    const cellElem = this.createNode('div', 'cell');
    cellElem.id = cell.id;
    return cellElem;
  }

  renderOpenCell = (cell, isClicked) => {
    const cellElem = this.gameField.querySelector(`#${cell.id}`);
    if (cell.isOpen) cellElem.classList.add('open');
    if (cell.isMine && isClicked) cellElem.classList.add('exploded');
    cellElem.innerHTML = cell.value === 0 ? '' : `<span class="cell-value">${cell.value}</span>`;
  }

  createOverlay = () => {
    const overlay = this.createNode('div', 'overlay');
    this.gameField.prepend(overlay);
    return overlay;
  }

  displayMessage = (msg) => {
    this.createOverlay().innerHTML = `<span class="message">${msg}</span>`;
  }

  displayTime = (seconds) => {
    this.timeDisplay.innerHTML = `${seconds}`.padStart(3, '0');
  }

  displayMinesLeft = (minesLeft) => {
    this.minesDisplay.innerHTML = `${minesLeft}`.padStart(3, '0');
  }

  toggleCellFlag = (cell) => {
    this.gameField.querySelector(`#${cell.id}`).innerHTML = cell.isFlagged ? '🚩' : '';
  }

  highlightWrongFlags = (cell) => {
    const cellElem = this.gameField.querySelector(`#${cell.id}`);
    cellElem.classList.add('wrong-flag');
  }
}
