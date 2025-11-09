/**
 * Manages event listeners with automatic cleanup
 */
class EventManager {
	constructor() {
		this.listeners = [];
	}

	/**
	 * Add an event listener that will be automatically cleaned up
	 * @param {EventTarget} target - The event target (element, window, document, etc.)
	 * @param {string} event - The event name
	 * @param {Function} handler - The event handler
	 * @param {Object|boolean} options - Event listener options
	 */
	add(target, event, handler, options = false) {
		target.addEventListener(event, handler, options);
		this.listeners.push({ target, event, handler, options });
	}

	/**
	 * Remove a specific event listener
	 * @param {EventTarget} target - The event target
	 * @param {string} event - The event name
	 * @param {Function} handler - The event handler
	 */
	remove(target, event, handler) {
		target.removeEventListener(event, handler);
		this.listeners = this.listeners.filter(
			(listener) =>
				!(
					listener.target === target &&
					listener.event === event &&
					listener.handler === handler
				)
		);
	}

	/**
	 * Remove all registered event listeners
	 */
	dispose() {
		for (const { target, event, handler } of this.listeners) {
			target.removeEventListener(event, handler);
		}
		this.listeners = [];
	}
}

export default EventManager;
