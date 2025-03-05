// Import EButton correctly
import { EButton } from './EButton';
import { Scene } from 'phaser'; // Assuming you are using Phaser, adjust if needed
import {ETextButtonConfig} from "../interfaces";

export class ETextButton extends EButton{
    public textField: any;
    protected text:string;
    private images: any;
    private backingLeft: any;
    private backingRight: any;
    private fontSize: number;
    private isBitmapText: boolean;
    private autoWidth: boolean;
    private font: string;
    private color: number;
    private padding: number;

    constructor(scene:Scene, x?:number, y?:number, config?:ETextButtonConfig) {
        super(scene, x, y, config);
    }

    initVars(config?:ETextButtonConfig){
        super.initVars(config);
        this.text = config?.text || "Text Button";
        this.fontSize = config?.fontSize || 16;
        this.isBitmapText = config?.isBitmapText || false;
        this.autoWidth = config?.autoWidth || false;
        this.font = config?.font || "Arial";
        this.color = config?.color || 0x000000;
        this.padding = config?.padding || 16;
    }

    // Method to add the button's graphics, including text and background
    addGraphics() {
        this.addTextField();
        this.addBacking();
        this.sendToBack(this.backing);
    }

    // Method to add the text field to the button, either as normal text or BitmapText
    addTextField() {
        if (this.isBitmapText) {
            this.textField = this.scene.add.bitmapText(0, 0, this.font!, this.text, this.fontSize).setOrigin(0.5, 0.5).setTint(this.color);
        } else {
            this.textField = this.scene.add.text(0, 0, this.text!, {
                fontFamily: this.font,
                fontStyle: 'normal',
                fontSize: this.fontSize + 'px',
                color: this.hexColorToString(this.color!),
            }).setOrigin(0.5, 0.5);
        }
        this.add(this.textField);
    }

    hexColorToString(hexColor: number): string {
        // Use toString(16) to convert the number to a hex string
        const hexString = hexColor.toString(16);

        // Ensure the string has 6 characters by padding with zeros if needed
        const paddedHexString = ('000000' + hexString).slice(-6);

        // Prepend "#" to the hex string
        return '#' + paddedHexString;
    }

    // Method to check if the button is set to use dynamic width
    isDynamic() {
        return this.autoWidth === true;
    }

    // Method to add the button's backing, which can be dynamic in width
    addBacking() {
        if (this.isDynamic()) {
            let padding = 2 * this.scale!;
            let width = this.textField.width + padding * 2;
            this.backing = this.scene.add.sprite(0, 0, this.images.center).setScale(this.scale);
            this.backing.displayWidth = width;
            let leftX = this.backing.x - this.backing.displayWidth / 2 - this.scale!;
            let rightX = this.backing.x + this.backing.displayWidth / 2 + this.scale!;
            this.backingLeft = this.scene.add.sprite(leftX, 0, this.images.left).setScale(this.scale);
            this.backingRight = this.scene.add.sprite(rightX, 0, this.images.right).setScale(this.scale);
            this.add(this.backingLeft);
            this.add(this.backing);
            this.add(this.backingRight);
        } else {
            super.addBacking();
        }
    }

    // Method to disable the button and change its appearance
    disable(alpha:number = .5) {
        this.disabled = true;
        if (this.hasGreyBacking()) {
            this.backingLeft.setTexture(this.images.leftDisabled);
            if(this.backing instanceof Image) (this.backing as any).setTexture(this.images.centerDisabled);
            this.backingRight.setTexture(this.images.rightDisabled);
        }
        this.alpha = alpha;
        this.removeInteraction();
    }

    // Method to enable the button and restore its appearance
    enable() {
        this.disabled = false;
        if (this.hasGreyBacking()) {
            this.backingLeft.setTexture(this.images.left);
            if(this.backing instanceof Image) (this.backing as any).setTexture(this.images.center);
            this.backingRight.setTexture(this.images.right);
        }
        this.alpha = 1;
        this.addInteraction();
    }

    // Method to check if the button has a grey backing when disabled
    hasGreyBacking() {
        return this.images != null &&
            this.images.leftDisabled != null &&
            this.images.centerDisabled != null &&
            this.images.rightDisabled != null &&
            this.images.leftDisabled &&
            this.images.centerDisabled &&
            this.images.rightDisabled;
    }

    // Handler for pointer over event
    onPointerOver() {
        console.log("onPointerOver");
        if (this.isDynamic()) {
            this.backingLeft.setTexture(this.images.leftOver);
            if(this.backing instanceof Image) (this.backing as any).setTexture(this.images.centerOver);
            this.backingRight.setTexture(this.images.rightOver);
            this.checkPlayPointerOverSound();
        } else {
            super.onPointerOver();
        }
    }

    // Handler for pointer out event
    onPointerOut() {
        if (this.isDynamic()) {
            this.backingLeft.setTexture(this.images.left);
            if(this.backing instanceof Image) (this.backing as any).setTexture(this.images.center);
            this.backingRight.setTexture(this.images.right);
        } else {
            super.onPointerOut();
        }
    }

    // Default callback function for button click
    defaultCallback() {
        console.log('ETextButton Clicked!');
    }

    // Method to set the text of the button
    setText(tText:string){
        this.text = this.textField.text = tText;
        if(this.isBackgroundGenerated){
            this.generateImageTextures(this.textField.displayWidth/this.scale! + this.padding!, this.textField.displayHeight/this.scale! + this.padding!);
            this.setNormalBackgroundTexture();
        }
    }

    // Method to get the current text of the button
    getText() {
        return this.text;
    }
}
