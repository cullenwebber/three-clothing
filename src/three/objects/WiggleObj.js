import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { WiggleBone } from "wiggle";
import MathUtils from "../../utils/Math";
import gsap from "gsap";

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
		this.rotationSpeed = 0.025;
		this.targetRotationY = 0;
		this.currentRotationY = 0;
		this.rotationDampingLambda = 5;
		this.configureLoader();
		this.load();
	}

	configureLoader() {
		this.loader = new GLTFLoader();
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath(
			"https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
		);
		this.loader.setDRACOLoader(dracoLoader);
	}

	load() {
		this.loader.load("/hoodie.glb", (gltf) => {
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
			const b2 = gltf.scene.getObjectByName("Bone2");

			const velocity = 0.3;

			this.wiggleBones.push(
				new WiggleBone(b1, {
					velocity,
				}),
				new WiggleBone(b2, {
					velocity,
				})
			);

			this.isLoaded = true;
		});
	}

	getMaterial() {
		// Generate random greyscale color
		const greyValue = Math.random() > 0.5 ? 0.03 : 0.5;
		const greyColor = new THREE.Color(greyValue, greyValue, greyValue);

		return new THREE.MeshStandardMaterial({
			color: greyColor,
			metalness: 0,
			roughness: 1,
			side: THREE.DoubleSide,
		});
	}

	update(deltaTime = 0.016) {
		if (!this.isLoaded || !this.rootBone) return;

		this.wiggleBones.forEach((wb) => wb.update());

		if (this.isHovered) {
			this.currentRotationY += this.rotationSpeed;
		} else {
			this.currentRotationY = MathUtils.damp(
				this.currentRotationY,
				this.targetRotationY,
				this.rotationDampingLambda,
				deltaTime
			);
		}

		this.group.rotation.y = this.currentRotationY;
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

	fadeOut() {
		gsap.to(this.group.scale, {
			x: 0.00001,
			y: 0.00001,
			z: 0.00001,
			duration: 0.5,
			ease: "power1.inOut",
		});
	}

	fadeIn() {
		gsap.to(this.group.scale, {
			delay: 0.25,
			x: 1,
			y: 1,
			z: 1,
			duration: 0.5,
			ease: "power1.inOut",
		});
	}
}

export default WiggleObj;
