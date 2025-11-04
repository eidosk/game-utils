export class CountdownManager {
    private counter: number;
    private text?: Phaser.GameObjects.BitmapText;

    constructor(
        private scene: Phaser.Scene,
        private font: string,
        private onComplete: () => void,
        private options: {
            startValue?: number;
            fontSize?: number;
            x?: number;
            y?: number;
            color?: number;
            finalText?: string;
            tickDuration?: number;
        } = {}
    ) {
        this.counter = options.startValue ?? 3;
    }

    start(): void {
        this.tick();
    }

    private showText(text: string): void {
        this.text?.destroy();

        const x = this.options.x ?? this.scene.scale.width / 2;
        const y = this.options.y ?? this.scene.scale.height / 2;
        const fontSize = this.options.fontSize ?? 140;
        const color = this.options.color ?? 0xFFFFFF;
        const tickDuration = this.options.tickDuration ?? 1000;  // Default 1 second

        this.text = this.scene.add.bitmapText(x, y, this.font, text, fontSize)
            .setOrigin(0.5)
            .setTint(color);

        this.scene.tweens.add({
            targets: this.text,
            scale: 1.4,
            ease: 'Sine.easeOut',
            duration: tickDuration * 0.6  // Scale is 60% of tick duration
        });

        this.scene.tweens.add({
            targets: this.text,
            alpha: 0,
            duration: tickDuration * 0.4,  // Fade is 40% of tick duration
            delay: tickDuration * 0.2,     // Delay is 20% of tick duration
            onComplete: () => this.tick()
        });
    }

    private tick(): void {
        if (this.counter < 0) {
            this.onComplete();
            return;
        }

        const text = this.counter === 0 ? (this.options.finalText ?? "GO!") : this.counter.toString();
        this.showText(text);
        this.counter--;
    }
}