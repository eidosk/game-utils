// eidosk/phaser/grid/word/LetterGridAnimator.ts
import { Scene } from 'phaser';
import {GridTileAnimator, GridVisualRenderer, LetterTile} from 'eidosk/phaser';
import {
    LetterAnimationSettings,
    DEFAULT_LETTER_ANIMATIONS,
    mergeAnimationSettings
} from 'eidosk/phaser/animation/config/LetterAnimConfig.ts';
import {GridPosition, LetterGrid} from "eidosk/core";

export class LetterGridAnimator extends GridTileAnimator {
    private settings: LetterAnimationSettings;

    constructor(scene: Scene, slowMotionFactor: number = 1.0, animationSettings?: Partial<LetterAnimationSettings>) {
        super(scene);
        let settings = mergeAnimationSettings(DEFAULT_LETTER_ANIMATIONS, animationSettings || {});

        if (slowMotionFactor !== 1.0) {
            settings = this.multiplyDurations(settings, slowMotionFactor);
        }

        this.settings = settings;
    }

    private multiplyDurations(settings: LetterAnimationSettings, factor: number): LetterAnimationSettings {
        return {
            letterRemoval: {
                ...settings.letterRemoval,
                duration: settings.letterRemoval.duration * factor,
                staggerDelay: settings.letterRemoval.staggerDelay * factor
            },
            letterFalling: {
                ...settings.letterFalling,
                duration: settings.letterFalling.duration * factor
            },
            wordPath: {
                ...settings.wordPath,
                scaleDuration: settings.wordPath.scaleDuration * factor,
                staggerDelay: settings.wordPath.staggerDelay * factor
            },
            wordFound: {
                ...settings.wordFound,
                celebrationDuration: settings.wordFound.celebrationDuration * factor,
                staggerDelay: settings.wordFound.staggerDelay * factor
            },
            invalidWord: {
                ...settings.invalidWord,
                shakeDuration: settings.invalidWord.shakeDuration * factor
            },
            pathGlow: {
                ...settings.pathGlow,
                pulseDuration: settings.pathGlow.pulseDuration * factor
            },
            floatingScore: {
                ...settings.floatingScore,
                duration: settings.floatingScore.duration * factor
            },
            hint: {
                ...settings.hint,
                duration: settings.hint.duration * factor,
                staggerDelay: settings.hint.staggerDelay * factor
            },
            clearPath: {
                ...settings.clearPath,
                duration: settings.clearPath.duration * factor
            }
        };
    }

    private applyGravityAndCollectMoves(
        letterGrid: LetterGrid,
        visualRenderer: GridVisualRenderer<string, LetterTile>,
        getPosition: (row: number, col: number) => { x: number, y: number }
    ): {
        tilesToAnimate: { tile: LetterTile, fromY: number, toY: number }[];
        allMoves: Array<{ col: number; from: number; to: number }>;
    } {
        const affectedCols = letterGrid.getColumnsWithEmptyCells();
        const allMoves: Array<{ col: number; from: number; to: number }> = [];
        const tilesToAnimate: { tile: LetterTile, fromY: number, toY: number }[] = [];

        const tiles = (visualRenderer as any).tiles as Array<Array<LetterTile | null>>;

        for (const col of affectedCols) {
            const moves = letterGrid.moveDownCellsAtCol(col);
            console.log("Column " + col + " moves:", moves.length);

            for (const move of moves) {
                allMoves.push({ col, from: move.from, to: move.to });

                const tile = visualRenderer.getTile(move.from, col);

                if (tile) {
                    const fromPos = getPosition(move.from, col);
                    const toPos = getPosition(move.to, col);

                    tilesToAnimate.push({
                        tile,
                        fromY: fromPos.y,
                        toY: toPos.y
                    });

                    console.log("Will move tile from row " + move.from + " to " + move.to);
                } else {
                    console.log("No visual tile found at from=", move.from, "col=", col);
                }
            }
        }

        return { tilesToAnimate, allMoves };
    }

    private clearRemovedTilesFromArray(
        visualRenderer: GridVisualRenderer<string, LetterTile>,
        removedPositions: GridPosition[]
    ): void {
        const tiles = (visualRenderer as any).tiles as Array<Array<LetterTile | null>>;

        for (const pos of removedPositions) {
            if (tiles[pos.row] && tiles[pos.row][pos.col]) {
                const tile = tiles[pos.row][pos.col];
                if (tile && (tile as any).object && (tile as any).object.destroy) {
                    (tile as any).object.destroy();
                }
                tiles[pos.row][pos.col] = null;
            }
        }

        console.log("=== Cleared " + removedPositions.length + " removed positions from tile array ===");
    }

    private updateTileArrayAfterGravity(
        visualRenderer: GridVisualRenderer<string, LetterTile>,
        allMoves: Array<{ col: number; from: number; to: number }>
    ): void {
        const tiles = (visualRenderer as any).tiles;

        console.log("=== UPDATING TILE ARRAY ===");

        const sortedMoves = [...allMoves].sort((a, b) => b.from - a.from);

        for (const move of sortedMoves) {
            const tile = tiles[move.from][move.col];
            if (tile) {
                tiles[move.from][move.col] = null;
                tiles[move.to][move.col] = tile;

                tile.updatePosition(move.to, move.col);

                console.log("Moved tile from row " + move.from + " to " + move.to + ", updated tile.row");
            }
        }

        console.log("=== Updated " + sortedMoves.length + " tile array positions ===");
    }

    private async animateNewTilesFalling(
        newLetterPositions: GridPosition[],
        visualRenderer: GridVisualRenderer<string, LetterTile>,
        getPosition: (row: number, col: number) => { x: number, y: number }
    ): Promise<void> {
        const newTileData = newLetterPositions
            .map(pos => {
                const tile = visualRenderer.getTile(pos.row, pos.col);
                return tile ? { row: pos.row, col: pos.col, tile } : null;
            })
            .filter((item): item is { row: number, col: number, tile: LetterTile } => item !== null);

        if (newTileData.length === 0) return;

        console.log("=== Animating " + newTileData.length + " new tiles falling ===");

        const newTilesToMove = newTileData.map(item => {
            const targetPos = getPosition(item.row, item.col);
            return {
                tile: item.tile,
                fromY: targetPos.y - this.settings.letterFalling.dropDistance,
                toY: targetPos.y
            };
        });

        await super.animateFallingTiles(newTilesToMove, {
            duration: this.settings.letterFalling.duration,
            ease: this.settings.letterFalling.ease,
            gravity: this.settings.letterFalling.gravity,
            bounce: this.settings.letterFalling.bounce,
            yVelocity: this.settings.letterFalling.yVelocity
        });
    }

    private recaptureSurvivorsAfterGravity(
        letterGrid: LetterGrid,
        visualRenderer: GridVisualRenderer<string, LetterTile>
    ): Map<string, number> {
        const currentSize = letterGrid.getTotRows();
        const updatedSurvivors = new Map<string, number>();

        for (let row = 0; row < currentSize; row++) {
            for (let col = 0; col < currentSize; col++) {
                const tile = visualRenderer.getTile(row, col);
                if (tile && tile.object) {
                    const tileType = (tile.object as any).tileType;
                    if (tileType !== undefined && tileType !== 0) {
                        updatedSurvivors.set(`${row},${col}`, tileType);
                        console.log(`[Refill] Recaptured survivor at [${row},${col}] type=${tileType}`);
                    }
                }
            }
        }

        console.log(`[Refill] Recaptured ${updatedSurvivors.size} survivors after gravity`);
        return updatedSurvivors;
    }

    private passSurvivorsToFactory(
        visualRenderer: GridVisualRenderer<string, LetterTile>,
        survivors: Map<string, number>
    ): void {
        const tileFactory = (visualRenderer as any).tileFactory;
        if (tileFactory && tileFactory.setSurvivors) {
            tileFactory.setSurvivors(survivors);
        }
    }

    private clearSurvivorsFromFactory(
        visualRenderer: GridVisualRenderer<string, LetterTile>
    ): void {
        const tileFactory = (visualRenderer as any).tileFactory;
        if (tileFactory && tileFactory.clearSurvivors) {
            tileFactory.clearSurvivors();
        }
    }

    async animateWordRemovalAndRefill(
        removedPositions: GridPosition[],
        letterGrid: LetterGrid,
        visualRenderer: GridVisualRenderer<string, LetterTile>,
        getPosition: (row: number, col: number) => { x: number, y: number },
        skipRefill: boolean = false
    ): Promise<void> {
        console.log("=== Starting word removal" + (skipRefill ? " (level complete)" : " and refill") + " ===");

        this.clearRemovedTilesFromArray(visualRenderer, removedPositions);

        if (skipRefill) {
            console.log("=== Skipping gravity and refill (transitioning to next level) ===");
            return;
        }

        const { tilesToAnimate, allMoves } = this.applyGravityAndCollectMoves(
            letterGrid,
            visualRenderer,
            getPosition
        );

        if (tilesToAnimate.length > 0) {
            console.log("=== Animating " + tilesToAnimate.length + " falling tiles ===");
            await super.animateFallingTiles(tilesToAnimate, {
                duration: this.settings.letterFalling.duration,
                ease: this.settings.letterFalling.ease,
                gravity: this.settings.letterFalling.gravity,
                bounce: this.settings.letterFalling.bounce,
                yVelocity: this.settings.letterFalling.yVelocity
            });

            this.updateTileArrayAfterGravity(visualRenderer, allMoves);
        }

        const updatedSurvivors = this.recaptureSurvivorsAfterGravity(letterGrid, visualRenderer);

        const newLetterPositions = letterGrid.fillEmptyTopCells();
        console.log("=== Filled " + newLetterPositions.length + " new positions ===");

        // ✅ Check if grid has combo tiles (game-specific but generic enough)
        if ((letterGrid as any).getComboTiles) {
            const comboTiles = (letterGrid as any).getComboTiles();
            comboTiles.forEach((type: number, key: string) => {
                updatedSurvivors.set(key, type);
            });
        }

        if (newLetterPositions.length > 0) {
            this.passSurvivorsToFactory(visualRenderer, updatedSurvivors);
            visualRenderer.renderPositions(letterGrid, newLetterPositions);
            this.clearSurvivorsFromFactory(visualRenderer);
            await this.animateNewTilesFalling(newLetterPositions, visualRenderer, getPosition);
        }

        console.log("=== Word removal and refill complete ===");
    }

    async animateLetterRemoval(
        tiles: LetterTile[],
        onTileDestroyed: (tile: LetterTile) => void
    ): Promise<void> {
        const { duration, staggerDelay, ease, rotation, endScale } = this.settings.letterRemoval;

        const promises = tiles.map((tile, index) => {
            if (!tile) return Promise.resolve();

            return new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile.object,
                    scaleX: endScale,
                    scaleY: endScale,
                    alpha: 0,
                    rotation: rotation,
                    duration: duration,
                    delay: index * staggerDelay,
                    ease: ease,
                    onComplete: () => {
                        onTileDestroyed(tile);
                        resolve();
                    }
                });
            });
        });

        await Promise.all(promises);
    }

    public async animateTileSwap(
        tile1: LetterTile,
        tile2: LetterTile,
        tile1Target: { x: number, y: number },
        tile2Target: { x: number, y: number }
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scene.tweens.add({
                targets: tile1.object,
                x: tile1Target.x,
                y: tile1Target.y,
                duration: 400,
                ease: 'Power2'
            });

            this.scene.tweens.add({
                targets: tile2.object,
                x: tile2Target.x,
                y: tile2Target.y,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    destroy(): void {
        super.destroy();
    }
}