class GridRenderer {
	constructor(container, cellSize = 300) {
		this.container = container;
		this.cellSize = cellSize;

		// Fixed pool of cells
		this.cells = [];
		this.visibleCells = new Set();

		this.initializeCells();
	}

	initializeCells() {
		// Calculate cells needed with buffer of 2 on each side
		const cols = Math.ceil(window.innerWidth / this.cellSize) + 4;
		const rows = Math.ceil(window.innerHeight / this.cellSize) + 4;
		const cellCount = cols * rows;

		// Create fixed pool of cells
		for (let i = 0; i < cellCount; i++) {
			const cell = document.createElement("div");
			const text = document.createElement("span");

			cell.className = "grid-item";
			text.className = "grid-item-text";

			cell.style.width = `${this.cellSize}px`;
			cell.style.height = `${this.cellSize}px`;

			cell.dataset.cellId = i;
			text.innerText = "XZ-" + i;

			cell.appendChild(text);
			this.container.appendChild(cell);

			this.cells.push(cell);
		}
	}

	updateVisibleCells(offsetX, offsetY) {
		const w = window.innerWidth;
		const h = window.innerHeight;

		// Calculate visible grid range with 2 cell buffer on each side
		const startCol = Math.floor(-offsetX / this.cellSize) - 2;
		const endCol = Math.ceil((w - offsetX) / this.cellSize) + 2;
		const startRow = Math.floor(-offsetY / this.cellSize) - 2;
		const endRow = Math.ceil((h - offsetY) / this.cellSize) + 2;

		// Build set of all positions that should be visible
		const newVisibleCells = new Set();
		const neededPositions = [];
		for (let row = startRow; row < endRow; row++) {
			for (let col = startCol; col < endCol; col++) {
				const key = `${col},${row}`;
				newVisibleCells.add(key);
				neededPositions.push({ col, row, key });
			}
		}

		// Create a map of currently assigned cells by their grid key
		const cellsByKey = new Map();
		for (const cell of this.cells) {
			const gridKey = cell.dataset.gridKey;
			if (gridKey) {
				cellsByKey.set(gridKey, cell);
			}
		}

		// Find cells that are no longer visible (available for reuse)
		const availableCells = [];
		for (const cell of this.cells) {
			const gridKey = cell.dataset.gridKey;
			if (!gridKey || !newVisibleCells.has(gridKey)) {
				availableCells.push(cell);
			}
		}

		// Assign positions: reuse existing cells when possible, use available cells for new positions
		let availableIndex = 0;
		for (const { col, row, key } of neededPositions) {
			let cell = cellsByKey.get(key);

			// If this position doesn't have a cell yet, assign one from available pool
			if (!cell && availableIndex < availableCells.length) {
				cell = availableCells[availableIndex++];
				cell.dataset.gridKey = key;
			}

			// Update position for all visible cells
			if (cell) {
				const x = col * this.cellSize + offsetX;
				const y = row * this.cellSize + offsetY;
				cell.style.transform = `translate(${x}px, ${y}px)`;
			}
		}

		this.visibleCells = newVisibleCells;
	}

	clear() {
		this.visibleCells.clear();
	}
}

export default GridRenderer;
