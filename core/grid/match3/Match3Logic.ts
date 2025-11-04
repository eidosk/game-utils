// eidosk/core/grid/match3/Match3Logic.ts
// Pure match-3 algorithms with no framework dependencies

export interface Match3Position {
    row: number;
    col: number;
}

export interface Match3Match {
    positions: Match3Position[];
    type: number;
    direction: 'horizontal' | 'vertical';
}

export class Match3Logic {

    /**
     * Find all matches of 3 or more in a grid
     */
    static findMatches(grid: (number | null | undefined)[][], rows: number, cols: number): Match3Position[] {
        const matches: Match3Position[] = [];
        const matchedPositions = new Set<string>();

        // Find horizontal matches
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols - 2; col++) {
                const tile1 = grid[row][col];
                const tile2 = grid[row][col + 1];
                const tile3 = grid[row][col + 2];

                if (tile1 && tile1 === tile2 && tile2 === tile3) {
                    // Find the complete match length
                    let matchLength = 3;
                    let checkCol = col + 3;

                    while (checkCol < cols && grid[row][checkCol] === tile1) {
                        matchLength++;
                        checkCol++;
                    }

                    // Add all positions in this match
                    for (let i = 0; i < matchLength; i++) {
                        const pos = row + "," + (col + i);
                        if (!matchedPositions.has(pos)) {
                            matches.push({ row, col: col + i });
                            matchedPositions.add(pos);
                        }
                    }
                }
            }
        }

        // Find vertical matches
        for (let row = 0; row < rows - 2; row++) {
            for (let col = 0; col < cols; col++) {
                const tile1 = grid[row][col];
                const tile2 = grid[row + 1][col];
                const tile3 = grid[row + 2][col];

                if (tile1 && tile1 === tile2 && tile2 === tile3) {
                    // Find the complete match length
                    let matchLength = 3;
                    let checkRow = row + 3;

                    while (checkRow < rows && grid[checkRow][col] === tile1) {
                        matchLength++;
                        checkRow++;
                    }

                    // Add all positions in this match
                    for (let i = 0; i < matchLength; i++) {
                        const pos = (row + i) + "," + col;
                        if (!matchedPositions.has(pos)) {
                            matches.push({ row: row + i, col });
                            matchedPositions.add(pos);
                        }
                    }
                }
            }
        }

        return matches;
    }

    /**
     * Check if two positions are adjacent (horizontally or vertically)
     */
    static areAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * Check if a swap would create a match
     */
    static wouldCreateMatch(
        grid: (number | null | undefined)[][],
        rows: number,
        cols: number,
        row1: number,
        col1: number,
        row2: number,
        col2: number
    ): boolean {
        // Create a copy and perform the swap
        const testGrid = grid.map(row => [...row]);
        const temp = testGrid[row1][col1];
        testGrid[row1][col1] = testGrid[row2][col2];
        testGrid[row2][col2] = temp;

        // Check if this creates any matches
        const matches = Match3Logic.findMatches(testGrid, rows, cols);
        return matches.length > 0;
    }

    /**
     * Check if placing a tile at position would create a match
     */
    static wouldCreateMatchAtPosition(
        grid: (number | null | undefined)[][],
        rows: number,
        cols: number,
        row: number,
        col: number,
        tileType: number
    ): boolean {
        // Check horizontal match potential
        if (col >= 2) {
            const left1 = grid[row][col - 1];
            const left2 = grid[row][col - 2];
            if (left1 === tileType && left2 === tileType) {
                return true;
            }
        }

        // Check vertical match potential
        if (row >= 2) {
            const up1 = grid[row - 1][col];
            const up2 = grid[row - 2][col];
            if (up1 === tileType && up2 === tileType) {
                return true;
            }
        }

        // Check if between two matching tiles horizontally
        if (col >= 1 && col < cols - 1) {
            const left = grid[row][col - 1];
            const right = grid[row][col + 1];
            if (left === tileType && right === tileType) {
                return true;
            }
        }

        // Check if between two matching tiles vertically
        if (row >= 1 && row < rows - 1) {
            const up = grid[row - 1][col];
            const down = grid[row + 1][col];
            if (up === tileType && down === tileType) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all possible valid moves (swaps that would create matches)
     */
    static getPossibleMoves(
        grid: (number | null | undefined)[][],
        rows: number,
        cols: number
    ): Array<{ from: Match3Position, to: Match3Position }> {
        const moves: Array<{ from: Match3Position, to: Match3Position }> = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const tile = grid[row][col];
                if (!tile) continue;

                // Check adjacent positions
                const adjacentPositions = [
                    { row: row - 1, col }, // Up
                    { row: row + 1, col }, // Down
                    { row, col: col - 1 }, // Left
                    { row, col: col + 1 }  // Right
                ];

                for (const adj of adjacentPositions) {
                    if (adj.row >= 0 && adj.row < rows && adj.col >= 0 && adj.col < cols) {
                        if (Match3Logic.wouldCreateMatch(grid, rows, cols, row, col, adj.row, adj.col)) {
                            moves.push({
                                from: { row, col },
                                to: { row: adj.row, col: adj.col }
                            });
                        }
                    }
                }
            }
        }

        return moves;
    }

    /**
     * Calculate score for a match based on length and type
     */
    static calculateMatchScore(matchPositions: Match3Position[], tileType: number): number {
        const baseScore = 10;
        const lengthMultiplier = matchPositions.length;
        const typeBonus = tileType * 2;

        return baseScore * lengthMultiplier + typeBonus;
    }
}