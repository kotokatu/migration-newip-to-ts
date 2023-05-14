import { GameSetup } from "./GameSetup.js";
import { GameUI } from "./GameUi.js";
import { GamePlay } from "./GamePlay.js";

function init() {
  const gameSetup = new GameSetup();
  const gameUi = new GameUI();
  const gamePlay = new GamePlay(gameUi, gameSetup);
  gamePlay.init();
}

window.onload = init;