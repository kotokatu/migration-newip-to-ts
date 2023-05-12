export class View {
  constructor() {
    this.field = this.createNode('div', 'field');
    this.fieldHeader = this.createNode('div', 'field-header');
    this.timeDisplay = this.createNode('div', 'time-display');
    this.minesDisplay = this.createNode('div', 'mines-display');
  }

  createNode = (tag, className) => {
    const node = document.createElement(`${tag}`);
    node.className = className;
    return node;
  }

  renderField = (array) => {
    document.body.prepend(this.field);
    this.field.append(this.fieldHeader);
    this.fieldHeader.append(this.timeDisplay, this.minesDisplay);
    array.forEach(rowArr => {
      this.field.append(this.renderRow(rowArr))
    });
  }

  renderRow = (rowArr) => {
    const row = this.createNode('div', 'row');
    rowArr.forEach(cell => {
      row.append(this.renderCell(cell))
    });
    return row;
  }

  renderCell = (cell) => {
    const cellElem = this.createNode('div', 'cell closed');
    cellElem.id = cell.id;
    // cell.dataset.x = id.split('_')[1];
    // cell.dataset.y = id.split('_')[2];
    return cellElem;
  }

  renderOpenCell = (cell, isClicked) => {
    const cellElem = this.field.querySelector(`#${cell.id}`);
    if (cell.isOpen) cellElem.classList.remove('closed');
    if (cell.isMine && isClicked) cellElem.classList.add('exploded');
    cellElem.innerHTML = cell.value === 0 ? '' : `<span class="cell-value">${cell.value}</span>`;
  }

  createOverlay = () => {
    const overlay = this.createNode('div', 'overlay');
    this.field.prepend(overlay);
    return overlay;
  }

  displayMessage = (msg) => {
    this.createOverlay().innerHTML = `<span class="message">${msg}</span>`;
  }

  displayTime = (seconds) => {
    this.timeDisplay.innerHTML = seconds;
  }

  displayMinesLeft = (minesLeft) => {
    this.minesDisplay.innerHTML = minesLeft;
  }

  cellFlagToggle = (cell) => {
    this.field.querySelector(`#${cell.id}`).innerHTML = cell.isFlagged ? '🚩' : '';
  }

  highlightWrongFlags = (cell) => {
    const cellElem = this.field.querySelector(`#${cell.id}`);
    cellElem.classList.add('wrong-flag');
  }
}
