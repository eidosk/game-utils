/**
 * Vector2 - Complete 2D Vector Math Library
 * Engine-agnostic, suitable for any 2D game
 *
 * Features:
 * - Basic operations (add, subtract, multiply, divide)
 * - Vector math (dot product, cross product, normalize)
 * - Geometry (rotate, reflect, perpendicular)
 * - Utilities (lerp, limit, distance calculations)
 * - Static factory methods
 * - Performance optimizations (lengthSquared, distanceToSquared)
 *
 * For scalar (single number) operations, see MathUtils.
 */
export class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    // ===== BASIC OPERATIONS =====

    /**
     * Create a copy of this vector
     */
    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    /**
     * Set vector components
     */
    set(x: number, y: number): Vector2 {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Copy values from another vector
     */
    copy(other: Vector2): Vector2 {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    // ===== ARITHMETIC OPERATIONS =====

    /**
     * Add another vector to this one
     */
    add(other: Vector2): Vector2 {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    /**
     * Subtract another vector from this one
     */
    subtract(other: Vector2): Vector2 {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    /**
     * Multiply by a scalar value
     */
    multiply(scalar: number): Vector2 {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * Divide by a scalar value
     */
    divide(scalar: number): Vector2 {
        if (scalar === 0) throw new Error('Division by zero');
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    // ===== VECTOR OPERATIONS =====

    /**
     * Get the length (magnitude) of the vector
     */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Get the squared length (faster than length, useful for comparisons)
     */
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normalize the vector (make length = 1)
     */
    normalize(): Vector2 {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    /**
     * Get distance to another vector
     */
    distanceTo(other: Vector2): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get squared distance to another vector (faster)
     */
    distanceToSquared(other: Vector2): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }

    /**
     * Calculate dot product with another vector
     */
    dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    /**
     * Calculate cross product with another vector (returns scalar for 2D)
     */
    cross(other: Vector2): number {
        return this.x * other.y - this.y * other.x;
    }

    // ===== TRANSFORMATION OPERATIONS =====

    /**
     * Rotate vector by angle in radians
     */
    rotate(angleRadians: number): Vector2 {
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }

    /**
     * Get angle of vector in radians
     */
    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Get angle between this vector and another in radians
     */
    angleTo(other: Vector2): number {
        return Math.atan2(this.cross(other), this.dot(other));
    }

    // ===== UTILITY METHODS =====

    /**
     * Limit vector magnitude to maxLength
     */
    limit(maxLength: number): Vector2 {
        const lengthSq = this.lengthSquared();
        if (lengthSq > maxLength * maxLength) {
            this.normalize().multiply(maxLength);
        }
        return this;
    }

    /**
     * Linear interpolation towards another vector
     */
    lerp(other: Vector2, t: number): Vector2 {
        this.x += (other.x - this.x) * t;
        this.y += (other.y - this.y) * t;
        return this;
    }

    /**
     * Check if vector is approximately equal to another
     */
    equals(other: Vector2, tolerance: number = 0.001): boolean {
        return Math.abs(this.x - other.x) < tolerance &&
            Math.abs(this.y - other.y) < tolerance;
    }

    /**
     * Check if vector is zero (or close to zero)
     */
    isZero(tolerance: number = 0.001): boolean {
        return Math.abs(this.x) < tolerance && Math.abs(this.y) < tolerance;
    }

    /**
     * Get perpendicular vector (rotated 90 degrees)
     */
    perpendicular(): Vector2 {
        const temp = this.x;
        this.x = -this.y;
        this.y = temp;
        return this;
    }

    /**
     * Reflect vector off a surface with given normal
     */
    reflect(normal: Vector2): Vector2 {
        const dot = this.dot(normal);
        this.x -= 2 * dot * normal.x;
        this.y -= 2 * dot * normal.y;
        return this;
    }

    /**
     * Convert to string representation
     */
    toString(): string {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    // ===== STATIC FACTORY METHODS =====

    /**
     * Create vector from angle and magnitude
     */
    static fromAngle(angleRadians: number, magnitude: number = 1): Vector2 {
        return new Vector2(
            Math.cos(angleRadians) * magnitude,
            Math.sin(angleRadians) * magnitude
        );
    }

    /**
     * Create random vector with given magnitude
     */
    static random(magnitude: number = 1): Vector2 {
        const angle = Math.random() * Math.PI * 2;
        return Vector2.fromAngle(angle, magnitude);
    }

    /**
     * Create zero vector
     */
    static zero(): Vector2 {
        return new Vector2(0, 0);
    }

    /**
     * Create unit vector pointing right
     */
    static right(): Vector2 {
        return new Vector2(1, 0);
    }

    /**
     * Create unit vector pointing up
     */
    static up(): Vector2 {
        return new Vector2(0, -1); // -1 because Y increases downward in most game engines
    }

    /**
     * Create unit vector pointing left
     */
    static left(): Vector2 {
        return new Vector2(-1, 0);
    }

    /**
     * Create unit vector pointing down
     */
    static down(): Vector2 {
        return new Vector2(0, 1);
    }

    // ===== STATIC UTILITY METHODS =====

    /**
     * Add two vectors and return a new vector
     */
    static add(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x + b.x, a.y + b.y);
    }

    /**
     * Subtract two vectors and return a new vector
     */
    static subtract(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    /**
     * Multiply vector by scalar and return new vector
     */
    static multiply(v: Vector2, scalar: number): Vector2 {
        return new Vector2(v.x * scalar, v.y * scalar);
    }

    /**
     * Divide vector by scalar and return new vector
     */
    static divide(v: Vector2, scalar: number): Vector2 {
        if (scalar === 0) throw new Error('Division by zero');
        return new Vector2(v.x / scalar, v.y / scalar);
    }

    /**
     * Linear interpolation between two vectors
     */
    static lerp(a: Vector2, b: Vector2, t: number): Vector2 {
        return new Vector2(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t
        );
    }

    /**
     * Get distance between two vectors
     */
    static distance(a: Vector2, b: Vector2): number {
        return Vector2.subtract(a, b).length();
    }

    /**
     * Get squared distance between two vectors (faster)
     */
    static distanceSquared(a: Vector2, b: Vector2): number {
        return Vector2.subtract(a, b).lengthSquared();
    }

    /**
     * Get dot product of two vectors
     */
    static dot(a: Vector2, b: Vector2): number {
        return a.x * b.x + a.y * b.y;
    }

    /**
     * Get cross product of two vectors
     */
    static cross(a: Vector2, b: Vector2): number {
        return a.x * b.y - a.y * b.x;
    }
}