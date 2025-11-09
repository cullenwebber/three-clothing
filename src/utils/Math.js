class MathUtils {
	/**
	 * Framerate independent dampening using exponential decay
	 * @param current - The current value
	 * @param target - The target value to transition towards
	 * @param lambda - Decay rate (larger = faster decay)
	 * @param dt - Delta time in seconds
	 * @returns Interpolated value between current and target
	 */
	static damp(current, target, lambda, dt) {
		return this.lerp(current, target, 1 - Math.exp(-lambda * dt));
	}

	static lerp(a, b, t) {
		return a * (1 - t) + b * t;
	}
}

export default MathUtils;
