// eidosk/phaser/grid/match3/Match3Matcher.ts
import { Match3Grid, Match3Position } from 'eidosk/core';

export interface MatchProcessingResult {
    totalMatches: number;
    cascadeCount: number;
    noMovesLeft: boolean;
}

export class Match3Matcher {
    private readonly gameGrid: Match3Grid;
    private onMatchFound?: (matches: Match3Position[]) => void;
    private onNoMovesLeft?: () => void;

    constructor(
        gameGrid: Match3Grid,
        callbacks: {
            onMatchFound?: (matches: Match3Position[]) => void;
            onNoMovesLeft?: () => void;
        } = {}
    ) {
        this.gameGrid = gameGrid;
        this.onMatchFound = callbacks.onMatchFound;
        this.onNoMovesLeft = callbacks.onNoMovesLeft;
    }

    findMatches(): Match3Position[] {
        return this.gameGrid.findMatches();
    }

    removeMatches(matches: Match3Position[]): void {
        this.gameGrid.removeMatches(matches);
    }

    async processAllMatches(
        onEachCascade: (matches: Match3Position[]) => Promise<void>,
        onApplyGravity: () => Promise<void>
    ): Promise<MatchProcessingResult> {
        let totalMatches = 0;
        let cascadeCount = 0;

        try {
            // Keep processing matches until no more are found
            while (true) {
                const matches = this.findMatches();

                if (matches.length === 0) {
                    break; // No more matches
                }

                console.log("Found " + matches.length + " matches (cascade " + cascadeCount + ")");
                totalMatches += matches.length;

                // Notify callback
                if (this.onMatchFound) {
                    this.onMatchFound(matches);
                }

                // Let caller handle match removal animation
                await onEachCascade(matches);

                // Remove matches from grid data
                this.removeMatches(matches);

                // Apply gravity and fill new tiles
                await onApplyGravity();

                cascadeCount++;

                // Prevent infinite loops
                if (cascadeCount > 10) {
                    console.warn("Match3Matcher: Too many cascades, stopping");
                    break;
                }
            }

            if (totalMatches > 0) {
                console.log("Match processing complete: " + totalMatches + " total matches, " + cascadeCount + " cascades");
            }

            // Check if there are any possible moves left
            const noMovesLeft = !this.gameGrid.hasPossibleMoves();
            if (noMovesLeft) {
                console.log("No more possible moves!");
                if (this.onNoMovesLeft) {
                    this.onNoMovesLeft();
                }
            }

            return {
                totalMatches,
                cascadeCount,
                noMovesLeft
            };

        } catch (error) {
            console.error("Match3Matcher: Error processing matches: " + error);
            throw error;
        }
    }

    getPossibleMoves(): Array<{ from: Match3Position, to: Match3Position }> {
        return this.gameGrid.getPossibleMoves();
    }

    hasPossibleMoves(): boolean {
        return this.gameGrid.hasPossibleMoves();
    }

    canSwapTiles(row1: number, col1: number, row2: number, col2: number): boolean {
        return this.gameGrid.swapTiles(row1, col1, row2, col2);
    }

    getStats(): {
        totalTiles: number;
        emptyTiles: number;
        tileTypeCounts: { [key: number]: number };
        possibleMoves: number;
    } {
        return this.gameGrid.getStats();
    }

    isValidState(): boolean {
        return this.gameGrid.isValid() && this.gameGrid.isFull();
    }

    getGameGrid(): Match3Grid {
        return this.gameGrid;
    }

    updateCallbacks(callbacks: {
        onMatchFound?: (matches: Match3Position[]) => void;
        onNoMovesLeft?: () => void;
    }): void {
        this.onMatchFound = callbacks.onMatchFound;
        this.onNoMovesLeft = callbacks.onNoMovesLeft;
    }

    destroy(): void {
        this.onMatchFound = undefined;
        this.onNoMovesLeft = undefined;
    }
}