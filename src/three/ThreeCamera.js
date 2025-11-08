import * as THREE from "three";

class ThreeCamera {
	constructor(aspect = window.innerWidth / window.innerHeight) {
		this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
		this.defaultPosition = new THREE.Vector3(0, 0, 4);
		this.defaultLookAt = new THREE.Vector3(0, 0, 0);
	}

	init() {
		this.camera.position.copy(this.defaultPosition);
		this.camera.lookAt(this.defaultLookAt);
	}

	setPosition(x, y, z) {
		this.camera.position.set(x, y, z);
	}

	lookAt(x, y, z) {
		this.camera.lookAt(new THREE.Vector3(x, y, z));
	}

	setAspect(aspect) {
		this.camera.aspect = aspect;
		this.camera.updateProjectionMatrix();
	}

	updateAspectRatio(width, height) {
		this.setAspect(width / height);
	}

	getCamera() {
		return this.camera;
	}

	update(time) {}
}

export default ThreeCamera;
