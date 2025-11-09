import { Flip } from "gsap/Flip";
import gsap from "gsap";
import EventManager from "../utils/EventManager.js";

gsap.registerPlugin(Flip);

class FocusMode {
	constructor(gridContainer, gridRenderer, gridObject = null) {
		this.gridContainer = gridContainer;
		this.gridRenderer = gridRenderer;
		this.gridObject = gridObject;
		this.focusedCell = null;
		this.originalTransform = null;
		this.eventManager = new EventManager();
		this.setupEscapeListener();
	}

	setGridObject(gridObject) {
		this.gridObject = gridObject;
	}

	setupEscapeListener() {
		const escapeHandler = (e) => {
			if (!e.key === "Escape" && !this.focusedCell) return;
			this.exit();
		};
		this.eventManager.add(document, "keydown", escapeHandler);
	}

	toggle(cellElement) {
		if (this.focusedCell === cellElement) {
			this.exit();
		} else {
			this.enter(cellElement);
		}
	}

	enter(cellElement) {
		if (!cellElement) return;

		this.focusedCell = cellElement;
		this.gridRenderer.setFocusedCell(cellElement);

		this.originalTransform = cellElement.style.transform;

		const textElement = cellElement.querySelector(".grid-item-text");
		const state = Flip.getState(cellElement);

		// Fade out all other 3D objects
		if (this.gridObject) {
			this.gridObject.fadeOutAllExcept(cellElement);
		}

		gsap.set(cellElement, {
			position: "fixed",
			top: "50%",
			left: "50%",
			width: "100vw",
			height: "100vh",
			transform: "translate(-50%, -50%)",
			zIndex: "1000",
		});

		Flip.from(state, {
			delay: 0.3,
			duration: 0.6,
			ease: "power2.inOut",
			absolute: true,
		});

		gsap.to(textElement, {
			delay: 0.3,
			y: "-8rem",
			duration: 0.6,
			ease: "power2.inOut",
		});
	}

	exit() {
		if (!this.focusedCell) return;

		const cellElement = this.focusedCell;
		const textElement = cellElement.querySelector(".grid-item-text");
		const state = Flip.getState(cellElement);

		// Fade in all other 3D objects
		if (this.gridObject) {
			this.gridObject.fadeInAll();
		}

		gsap.set(this.focusedCell, {
			position: "",
			top: "",
			left: "",
			width: `${this.gridRenderer.cellSize}px`,
			height: `${this.gridRenderer.cellSize}px`,
			transform: this.originalTransform,
			zIndex: "",
		});

		Flip.from(state, {
			duration: 0.6,
			ease: "power2.inOut",
			absolute: true,
			onComplete: () => {
				this.gridRenderer.setFocusedCell(null);
			},
		});

		gsap.to(textElement, {
			y: 0,
			duration: 0.6,
			ease: "power2.inOut",
		});

		this.focusedCell = null;
		this.originalTransform = null;
	}

	isFocused(cellId) {
		return this.focusedCell?.dataset?.cellId === cellId;
	}

	dispose() {
		this.eventManager.dispose();
	}
}

export default FocusMode;
