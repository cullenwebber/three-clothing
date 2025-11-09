import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/Addons.js";

class ThreeScene {
	constructor() {
		this.scene = new THREE.Scene();
		this.objects = [];
	}

	init() {
		this.createBackground();
	}

	createEnvironment(renderer) {
		const pmremGenerator = new THREE.PMREMGenerator(renderer);
		this.scene.environment = pmremGenerator.fromScene(
			new RoomEnvironment(),
			0.01
		).texture;
		this.scene.environmentIntensity = 1.0;
		pmremGenerator.dispose();
	}

	createBackground() {
		this.scene.background = new THREE.Color(0xffffff);
	}

	addObject(object) {
		this.objects.push(object);
		this.scene.add(object);
		return object;
	}

	getScene() {
		return this.scene;
	}
}

export default ThreeScene;
