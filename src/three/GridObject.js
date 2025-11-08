import WiggleObj from "./WiggleObj.js";
import GridTextTracker from "./GridTextTracker.js";

class GridObject {
	constructor(scene, camera, container) {
		this.scene = scene;
		this.camera = camera;
		this.container = container;
		this.wiggleObjects = new Map();
		this.initialized = false;

		// Initialize text tracker
		this.textTracker = new GridTextTracker(
			scene.getScene(),
			camera.getCamera(),
			container
		);
	}

	initialize() {
		if (this.initialized) return;

		const cells = this.container.querySelectorAll("[data-cell-id]");

		for (const cell of cells) {
			const cellId = cell.dataset.cellId;
			const wiggleObj = new WiggleObj(this.scene.getScene());

			this.wiggleObjects.set(cellId, {
				wiggleObj,
				cellElement: cell,
			});
		}

		this.initialized = true;
	}

	updatePosition(cellId) {
		const tracked = this.wiggleObjects.get(cellId);
		if (!tracked || !tracked.cellElement) return;

		const rect = tracked.cellElement.getBoundingClientRect();
		const containerRect = this.container.getBoundingClientRect();

		// Calculate center position relative to viewport
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		// Convert to NDC (-1 to 1)
		const ndcX = (centerX / window.innerWidth) * 2 - 1;
		const ndcY = -((centerY / window.innerHeight) * 2 - 1);

		// Convert to world coordinates
		const { width, height } = this.getFrustumDimensions();
		const worldX = ndcX * (width / 2);
		const worldY = ndcY * (height / 2);

		tracked.wiggleObj.setTargetPosition(worldX, worldY);
	}

	updateGridItems() {
		// Initialize if needed
		if (!this.initialized) {
			this.initialize();
		}

		// Update positions for all cells
		for (const cellId of this.wiggleObjects.keys()) {
			this.updatePosition(cellId);
		}
	}

	getFrustumDimensions() {
		const cam = this.camera.getCamera();
		const distance = cam.position.z;
		const fov = cam.fov * (Math.PI / 180);
		const height = 2 * Math.tan(fov / 2) * distance;
		const width = height * cam.aspect;
		return { width, height };
	}

	update() {
		// Update positions and wiggle animations for all cells
		for (const [cellId, tracked] of this.wiggleObjects.entries()) {
			this.updatePosition(cellId);
			tracked.wiggleObj.update();
		}

		// Update WebGL text tracking
		this.textTracker.update();
	}

	dispose() {
		// Clean up text tracker
		if (this.textTracker) {
			this.textTracker.dispose();
		}

		// Clean up wiggle objects
		for (const tracked of this.wiggleObjects.values()) {
			if (tracked.wiggleObj && tracked.wiggleObj.dispose) {
				tracked.wiggleObj.dispose();
			}
		}
		this.wiggleObjects.clear();
	}
}

export default GridObject;
