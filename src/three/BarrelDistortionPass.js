import {
	Pass,
	FullScreenQuad,
} from "three/examples/jsm/postprocessing/Pass.js";
import * as THREE from "three";

class BarrelDistortionPass extends Pass {
	constructor(strength = 0.3, chromaticAberration = 0.02) {
		super();

		this.uniforms = {
			tDiffuse: { value: null },
			uStrength: { value: strength },
			uChromaticAberration: { value: chromaticAberration },
		};

		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: /*glsl*/ `
				varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: /*glsl*/ `
				uniform sampler2D tDiffuse;
				uniform float uStrength;
				uniform float uChromaticAberration;
				varying vec2 vUv;

				vec2 pincushionDistortion(vec2 uv, float strength) {
					vec2 st = uv - 0.5;
					float r2 = dot(st, st);
					float radius = 1.0 + strength * r2;
					return 0.5 + st / radius;
				}

				void main() {
					// Calculate distance from center for chromatic aberration
					vec2 toCenter = vUv - 0.5;
					float dist = length(toCenter);

					vec2 uvR = pincushionDistortion(vUv, uStrength + uChromaticAberration * dist);
					vec2 uvG = pincushionDistortion(vUv, uStrength);
					vec2 uvB = pincushionDistortion(vUv, uStrength - uChromaticAberration * dist);

					// Sample each channel separately
					float r = texture2D(tDiffuse, uvR).r;
					float g = texture2D(tDiffuse, uvG).g;
					float b = texture2D(tDiffuse, uvB).b;

					// Check if any UV is out of bounds
					bool outOfBounds =
						uvR.x < 0.0 || uvR.x > 1.0 || uvR.y < 0.0 || uvR.y > 1.0 ||
						uvG.x < 0.0 || uvG.x > 1.0 || uvG.y < 0.0 || uvG.y > 1.0 ||
						uvB.x < 0.0 || uvB.x > 1.0 || uvB.y < 0.0 || uvB.y > 1.0;

					if (outOfBounds) {
						gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
					} else {
						gl_FragColor = vec4(r, g, b, 1.0);
					}
				}
			`,
		});

		this.fsQuad = new FullScreenQuad(this.material);
	}

	render(renderer, writeBuffer, readBuffer) {
		this.uniforms.tDiffuse.value = readBuffer.texture;

		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);
		} else {
			renderer.setRenderTarget(writeBuffer);
			if (this.clear) renderer.clear();
			this.fsQuad.render(renderer);
		}
	}
}

export default BarrelDistortionPass;
