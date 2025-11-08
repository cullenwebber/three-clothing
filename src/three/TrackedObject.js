class TrackedObject {
	constructor(scene, camera, element, container = null, config = {}) {
		this.scene = scene;
		this.camera = camera;
		this.element = element;
		this.container = container;
		this.config = {
			zPosition: 0,
			...config,
		};
	}

	getFrustumDimensions(zPosition = 0) {
		const distance = Math.abs(this.camera.position.z - zPosition);
		const fov = this.camera.fov * (Math.PI / 180);
		const aspect = this.camera.aspect;
		const height = 2 * Math.tan(fov / 2) * distance;
		const width = height * aspect;
		return { width, height };
	}

	getWorldSizeFromPixels(options) {
		const containerRect = this.getContainerRect();
		const { width: frustumWidth, height: frustumHeight } =
			this.getFrustumDimensions(this.config.zPosition);
		const result = {};

		if (options.width !== undefined) {
			const worldUnitsPerPixel = frustumWidth / containerRect.width;
			result.width = options.width * worldUnitsPerPixel;
		}

		if (options.height !== undefined) {
			const worldUnitsPerPixel = frustumHeight / containerRect.height;
			result.height = options.height * worldUnitsPerPixel;
		}

		return result;
	}

	getContainerRect() {
		if (this.container) {
			return this.container.getBoundingClientRect();
		}
		return {
			left: 0,
			top: 0,
			width: window.innerWidth,
			height: window.innerHeight,
		};
	}

	getWorldPosition() {
		const rect = this.element.getBoundingClientRect();
		const containerRect = this.getContainerRect();

		const centerX = rect.left + rect.width / 2 - containerRect.left;
		const centerY = rect.top + rect.height / 2 - containerRect.top;

		const ndcX = (centerX / containerRect.width) * 2 - 1;
		const ndcY = -((centerY / containerRect.height) * 2 - 1);

		const { width: frustumWidth, height: frustumHeight } =
			this.getFrustumDimensions(this.config.zPosition);
		const worldX = ndcX * (frustumWidth / 2);
		const worldY = ndcY * (frustumHeight / 2);

		return { worldX, worldY };
	}

	getElementRect() {
		return this.element.getBoundingClientRect();
	}

	dispose() {
		// Override in subclasses
	}
}

export default TrackedObject;
