import WebGLText from "./WebGLText.js";
import BorderPlane from "./BorderPlane.js";

class GridTextTracker {
	constructor(scene, camera, gridContainer) {
		this.scene = scene;
		this.camera = camera;
		this.gridContainer = gridContainer;
		this.textInstances = new Map();
		this.borderInstances = new Map();
	}

	update() {
		const textElements = this.gridContainer.querySelectorAll(".grid-item-text");
		const gridItems = this.gridContainer.querySelectorAll(".grid-item");

		const currentTextElements = new Set();
		const currentGridItems = new Set();

		// Update text elements
		textElements.forEach((element) => {
			currentTextElements.add(element);

			if (!this.textInstances.has(element)) {
				const webglText = new WebGLText(
					this.scene,
					this.camera,
					element,
					this.gridContainer,
					{
						hideOriginal: true,
						zPosition: 0,
					}
				);
				this.textInstances.set(element, webglText);
			} else {
				this.textInstances.get(element).updateText();
			}
		});

		// Update border planes for grid items
		gridItems.forEach((element) => {
			currentGridItems.add(element);

			if (!this.borderInstances.has(element)) {
				const borderPlane = new BorderPlane(
					this.scene,
					this.camera,
					element,
					this.gridContainer,
					{
						zPosition: 0,
						borderWidth: 0.75,
						borderColor: 0x000000,
					}
				);
				this.borderInstances.set(element, borderPlane);
			} else {
				this.borderInstances.get(element).updatePosition();
			}
		});
	}
}

export default GridTextTracker;
