import {Grid} from "eidosk/core";

export abstract class GravityGrid<T> extends Grid<T> {

    getColumnsWithEmptyCells(): number[] {
        const colSet = new Set<number>();
        for (let row = 0; row < this.getTotRows(); row++) {
            for (let col = 0; col < this.getTotCols(); col++) {
                if (this.isCellActive(row, col) && !this.getCell(row, col)) {
                    colSet.add(col);
                }
            }
        }
        return Array.from(colSet).sort((a, b) => a - b);
    }

    /**
     * Move cells down within each contiguous ACTIVE segment of the column.
     * Returns an array of moves to animate: { from, to, gaps }.
     */
    moveDownCellsAtCol(col: number): { from: number, to: number, gaps: number }[] {
        const moves: { from: number, to: number, gaps: number }[] = [];
        const rows = this.getTotRows();

        let segEnd = rows - 1;
        while (segEnd >= 0) {
            // skip inactive rows (they act as solid separators)
            if (!this.isCellActive(segEnd, col)) {
                segEnd--;
                continue;
            }

            // find start of this active segment (segStart..segEnd inclusive)
            let segStart = segEnd;
            while (segStart - 1 >= 0 && this.isCellActive(segStart - 1, col)) {
                segStart--;
            }

            // compress this segment: write pointer starts at segEnd
            let write = segEnd;
            for (let read = segEnd; read >= segStart; read--) {
                const cell = this.getCell(read, col);
                if (cell !== undefined && cell !== null) {
                    if (write !== read) {
                        // move the cell down to `write`
                        this.setCell(write, col, cell);
                        this.setCell(read, col, undefined);
                        moves.push({ from: read, to: write, gaps: write - read });
                    }
                    write--;
                }
            }
            // clear any remaining slots above `write` in the segment
            for (let r = write; r >= segStart; r--) {
                if (this.getCell(r, col) !== undefined && this.getCell(r, col) !== null) {
                    // defensive: clear if something unexpected remains
                    this.setCell(r, col, undefined);
                }
            }

            // continue with the next segment above this one
            segEnd = segStart - 1;
        }

        return moves;
    }

}
