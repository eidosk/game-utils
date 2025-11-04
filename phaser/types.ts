export type Scene = Phaser.Scene;
export type Image = Phaser.GameObjects.Image;
export type Container = Phaser.GameObjects.Container;
export type BitmapText = Phaser.GameObjects.BitmapText;
export type Text = Phaser.GameObjects.Text;
export type Point = Phaser.Geom.Point;
export type Sound = Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
export type DisplayObject = Image | BitmapText | Text | Container;
export type TileGameObject = Phaser.GameObjects.Graphics | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

import {LayoutConfig} from "eidosk/core";

/**
 * Interface representing a layer in Aseprite.
 * @interface
 */

// Unified configs - layout + constructor properties together
export interface ImageConfig extends LayoutConfig {
    tint?: number;
}

export interface TextConfig extends LayoutConfig {
    text?: string,
    font?: string;
    fontSize?: number;
    color?: number;
}

export interface BitmapTextConfig extends LayoutConfig {
    text?: string,
    font?: string;
    fontSize?: number;
    color?: number;
}

/*export interface ButtonConfig extends LayoutConfig {
    texture?:string; // will override name if set
    hoverTexture?: string;
    disabledTexture?: string;
    pointerOverSound?: Phaser.Sound.BaseSound | null;
}

export interface TextButtonConfig extends LayoutConfig {
    text?: string;
    fontSize?: number;
    textColor?: number;
    font?: string;
    hoverTexture?: string;
    disabledTexture?: string;
    padding?: number;
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
}*/

export interface SceneElement {
    name: string;
    type: 'image' | 'text' | 'bitmapText' | 'button';
    config?: LayoutConfig & {
        // Add Aseprite-specific fields
        hasHover?: boolean;
        font?: string;
        text?: string;
        color?: number;
        shadowColor?: number;
        loc?: boolean;
    };
}
