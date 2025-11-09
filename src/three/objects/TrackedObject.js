import CoordinateUtils from "../utils/CoordinateUtils.js";

class TrackedObject {
	constructor(scene, camera, element, container = null, config = {}) {
		this.scene = scene;
		this.camera = camera;
		this.element = element;
		this.config = {
			zPosition: 0,
			...config,
		};
	}

	getFrustumDimensions(zPosition = 0) {
		return CoordinateUtils.getFrustumDimensions(this.camera, zPosition);
	}

	getWorldSizeFromPixels(options) {
		const containerRect = this.getContainerRect();
		return CoordinateUtils.pixelsToWorld(
			this.camera,
			containerRect,
			options,
			this.config.zPosition
		);
	}

	getContainerRect() {
		return {
			left: 0,
			top: 0,
			width: window.innerWidth,
			height: window.innerHeight,
		};
	}

	getWorldPosition() {
		const containerRect = this.getContainerRect();
		const { x, y } = CoordinateUtils.elementToWorld(
			this.camera,
			this.element,
			containerRect,
			this.config.zPosition
		);
		return { worldX: x, worldY: y };
	}

	getElementRect() {
		return this.element.getBoundingClientRect();
	}
}

export default TrackedObject;
