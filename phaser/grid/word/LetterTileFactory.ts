// eidosk/phaser/grid/word/LetterTileFactory.ts
import { Scene } from 'phaser';
import {TileFactory, TileConfig, LetterTile} from 'eidosk/phaser';
import { ScrabbleScorer } from 'eidosk/core';
import {TileType} from "game/core";

export interface LetterTileConfig {
    backgroundColor?: number;
    borderColor?: number;
    borderWidth?: number;
    textColor?: number;
    fontSize?: number;
    fontFamily?: string;
    showLetterScore?: boolean;
    textureKey?: string;
    useBitmapText?: boolean; // new
    bitmapFontKey?: string;  // required if useBitmapText = true
    colorTextures?: Map<TileType, string>;
}

export class LetterTileFactory extends TileFactory<string> {
    protected backgroundColor: number;
    protected borderColor: number;
    protected borderWidth: number;
    protected textColor: number;
    protected fontSize: number;
    protected fontFamily: string;
    protected showLetterScore: boolean;
    protected scorer: ScrabbleScorer;
    protected textureKey?: string;
    protected useBitmapText: boolean;
    protected bitmapFontKey: string | boolean;

    constructor(scene: Scene, scorer: ScrabbleScorer, config: LetterTileConfig = {}) {
        super(scene);
        this.backgroundColor = config.backgroundColor || 0xf5f5dc;
        this.borderColor = config.borderColor || 0x8b7355;
        this.borderWidth = config.borderWidth || 2;
        this.textColor = config.textColor || 0x2f4f4f;
        console.log("config.fontSize:" + config.fontSize);
        this.fontSize = config.fontSize || 24;
        this.fontFamily = config.fontFamily || 'Arial Black';
        this.showLetterScore = config.showLetterScore ?? true;
        this.textureKey = config.textureKey;
        this.scorer = scorer;
        this.useBitmapText = config.useBitmapText || false;
        this.bitmapFontKey = config.bitmapFontKey || false;
    }

    // ✅ NEW: Reusable 3D effect
    protected add3DEffect(graphics: Phaser.GameObjects.Graphics, size: number): void {
        graphics.fillStyle(0xffffff, 0.3);
        graphics.fillRoundedRect(-size/2 + 2, -size/2 + 2, size - 4, size / 6, 2);
        graphics.fillStyle(0x000000, 0.1);
        graphics.fillRoundedRect(-size/2 + 2, size/2 - size / 6, size - 4, size / 8, 2);
    }

    protected createBackground(container: Phaser.GameObjects.Container, config: TileConfig): void {
        if (this.textureKey && this.scene.textures.exists(this.textureKey)) {
            const image = this.scene.add.image(0, 0, this.textureKey as string);
            image.setDisplaySize(config.size, config.size);
            container.add(image);
            //container.sendToBack(image);
        } else {
            const graphics = this.scene.add.graphics();
            graphics.fillStyle(this.backgroundColor);
            graphics.fillRoundedRect(-config.size / 2, -config.size / 2, config.size, config.size, 4);

            if (this.borderWidth > 0) {
                graphics.lineStyle(this.borderWidth, this.borderColor, 1);
                graphics.strokeRoundedRect(-config.size / 2, -config.size / 2, config.size, config.size, 4);
            }

            this.add3DEffect(graphics, config.size);
            container.add(graphics);
        }
    }

    protected createTextLayer(container: Phaser.GameObjects.Container, config: TileConfig, letter: string): void {
        let letterText;

        if (this.useBitmapText && this.bitmapFontKey) {
            // Use BitmapText
            if (typeof this.bitmapFontKey === "string") {
                letterText = this.scene.add.bitmapText(0, 0, this.bitmapFontKey, letter.toUpperCase(), this.fontSize);
            }
            letterText.setOrigin(0.5, 0.5);
        } else {
            // Use normal Text
            letterText = this.scene.add.text(0, 0, letter.toUpperCase(), {
                fontFamily: this.fontFamily,
                fontSize: this.fontSize + 'px',
                color: '#' + this.textColor.toString(16).padStart(6, '0'),
                align: 'center'
            }).setOrigin(0.5, 0.5);
        }

        container.add(letterText);

        if (this.showLetterScore) {
            const score = this.getLetterScore(letter);
            let scoreText;
            if (this.useBitmapText && this.bitmapFontKey) {
                if (typeof this.bitmapFontKey === "string") {
                    scoreText = this.scene.add.bitmapText(config.size / 2 - 8, config.size / 2 - 8, this.bitmapFontKey, score.toString(), this.fontSize / 2);
                }
                scoreText.setOrigin(1, 1);
            } else {
                scoreText = this.scene.add.text(config.size / 2 - 8, config.size / 2 - 8, score.toString(), {
                    fontFamily: this.fontFamily,
                    fontSize: (this.fontSize / 2) + 'px',
                    color: '#' + this.textColor.toString(16).padStart(6, '0'),
                    align: 'center'
                }).setOrigin(1, 1);
            }
            container.add(scoreText);
        }
    }

    createTile(config: TileConfig, letter: string): LetterTile {
        console.log("createTile");
        const container = this.scene.add.container(config.x, config.y);
        container.name = "tile_" + config.row + "_" + config.col;
        this.createBackground(container, config);
        this.createTextLayer(container, config, letter);
        // ✅ Set size first, then make interactive
        //container.setSize(config.size, config.size);
        container.setInteractive();
        if (container.input) container.input.cursor = 'pointer';
        return new LetterTile(container, letter, config.row, config.col);
    }

    getLetterScore(letter: string): number {
        return this.scorer.getLetterValue(letter.toUpperCase()) || 1;
    }
}