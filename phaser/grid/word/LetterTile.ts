export class LetterTile {

    private gameObject: Phaser.GameObjects.Container; // <- container only
    readonly letter: string;
    row: number;
    col: number;
    isHighlighted: boolean = false;
    isWildcard: boolean = false;


    constructor(gameObject: Phaser.GameObjects.Container, letter: string, row: number, col: number) {
        this.gameObject = gameObject;
        this.letter = letter;
        this.row = row;
        this.col = col;
    }

    get object(): Phaser.GameObjects.Container {
        return this.gameObject;
    }

    setAlpha(alpha: number): void {
        this.gameObject.setAlpha(alpha);
    }

    updatePosition(row: number, col: number): void {
        this.row = row;
        this.col = col;
    }

    setScale(scale: number): void {
        this.gameObject.setScale(scale);
    }

    setWildcard(isWildcard: boolean, scene: Phaser.Scene): void {
        this.isWildcard = isWildcard;

        // Find letter text in container
        const letterText = this.gameObject.list.find(
            child => child.type === 'Text' && (child as Phaser.GameObjects.Text).text.length === 1
        ) as Phaser.GameObjects.Text;

        if (isWildcard) {
            // Hide letter text
            if (letterText) letterText.setVisible(false);

            // Add star icon
            const star = scene.add.text(0, 0, '⭐', {
                fontSize: '32px',
                color: '#FFD700'
            }).setOrigin(0.5);
            star.setName('wildcard-star');  // Tag it so we can find it later
            this.gameObject.add(star);
        } else {
            // Show letter text
            if (letterText) letterText.setVisible(true);

            // Remove star icon
            const star = this.gameObject.list.find(child => child.name === 'wildcard-star');
            if (star) star.destroy();
        }
    }

    setFrame(frame: number): void {
        const image = this.gameObject.getAt(0) as Phaser.GameObjects.Image;
        if (image && 'setFrame' in image) {
            (image as any).setFrame(frame - 1); // Frames are 0-indexed
        }
    }

    destroy(): void {
        this.gameObject.destroy();
    }
}
