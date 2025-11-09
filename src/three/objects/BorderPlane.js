import * as THREE from "three";
import TrackedObject from "./TrackedObject.js";
import gsap from "gsap";

class BorderPlane extends TrackedObject {
	constructor(scene, camera, element, container = null, config = {}) {
		super(scene, camera, element, container, {
			borderWidth: 0.5,
			borderColor: 0x000000,
			...config,
		});

		this.createPlane();
		this.scene.add(this.mesh);
		this.updatePosition();
	}

	createPlane() {
		const geometry = new THREE.PlaneGeometry(1, 1);
		const material = this.createMaterial();
		this.mesh = new THREE.Mesh(geometry, material);
	}

	createMaterial() {
		return new THREE.ShaderMaterial({
			transparent: true,
			uniforms: {
				uBorderWidth: { value: this.config.borderWidth },
				uBorderColor: { value: new THREE.Color(this.config.borderColor) },
				uResolution: { value: new THREE.Vector2(1, 1) },
				uOpacity: { value: 1.0 },
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
				uniform float uOpacity;

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
					float alpha = border * uOpacity;

					if (alpha < 0.01) discard;

					gl_FragColor = vec4(uBorderColor, alpha);
				}
			`,
		});
	}

	updatePosition() {
		if (!this.element) {
			this.mesh.visible = false;
			return;
		}

		this.mesh.visible = true;

		const rect = this.getElementRect();
		const { worldX, worldY } = this.getWorldPosition();

		const worldSize = this.getWorldSizeFromPixels({
			width: rect.width,
			height: rect.height,
		});

		this.mesh.scale.set(worldSize.width, worldSize.height, 1);
		this.mesh.material.uniforms.uResolution.value.set(rect.width, rect.height);
		this.mesh.position.set(worldX, worldY, this.config.zPosition);
	}

	fadeOut() {
		gsap.to(this.mesh.material.uniforms.uOpacity, {
			value: 0.0,
			duration: 0.5,
			ease: "power2.out",
		});
	}

	fadeIn() {
		const targetColor = new THREE.Color(this.config.borderColor);
		gsap.to(this.mesh.material.uniforms.uOpacity, {
			delay: 0.5,
			value: 1.0,
			duration: 0.5,
			ease: "power2.in",
		});
	}
}

export default BorderPlane;
