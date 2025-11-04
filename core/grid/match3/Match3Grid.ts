import { Match3Logic, Match3Position } from 'eidosk/core';
import {GravityGrid} from "eidosk/core/grid/GravityGrid.ts";

export class Match3Grid extends GravityGrid<number> {
    private tileTypes: number;
    private maxAttempts: number = 50;

    constructor(rows: number, cols: number, tileTypes: number = 5) {
        super(rows, cols);
        this.tileTypes = Math.max(3, Math.min(8, tileTypes)); // Clamp between 3-8
    }

    /**
     * Create a new random tile type
     */
    createNewCell(): number {
        return Math.floor(Math.random() * this.tileTypes) + 1;
    }

    /**
     * Create a valid grid without initial matches
     */
    createValidGrid(): void {
        // Clear the grid first
        this.clearGrid();

        // Fill the grid row by row, column by column
        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                let tileType: number;
                let attempts = 0;

                // Keep trying until we find a tile that doesn't create a match
                do {
                    tileType = this.createNewCell();
                    attempts++;
                } while (
                    attempts < this.maxAttempts &&
                    Match3Logic.wouldCreateMatchAtPosition(
                        this.getAsArray(),
                        this.getTotRows(),
                        this.getTotCols(),
                        row,
                        col,
                        tileType
                    )
                    );

                this.setCell(row, col, tileType);
            }
        }

        // Verify no matches exist
        const matches = this.findMatches();
        if (matches.length > 0) {
            console.warn("Match3GridView: Created grid still has " + matches.length + " matches, retrying...");
            // If we still have matches, try again (rare but possible)
            this.createValidGrid();
        }
    }

    /**
     * Clear all cells in the grid
     */
    private clearGrid(): void {
        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                this.setCell(row, col, undefined);
            }
        }
    }



    /**
     * Find all matches in the current grid
     */
    findMatches(): Match3Position[] {
        return Match3Logic.findMatches(
            this.getAsArray(),
            this.getTotRows(),
            this.getTotCols()
        );
    }

    /**
     * Swap two tiles if they are adjacent
     */
    swapTiles(row1: number, col1: number, row2: number, col2: number): boolean {
        // Check if positions are valid
        if (!this.isValidPosition(row1, col1) || !this.isValidPosition(row2, col2)) {
            return false;
        }

        // Check if positions are adjacent
        if (!Match3Logic.areAdjacent(row1, col1, row2, col2)) {
            return false;
        }

        // Get the tiles
        const tile1 = this.getCell(row1, col1);
        const tile2 = this.getCell(row2, col2);

        if (tile1 === undefined || tile2 === undefined) {
            return false;
        }

        // Check if swap would create a match
        if (!Match3Logic.wouldCreateMatch(
            this.getAsArray(),
            this.getTotRows(),
            this.getTotCols(),
            row1, col1, row2, col2
        )) {
            return false; // Invalid move
        }

        // Perform the swap
        this.setCell(row1, col1, tile2);
        this.setCell(row2, col2, tile1);

        return true;
    }

    /**
     * Remove tiles at the specified positions
     */
    removeMatches(positions: Match3Position[]): void {
        positions.forEach(pos => {
            if (this.isValidPosition(pos.row, pos.col)) {
                this.setCell(pos.row, pos.col, undefined);
            }
        });
    }

    /**
     * Get all possible moves that would create matches
     */
    getPossibleMoves(): Array<{ from: Match3Position, to: Match3Position }> {
        return Match3Logic.getPossibleMoves(
            this.getAsArray(),
            this.getTotRows(),
            this.getTotCols()
        );
    }

    /**
     * Check if the grid has any possible moves
     */
    hasPossibleMoves(): boolean {
        return this.getPossibleMoves().length > 0;
    }

    /**
     * Fill empty cells at the top with new random tiles
     */
    fillEmptyTopCells(): Match3Position[] {
        const newTilePositions: Match3Position[] = [];

        for (let col = 0; col < this.getTotCols(); col++) {
            for (let row = 0; row < this.getTotRows(); row++) {
                if (!this.getCell(row, col)) {
                    const newTile = this.createNewCell();
                    this.setCell(row, col, newTile);
                    newTilePositions.push({ row, col });
                }
            }
        }

        return newTilePositions;
    }

    /**
     * Check if the grid is completely filled
     */
    isFull(): boolean {
        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                if (!this.getCell(row, col)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Check if grid is valid (no matches)
     */
    isValid(): boolean {
        return this.findMatches().length === 0;
    }

    /**
     * Get statistics about the grid
     */
    getStats(): {
        totalTiles: number;
        emptyTiles: number;
        tileTypeCounts: { [key: number]: number };
        possibleMoves: number;
    } {
        const stats = {
            totalTiles: this.getTotRows() * this.getTotCols(),
            emptyTiles: 0,
            tileTypeCounts: {} as { [key: number]: number },
            possibleMoves: this.getPossibleMoves().length
        };

        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                const cell = this.getCell(row, col);
                if (!cell) {
                    stats.emptyTiles++;
                } else {
                    stats.tileTypeCounts[cell] = (stats.tileTypeCounts[cell] || 0) + 1;
                }
            }
        }

        return stats;
    }

    /**
     * Private helper to check if position is valid
     */
    private isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < this.getTotRows() && col >= 0 && col < this.getTotCols();
    }
}