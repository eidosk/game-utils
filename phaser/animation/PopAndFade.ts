import {Scene, DisplayObject} from "eidosk/phaser";

/**
 * PopAndFade class for animating and removing a display object in Phaser.
 */
export class PopAndFade {
    private scene: Scene;
    private readonly callback?: () => void;
    private readonly shouldDestroy: boolean;

    constructor(
        scene: Scene,
        displayObject: DisplayObject,
        duration: number = 400,
        callback?: () => void,
        shouldDestroy: boolean = true
    ) {
        this.scene = scene;
        this.callback = callback;
        this.shouldDestroy = shouldDestroy;
        this.startAnimation(displayObject, duration);
    }

    private startAnimation(displayObject:DisplayObject, duration: number): void {
        const fadeDuration = duration * .9;
        const finalScale = displayObject.scale * 1.1;
        const fadeAlpha = 0.1;

        // Pop animation
        this.scene.tweens.add({
            targets: displayObject,
            scale: finalScale,
            ease: Phaser.Math.Easing.Back.Out,
            duration: duration
        });

        // Fade animationscale
        this.scene.tweens.add({
            targets: displayObject,
            alpha: fadeAlpha,
            ease: Phaser.Math.Easing.Sine.Out,
            duration: fadeDuration,
            onComplete: () => this.onComplete(displayObject)
        });
    }

    private onComplete(displayObject:DisplayObject): void {
        if (displayObject && this.shouldDestroy) displayObject.destroy();
        this.callback?.();
    }
}
