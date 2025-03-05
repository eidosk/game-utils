export class ENumberInterval {
	// Constructor to initialize the start and end of the interval
	constructor(private start: number, private end: number) {}

	// Check if a value is within the interval, with an option to include the end value
	contains(value: number, includeEnd: boolean = true): boolean {
		if (includeEnd) {
			return value >= this.start && value <= this.end;
		} else {
			return value >= this.start && value < this.end;
		}
	}

	// Calculate and return the middle point of the interval
	getMiddlePoint(): number {
		return (this.start + this.end) / 2;
	}
}
