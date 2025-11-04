import { Scene } from 'phaser';

export class Orientation {
    private scene?: Scene;
    private readonly resizeListener?: () => void;

    // Static methods (no scene needed)
    static isPortrait(): boolean {
        return window.innerHeight > window.innerWidth;
    }

    static isLandscape(): boolean {
        return window.innerWidth > window.innerHeight;
    }

    static getAspectRatio(): number {
        return window.innerWidth / window.innerHeight;
    }

    // Instance methods (for scene management)
    constructor(scene: Scene) {
        this.scene = scene;
        this.resizeListener = this.onResize.bind(this);
    }

    setup(): void {
        window.addEventListener('resize', this.resizeListener!);
    }

    destroy(): void {
        window.removeEventListener('resize', this.resizeListener!);
    }

    private onResize(): void {
        const aspectRatio = Orientation.getAspectRatio();
        this.scene!.events.emit('orientationChanged', aspectRatio);
    }
}