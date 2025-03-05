import { EGraphics } from "./EGraphics";
import Image = Phaser.GameObjects.Image;
import Container = Phaser.GameObjects.Container;
import {EButtonConfig} from "../interfaces";
import {Scene} from "phaser";

/**
 * A custom button component for Phaser scenes.
 */
export class EButton extends Container {
    public disabled!: boolean;
    public backing!: Image;
    private static DEFAULT_WIDTH: number = 48;
    private static DEFAULT_HEIGHT: number = 16;
    protected isBackgroundGenerated:boolean = false;
    protected onClick: (() => void);
    private imageName: string;
    private pointerOverSound: Phaser.Sound.BaseSound | null;
    private imageHoverName: string;
    private backgroundHoverColor: number;

    /**
     * Creates an instance of EButton.
     * @param {Phaser.Scene} scene - The Phaser scene to which the button belongs.
     * @param x
     * @param y
     * @param {EButtonConfig} [config] - The configuration options for the button.
     */
    constructor(scene: Scene, x?:number, y?:number, config?: EButtonConfig) {
        super(scene, x, y);
        if(x == undefined) this.x = this.scene.sys.game.canvas.width * 0.5;
        if(y == undefined) this.x = this.scene.sys.game.canvas.width * 0.5;
        this.initVars(config);
        this.setup();
        scene.add.existing(this);
    }

    initVars(config?:EButtonConfig){
        this.width = config?.width || EButton.DEFAULT_WIDTH;
        this.height = config?.height || EButton.DEFAULT_HEIGHT;
        this.scale = config?.scale || 1;
        this.imageName = config?.imageName || "";
        this.imageHoverName = config?.imageHoverName || "";
        this.onClick = config?.onClick || this.defaultCallback;
        if(config?.pointerOverSound){
            this.pointerOverSound = config.pointerOverSound;
        }else if (this.scene.cache.audio.exists('rollover')) {
            this.pointerOverSound = this.scene.sound.add('rollover',{volume:.2});
        }else{
            this.pointerOverSound = null;
        }
        this.backgroundHoverColor = config?.backgroundHoverColor || 0xcccccc;
    }

    /**
     * IMPORTANT: called at the end of the constructor
     * after vars have been initialized
     * Adds graphics and interaction
     */
    setup(){
        this.addGraphics();
        this.addInteraction();
    }

    /**
     * Adds interaction to the button's backing, allowing it to respond to user input.
     */
    addInteraction(): void {
        this.backing.setInteractive({ useHandCursor: true });
        this.backing.on('pointerover', this.onPointerOver.bind(this));
        this.backing.on('pointerout', this.onPointerOut.bind(this));
        this.backing.on('pointerup', this.onClick!.bind(this.scene)!);
    }

    /**
     * Removes interaction from the button's backing.
     */
    removeInteraction(): void {
        this.backing.removeInteractive();
        this.backing.off('pointerover', this.onPointerOver.bind(this));
        this.backing.off('pointerout', this.onPointerOut.bind(this));
        this.backing.off('pointerup', this.onClick!.bind(this.scene));
    }

    /**
     * Adds graphics (background) to the button.
     */
    addGraphics(){
        this.addBacking();
    }

    /**
     * Adds backing (image or graphics) to the button.
     * @param {number} [width] - The width of the button's backing.
     * @param {number} [height] - The height of the button's backing.
     */
    addBacking(width?: number, height?: number){
        if(width === undefined) width = this.width !== undefined ? this.width : EButton.DEFAULT_WIDTH;
        if(height === undefined) height = this.height !== undefined ? this.height : EButton.DEFAULT_HEIGHT;
        if (this.imageName == undefined || this.imageName == "") {
            this.generateImageTextures(width, height);
        }
        this.backing = this.scene.add.image(0, 0, this!.imageName!);
        this.add(this.backing);
    }

    generateImageTextures(width:number, height:number){
        if(!this.isBackgroundGenerated) this.isBackgroundGenerated = true;
        this.imageName = this.generateImageTexture(width, height);
        //this.imageHoverName = this.generateImageTexture(width, height, "Hover", this.backgroundHoverColor);
    }

    generateImageTexture(width:number, height:number, state:string = "Normal", color:number = 0xfffdec):string{
        let graphics = new EGraphics(this.scene);
        let sceneName = this.scene.sys.settings.key;
        graphics.drawBacking(width, height, false, 1, color);
        let name:string = sceneName+ "_buttonBg_" + state +"_"+ width + "x" + height;
        graphics.generateTexture(name,width+1, height+1);
        graphics.destroy(); //destroy graphics... only using texture
        return name;
    }

    /**
     * The default callback function for button click.
     */
    defaultCallback(): void {
        console.log('EButton Clicked!');
    }

    /**
     * Handler for pointer over event. Plays the pointer over sound if configured.
     */
    onPointerOver(): void {
        this.checkPlayPointerOverSound();
        if(this.imageHoverName!="" && this.imageHoverName != null){
            this.backing.setTexture(this.imageHoverName);
        }
    }

    addHoverImage(name:string){
        this.imageHoverName = name;
    }

    /*addPointerOverSound(name:string){
        this.pointerOverSound = name;
    }*/

    /**
     * Handler for pointer out event.
     */
    onPointerOut(): void {
        this.setNormalBackgroundTexture();
    }

    setNormalBackgroundTexture(){
        if (this.imageName != null && this.imageHoverName != null) {
            this.backing.setTexture(this.imageName);
        }
    }

    /**
     * Checks and plays the pointer over sound if configured.
     */
    checkPlayPointerOverSound(): void {
        if (this.pointerOverSound) this.pointerOverSound.play();
    }
}
