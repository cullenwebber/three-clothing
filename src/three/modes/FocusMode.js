import { Flip } from "gsap/Flip";
import gsap from "gsap";
import EventManager from "../utils/EventManager.js";

gsap.registerPlugin(Flip);

class FocusMode {
	constructor(gridContainer, gridRenderer) {
		this.gridContainer = gridContainer;
		this.gridRenderer = gridRenderer;
		this.focusedCell = null;
		this.eventManager = new EventManager();
		this.setupEscapeListener();
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

		const textElement = cellElement.querySelector(".grid-item-text");
		const state = Flip.getState(cellElement);

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
			duration: 0.8,
			ease: "power2.inOut",
			absolute: true,
		});

		gsap.to(textElement, {
			y: "-4rem",
			duration: 0.8,
			ease: "power2.inOut",
		});
	}

	exit() {
		if (!this.focusedCell) return;

		const cellElement = this.focusedCell;
		const textElement = cellElement.querySelector(".grid-item-text");
		const state = Flip.getState(cellElement);

		cellElement.style.position = "";
		cellElement.style.top = "";
		cellElement.style.left = "";
		cellElement.style.width = `${this.gridRenderer.cellSize}px`;
		cellElement.style.height = `${this.gridRenderer.cellSize}px`;
		cellElement.style.transform = "";
		cellElement.style.zIndex = "";

		this.gridRenderer.setFocusedCell(null);

		Flip.from(state, {
			duration: 0.8,
			ease: "power2.inOut",
			absolute: true,
		});

		gsap.to(textElement, {
			y: 0,
			duration: 0.8,
			ease: "power2.inOut",
		});

		this.focusedCell = null;
	}

	isFocused(cellId) {
		return this.focusedCell?.dataset?.cellId === cellId;
	}

	dispose() {
		this.eventManager.dispose();
	}
}

export default FocusMode;
