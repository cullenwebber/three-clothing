import GridRenderer from "./GridRenderer.js";
import MathUtils from "../utils/Math.js";
import EventManager from "../three/utils/EventManager.js";

class Grid {
	constructor() {
		this.gridContainer = document.querySelector("#grid");
		this.renderer = new GridRenderer(this.gridContainer, 500);

		// Position
		this.offsetX = 0;
		this.offsetY = 0;
		this.targetOffsetX = 0;
		this.targetOffsetY = 0;

		// Drag
		this.isDragging = false;
		this.dragStartX = 0;
		this.dragStartY = 0;

		// Velocity tracking
		this.velocityX = 0;
		this.velocityY = 0;
		this.lastMouseX = 0;
		this.lastMouseY = 0;
		this.lastTime = 0;

		// Animation
		this.animationRAF = null;
		this.lastFrameTime = performance.now();

		// Damping
		this.mathUtils = new MathUtils();
		this.dampingLambda = 5; // Higher = faster response (try 5-20)

		// Event management
		this.eventManager = new EventManager();

		// Callbacks
		this.onDragStateChange = null;
	}

	init() {
		this.setupEventListeners();
		this.updateGrid();
		this.startRenderLoop();
	}

	setupEventListeners() {
		this.eventManager.add(this.gridContainer, "mousedown", (e) =>
			this.startDrag(e)
		);
		this.eventManager.add(document, "mousemove", (e) => this.drag(e));
		this.eventManager.add(document, "mouseup", () => this.endDrag());

		this.eventManager.add(
			this.gridContainer,
			"touchstart",
			(e) => this.startDrag(e.touches[0]),
			{ passive: false }
		);
		this.eventManager.add(
			document,
			"touchmove",
			(e) => {
				if (this.isDragging) {
					e.preventDefault();
					this.drag(e.touches[0]);
				}
			},
			{ passive: false }
		);
		this.eventManager.add(document, "touchend", () => this.endDrag());

		this.eventManager.add(window, "resize", () => this.updateGrid());
	}

	startDrag(e) {
		this.isDragging = true;
		this.dragStartX = e.clientX - this.offsetX;
		this.dragStartY = e.clientY - this.offsetY;
		this.lastMouseX = e.clientX;
		this.lastMouseY = e.clientY;
		this.lastTime = performance.now();

		this.gridContainer.style.cursor = "grabbing";

		if (this.onDragStateChange) {
			this.onDragStateChange(true);
		}
	}

	drag(e) {
		if (!this.isDragging) return;

		// Calculate velocity with clamping
		const now = performance.now();
		const dt = now - this.lastTime;
		if (dt > 0 && dt < 100) {
			// Ignore huge time gaps
			const rawVelX = ((e.clientX - this.lastMouseX) / dt) * 16;
			const rawVelY = ((e.clientY - this.lastMouseY) / dt) * 16;

			// Clamp velocity to prevent spikes
			const maxVel = 50;
			this.velocityX = Math.max(-maxVel, Math.min(maxVel, rawVelX));
			this.velocityY = Math.max(-maxVel, Math.min(maxVel, rawVelY));
		}

		this.lastMouseX = e.clientX;
		this.lastMouseY = e.clientY;
		this.lastTime = now;

		// Update target position (actual position will be damped in render loop)
		this.targetOffsetX = e.clientX - this.dragStartX;
		this.targetOffsetY = e.clientY - this.dragStartY;
	}

	endDrag() {
		if (!this.isDragging) return;

		this.isDragging = false;
		this.gridContainer.style.cursor = "grab";

		// Reset velocity when drag ends
		this.velocityX = 0;
		this.velocityY = 0;

		if (this.onDragStateChange) {
			this.onDragStateChange(false);
		}
	}

	stopAnimation() {
		if (this.animationRAF) {
			cancelAnimationFrame(this.animationRAF);
			this.animationRAF = null;
		}
		this.offsetX = this.targetOffsetX;
		this.offsetY = this.targetOffsetY;
		this.velocityX = 0;
		this.velocityY = 0;
	}

	startRenderLoop() {
		const render = () => {
			const now = performance.now();
			const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1); // Cap dt to prevent huge jumps
			this.lastFrameTime = now;

			const lambda = this.isDragging ? 5 : this.dampingLambda;

			this.offsetX = this.mathUtils.damp(
				this.offsetX,
				this.targetOffsetX,
				lambda,
				dt
			);

			this.offsetY = this.mathUtils.damp(
				this.offsetY,
				this.targetOffsetY,
				lambda,
				dt
			);

			this.updateGrid();

			this.animationRAF = requestAnimationFrame(render);
		};

		this.animationRAF = requestAnimationFrame(render);
	}

	updateGrid() {
		this.renderer.updateVisibleCells(this.offsetX, this.offsetY);
	}

	dispose() {
		// Cancel animation frame
		if (this.animationRAF) {
			cancelAnimationFrame(this.animationRAF);
		}

		// Clean up event listeners
		this.eventManager.dispose();

		// Clear renderer
		this.renderer.clear();
	}
}

export default Grid;
