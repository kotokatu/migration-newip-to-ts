import { Model } from "./model.js";
import { View } from "./view.js";
import { Controller } from "./controller.js";

const model = new Model(10, 10);
const view = new View();
const controller = new Controller(view, model);
controller.init();