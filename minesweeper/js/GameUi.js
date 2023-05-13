export class GameUI {
  constructor() {
    this.gameContainer = this.createNode('div', 'game-container');
    this.gameHeader = this.createNode('div', 'game-header');
    this.gameField = this.createNode('div', 'field');
    this.gameFooter = this.createNode('div', 'game-footer');
    this.timeDisplay = this.createNode('span', 'time-display');
    this.minesDisplay = this.createNode('span', 'mines-display');
    this.button = this.createNode('button', 'new-game-btn', 'New Game');
    document.body.prepend(this.gameContainer);
    this.gameHeader.append(this.timeDisplay, this.button, this.minesDisplay);
    this.gameContainer.append(this.gameHeader, this.gameField, this.gameFooter);
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
    const cellElem = this.createNode('span', 'cell');
    cellElem.id = cell.id;
    return cellElem;
  }

  renderOpenCell = (cell, isClicked) => {
    const cellElem = this.gameField.querySelector(`#${cell.id}`);
    if (cell.isOpen) {
      cellElem.classList.add('open', `cc-${cell.value}`);
      cellElem.innerText = cell.value === 0 ? '' : cell.value;
    }
    if (cell.isMine && isClicked) cellElem.classList.add('exploded');
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
    this.timeDisplay.innerText = `${seconds}`.padStart(3, '0');
  }

  displayMinesLeft = (minesLeft) => {
    this.minesDisplay.innerText = `${minesLeft}`.padStart(3, '0');
  }

  renderCellFlag = (cell) => {
    this.gameField.querySelector(`#${cell.id}`).innerText = cell.isFlagged ? '🚩' : '';
  }

  highlightWrongFlags = (cell) => {
    const cellElem = this.gameField.querySelector(`#${cell.id}`);
    cellElem.classList.add('wrong-flag');
  }
}
