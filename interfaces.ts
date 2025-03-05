import Point = Phaser.Geom.Point;


/**
 * Interface representing a layer.
 * @interface
 */
export interface Layer {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    excludeScenes?: string[];
    opacity?: number;
    origin?: number;
    originX?: number;
    originY?: number;
    size?: number;
    snapTo?:string;
    type?: string;
    font?: string;
    text?: string;
    color?:number;
    shadowColor?:number;
    loc?:boolean;
}

export interface EBitmapTextConfig {
    text?: string;
    pos?: Point;
    font?: string;
    size?: number;
    color?: number;
    alpha?: number;
    origin?: { x: number, y: number };
    debug?: boolean;
}

export interface EButtonConfig {
    width?: number;
    height?: number;
    scale?: number;
    imageName?: string; //The name of the image to be used as the button's background.
    imageHoverName? :string;
    imageDisabledName? :string;
    backgroundHoverColor? :number;
    onClick?: () => void;
    pointerOverSound?: Phaser.Sound.BaseSound | null; // The sound to be played when the pointer is over the button.
}

export interface ETextButtonConfig extends EButtonConfig {
    text: string;
    fontSize?: number;
    isBitmapText?: boolean;
    autoWidth?: boolean;
    font?: string;
    color?: number;
    padding?:number;
}

