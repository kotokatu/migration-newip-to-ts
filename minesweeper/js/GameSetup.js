export class GameSetup {
  constructor() {
    this.levels = { easy: [10, 10], medium: [15, 40], hard: [25, 99] };
  }

  setFieldSize(level) {
    this.size = this.levels[level][0];
  }

  setMinesNum(level) {
    this.minesNum = this.levels[level][1];
  }

  generateField() {
    this.field = [];
    for (let i = 0; i < this.size; i++) {
      this.field.push([]);
      for (let j = 0; j < this.size; j++) {
        this.field[i].push(this.generateCell(i, j))
      }
    }
  }

  generateCell(y, x) {
    const cell = { id: `cell_${y}_${x}` };
    return cell;
  }

  generateMines(id) {
    let i = 0;
    while (i < this.minesNum) {
      const cell = this.field[this.getRandomNum()][this.getRandomNum()];
      if (cell.isMine || cell.id === id) continue;
      cell.isMine = true;
      i++;
    }
  }

  getRandomNum() {
    return Math.floor(Math.random() * this.size);
  }

  getNearbyCells(cellId) {
    const cellY = +cellId.split('_')[1];
    const cellX = +cellId.split('_')[2];
    const nearbyCellsArray = [];
    for (let y = cellY > 0 ? cellY - 1 : 0; y <= (cellY < this.size - 1 ? cellY + 1 : cellY); y++) {
      for (let x = cellX > 0 ? cellX - 1 : 0; x <= (cellX < this.size - 1 ? cellX + 1 : cellX); x++) {
        if (cellX === x && cellY === y) continue;
        nearbyCellsArray.push(this.field[y][x]);
      }
    }
    return nearbyCellsArray;
  }

  getNearbyMinesCount() {
    this.field.forEach(row => {
      row.forEach(cell => {
        if (!cell.isMine) cell.value = this.getNearbyCells(cell.id).filter(cell => cell.isMine).length;
      });
    })
  }
}