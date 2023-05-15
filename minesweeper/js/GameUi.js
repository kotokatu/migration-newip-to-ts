export class GameUI {
  constructor() {
    this.open = new Audio('../assets/sounds/open.wav');
    this.flag = new Audio('../assets/sounds/flag.wav');
    this.unflag = new Audio('../assets/sounds/unflag.wav');
    this.lose = new Audio('../assets/sounds/lose.wav');
    this.win = new Audio('../assets/sounds/win.wav');
    this.gameContainer = this.createNode('div', 'game-container');
    this.gameHeader = this.createNode('div', 'game-header');
    this.gameField = this.createNode('div', 'field');
    this.gameFooter = this.createNode('div', 'game-footer');
    this.timeDisplay = this.createNode('span', 'time-display');
    this.clicksDisplay = this.createNode('span', 'clicks-display');
    this.newGameButton = this.createNode('button', 'new-game-btn', 'New Game');
    this.select = this.createNode('select', 'level-select',
                                  `<option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>`);
    this.minesInput = this.createNode('input', 'mines-input');
    this.minesInput.setAttribute('type', 'number');
    this.minesInput.setAttribute('min', '10');
    this.minesInput.setAttribute('max', '99');
    this.soundBtn = this.createNode('button', 'sound-btn');
    this.themeBtn = this.createNode('button', 'theme-btn');
    document.body.prepend(this.gameContainer);
    this.gameHeader.append(this.timeDisplay, this.newGameButton, this.clicksDisplay);
    this.gameContainer.append(this.gameHeader, this.gameField, this.gameFooter);
    this.gameFooter.append(this.select, this.minesInput, this.soundBtn, this.themeBtn);
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
      if (!cell.isMine) cellElem.classList.add('open', `cc-${cell.value}`);
      cellElem.innerHTML = cell.value === 0 ? '' : cell.value;
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

  displayClicks = (clicks) => {
    this.clicksDisplay.innerText = `${clicks}`.padStart(3, '0');
  }

  renderCellFlag = (cell) => {
    if (!cell.isOpen) this.gameField.querySelector(`#${cell.id}`).innerText = cell.isFlagged ? '🚩' : '';
  }

  highlightWrongFlags = (cell) => {
    const cellElem = this.gameField.querySelector(`#${cell.id}`);
    cellElem.classList.add('wrong-flag');
  }

  setLevel = (level) => {
    this.select.value = level;
  }

  setMinesInputValue = (value) => {
    this.minesInput.value = value;
  }

  toggleMinesInputDisable = (isPlaying) => {
    this.minesInput.disabled = isPlaying ? true : false;
  }

  playSound = (action) => {
    this[action].play();
  }

  toggleSound = (soundOn) => {
    soundOn ? this.soundBtn.classList.remove('off') : this.soundBtn.classList.add('off');
  }

  toggleTheme = (themeLight) => {
    themeLight ? document.body.classList.add('light') : document.body.classList.remove('light');
  }
}
