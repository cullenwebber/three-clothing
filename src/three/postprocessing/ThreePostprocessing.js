import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import BarrelDistortionPass from "./BarrelDistortionPass.js";
import MathUtils from "../../utils/Math.js";
import EventManager from "../utils/EventManager.js";

class ThreePostprocessing {
	constructor(renderer) {
		this.renderer = renderer;
		this.composer = null;
		this.passes = {};

		// Distortion state
		this.isDragging = false;

		this.currentChromaticAberration = 0.02;
		this.targetChromaticAberration = 0.02;
		this.distortionLambda = 8;
		this.lastDistortionTime = performance.now();

		// Distortion values
		this.dragDistortion = 1.6;
		this.idleDistortion = 0.6;
		this.currentDistortion = this.idleDistortion;
		this.targetDistortion = this.idleDistortion;
		this.dragChromaticAberration = 0.06;
		this.idleChromaticAberration = 0.02;

		// Event manager
		this.eventManager = new EventManager();
		this.setupDragListeners();
	}

	init(scene, camera) {
		this.composer = new EffectComposer(this.renderer);

		const renderPass = new RenderPass(scene, camera);
		const barrelDistortionPass = new BarrelDistortionPass(
			this.idleDistortion,
			this.idleChromaticAberration
		);

		const outputPass = new OutputPass();

		// Add passes in order
		this.composer.addPass(renderPass);
		this.composer.addPass(barrelDistortionPass);
		this.composer.addPass(outputPass);

		this.passes.render = renderPass;
		this.passes.barrelDistortion = barrelDistortionPass;
		this.passes.output = outputPass;
	}

	setupDragListeners() {
		const gridContainer = document.querySelector("#grid");
		if (!gridContainer) return;

		this.eventManager.add(gridContainer, "mousedown", () => {
			this.setDragging(true);
		});

		this.eventManager.add(document, "mouseup", () => {
			this.setDragging(false);
		});

		this.eventManager.add(gridContainer, "touchstart", () => {
			this.setDragging(true);
		});

		this.eventManager.add(document, "touchend", () => {
			this.setDragging(false);
		});
	}

	setDragging(isDragging) {
		this.isDragging = isDragging;
		this.targetDistortion = isDragging
			? this.dragDistortion
			: this.idleDistortion;
		this.targetChromaticAberration = isDragging
			? this.dragChromaticAberration
			: this.idleChromaticAberration;
	}

	update() {
		const now = performance.now();
		const dt = Math.min((now - this.lastDistortionTime) / 1000, 0.1);
		this.lastDistortionTime = now;

		this.currentDistortion = MathUtils.damp(
			this.currentDistortion,
			this.targetDistortion,
			this.distortionLambda,
			dt
		);

		this.currentChromaticAberration = MathUtils.damp(
			this.currentChromaticAberration,
			this.targetChromaticAberration,
			this.distortionLambda,
			dt
		);

		this.passes.barrelDistortion.uniforms.uStrength.value =
			this.currentDistortion;
		this.passes.barrelDistortion.uniforms.uChromaticAberration.value =
			this.currentChromaticAberration;
	}

	render() {
		this.composer && this.composer.render();
	}

	handleResize() {
		if (!this.composer) return;
		this.composer.setSize(window.innerWidth, window.innerHeight);
		this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	getComposer() {
		return this.composer;
	}

	getPass(name) {
		return this.passes[name];
	}

	dispose() {
		this.eventManager.dispose();
	}
}

export default ThreePostprocessing;
