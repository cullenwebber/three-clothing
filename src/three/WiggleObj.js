import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { WiggleBone } from "wiggle/spring";

class WiggleObj {
	constructor(scene) {
		this.scene = scene;
		this.group = new THREE.Group();
		this.wiggleBones = [];
		this.rootBone = null;
		this.isLoaded = false;
		this.material = this.getMaterial();

		this.load();
	}

	load() {
		const stiffness = 350;
		const damping = 18;
		const loader = new GLTFLoader();

		loader.load("/demo.glb", (gltf) => {
			gltf.scene.traverse((child) => {
				if (!child.isMesh) return;
				child.material = this.material;
			});

			// Manual centering using Box3
			const box = new THREE.Box3().setFromObject(gltf.scene);
			const center = new THREE.Vector3();
			box.getCenter(center);

			// Offset the scene so its center is at (0,0,0)
			gltf.scene.position.sub(center);

			this.group.add(gltf.scene);
			this.scene.add(this.group);

			this.rootBone = gltf.scene.getObjectByName("Root");

			const b1 = gltf.scene.getObjectByName("Bone1");
			const b2 = gltf.scene.getObjectByName("Bone2");
			const b3 = gltf.scene.getObjectByName("Bone3");

			this.wiggleBones.push(new WiggleBone(b1, { stiffness, damping }));
			this.wiggleBones.push(new WiggleBone(b2, { stiffness, damping }));
			this.wiggleBones.push(new WiggleBone(b3, { stiffness, damping }));

			this.isLoaded = true;
		});
	}

	getMaterial() {
		return new THREE.MeshStandardMaterial({
			color: 0xffffff,
			metalness: 0.9,
			roughness: 0.2,
		});
	}

	update() {
		if (!this.isLoaded || !this.rootBone) return;

		this.wiggleBones.forEach((wb) => wb.update());
	}

	setTargetPosition(x, y) {
		this.group.position.set(x, y, 0);
	}

	getGroup() {
		return this.group;
	}
}

export default WiggleObj;
