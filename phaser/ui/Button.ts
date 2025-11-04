import { Scene } from 'phaser';
import { LayoutConfig } from 'eidosk/core';

export interface ButtonConfig extends LayoutConfig {
    name?: string;
    texture?: string;
    hoverTexture?: string;
    disabledTexture?: string;
    disabled?: boolean;
    text?: string;
    font?: string;
    fontSize?: number;
    color?: number | string;
    onClick?: () => void;
    onPointerOver?: () => void;
    onPointerOut?: () => void;
}

export class Button {
    private readonly base: Phaser.GameObjects.Image | Phaser.GameObjects.Container;
    private readonly image: Phaser.GameObjects.Image;
    private readonly text?: Phaser.GameObjects.Text;
    private onClickCallback?: () => void;
    private readonly normalTexture: string;
    private readonly hoverTexture?: string;
    private disabledTexture?: string;
    private disabled = false;

    constructor(scene: Scene, cfg: ButtonConfig) {
        const {
            name, texture, hoverTexture, disabledTexture, text, font, fontSize, color, onClick,
            x, y, percX, percY, scale = 1, originX = 0.5, originY = 0.5,
            alpha = 1, rotation = 0, visible = true, disabled = false  // ADD THIS
        } = cfg;

        this.normalTexture = texture || "defaultTexture";
        this.hoverTexture = hoverTexture;
        this.disabledTexture = disabledTexture;
        this.onClickCallback = onClick ?? (() => console.log('Button "' + (name || this.normalTexture) + '" clicked'));

        const finalX = x ?? (percX ? scene.scale.width * percX / 100 : scene.scale.width / 2);
        const finalY = y ?? (percY ? scene.scale.height * percY / 100 : scene.scale.height / 2);

        this.image = scene.add.image(finalX, finalY, this.normalTexture)
            .setOrigin(originX, originY).setScale(scale).setAlpha(alpha)
            .setRotation(rotation).setVisible(visible)
            .setInteractive({ useHandCursor: true });

        const container = text ? scene.add.container(finalX, finalY) : null;
        if (container) {
            this.image.setPosition(0, 0).disableInteractive();
            container.add(this.image).setSize(this.image.width * scale, this.image.height * scale)
                .setInteractive({ useHandCursor: true });
            this.text = scene.add.text(0, 0, text!, {
                font: font ?? 'Arial',
                fontSize: (fontSize ?? 24) + 'px',
                color: typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : (color ?? '#fff')
            }).setOrigin(0.5);
            container.add(this.text);
            this.base = container;
        } else this.base = this.image;

        const target = (container || this.image) as Phaser.GameObjects.GameObject;
        target.on('pointerup', () => { if (!this.disabled) this.onClickCallback?.(); });

        if (hoverTexture)
            target.on('pointerover', () => { if (!this.disabled) this.image.setTexture(hoverTexture); })
                .on('pointerout', () => { if (!this.disabled) this.image.setTexture(this.normalTexture); });
        if (disabled) {
            this.setDisabled(true);
        }
    }

    setDisabledTexture(key: string): this {
        this.disabledTexture = key;
        if (this.disabled) {
            this.image.setTexture(key);
        }
        return this;
    }

    setDisabled(disabled: boolean): this {
        this.disabled = disabled;
        const base = this.base;
        if (disabled) {
            base.disableInteractive();
            console.log("this.disabledTexture: " + this.disabledTexture);
            this.image.setTexture(this.disabledTexture || this.normalTexture);
            base.setAlpha(0.7);
        } else {
            base.setInteractive({ useHandCursor: true });
            this.image.setTexture(this.normalTexture);
            base.setAlpha(1);
        }
        return this;
    }

    isDisabled(): boolean {
        return this.disabled;
    }

    setOnClick(callback: () => void): this {
        this.onClickCallback = callback;
        return this;
    }

    hasOnClick(): boolean {
        return this.onClickCallback !== undefined;
    }

    setAlpha(a: number): this { this.base.setAlpha(a); return this; }
    setScale(s: number): this { this.base.setScale(s); return this; }
    setFrame(frame: string | number): this { this.image.setFrame(frame); return this; }
    setTint(c: number): this { this.image.setTint(c); return this; }
    setTexture(key: string, frame?: string | number): this { this.image.setTexture(key, frame); return this; }
    setText(t: string): this { this.text?.setText(t); return this; }
    destroy(): void { this.base.destroy(); }
    get gameObject() { return this.base; }
    get imageObject() { return this.image; }
}