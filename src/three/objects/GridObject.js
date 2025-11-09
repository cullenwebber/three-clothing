import WiggleObj from "./WiggleObj.js";
import WebGLText from "./WebGLText.js";
import BorderPlane from "./BorderPlane.js";
import FocusMode from "../modes/FocusMode.js";
import CoordinateUtils from "../utils/CoordinateUtils.js";
import EventManager from "../utils/EventManager.js";

class GridObject {
	constructor(scene, camera, container, gridRenderer) {
		this.scene = scene;
		this.camera = camera;
		this.container = container;
		this.gridRenderer = gridRenderer;

		// Track all grid items
		this.wiggleObjects = new Map();
		this.textInstances = new Map();
		this.borderInstances = new Map();

		this.initialised = false;

		// Track time for delta calculation
		this.lastTime = performance.now();

		this.eventManager = new EventManager();
		this.focusMode = new FocusMode(container, gridRenderer);
		this.focusMode.setGridObject(this);
	}

	initialise() {
		if (this.initialised) return;

		const cells = this.container.querySelectorAll("[data-cell-id]");

		for (const cell of cells) {
			const cellId = cell.dataset.cellId;
			const wiggleObj = new WiggleObj(this.scene.getScene());

			// Add hover listeners
			this.eventManager.add(cell, "mouseenter", () =>
				this.onCellHover(cellId, true)
			);
			this.eventManager.add(cell, "mouseleave", () =>
				this.onCellHover(cellId, false)
			);

			// Add click listener for focus mode
			this.eventManager.add(cell, "click", () => this.focusMode.toggle(cell));

			this.wiggleObjects.set(cellId, {
				wiggleObj,
				cellElement: cell,
				isHovered: false,
			});
		}

		this.initialised = true;
	}

	onCellHover(cellId, isHovered) {
		const tracked = this.wiggleObjects.get(cellId);
		if (!tracked) return;

		tracked.isHovered = isHovered;
		tracked.wiggleObj.setHovered(isHovered);
	}

	updateWigglePosition(cellId) {
		const tracked = this.wiggleObjects.get(cellId);
		if (!tracked || !tracked.cellElement) return;

		const { x, y } = CoordinateUtils.elementToWorld(
			this.camera.getCamera(),
			tracked.cellElement,
			null,
			0
		);

		tracked.wiggleObj.setTargetPosition(x, y);
	}

	update() {
		if (!this.initialised) {
			this.initialise();
		}

		// Calculate delta time
		const now = performance.now();
		const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 0.1s to prevent huge jumps
		this.lastTime = now;

		// Update wiggle objects
		for (const [cellId, tracked] of this.wiggleObjects.entries()) {
			this.updateWigglePosition(cellId);
			tracked.wiggleObj.update(deltaTime);
		}

		// Update text and borders
		this.updateTextAndBorders();
	}

	updateTextAndBorders() {
		const focusedCell = this.focusMode.focusedCell;

		// Update text
		document.querySelectorAll(".grid-item-text").forEach((element) => {
			if (!this.textInstances.has(element)) {
				this.textInstances.set(
					element,
					new WebGLText(
						this.scene.getScene(),
						this.camera.getCamera(),
						element,
						null,
						{
							hideOriginal: true,
							zPosition: 0,
						}
					)
				);
			}

			const instance = this.textInstances.get(element);

			instance.updateText();
		});

		// Update borders
		document.querySelectorAll(".grid-item").forEach((element) => {
			if (!this.borderInstances.has(element)) {
				this.borderInstances.set(
					element,
					new BorderPlane(
						this.scene.getScene(),
						this.camera.getCamera(),
						element,
						null,
						{
							zPosition: 0,
							borderWidth: 0.5,
							borderColor: 0xbababa,
						}
					)
				);
			}

			const instance = this.borderInstances.get(element);

			instance.updatePosition();
		});
	}

	fadeOutAllExcept(cellElement) {
		// Fade out all wiggle objects except the focused one
		for (const [cellId, tracked] of this.wiggleObjects.entries()) {
			if (tracked.cellElement !== cellElement) {
				tracked.wiggleObj.fadeOut();
			}
		}

		// Fade out all text instances except those in the focused cell
		this.textInstances.forEach((instance, element) => {
			if (!cellElement.contains(element)) {
				instance.fadeOut();
			}
		});

		// Fade out all border instances except the focused cell
		this.borderInstances.forEach((instance, element) => {
			if (element !== cellElement) {
				instance.fadeOut();
			}
		});
	}

	fadeInAll() {
		// Fade in all wiggle objects
		for (const tracked of this.wiggleObjects.values()) {
			tracked.wiggleObj.fadeIn();
		}

		// Fade in all text instances
		this.textInstances.forEach((instance) => {
			instance.fadeIn();
		});

		// Fade in all border instances
		this.borderInstances.forEach((instance) => {
			instance.fadeIn();
		});
	}
}

export default GridObject;
