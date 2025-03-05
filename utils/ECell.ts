export default class ECell<T extends number | boolean | string | null> {
    private value: T;
    private type: number;

    constructor(value: T, type?:number) {
        this.value = value;
        this.type = type || this.getDefaultType();
    }

    getType():number{
        return this.type;
    }

    setType(type:number){
        this.type = type;
    }

    private getDefaultType(): number{
        return 0;
    }

    getValue():T{
        return this.value;
    }

    // Method to reset the cell's state
    setValue(value: T): void {
        this.value = value;
    }

    isEmpty(): boolean {
        if (typeof this.value === 'number') {
            return this.value === 0;
        } else if (typeof this.value === 'string') {
            return this.value === '0';
        } else if (typeof this.value === 'boolean') {
            return !this.value;
        } else {
            return this.value === null;
        }
    }



    // Method to get a concise string representation of the cell for debugging
    toString(): string {
        return `${this.value}`;
    }
}