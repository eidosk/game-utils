import Container = Phaser.GameObjects.Container;
import EGrid from "../utils/EGrid";
import { Scene } from "phaser";
import {ETextButton} from "./ETextButton";
import Graphics = Phaser.GameObjects.Graphics;
import ECell from "../utils/ECell";
type TileType = Graphics | ETextButton;
type CellDataType = number | boolean | string | null;

/**
 * An abstract base class for grid-based containers in Phaser.
 *
 * This class provides the basic structure and functionality for managing a grid of tiles,
 * including tile generation, rendering, and handling cell movement.
 *
 * @template T The type of data stored in each cell of the grid.
 */
export default abstract class EGridContainer<T extends CellDataType> extends Container {

    protected dataGrid: EGrid<T>;
    protected gfxGrid: TileType[][];
    protected paddingX: number;
    protected paddingY: number;
    protected size: number;
    private longestTweenDuration:number;
    protected readonly VELOCITY: number = .4;

    /**
     * Creates a new EGridContainer instance.
     *
     * @param scene The Phaser scene to which this container belongs.
     * @param x The x-coordinate of the container.
     * @param y The y-coordinate of the container.
     * @param rows The number of rows in the grid.
     * @param cols The number of columns in the grid.
     * @param paddingX
     * @param paddingY
     * @param size The size of each tile in the grid.
     */
    protected constructor(scene: Scene, x: number, y: number, rows: number, cols: number,
                          paddingX: number, paddingY:number, size: number){
        super(scene, x, y);
        console.log("container x: " + x);
        this.paddingX = paddingX;
        this.paddingY = paddingY;
        this.size = size;
        this.longestTweenDuration = 0;
        this.initVars();
    }

    abstract initVars();
    abstract createDataGrid(rows: number, cols: number): EGrid<T>;
    abstract createNewCell():ECell<T>;
    abstract generateTile(x: number, y: number, row:number, col:number, cell:ECell<T>): TileType;

    generateTiles() {
        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                const cell: ECell<T> = this.dataGrid.getCell(row, col)!; // No need for undefined check here
                const x: number = this.getXFromCol(col);
                console.log("cell x: " + x);
                const y: number = this.getYFromRow(row);
                if(!cell.isEmpty()){
                    let tile:TileType = this.generateTile(x, y, row, col, cell);
                    this.gfxGrid[row][col] = tile;
                    this.add(tile);
                }
            }
        }
    }

    getXFromCol(col:number):number{
        return (this.size + this.paddingX) * col;
    }
    getYFromRow(row:number):number{
        return (this.size + this.paddingY) * row;
    }

    /**
     * Renders the tiles in the grid.
     *
     * @param affectedCols An optional array of column indices to render.
     *                      If not provided, all columns will be rendered.
     */
    render(affectedCols?: number[]): void {
        if (!affectedCols) affectedCols = Array.from({ length: this.getTotCols() }, (_, i) => i);
        affectedCols.forEach(col => {
            for (let row = 0; row < this.getTotRows(); row++) {
                const cell:ECell<T> = this.dataGrid.getCell(row, col) as ECell<T>;
                const x = this.getXFromCol(col);
                const y = this.getYFromRow(row);
                const oldTile = this.gfxGrid[row][col];
                if (oldTile) this.remove(oldTile, true);
                if(!cell.isEmpty()){
                    let tile:TileType = this.generateTile(x, y, row, col, cell);
                    this.gfxGrid[row][col] = tile;
                    this.add(tile);
                }
            }
        });
    }

    createAndMoveDownNewCells() {
        const affectedCols = this.getColumnsWithEmptyCells();
        if (affectedCols.length === 0) return;
        for (let i = 0; i < affectedCols.length; i++) {
            const col: number = affectedCols[i];
            this.moveDownCellsAtCol(col); // Move existing cells down per column
        }
        this.fillTopEmptyCells(affectedCols); // Fill empty cells in affected columns
        this.scene.time.delayedCall(this.longestTweenDuration, this.onGridFilled.bind(this)); // Call on grid filled at the end of tweens
        this.dataGrid.log();
    }

    correctFilledCells(filledCells: { row: number, col: number }[]) {}

    /**
     * Fills all empty cells in the specified affected columns with new cells, animating them into place.
     * @param affectedCols Array of column indices that contain empty cells.
     */
    /**
     * Fills all empty cells in the specified affected columns with new cells, animating them into place.
     * @param affectedCols Array of column indices that contain empty cells.
     */
    fillTopEmptyCells(affectedCols: number[]) {
        let tweenTargets: TileType[] = [];
        let tweenDistances: number[] = []; // Store distances for each target
        this.longestTweenDuration = 0; // Reset to track the longest tween
        const filledCells: { row: number, col: number }[] = []; // Track filled cells

        // Scan only the affected columns
        for (let col of affectedCols) {
            for (let row: number = 0; row < this.dataGrid.getTotRows(); row++) {
                let cell: ECell<T> | undefined = this.dataGrid.getCell(row, col);
                if (cell?.isEmpty()) {
                    // Calculate the starting Y position (above the grid)
                    const targetY: number = this.getYFromRow(row);
                    const gapsAbove: number = this.countEmptyCellsAbove(row, col);
                    const tweenDistance: number = gapsAbove * (this.size + this.paddingY);
                    const startY: number = targetY - tweenDistance;
                    // Create and position the new cell
                    let newCell: ECell<T> = this.createNewCell();
                    let tile: TileType = this.generateTile(this.getXFromCol(col), startY, row, col, newCell);
                    this.dataGrid.setCell(row, col, newCell);
                    this.gfxGrid[row][col] = tile; // Add the new tile to the 2D array
                    this.add(tile); // Add the tile to the container
                    tweenTargets.push(tile);
                    tweenDistances.push(tweenDistance); // Store the distance for this tile
                    // Update longest tween duration
                    const time: number = this.getTimeFromSpace(tweenDistance);
                    if (time > this.longestTweenDuration) this.longestTweenDuration = time;
                    filledCells.push({ row, col });
                }
            }
        }

        this.correctFilledCells(filledCells);

        // Animate all new tiles dropping into place
        if (tweenTargets.length > 0) {
            this.scene.tweens.add({
                targets: tweenTargets,
                y: (target: TileType, _targetIdx: number, _targets: TileType[], idx: number) => target.y + tweenDistances[idx], // Use stored distance
                ease: 'Linear',
                duration: this.longestTweenDuration // Use the longest duration for consistency
            });
        }
    }

    /**
     * Counts the number of empty cells above the given row in the specified column.
     * @param row The row index to start counting from.
     * @param col The column index.
     * @returns The number of empty cells above the position.
     */
    countEmptyCellsAbove(row: number, col: number): number {
        let emptyCount: number = 0;
        for (let r: number = 0; r < row; r++) {
            let cell: ECell<T> | undefined = this.dataGrid.getCell(r, col);
            if (cell?.isEmpty()) {
                emptyCount++;
            }
        }
        return emptyCount;
    }



/*
    createAndMoveDownNewCells() {
        const affectedCols = this.getColumnsWithEmptyCells();
        if (affectedCols.length === 0) return;
        for (let i = 0; i < affectedCols.length; i++) {
            const col: number = affectedCols[i];
            const colGaps:number = this.moveDownCellsAtCol(col);
            this.fillTopEmptyCellsAtCol(col, colGaps);
        }
        this.scene.time.delayedCall(this.longestTweenDuration, this.onGridFilled.bind(this)); //call on grid filled at the end of tweens
        this.dataGrid.log();
    }

    fillTopEmptyCellsAtCol(col: number, gaps: number, last:boolean = false) {
        const tweenDistance: number = gaps * (this.size + this.paddingY);
        let tweenTargets: TileType[] = [];
        for (let row: number = 0; row < gaps; row++) { // Iterate only up to the number of gaps
            let cell: ECell<T> | undefined = this.dataGrid.getCell(row, col);
            if (cell?.isEmpty()) {
                const startY: number = this.getYFromRow(row) - tweenDistance;
                let newCell: ECell<T> = this.createNewCell();
                let tile:TileType = this.generateTile(this.getXFromCol(col), startY, row, col, newCell);
                this.dataGrid.setCell(row, col, newCell);
                this.gfxGrid[row][col] = tile; // Add the new tile to the 2D array
                this.add(tile); // Add the tile to the container
                tweenTargets.push(tile);
            }
        }

        const time:number = this.getTimeFromSpace(tweenDistance);
        if(time>this.longestTweenDuration)this.longestTweenDuration = time;
        this.scene.tweens.add({
            targets: tweenTargets,
            y: '+=' + tweenDistance,
            ease: 'Linear',
            duration: time
        });
    }*/



    /**
     * Gets the columns in the grid that contain empty cells.
     *
     * @returns An array of column indices that contain empty cells.
     */
    getColumnsWithEmptyCells():number[]{
        let affectedCols:number[] = [];
        for(let row= 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                let cell:ECell<T>|undefined = this.dataGrid.getCell(row, col);
                if(cell?.isEmpty()){ //check
                    if(!affectedCols.includes(col)) affectedCols.push(col);
                }
            }
        }
        return affectedCols.sort((a, b) => a - b);
    }

    /**
     * Moves down cells in the specified column to fill empty spaces.
     *
     * @param col The index of the column to move cells down in.
     * @returns The number of gaps (empty cells) filled in the column.
     */
    moveDownCellsAtCol(col: number): number {
        const totRows: number = this.getTotRows();
        let gaps: number = 0;
        for (let row = totRows - 1; row >= 0; row--) {
            let cell: ECell<T> | undefined = this.dataGrid.getCell(row, col);
            if (cell?.isEmpty()) {
                gaps++;
            } else if (gaps > 0) { // filled cell that have gaps below
                let tile: TileType = this.gfxGrid[row][col];
                if (tile) {
                    let targetRow: number = row + gaps;
                    let targetTile: TileType = this.gfxGrid[targetRow][col];
                    let targetCell: ECell<T>|undefined = this.dataGrid.getCell(targetRow, col);
                    if (targetCell?.isEmpty()) {
                        const distance: number = this.getYFromRow(targetRow) - tile.y;
                        const time:number = this.getTimeFromSpace(distance);
                        if(time>this.longestTweenDuration)this.longestTweenDuration = time;
                        this.scene.tweens.add({
                            targets: tile,
                            y: "+=" + distance,
                            duration: time
                        });
                        this.dataGrid.setCell(row, col, targetCell); // row above, empty cell
                        // @ts-ignore
                        this.dataGrid.setCell(targetRow, col, cell); // row below
                        this.gfxGrid[row][col] = targetTile;
                        this.gfxGrid[targetRow][col] = tile;
                    }
                }
            }
        }
        return gaps;
    }


    onGridFilled(){}//extend
    getTimeFromSpace(space:number):number { return space / this.VELOCITY; }

    getTotRows():number { return this.dataGrid.getTotRows() };
    getTotCols():number{ return this.dataGrid.getTotCols(); }
}