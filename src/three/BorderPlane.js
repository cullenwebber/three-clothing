import * as THREE from "three";

class BorderPlane {
	constructor(scene, camera, element, container = null, config = {}) {
		this.scene = scene;
		this.camera = camera;
		this.element = element;
		this.container = container;

		this.config = {
			zPosition: config.zPosition || 0,
			borderWidth: config.borderWidth || 0.5, // pixels
			borderColor: config.borderColor || 0x000000,
			...config,
		};

		this.createPlane();
		this.scene.add(this.mesh);
		this.updatePosition();
	}

	createPlane() {
		const geometry = new THREE.PlaneGeometry(1, 1);

		// Shader material for border
		const material = new THREE.ShaderMaterial({
			transparent: true,
			uniforms: {
				uBorderWidth: { value: this.config.borderWidth },
				uBorderColor: { value: new THREE.Color(this.config.borderColor) },
				uResolution: { value: new THREE.Vector2(1, 1) },
			},
			vertexShader: /*glsl*/ `
				varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: /*glsl*/ `
				uniform vec3 uBorderColor;
				uniform float uBorderWidth;
				uniform vec2 uResolution;

				varying vec2 vUv;

				void main() {
					vec2 pixelSize = 1.0 / uResolution;
					float borderX = uBorderWidth * pixelSize.x;
					float borderY = uBorderWidth * pixelSize.y;

					// Check if we're in the border region
					float isLeftBorder = step(vUv.x, borderX);
					float isRightBorder = step(1.0 - borderX, vUv.x);
					float isTopBorder = step(1.0 - borderY, vUv.y);
					float isBottomBorder = step(vUv.y, borderY);

					float border = max(max(isLeftBorder, isRightBorder), max(isTopBorder, isBottomBorder));

					gl_FragColor = vec4(uBorderColor, border);
				}
			`,
		});

		this.mesh = new THREE.Mesh(geometry, material);
	}

	updatePosition() {
		if (!this.element) {
			this.mesh.visible = false;
			return;
		}

		this.mesh.visible = true;

		const rect = this.element.getBoundingClientRect();
		const containerRect = this.getContainerRect();

		// Calculate center position relative to container
		const centerX = rect.left + rect.width / 2 - containerRect.left;
		const centerY = rect.top + rect.height / 2 - containerRect.top;

		// Convert to NDC coordinates
		const ndcX = (centerX / containerRect.width) * 2 - 1;
		const ndcY = -((centerY / containerRect.height) * 2 - 1);

		// Convert to world coordinates
		const { width: frustumWidth, height: frustumHeight } =
			this.getFrustumDimensions(this.config.zPosition);
		const worldX = ndcX * (frustumWidth / 2);
		const worldY = ndcY * (frustumHeight / 2);

		// Convert element size to world units
		const worldSize = this.getWorldSizeFromPixels({
			width: rect.width,
			height: rect.height,
		});

		// Update plane scale to match element size
		this.mesh.scale.set(worldSize.width, worldSize.height, 1);

		// Update resolution uniform for pixel-perfect border
		this.mesh.material.uniforms.uResolution.value.set(rect.width, rect.height);

		// Set position
		this.mesh.position.set(worldX, worldY, this.config.zPosition);
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
}

export default BorderPlane;
