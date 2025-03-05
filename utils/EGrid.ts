import ECell from "./ECell";


export default class EGrid<T extends number | boolean | string | null> {
    private rows: number;
    private cols: number;
    private grid: ECell<T>[][];
    private initialValue:T | (() => T) | undefined;


    constructor(rows: number, cols: number, initialValue?: T | (() => T)) {
        this.rows = rows;
        this.cols = cols;
        this.initialValue = initialValue;
        this.grid = this.createGrid(initialValue);
    }

    private createGrid(initialValue?: T | (() => T)): ECell<T>[][] {
        let grid: ECell<T>[][] = [];
        for (let row = 0; row < this.rows; row++) {
            grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                let value: T = this.getDefaultValue(); // Get default value based on type T
                if (typeof initialValue === 'function') {
                    value = (initialValue as () => T)();
                } else if (initialValue !== undefined) {
                    value = initialValue as T;
                }
                grid[row][col] = new ECell(value);
            }
        }
        return grid;
    }

    private getDefaultValue(): T {
        if (typeof 0 === 'number') {
            return 0 as T;
        } else if (typeof '0' === 'string') {
            return '0' as T;
        } else if (typeof false === 'boolean') {
            return false as T;
        } else {
            return null as T;
        }
    }

    randomize(values:T[]){
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const value:T = values[Math.floor(Math.random()*values.length)];
                this.grid[row][col] = new ECell(value);
            }
        }
    }

    emptyCell(row:number, col:number){
        if (this.isValidCell(row, col)) {
            this.getCell(row,col)?.setValue(this.getDefaultValue());
        } else {
            console.error("Invalid Game Grid ECell. row: " + row + ", col: " + col);
        }
    }

    public getCell(row: number, col: number): ECell<T>|undefined {
        if (this.isValidCell(row, col)) {
            return this.grid[row][col];
        } else {
            console.error("Invalid Game Grid ECell");
            return undefined;
        }
    }

    public setCell(row: number, col: number, cell: ECell<T>): void {
        if (this.isValidCell(row, col)) {
            this.grid[row][col] = cell;
        } else {
            console.error("Invalid Game Grid ECell. row: " + row + ", col: " + col);
        }
    }

    public isValidCell(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    public fillGrid(value: T): void {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].setValue(value);
            }
        }
    }

    public log(): void {
        let rowString = '';
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                rowString += this.grid[row][col].toString() + ' ';
            }
            rowString += '\n'; // Add a newline after each row
        }
        console.log(rowString);
    }

    swapCells(row1:number, col1:number, row2:number, col2:number){
        const cell1 = this.getCell(row1, col1) as ECell<T>;
        const cell2 = this.getCell(row2, col2) as ECell<T>;
        this.setCell(row1, col1, cell2);
        this.setCell(row2, col2, cell1);
    }

    swapValues(value1:T, value2:T):number[] {
        let affectedCols:number[] = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col].getValue() === value1) {
                    this.grid[row][col].setValue(value2);
                    if(!affectedCols.includes(col))affectedCols.push(col);
                }
            }
        }
        return affectedCols.sort((a, b) => a - b);
    }

    public getTotRows(): number { return this.rows; }
    public getTotCols(): number { return this.cols; }
}