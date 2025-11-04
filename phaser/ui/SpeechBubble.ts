export class SpeechBubble {
        private _container: Phaser.GameObjects.Container;
        public character: any; // Assuming character is a Phaser.GameObjects.Sprite or similar; adjust type as needed
        private topLeftCorner: Phaser.GameObjects.Sprite;
        private bodyCenter: Phaser.GameObjects.Sprite;
        private topRightCorner: Phaser.GameObjects.Sprite;
        private bottomLeftCorner: Phaser.GameObjects.Sprite;
        private bottomRightCorner: Phaser.GameObjects.Sprite;
        private speechBlackArrow: Phaser.GameObjects.Sprite;
        private bitmapText: Phaser.GameObjects.BitmapText | null = null;

        public static TEXT_HEIGHT: number = 6;
        public static BODY_HEIGHT: number = 12;

        constructor(scene: Phaser.Scene, msg: string, character: any, y: number) {
            this._container = new Phaser.GameObjects.Container(scene, 0, y);
            scene.add.existing(this._container);
            this.character = character;
            this.makeSprites();
            this.flipSprites();
            this.addSprites();
            this.setUp(msg);
            if (this.character.scale.x === -1) {
                this.flipText();
            }
        }

        public get container(): Phaser.GameObjects.Container {
            return this._container;
        }

        public get x(): number {
            return this._container.x;
        }

        public set x(value: number) {
            this._container.x = value;
        }

        public get y(): number {
            return this._container.y;
        }

        public set y(value: number) {
            this._container.y = value;
        }

        public get scaleX(): number {
            return this._container.scaleX;
        }

        public set scaleX(value: number) {
            this._container.scaleX = value;
        }

        public get scaleY(): number {
            return this._container.scaleY;
        }

        public set scaleY(value: number) {
            this._container.scaleY = value;
        }

        public setScale(x: number, y?: number): void {
            this._container.setScale(x, y);
        }

        private addSprites(): void {
            console.log("ADD SPRITES");
            this._container.add(this.topLeftCorner);
            this._container.add(this.bodyCenter);
            this._container.add(this.topRightCorner);
            this._container.add(this.bottomLeftCorner);
            this._container.add(this.bottomRightCorner);
            this._container.add(this.speechBlackArrow);
        }

        private addBitmapText(txt: string): void {
            this.createBitmapText(txt);
            this._container.add(this.bitmapText!);
        }

        public center(): void {
            const totalWidth = 2 * this.topLeftCorner.displayWidth + this.bitmapText!.width;
            this.x = -Math.floor(totalWidth * 0.5);
        }

        private createBitmapText(txt: string): void {
            if (this.bitmapText !== null) {
                this._container.remove(this.bitmapText);
                this.bitmapText = null;
            }
            this.bitmapText = new Phaser.GameObjects.BitmapText(this._container.scene, this.topLeftCorner.displayWidth, -1, 'myfont', txt, 16);
            this.bitmapText.setOrigin(0, 0);
        }

        private flipSprites(): void {
            this.topRightCorner.setScale(-1, 1);
            this.bottomLeftCorner.setScale(1, -1);
            this.bottomRightCorner.setScale(-1, -1);
        }

        private flipText(): void {
            this.setScale(this.scaleX * -1, 1);
            this.center();
        }

        public getText(): string {
            return this.bitmapText!.text;
        }

        private makeSprites(): void {
            this.topLeftCorner = new Phaser.GameObjects.Sprite(this._container.scene, 0, 0, 'speech_corner');
            this.topLeftCorner.setOrigin(0, 0);
            this.bodyCenter = new Phaser.GameObjects.Sprite(this._container.scene, 0, 0, 'speech_body');
            this.bodyCenter.setOrigin(0, 0);
            this.topRightCorner = new Phaser.GameObjects.Sprite(this._container.scene, 0, 0, 'speech_corner');
            this.topRightCorner.setOrigin(0, 0);
            this.bottomLeftCorner = new Phaser.GameObjects.Sprite(this._container.scene, 0, 0, 'speech_corner');
            this.bottomLeftCorner.setOrigin(0, 0);
            this.bottomRightCorner = new Phaser.GameObjects.Sprite(this._container.scene, 0, 0, 'speech_corner');
            this.bottomRightCorner.setOrigin(0, 0);
            this.speechBlackArrow = new Phaser.GameObjects.Sprite(this._container.scene, 0, 0, 'speech_arrow');
            this.speechBlackArrow.setOrigin(0, 0);
        }

        private positionSprites(): void {
            this.bodyCenter.x = this.topLeftCorner.displayWidth;
            this.topRightCorner.x = this.topLeftCorner.displayWidth * 2 + this.bitmapText!.width;
            this.bottomLeftCorner.y = SpeechBubble.TEXT_HEIGHT * 2;
            this.bottomRightCorner.x = this.topLeftCorner.displayWidth * 2 + this.bitmapText!.width;
            this.bottomRightCorner.y = SpeechBubble.TEXT_HEIGHT * 2;
            this.speechBlackArrow.x = (this.bodyCenter.displayWidth + this.topLeftCorner.displayWidth * 2) * 0.5 - this.speechBlackArrow.displayWidth * 0.5;
            this.speechBlackArrow.y = SpeechBubble.BODY_HEIGHT;
        }

        private resize(): void {
            this.bodyCenter.displayWidth = this.bitmapText!.width;
            this.bodyCenter.displayHeight = SpeechBubble.BODY_HEIGHT;
        }

        private setUp(msg: string): void {
            this.createBitmapText(msg);
            this.resize();
            this.positionSprites();
            this._container.add(this.bitmapText!);
            this.center();
        }
}