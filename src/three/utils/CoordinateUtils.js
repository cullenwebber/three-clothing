/**
 * Utility class for coordinate transformations between screen space and 3D world space
 */
class CoordinateUtils {
	/**
	 * Get the frustum dimensions at a given Z position
	 * @param {THREE.Camera} camera - The camera
	 * @param {number} zPosition - The Z position in world space
	 * @returns {{width: number, height: number}} Frustum dimensions in world units
	 */
	static getFrustumDimensions(camera, zPosition = 0) {
		const distance = Math.abs(camera.position.z - zPosition);
		const fov = camera.fov * (Math.PI / 180);
		const aspect = camera.aspect;
		const height = 2 * Math.tan(fov / 2) * distance;
		const width = height * aspect;
		return { width, height };
	}

	/**
	 * Convert pixel dimensions to world space dimensions
	 * @param {THREE.Camera} camera - The camera
	 * @param {DOMRect} containerRect - The container bounding rectangle
	 * @param {{width?: number, height?: number}} pixelDimensions - Pixel dimensions to convert
	 * @param {number} zPosition - The Z position in world space
	 * @returns {{width?: number, height?: number}} World space dimensions
	 */
	static pixelsToWorld(camera, containerRect, pixelDimensions, zPosition = 0) {
		const { width: frustumWidth, height: frustumHeight } =
			this.getFrustumDimensions(camera, zPosition);
		const result = {};

		if (pixelDimensions.width !== undefined) {
			const worldUnitsPerPixel = frustumWidth / containerRect.width;
			result.width = pixelDimensions.width * worldUnitsPerPixel;
		}

		if (pixelDimensions.height !== undefined) {
			const worldUnitsPerPixel = frustumHeight / containerRect.height;
			result.height = pixelDimensions.height * worldUnitsPerPixel;
		}

		return result;
	}

	/**
	 * Convert screen position to world position
	 * @param {THREE.Camera} camera - The camera
	 * @param {number} screenX - Screen X coordinate (pixels)
	 * @param {number} screenY - Screen Y coordinate (pixels)
	 * @param {DOMRect} containerRect - The container bounding rectangle
	 * @param {number} zPosition - The Z position in world space
	 * @returns {{x: number, y: number}} World space coordinates
	 */
	static screenToWorld(camera, screenX, screenY, containerRect, zPosition = 0) {
		// Convert to NDC (-1 to 1)
		const ndcX = (screenX / containerRect.width) * 2 - 1;
		const ndcY = -((screenY / containerRect.height) * 2 - 1);

		// Get frustum dimensions at the given Z position
		const { width: frustumWidth, height: frustumHeight } =
			this.getFrustumDimensions(camera, zPosition);

		// Convert NDC to world coordinates
		const x = ndcX * (frustumWidth / 2);
		const y = ndcY * (frustumHeight / 2);

		return { x, y };
	}

	/**
	 * Get the world position of a DOM element's center
	 * @param {THREE.Camera} camera - The camera
	 * @param {HTMLElement} element - The DOM element
	 * @param {DOMRect|null} containerRect - Optional container rect (defaults to viewport)
	 * @param {number} zPosition - The Z position in world space
	 * @returns {{x: number, y: number}} World space coordinates
	 */
	static elementToWorld(camera, element, containerRect = null, zPosition = 0) {
		const rect = element.getBoundingClientRect();

		// Use viewport if no container specified
		const container = containerRect || {
			left: 0,
			top: 0,
			width: window.innerWidth,
			height: window.innerHeight,
		};

		// Calculate center position relative to container
		const centerX = rect.left + rect.width / 2 - container.left;
		const centerY = rect.top + rect.height / 2 - container.top;

		return this.screenToWorld(camera, centerX, centerY, container, zPosition);
	}
}

export default CoordinateUtils;
