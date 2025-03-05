// Import necessary classes from the Phaser module
import Phaser, {Scene} from 'phaser';
import Image = Phaser.GameObjects.Image;
import Sprite = Phaser.GameObjects.Sprite;
import BitmapText = Phaser.GameObjects.BitmapText;
import Container = Phaser.GameObjects.Container;
type DisplayObject = Image | Sprite | BitmapText | Container

/**
 * PopAndFade class for animating and removing a display object in Phaser.
 */
export class PopAndFade {

    private displayObject: DisplayObject; // The display object to animate and remove.
    private scene: Scene; // The Phaser scene.
    private callback: any; // The callback function to call after animation.
    private destroy:boolean = true;

    // Constructor function, called when creating a new PopAndFade object.
    constructor(scene:Scene, dObj:DisplayObject, scale:number, duration:number, callback:Function, destroy:boolean=true) {
        this.destroy = destroy;
        // Set default values for scale and duration if not provided.
        if (scale === undefined) {
            scale = 0.3;
        }
        if (duration === undefined) {
            duration = 400;
        }

        // Store the display object, initial scale, and Phaser scene.
        this.displayObject = dObj;
        this.displayObject.setScale(scale); // Apply the initial scale.
        this.scene = scene;

        // If a callback function is provided, bind it to the scene.
        if (callback) {
            this.callback = callback.bind(this.scene);
        }

        // Calculate the duration for the fading part of the animation.
        var duration2 = (duration / 4) * 5;

        // Calculate the final scale for the pop animation.
        var finalScale = scale + scale / 3;

        // Add a scaling animation to the display object.
        scene.tweens.add({
            targets: this.displayObject,
            scale: finalScale,
            ease: 'Quart.easeOut', // Apply easing for smooth animation.
            duration: duration, // Set the duration of the animation.
        });

        // Add a fading animation to the display object.
        scene.tweens.add({
            targets: this.displayObject,
            alpha: 0.1, // Fade the object to an alpha of 0.1.
            ease: 'Quart.easeOut', // Apply easing for smooth animation.
            duration: duration2, // Set the duration for the fading animation.
            onComplete: this.onComplete.bind(this)
        });
    }

    // Method to remove the display object after animation.
    onComplete() {
        // Check if the displayObject exists (not null).
        if (this.displayObject !== null && this.destroy) {
            this.displayObject.destroy(); // Destroy the display object.
        }
        // If a callback function is provided, call it in the scope of the scene.
        if (this.callback) {
            this.callback();
        }
    }
}
