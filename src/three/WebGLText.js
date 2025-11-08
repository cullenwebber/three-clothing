import * as THREE from "three";
import { Text } from "troika-three-text";
import TrackedObject from "./TrackedObject.js";

class WebGLText extends TrackedObject {
	constructor(scene, camera, element, container = null, config = {}) {
		super(scene, camera, element, container, {
			hideOriginal: config.hideOriginal !== false,
			material: config.material,
			...config,
		});

		this.enabled = true;
		this.createMesh();
		this.scene.add(this.mesh);
		this.updateText();

		if (this.config.hideOriginal) {
			this.element.style.opacity = 0;
		}
	}

	createMesh() {
		this.mesh = new Text();
		this.mesh.font = "/public/geistMono.ttf";
		this.mesh.text = this.element.innerText;
		this.mesh.anchorX = "left";
		this.mesh.anchorY = "top";

		if (this.config.material) {
			this.mesh.material = this.config.material;
		} else {
			const color = new THREE.Color(
				window.getComputedStyle(this.element).color
			);
			this.mesh.material = new THREE.MeshBasicMaterial({
				color: color,
				transparent: true,
			});
		}

		// Make text thicker/bolder
		this.mesh.outlineWidth = 0.0015;
		this.mesh.outlineColor = new THREE.Color(
			window.getComputedStyle(this.element).color
		);

		this.applyTextStyles();
	}

	applyTextStyles() {
		const styles = window.getComputedStyle(this.element);
		const fontSize = parseFloat(styles.fontSize);
		const worldSize = this.getWorldSizeFromPixels({ height: fontSize });

		this.mesh.fontSize = worldSize.height;
		this.mesh.color = new THREE.Color(styles.color);
	}

	updateText() {
		if (!this.enabled || !this.element) {
			this.mesh.visible = false;
			return;
		}

		this.mesh.visible = true;

		const currentText = this.element.innerText;
		if (this.mesh.text !== currentText) {
			this.mesh.text = currentText;
		}

		const rect = this.getElementRect();
		const containerRect = this.getContainerRect();

		this.applyTextStyles();

		const relativeLeft = rect.left - containerRect.left;
		const relativeTop = rect.top - containerRect.top;

		const ndcX = (relativeLeft / containerRect.width) * 2 - 1;
		const ndcY = -((relativeTop / containerRect.height) * 2 - 1);

		const { width, height } = this.getFrustumDimensions(this.config.zPosition);
		const worldX = ndcX * (width / 2);
		const worldY = ndcY * (height / 2);

		this.mesh.position.set(worldX, worldY, this.config.zPosition);
		this.mesh.sync();
	}

	dispose() {
		this.scene.remove(this.mesh);
		if (this.mesh.dispose) {
			this.mesh.dispose();
		}
		if (this.mesh.material && this.mesh.material.dispose) {
			this.mesh.material.dispose();
		}
		if (this.config.hideOriginal && this.element) {
			this.element.style.opacity = "";
		}
	}
}

export default WebGLText;
