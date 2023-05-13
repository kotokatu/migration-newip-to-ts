import { GameSetup } from "./GameSetup.js";
import { GameUI } from "./GameUi.js";
import { GamePlay } from "./GamePlay.js";

function init() {
  const gameSetup = new GameSetup(10, 10);
  const gameUi = new GameUI();
  const gamePlay = new GamePlay(gameUi, gameSetup);
  gamePlay.loadGame();
  document.querySelector('.new-game-btn').addEventListener('click', () => {
    document.querySelector('.game-container').remove();
    init();
  });
}

window.onload = init;