// eidosk/phaser/grid/match3/Match3Animator.ts
import { Scene } from 'phaser';
import { GridTileAnimator, TileGameObject } from 'eidosk/phaser';
import {
    Match3AnimationSettings,
    DEFAULT_MATCH3_ANIMATIONS,
    mergeMatch3AnimationSettings
} from 'eidosk/phaser/animation/config/Match3AnimConfig';

export class Match3Animator extends GridTileAnimator {
    private settings: Match3AnimationSettings;

    constructor(scene: Scene, slowMotionFactor: number = 1.0, animationSettings?: Partial<Match3AnimationSettings>) {
        super(scene);

        let settings = mergeMatch3AnimationSettings(DEFAULT_MATCH3_ANIMATIONS, animationSettings || {});

        if (slowMotionFactor !== 1.0) {
            settings = this.multiplyDurations(settings, slowMotionFactor);
        }

        this.settings = settings;
    }

    private multiplyDurations(settings: Match3AnimationSettings, factor: number): Match3AnimationSettings {
        return {
            ...settings,
            tileSwap: { ...settings.tileSwap, duration: settings.tileSwap.duration * factor },
            invalidSwap: { ...settings.invalidSwap, duration: settings.invalidSwap.duration * factor },
            matchRemoval: { ...settings.matchRemoval, duration: settings.matchRemoval.duration * factor },
            tileFalling: { ...settings.tileFalling, duration: settings.tileFalling.duration * factor },
            newTileEntry: { ...settings.newTileEntry, duration: settings.newTileEntry.duration * factor },
            selection: { ...settings.selection, scaleDuration: settings.selection.scaleDuration * factor },
            hint: { ...settings.hint, duration: settings.hint.duration * factor }
        };
    }

    updateSettings(newSettings: Partial<Match3AnimationSettings>): void {
        this.settings = mergeMatch3AnimationSettings(this.settings, newSettings);
    }

    async animateSwap(
        tile1: TileGameObject,
        tile2: TileGameObject,
        onComplete?: () => void
    ): Promise<void> {
        if (!tile1 || !tile2) return;

        const { duration, ease, overshoot } = this.settings.tileSwap;

        // Store current positions
        const currentPos1 = { x: tile1.x, y: tile1.y };
        const currentPos2 = { x: tile2.x, y: tile2.y };

        // Calculate overshoot positions
        const overshootX = overshoot * 10; // Convert to pixels
        const overshootY = overshoot * 10;

        const promises = [
            new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile1,
                    x: currentPos2.x + (currentPos2.x > currentPos1.x ? overshootX : -overshootX),
                    y: currentPos2.y + (currentPos2.y > currentPos1.y ? overshootY : -overshootY),
                    duration: duration * 0.6,
                    ease: ease,
                    onComplete: () => {
                        // Settle to final position
                        this.scene.tweens.add({
                            targets: tile1,
                            x: currentPos2.x,
                            y: currentPos2.y,
                            duration: duration * 0.4,
                            ease: 'Power2.Out',
                            onComplete: () => resolve()
                        });
                    }
                });
            }),
            new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile2,
                    x: currentPos1.x + (currentPos1.x > currentPos2.x ? overshootX : -overshootX),
                    y: currentPos1.y + (currentPos1.y > currentPos2.y ? overshootY : -overshootY),
                    duration: duration * 0.6,
                    ease: ease,
                    onComplete: () => {
                        // Settle to final position
                        this.scene.tweens.add({
                            targets: tile2,
                            x: currentPos1.x,
                            y: currentPos1.y,
                            duration: duration * 0.4,
                            ease: 'Power2.Out',
                            onComplete: () => resolve()
                        });
                    }
                });
            })
        ];

        await Promise.all(promises);

        if (onComplete) {
            onComplete();
        }
    }

    async animateInvalidSwap(tile1: TileGameObject, tile2: TileGameObject): Promise<void> {
        if (!tile1 || !tile2) return;

        const { duration, distance, repeats, ease } = this.settings.invalidSwap;

        const promises = [
            new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile1,
                    x: tile1.x + distance,
                    duration: duration,
                    yoyo: true,
                    repeat: repeats,
                    ease: ease,
                    onComplete: () => resolve()
                });
            }),
            new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile2,
                    x: tile2.x - distance,
                    duration: duration,
                    yoyo: true,
                    repeat: repeats,
                    ease: ease,
                    onComplete: () => resolve()
                });
            })
        ];

        await Promise.all(promises);
    }

    async animateMatchRemoval(
        tiles: TileGameObject[],
        onTileDestroyed: (tile: TileGameObject) => void
    ): Promise<void> {
        const { duration, staggerDelay, scale, ease, rotation } = this.settings.matchRemoval;

        const promises = tiles.map((tile, index) => {
            if (!tile) return Promise.resolve();

            return new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile,
                    scaleX: scale,
                    scaleY: scale,
                    alpha: 0,
                    rotation: rotation,
                    duration: duration,
                    delay: index * staggerDelay,
                    ease: ease,
                    onComplete: () => {
                        tile.destroy();
                        onTileDestroyed(tile);
                        resolve();
                    }
                });
            });
        });

        await Promise.all(promises);
    }

    async animateNewTileEntry(
        tiles: TileGameObject[],
        onComplete?: () => void
    ): Promise<void> {
        const { duration, ease, startScale, endScale, staggerDelay } = this.settings.newTileEntry;

        // Set initial state
        tiles.forEach(tile => {
            if (tile) {
                tile.setScale(startScale);
                tile.setAlpha(0);
            }
        });

        const promises = tiles.map((tile, index) => {
            if (!tile) return Promise.resolve();

            return new Promise<void>(resolve => {
                this.scene.tweens.add({
                    targets: tile,
                    scaleX: endScale,
                    scaleY: endScale,
                    alpha: 1,
                    duration: duration,
                    delay: index * staggerDelay,
                    ease: ease,
                    onComplete: () => resolve()
                });
            });
        });

        await Promise.all(promises);

        if (onComplete) {
            onComplete();
        }
    }

    animateSelection(tile: TileGameObject): void {
        if (!tile) return;

        const { scaleDuration, scaleAmount, alpha, ease } = this.settings.selection;

        this.scene.tweens.add({
            targets: tile,
            scaleX: scaleAmount,
            scaleY: scaleAmount,
            alpha: alpha,
            duration: scaleDuration,
            ease: ease
        });
    }

    animateDeselection(tile: TileGameObject): void {
        if (!tile) return;

        const { scaleDuration, ease } = this.settings.selection;

        this.scene.tweens.add({
            targets: tile,
            scaleX: 1.0,
            scaleY: 1.0,
            alpha: 1.0,
            duration: scaleDuration,
            ease: ease
        });
    }

    animateHint(tiles: TileGameObject[]): void {
        const { duration, alpha, scale, repeats, staggerDelay, ease } = this.settings.hint;

        tiles.forEach((tile, index) => {
            if (tile) {
                this.scene.tweens.add({
                    targets: tile,
                    alpha: alpha,
                    scaleX: scale,
                    scaleY: scale,
                    duration: duration,
                    delay: index * staggerDelay,
                    yoyo: true,
                    repeat: repeats,
                    ease: ease
                });
            }
        });
    }

    async animateGravityAndRefill(
        fallingTiles: { tile: TileGameObject, fromY: number, toY: number }[],
        newTiles: TileGameObject[]
    ): Promise<void> {
        // Animate existing tiles falling
        if (fallingTiles.length > 0) {
            await super.animateFallingTiles(fallingTiles, {
                duration: this.settings.tileFalling.duration,
                ease: this.settings.tileFalling.ease,
                gravity: this.settings.tileFalling.gravity,
                yVelocity: this.settings.tileFalling.yVelocity,
                bounce: this.settings.tileFalling.bounce
            });
        }

        // Animate new tiles entering
        if (newTiles.length > 0) {
            await this.animateNewTileEntry(newTiles);
        }
    }

    getSettings(): Match3AnimationSettings {
        return { ...this.settings };
    }

    destroy(): void {
        super.destroy();
    }
}