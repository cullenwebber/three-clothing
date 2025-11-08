import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import BarrelDistortionPass from "./BarrelDistortionPass.js";

class ThreePostprocessing {
	constructor(renderer) {
		this.renderer = renderer;
		this.composer = null;
		this.passes = {};
	}

	init(scene, camera) {
		this.composer = new EffectComposer(this.renderer);

		const renderPass = new RenderPass(scene, camera);
		const barrelDistortionPass = new BarrelDistortionPass(0.8);
		const outputPass = new OutputPass();

		this.composer.addPass(renderPass);
		this.composer.addPass(barrelDistortionPass);
		this.composer.addPass(outputPass);

		this.passes.render = renderPass;
		this.passes.barrelDistortion = barrelDistortionPass;
		this.passes.output = outputPass;
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
