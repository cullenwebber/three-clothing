import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { WiggleBone } from "wiggle";

class WiggleObj {
	constructor(scene) {
		this.scene = scene;
		this.group = new THREE.Group();
		this.wiggleBones = [];
		this.rootBone = null;
		this.isLoaded = false;
		this.material = this.getMaterial();

		// Rotation state
		this.isHovered = false;
		this.rotationSpeed = 0.02;
		this.targetRotationY = 0;
		this.currentRotationY = 0;
		this.rotationDampingLambda = 8; // Higher = faster return to original position

		this.load();
	}

	load() {
		const loader = new GLTFLoader();

		// Setup Draco loader
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath(
			"https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
		);
		loader.setDRACOLoader(dracoLoader);

		loader.load("/hoodie.glb", (gltf) => {
			gltf.scene.traverse((child) => {
				if (!child.isMesh) return;
				child.material = this.material;
			});

			const box = new THREE.Box3().setFromObject(gltf.scene);
			const center = new THREE.Vector3();
			box.getCenter(center);
			gltf.scene.position.sub(center);

			this.group.add(gltf.scene);
			this.scene.add(this.group);

			this.rootBone = gltf.scene.getObjectByName("Root");

			const b1 = gltf.scene.getObjectByName("Bone1");

			this.wiggleBones.push(
				new WiggleBone(b1, {
					velocity: 0.4,
				})
			);

			this.isLoaded = true;
		});
	}

	getMaterial() {
		// Generate random greyscale color
		const greyValue = Math.random() > 0.5 ? 0.025 : 0.45;
		const greyColor = new THREE.Color(greyValue, greyValue, greyValue);

		return new THREE.MeshStandardMaterial({
			color: greyColor,
			metalness: 0.1,
			roughness: 1.0,
			side: THREE.DoubleSide,
		});
	}

	update(deltaTime = 0.016) {
		if (!this.isLoaded || !this.rootBone) return;

		this.wiggleBones.forEach((wb) => wb.update());

		// Rotate on hover
		if (this.isHovered) {
			this.currentRotationY += this.rotationSpeed;
		} else {
			// Smooth damping back to original position (0)
			this.currentRotationY = this.damp(
				this.currentRotationY,
				this.targetRotationY,
				this.rotationDampingLambda,
				deltaTime
			);
		}

		this.group.rotation.y = this.currentRotationY;
	}

	damp(current, target, lambda, dt) {
		return current + (target - current) * (1 - Math.exp(-lambda * dt));
	}

	setTargetPosition(x, y) {
		this.group.position.set(x, y, 0);
	}

	setHovered(isHovered) {
		this.isHovered = isHovered;
	}

	getGroup() {
		return this.group;
	}
}

export default WiggleObj;
