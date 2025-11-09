import ThreeScene from "./ThreeScene.js";
import ThreeCamera from "./ThreeCamera.js";
import ThreeRenderer from "./ThreeRenderer.js";
import ThreePostprocessing from "../postprocessing/ThreePostprocessing.js";
import GridObject from "../objects/GridObject.js";
import EventManager from "../utils/EventManager.js";

class ThreeApp {
	constructor() {
		this.scene = new ThreeScene();
		this.camera = new ThreeCamera();
		this.renderer = new ThreeRenderer(document.querySelector("#three-canvas"));
		this.eventManager = new EventManager();
		this.postprocessing = null;
		this.gridObject = null;
	}

	init(gridRenderer) {
		this.scene.init();
		this.camera.init();
		this.renderer.init();
		this.scene.createEnvironment(this.renderer.getRenderer());
		this.postprocessing = new ThreePostprocessing(this.renderer.getRenderer());
		this.postprocessing.init(this.scene.getScene(), this.camera.getCamera());

		this.addObjects(gridRenderer);
		this.resize();
		this.animate();
	}

	addObjects(gridRenderer) {
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
