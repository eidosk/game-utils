/**
 * MathUtils - Scalar mathematical operations for games
 *
 * A collection of utility functions for working with numbers, angles,
 * randomization, and other scalar mathematical operations.
 *
 * For vector operations, see Vector2.
 */
export class MathUtils {
    // ===== RANDOM NUMBER GENERATION =====

    /**
     * Generate a random integer within a specified interval [min, max].
     * @param min The minimum value (inclusive).
     * @param max The maximum value (inclusive).
     * @returns A random integer between min and max (inclusive).
     */
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * Legacy alias for randomInt
     * @deprecated Use randomInt instead
     */
    static randomIntFromInterval(min: number, max: number): number {
        return this.randomInt(min, max);
    }

    /**
     * Generate a random float within a specified interval [min, max).
     * @param min The minimum value (inclusive).
     * @param max The maximum value (exclusive).
     * @returns A random float between min and max.
     */
    static randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generate a random integer within the specified range [min, max].
     * If only one argument is provided, it treats it as the max value and defaults min to 0.
     * @param min The minimum value of the range.
     * @param max The maximum value of the range.
     * @returns A random integer between min and max (inclusive).
     */
    static rand(min: number, max: number = NaN): number {
        if (isNaN(max)) {
            max = min;
            min = 0;
        }
        return Math.floor(this.randFloat(min, max + 1));
    }

    /**
     * Generate a random floating-point number within the specified range [min, max).
     * If only one argument is provided, it treats it as the max value and defaults min to 0.
     * @param min The minimum value of the range.
     * @param max The maximum value of the range.
     * @returns A random floating-point number between min and max.
     */
    static randFloat(min: number, max: number = NaN): number {
        if (isNaN(max)) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    }

    // ===== RANGE & VALUE OPERATIONS =====

    /**
     * Check if a value is within a specified range.
     * @param value The value to check.
     * @param min The minimum value of the range.
     * @param max The maximum value of the range.
     * @param includeMax Whether to include the max value in the range (default: true).
     * @returns True if the value is within the range, false otherwise.
     */
    static isInRange(value: number, min: number, max: number, includeMax: boolean = true): boolean {
        return includeMax ? (value >= min && value <= max) : (value >= min && value < max);
    }

    /**
     * Get the midpoint between two values.
     * @param min The first value.
     * @param max The second value.
     * @returns The midpoint between the two values.
     */
    static getMidpoint(min: number, max: number): number {
        return (min + max) / 2;
    }

    /**
     * Clamp a value to ensure it stays within the provided minimum and maximum range.
     * @param value The value to clamp.
     * @param min The minimum allowable value.
     * @param max The maximum allowable value.
     * @returns The clamped value.
     */
    static clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(value, max));
    }

    /**
     * Linear interpolation between two values.
     * @param a The start value.
     * @param b The end value.
     * @param t The interpolation factor (0-1).
     * @returns The interpolated value.
     */
    static lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    // ===== ANGLE OPERATIONS =====

    /**
     * Convert degrees to radians.
     * @param degrees The angle in degrees.
     * @returns The angle in radians.
     */
    static degToRad(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    /**
     * Convert radians to degrees.
     * @param radians The angle in radians.
     * @returns The angle in degrees.
     */
    static radToDeg(radians: number): number {
        return radians * 180 / Math.PI;
    }

    // ===== NUMBER FORMATTING =====

    /**
     * Round a number to a specified number of decimal places.
     * @param value The number to round.
     * @param decimals The number of decimal places (default: 0).
     * @returns The rounded number.
     */
    static roundTo(value: number, decimals: number = 0): number {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    /**
     * Round a number to two decimal places.
     * @param value The number to round.
     * @returns The number rounded to two decimal places.
     */
    static roundTo2DecimalPlaces(value: number): number {
        return this.roundTo(value, 2);
    }

    /**
     * Round a number to one decimal place.
     * @param value The number to round.
     * @returns The number rounded to one decimal place.
     */
    static roundTo1DecimalPlace(value: number): number {
        return this.roundTo(value, 1);
    }

    // ===== SPECIAL MATH OPERATIONS =====

    /**
     * Check if a number is a prime number.
     * @param n The number to check.
     * @returns true if n is a prime number, false otherwise.
     */
    static isPrime(n: number): boolean {
        if (isNaN(n) || !isFinite(n) || n % 1 || n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;

        const m = Math.sqrt(n);
        for (let i = 3; i <= m; i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    }

    /**
     * Calculate the greatest common divisor of two numbers.
     * @param a First number.
     * @param b Second number.
     * @returns The greatest common divisor.
     */
    static gcd(a: number, b: number): number {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    /**
     * Calculate the least common multiple of two numbers.
     * @param a First number.
     * @param b Second number.
     * @returns The least common multiple.
     */
    static lcm(a: number, b: number): number {
        return Math.abs(a * b) / this.gcd(a, b);
    }
}