export interface GridPosition {
    row: number;
    col: number;
}

/*todo:
*
* - Fix performance issue: Replace Set creation in canExtendPath() with direct array search
* - Rename method: buildWordFromPath() → buildStringFromPath()
* - Add type alias: Export type WordPosition = GridPosition for backward compatibility
* - Update imports: Fix all references across word system files
* Priority: Medium - functionality works but needs architectural cleanup for proper reusability.
*
* */

export class GridPositionUtils {

    /**
     * Check if two positions are adjacent (horizontally, vertically, or diagonally)
     */
    static areAdjacent(pos1: GridPosition, pos2: GridPosition): boolean {
        const rowDiff = Math.abs(pos1.row - pos2.row);
        const colDiff = Math.abs(pos1.col - pos2.col);

        // Adjacent includes diagonal neighbors (8-directional)
        return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
    }

    /**
     * Validate that a path of positions forms a connected chain
     */
    static isValidPath(positions: GridPosition[]): boolean {
        if (positions.length === 0) return false;
        if (positions.length === 1) return true;

        // Check that each position is adjacent to the next
        for (let i = 0; i < positions.length - 1; i++) {
            if (!this.areAdjacent(positions[i], positions[i + 1])) {
                return false;
            }
        }

        // Check for duplicate positions (can't use same tile twice)
        const positionSet = new Set<string>();
        for (const pos of positions) {
            const key = pos.row + "," + pos.col;
            if (positionSet.has(key)) {
                return false;
            }
            positionSet.add(key);
        }

        return true;
    }

    /**
     * Build a word string from a path through the grid
     */
    static buildWordFromPath(
        grid: (string | null | undefined)[][],
        path: GridPosition[]
    ): string {
        let word = "";

        for (const pos of path) {
            // Validate position bounds before accessing
            if (pos.row >= 0 && pos.row < grid.length &&
                pos.col >= 0 && pos.col < grid[pos.row].length) {

                const letter = grid[pos.row][pos.col];
                if (letter) {
                    word += letter.toUpperCase();
                }
            }
        }

        return word;
    }

    /**
     * Check if a position is valid within grid bounds
     */
    static isValidPosition(pos: GridPosition, rows: number, cols: number): boolean {
        return pos.row >= 0 && pos.row < rows && pos.col >= 0 && pos.col < cols;
    }

    /**
     * Get all adjacent positions for a given position within grid bounds
     */
    static getAdjacentPositions(
        pos: GridPosition,
        rows: number,
        cols: number
    ): GridPosition[] {
        const adjacent: GridPosition[] = [];

        // Check all 8 directions (including diagonals)
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
                if (rowOffset === 0 && colOffset === 0) continue; // Skip center

                const newPos: GridPosition = {
                    row: pos.row + rowOffset,
                    col: pos.col + colOffset
                };

                if (this.isValidPosition(newPos, rows, cols)) {
                    adjacent.push(newPos);
                }
            }
        }

        return adjacent;
    }

    /**
     * Check if adding a position to a path would maintain validity
     */
    static canExtendPath(
        currentPath: GridPosition[],
        newPosition: GridPosition
    ): boolean {
        if (currentPath.length === 0) return true;

        // Check if new position is adjacent to last position
        const lastPos = currentPath[currentPath.length - 1];
        if (!this.areAdjacent(lastPos, newPosition)) {
            return false;
        }

        // Efficient duplicate check using Set
        const posKey = newPosition.row + "," + newPosition.col;
        const existingKeys = new Set(currentPath.map(pos => pos.row + "," + pos.col));

        return !existingKeys.has(posKey);
    }

    /**
     * Generate a unique key for a position (useful for Set operations)
     */
    static positionKey(pos: GridPosition): string {
        return pos.row + "," + pos.col;
    }

    /**
     * Calculate Manhattan distance between two positions
     */
    static manhattanDistance(pos1: GridPosition, pos2: GridPosition): number {
        return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
    }

    /**
     * Calculate Chebyshev distance (diagonal allowed) between two positions
     */
    static chebyshevDistance(pos1: GridPosition, pos2: GridPosition): number {
        return Math.max(Math.abs(pos1.row - pos2.row), Math.abs(pos1.col - pos2.col));
    }

    /**
     * Check if a path contains a specific position
     */
    static pathContainsPosition(path: GridPosition[], targetPos: GridPosition): boolean {
        const targetKey = this.positionKey(targetPos);
        return path.some(pos => this.positionKey(pos) === targetKey);
    }

    /**
     * Get the length of a path (number of positions)
     */
    static getPathLength(path: GridPosition[]): number {
        return path.length;
    }

    /**
     * Reverse a path (useful for different traversal directions)
     */
    static reversePath(path: GridPosition[]): GridPosition[] {
        return [...path].reverse();
    }
}