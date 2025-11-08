import ThreeScene from "./ThreeScene.js";
import ThreeCamera from "./ThreeCamera.js";
import ThreeRenderer from "./ThreeRenderer.js";
import ThreePostprocessing from "./ThreePostprocessing.js";
import GridObject from "./GridObject.js";

class ThreeApp {
	constructor() {
		this.canvas = document.querySelector("#three-canvas");
		this.scene = new ThreeScene();
		this.camera = new ThreeCamera();
		this.renderer = new ThreeRenderer(this.canvas);
		this.postprocessing = null;
		this.isRunning = false;
		this.gridObject = null;
	}

	init() {
		this.scene.init();
		this.camera.init();
		this.renderer.init();
		this.scene.createEnvironment(this.renderer.getRenderer());
		this.postprocessing = new ThreePostprocessing(this.renderer.getRenderer());
		this.postprocessing.init(this.scene.getScene(), this.camera.getCamera());

		this.createScene();
		this.resize();
		this.animate();
	}

	createScene() {
		const gridContainer = document.querySelector("#grid");
		this.gridObject = new GridObject(this.scene, this.camera, gridContainer);
	}

	resize() {
		window.addEventListener("resize", () => {
			this.camera.updateAspectRatio(window.innerWidth, window.innerHeight);
			this.renderer.handleResize();
			if (this.postprocessing) {
				this.postprocessing.handleResize();
			}
		});
	}

	animate() {
		requestAnimationFrame(() => this.animate());

		if (this.gridObject) {
			this.gridObject.update();
		}

		this.camera.update();

		if (this.postprocessing) {
			this.postprocessing.render();
		} else {
			this.renderer.render(this.scene.getScene(), this.camera.getCamera());
		}
	}
}

export default ThreeApp;
