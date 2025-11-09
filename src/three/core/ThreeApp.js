import ThreeScene from "./ThreeScene.js";
import ThreeCamera from "./ThreeCamera.js";
import ThreeRenderer from "./ThreeRenderer.js";
import ThreePostprocessing from "../postprocessing/ThreePostprocessing.js";
import GridObject from "../objects/GridObject.js";
import EventManager from "../utils/EventManager.js";

class ThreeApp {
	constructor() {
		this.canvas = document.querySelector("#three-canvas");
		this.scene = new ThreeScene();
		this.camera = new ThreeCamera();
		this.renderer = new ThreeRenderer(this.canvas);
		this.postprocessing = null;
		this.gridObject = null;
		this.eventManager = new EventManager();
	}

	init(gridRenderer) {
		this.scene.init();
		this.camera.init();
		this.renderer.init();
		this.scene.createEnvironment(this.renderer.getRenderer());
		this.postprocessing = new ThreePostprocessing(this.renderer.getRenderer());
		this.postprocessing.init(this.scene.getScene(), this.camera.getCamera());

		this.createScene(gridRenderer);
		this.resize();
		this.animate();
	}

	createScene(gridRenderer) {
		this.gridObject = new GridObject(
			this.scene,
			this.camera,
			document.querySelector("#grid"),
			gridRenderer
		);
	}

	animate() {
		requestAnimationFrame(() => this.animate());
		this.gridObject.update();
		this.camera.update();
		this.postprocessing.update();
		this.postprocessing.render();
	}

	resize() {
		this.eventManager.add(window, "resize", () => {
			this.camera.updateAspectRatio(window.innerWidth, window.innerHeight);
			this.renderer.handleResize();
			this.postprocessing.handleResize();
		});
	}
}

export default ThreeApp;
