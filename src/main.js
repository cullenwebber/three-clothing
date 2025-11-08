import Grid from "./grid/Grid.js";
import ThreeApp from "./three/ThreeApp.js";

class App {
	constructor() {
		this.grid = new Grid();
		this.threeApp = new ThreeApp();
	}

	init() {
		this.threeApp.init();
		this.grid.init();
	}
}

const app = new App();
app.init();
