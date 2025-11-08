import WiggleObj from "./WiggleObj.js";
import WebGLText from "./WebGLText.js";
import BorderPlane from "./BorderPlane.js";

class GridObject {
	constructor(scene, camera, container) {
		this.scene = scene;
		this.camera = camera;
		this.container = container;

		// Track all grid items
		this.wiggleObjects = new Map();
		this.textInstances = new Map();
		this.borderInstances = new Map();

		this.initialised = false;
	}

	initialise() {
		if (this.initialised) return;

		const cells = this.container.querySelectorAll("[data-cell-id]");

		for (const cell of cells) {
			const cellId = cell.dataset.cellId;
			const wiggleObj = new WiggleObj(this.scene.getScene());

			this.wiggleObjects.set(cellId, {
				wiggleObj,
				cellElement: cell,
			});
		}

		this.initialised = true;
	}

	updateWigglePosition(cellId) {
		const tracked = this.wiggleObjects.get(cellId);
		if (!tracked || !tracked.cellElement) return;

		const rect = tracked.cellElement.getBoundingClientRect();

		// Calculate center position relative to viewport
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		// Convert to NDC (-1 to 1)
		const ndcX = (centerX / window.innerWidth) * 2 - 1;
		const ndcY = -((centerY / window.innerHeight) * 2 - 1);

		// Convert to world coordinates
		const cam = this.camera.getCamera();
		const distance = cam.position.z;
		const fov = cam.fov * (Math.PI / 180);
		const height = 2 * Math.tan(fov / 2) * distance;
		const width = height * cam.aspect;

		const worldX = ndcX * (width / 2);
		const worldY = ndcY * (height / 2);

		tracked.wiggleObj.setTargetPosition(worldX, worldY);
	}

	update() {
		if (!this.initialised) {
			this.initialise();
		}

		// Update wiggle objects
		for (const [cellId, tracked] of this.wiggleObjects.entries()) {
			this.updateWigglePosition(cellId);
			tracked.wiggleObj.update();
		}

		// Update text and borders
		this.updateTextAndBorders();
	}

	updateTextAndBorders() {
		// Update text
		this.updateTrackedInstances(
			".grid-item-text",
			this.textInstances,
			(element) =>
				new WebGLText(
					this.scene.getScene(),
					this.camera.getCamera(),
					element,
					this.container,
					{
						hideOriginal: true,
						zPosition: 0,
					}
				),
			(instance) => instance.updateText()
		);

		// Update borders
		this.updateTrackedInstances(
			".grid-item",
			this.borderInstances,
			(element) =>
				new BorderPlane(
					this.scene.getScene(),
					this.camera.getCamera(),
					element,
					this.container,
					{
						zPosition: 0,
						borderWidth: 0.5,
						borderColor: 0xbababa,
					}
				),
			(instance) => instance.updatePosition()
		);
	}

	updateTrackedInstances(selector, instanceMap, createFn, updateFn) {
		const elements = this.container.querySelectorAll(selector);
		const currentElements = new Set(elements);

		// Create or update instances
		elements.forEach((element) => {
			if (!instanceMap.has(element)) {
				instanceMap.set(element, createFn(element));
			} else {
				updateFn(instanceMap.get(element));
			}
		});

		// Clean up removed instances
		for (const [element, instance] of instanceMap.entries()) {
			if (!currentElements.has(element)) {
				instance.dispose();
				instanceMap.delete(element);
			}
		}
	}
}

export default GridObject;
