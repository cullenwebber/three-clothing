import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import BarrelDistortionPass from "./BarrelDistortionPass.js";

class ThreePostprocessing {
	constructor(renderer) {
		this.renderer = renderer;
		this.composer = null;
		this.passes = {};

		// Distortion state
		this.isDragging = false;
		this.currentDistortion = 0.4;
		this.targetDistortion = 0.4;
		this.currentChromaticAberration = 0.02;
		this.targetChromaticAberration = 0.02;
		this.distortionLambda = 8;
		this.lastDistortionTime = performance.now();

		// Distortion values
		this.dragDistortion = 1.6;
		this.idleDistortion = 0.4;
		this.dragChromaticAberration = 0.06;
		this.idleChromaticAberration = 0.02;
	}

	init(scene, camera) {
		this.composer = new EffectComposer(this.renderer);

		const renderPass = new RenderPass(scene, camera);

		// Barrel distortion with chromatic aberration - start with idle values
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

		// Smooth damping for both effects
		const dampFactor = 1 - Math.exp(-this.distortionLambda * dt);

		this.currentDistortion =
			this.currentDistortion +
			(this.targetDistortion - this.currentDistortion) * dampFactor;

		this.currentChromaticAberration =
			this.currentChromaticAberration +
			(this.targetChromaticAberration - this.currentChromaticAberration) *
				dampFactor;

		// Update the barrel distortion pass
		if (this.passes.barrelDistortion) {
			this.passes.barrelDistortion.uniforms.uStrength.value =
				this.currentDistortion;
			this.passes.barrelDistortion.uniforms.uChromaticAberration.value =
				this.currentChromaticAberration;
		}
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
}

export default ThreePostprocessing;
