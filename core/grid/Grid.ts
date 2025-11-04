import {GridPosition, GridShapeFunction} from "eidosk/core";

export abstract class Grid<T> {
    private readonly cells: (T | undefined)[][];
    protected readonly rows: number;
    protected readonly cols: number;
    private shapeFunction?: GridShapeFunction;

    protected constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.cells = Array.from({ length: rows }, () => Array<T | undefined>(cols));
    }

    setShape(shapeFunction?: GridShapeFunction): void {
        this.shapeFunction = shapeFunction;
    }

    getShape(): GridShapeFunction | undefined {
        return this.shapeFunction;
    }

    isCellActive(row: number, col: number): boolean {
        return this.shapeFunction
            ? this.shapeFunction(row, col, this.rows, this.cols)
            : this.isValidPosition(row, col);
    }

    getCell(row: number, col: number): T | undefined {
        return this.isValidPosition(row, col) && this.isCellActive(row, col)
            ? this.cells[row][col]
            : undefined;
    }

    setCell(row: number, col: number, value: T | undefined): void {
        if (this.isValidPosition(row, col) && this.isCellActive(row, col)) {
            this.cells[row][col] = value;
        }
    }

    protected isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    getEmptyPositions(): GridPosition[] {
        const empty: GridPosition[] = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.isCellActive(row, col) && !this.getCell(row, col)) {
                    empty.push({ row, col });
                }
            }
        }
        return empty;
    }

    getTotRows(): number { return this.rows; }
    getTotCols(): number { return this.cols; }

    getAsArray(): (T | undefined)[][] {
        return this.cells.map(row => [...row]);
    }

    abstract createNewCell(): T;
}