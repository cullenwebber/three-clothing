import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { WiggleRigHelper } from "wiggle/helper";
import { WiggleBone } from "wiggle/spring";

class WiggleChain {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.currentVelocity = new THREE.Vector3(0, 0, 0);
        this.velocityScale = 0.005;
        this.maxOffset = 2.0;
        this.wiggleBones = [];
        this.rootBone = null;
        this.isLoaded = false;
    }

    init() {
        this.load();
    }

    load() {
        const loader = new GLTFLoader();

        loader.load("/demo.glb", (gltf) => {
            this.group.add(gltf.scene);
            this.scene.add(this.group);

            const helper = new WiggleRigHelper({
                skeleton: gltf.scene.getObjectByName("Stick").skeleton,
                dotSize: 0.2,
                lineWidth: 0.02,
            });

            this.rootBone = gltf.scene.getObjectByName("Root");
            const b1 = gltf.scene.getObjectByName("Bone1");
            const b2 = gltf.scene.getObjectByName("Bone2");
            const b3 = gltf.scene.getObjectByName("Bone3");

            this.wiggleBones.push(
                new WiggleBone(b1, { stiffness: 700, damping: 28 })
            );
            this.wiggleBones.push(
                new WiggleBone(b2, { stiffness: 700, damping: 28 })
            );
            this.wiggleBones.push(
                new WiggleBone(b3, { stiffness: 700, damping: 28 })
            );

            this.isLoaded = true;
        });
    }

    update() {
        if (!this.isLoaded) return;

        // Apply velocity to root bone position
        if (this.rootBone && this.currentVelocity.length() > 0) {
            const offset = this.currentVelocity.clone().multiplyScalar(this.velocityScale);

            // Clamp offset to maxOffset
            if (offset.length() > this.maxOffset) {
                offset.normalize().multiplyScalar(this.maxOffset);
            }

            this.rootBone.position.add(offset);
        }

        // Update all wiggle bones
        this.wiggleBones.forEach((wb) => wb.update());
    }

    setVelocity(velocityX, velocityY) {
        this.currentVelocity.set(velocityX, 0, -velocityY);
    }

    getGroup() {
        return this.group;
    }
}

export default WiggleChain;
