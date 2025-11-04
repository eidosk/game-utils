// GridVisualRenderer.ts
import { Scene } from 'phaser';
import {Grid, CellDataType, GridPosition} from 'eidosk/core';
import { TileFactory, TileConfig } from 'eidosk';

export interface GridRenderConfig {
    position: { x: number, y: number };
    cellSize: number;
    padding: { x: number, y: number };
}

export class GridVisualRenderer<T extends CellDataType, TileType> {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private tiles: (TileType | null)[][];
    private config: GridRenderConfig;
    private tileFactory: TileFactory<T>;

    constructor(scene: Scene, config: GridRenderConfig, tileFactory: TileFactory<T>) {
        this.scene = scene;
        this.config = config;
        this.tileFactory = tileFactory;
        this.container = scene.add.container(config.position.x, config.position.y);
        this.tiles = [];
    }

    private createTile(row: number, col: number, cellData: T): TileType {
        const cfg: TileConfig = {
            x: col * (this.config.cellSize + this.config.padding.x) + this.config.cellSize / 2,
            y: row * (this.config.cellSize + this.config.padding.y) + this.config.cellSize / 2,
            row,
            col,
            size: this.config.cellSize
        };
        return this.tileFactory.createTile(cfg, cellData);
    }

    render(grid: Grid<T>): void {
        this.clearTiles();
        this.tiles = Array.from({ length: grid.getTotRows() }, () =>
            Array(grid.getTotCols()).fill(null)
        );

        for (let row = 0; row < grid.getTotRows(); row++) {
            for (let col = 0; col < grid.getTotCols(); col++) {
                const cell = grid.getCell(row, col);
                if (cell != null) {
                    const tile = this.createTile(row, col, cell);
                    this.tiles[row][col] = tile;
                    const obj = (tile as any).object ?? tile;
                    this.container.add(obj);
                }
            }
        }
    }

    public swapTiles(pos1: GridPosition, pos2: GridPosition): void {
        // Get tiles array reference
        const tiles = this.getAllTiles();

        // Swap tile references in the internal array
        const temp = tiles[pos1.row][pos1.col];
        tiles[pos1.row][pos1.col] = tiles[pos2.row][pos2.col];
        tiles[pos2.row][pos2.col] = temp;
    }

    renderPositions(grid: Grid<T>, positions: { row: number; col: number }[]): void {
        for (const pos of positions) {
            const cell = grid.getCell(pos.row, pos.col);
            if (cell != null) {
                const oldTile = this.tiles[pos.row]?.[pos.col];
                if (oldTile) {
                    const obj = (oldTile as any).object ?? oldTile;
                    this.container.remove(obj);
                    if (typeof (oldTile as any).destroy === 'function') {
                        (oldTile as any).destroy();
                    }
                }

                const tile = this.createTile(pos.row, pos.col, cell);
                this.tiles[pos.row][pos.col] = tile;
                const obj = (tile as any).object ?? tile;
                this.container.add(obj);
            }
        }
    }

    getTile(row: number, col: number): TileType | null {
        return this.tiles[row]?.[col] ?? null;
    }

    getAllTiles(): (TileType | null)[][] {
        return this.tiles;
    }

    getTilesAtPositions(positions: { row: number; col: number }[]): (TileType | null)[] {
        return positions.map(pos => this.getTile(pos.row, pos.col));
    }

    setPosition(x: number, y: number): void {
        this.container.setPosition(x, y);
    }

    setVisible(visible: boolean): void {
        this.container.setVisible(visible);
    }

    setAlpha(alpha: number): void {
        this.container.setAlpha(alpha);
    }

    getContainer(): Phaser.GameObjects.Container {
        return this.container;
    }

    private clearTiles(): void {
        for (let row = 0; row < this.tiles.length; row++) {
            for (let col = 0; col < this.tiles[row].length; col++) {
                const tile = this.tiles[row][col];
                if (tile) {
                    const obj = (tile as any).object ?? tile;
                    this.container.remove(obj);
                    if (typeof (tile as any).destroy === 'function') {
                        (tile as any).destroy();
                    }
                }
            }
        }
        this.tiles = [];
    }

    destroy(): void {
        this.clearTiles();
        this.container.destroy();
    }
}
