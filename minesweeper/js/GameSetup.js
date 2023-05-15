export class GameSetup {
  constructor() {
    this.levels = { easy: [10, 10], medium: [15, 40], hard: [25, 99] };
  }

  setFieldSize = (level) => {
    this.size = this.levels[level][0];
  }

  setMinesNum = (level) => {
    this.minesNum = this.levels[level][1];
  }

  generateField = () => {
    this.field = [];
    for (let i = 0; i < this.size; i++) {
      this.field.push([]);
      for (let j = 0; j < this.size; j++) {
        this.field[i].push(this.generateCell(i, j))
      }
    }
    return this.field;
  }

  generateCell = (y, x) => {
    const cell = { id: `cell_${y}_${x}` };
    return cell;
  }

  generateMines = (id) => {
    let i = 0;
    while (i < this.minesNum) {
      const cell = this.field[this.getRandomNum()][this.getRandomNum()];
      if (cell.isMine || cell.id === id) {
        continue;
      }
      cell.isMine = true;
      cell.value = `<svg xmlns="http://www.w3.org/2000/svg" id="mdi-mine" 
                    viewBox="0 0 24 24"><path d="M23,13V11H19.93C19.75,9.58 19.19,8.23 18.31,7.1L20.5,4.93L19.07,3.5L16.9,5.69C15.77,4.81 
                    14.42,4.25 13,4.07V1H11V4.07C9.58,4.25 8.23,4.81 7.1,5.69L4.93,3.5L3.5,4.93L5.69,7.1C4.81,8.23 4.25,9.58 4.07,11H1V13H4.07C4.25,14.42 4.81,15.77 
                    5.69,16.9L3.5,19.07L4.93,20.5L7.1,18.31C8.23,19.19 9.58,19.75 11,19.93V23H13V19.93C14.42,19.75 15.77,19.19 16.9,18.31L19.07,20.5L20.5,19.07L18.31,16.9C19.19,15.77 
                    19.75,14.42 19.93,13H23M12,8A4,4 0 0,0 8,12H6A6,6 0 0,1 12,6V8Z" /></svg>`;
      i++;
    }
  }

  getRandomNum = () => {
    return Math.floor(Math.random() * this.size);
  }

  getNearbyCells = (cellId) => {
    const cellY = +cellId.split('_')[1];
    const cellX = +cellId.split('_')[2];
    const nearbyCellsArray = [];
    for (let y = cellY > 0 ? cellY - 1 : 0; y <= (cellY < this.size - 1 ? cellY + 1 : cellY); y++) {
      for (let x = cellX > 0 ? cellX - 1 : 0; x <= (cellX < this.size - 1 ? cellX + 1 : cellX); x++) {
        if (cellX === x && cellY === y) continue;
        nearbyCellsArray.push(this.field[y][x])
      }
    }
    return nearbyCellsArray;
  }

  getNearbyMinesCount = () => {
    this.field.forEach(row => {
      row.forEach(cell => {
        if (!cell.isMine) cell.value = this.getNearbyCells(cell.id).filter(cell => cell.isMine).length;
      });
    })
  }

}