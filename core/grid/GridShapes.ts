// eidosk/core/grid/GridShapes.ts
export type GridShapeFunction = (
    row: number,
    col: number,
    totalRows: number,
    totalCols: number
) => boolean;

export const GridShapes = {
    rectangle: (): boolean => true,

    cross: (row: number, col: number, rows: number, cols: number): boolean => {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        return row === centerRow || col === centerCol;
    },

    plus: (row: number, col: number, rows: number, cols: number): boolean => {
        const centerRow = Math.floor(rows / 2);
        const centerCol = Math.floor(cols / 2);
        if (row === centerRow || col === centerCol) return true;
        if (Math.abs(row - centerRow) === 1 && Math.abs(col - centerCol) <= 1) return true;
        return Math.abs(col - centerCol) === 1 && Math.abs(row - centerRow) <= 1;
    },

    customShape: (row: number, col: number, rows: number, cols: number): boolean => {
        const pattern = `
    . X X X .
    X X X X X
    X X X X X
    X X X X X
    . X X X .
  `.trim().split('\n').map(line => line.trim().split(/\s+/).map(char => char === 'X'));
        if (rows !== pattern.length || cols !== pattern[0].length) {
            return false; // Inactive if size doesn't match
        }
        return pattern[row][col];
    }
};