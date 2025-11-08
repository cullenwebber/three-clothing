import Grid from "./grid/Grid.js";
import ThreeApp from "./three/ThreeApp.js";

class App {
	constructor() {
		this.grid = new Grid();
		this.threeApp = new ThreeApp();
	}

	init() {
		this.sync();
		this.threeApp.init();
		this.grid.init();
	}

	sync() {
		this.grid.onGridUpdate = (visibleCells, offsetX, offsetY) => {
			this.threeApp.updateGridItems(visibleCells, offsetX, offsetY);
		};
	}
}

const app = new App();
app.init();
