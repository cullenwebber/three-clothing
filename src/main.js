import Grid from "./grid/Grid.js";
import ThreeApp from "./three/core/ThreeApp.js";

class App {
	constructor() {
		this.grid = new Grid();
		this.threeApp = new ThreeApp();
	}

	init() {
		this.grid.init();
		this.threeApp.init(this.grid.renderer);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const app = new App();
	app.init();
});
