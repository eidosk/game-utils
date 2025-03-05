type Point = Phaser.Geom.Point;
export class ETrig {
	static getDistance(a: Point, b: Point): number {
		return Math.sqrt(Math.pow(b.y - a.y, 2) + Math.pow(b.x - a.x, 2));
	}
}