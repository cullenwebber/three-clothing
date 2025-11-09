import * as THREE from "three";

class ThreeRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.renderer = null;
	}

	init() {
		this.setupRenderer();
		this.handleResize();
	}

	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: false,
		});

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		// this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		// this.renderer.toneMappingExposure = 1.0;
	}

	render(scene, camera) {
		this.renderer.render(scene, camera);
	}

	handleResize() {
		const width = window.innerWidth;
		const height = window.innerHeight;

		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	getRenderer() {
		return this.renderer;
	}
}

export default ThreeRenderer;
