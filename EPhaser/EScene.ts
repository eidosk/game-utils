import TextStyle = Phaser.Types.GameObjects.Text.TextStyle;
import Point = Phaser.Geom.Point;
import GameObject = Phaser.GameObjects.GameObject;
import BitmapText = Phaser.GameObjects.BitmapText;
import { EButton } from './EButton';
import { ETextButton } from './ETextButton';
import { EGraphics } from './EGraphics';
import { EMath } from '../utils/EMath';
import {EBitmapTextConfig} from "../interfaces";
import {EGfxUtils} from "./EGfxUtils";
import EGlobalState from "../settings/EGlobalState";
import {Sound} from "../types";

interface DraggableGameObject extends Phaser.GameObjects.GameObject {
    x: number;
    y: number;
}



interface SceneConfig {
    key: string;
}

/**
 * The EScene class extends the Phaser.Scene class and provides a framework for creating a game scene
 * with various utilities and helper methods for adding game objects, handling user input, and managing
 * scene transitions. This class includes methods for adding buttons, text, images, sprites, and containers
 * to the scene, as well as handling drag and drop functionality for game objects.
 *
 * The EScene class is designed to be flexible and reusable, allowing for easy customization of the scene's
 * appearance and behavior. It also includes utility methods for calculating positions based on percentage
 * values, making it easier to position game objects relative to the game canvas.
 *
 * Key Features:
 * - Initialization and configuration of the scene
 * - Adding various types of game objects (buttons, text, images, sprites, containers)
 * - Handling user input events (e.g., pointer up, drag and drop)
 * - Managing scene transitions and event listeners
 * - Utility methods for percentage-based positioning
 *
 *
 * @extends Phaser.Scene
 */

export default abstract class EScene extends Phaser.Scene {
    protected config: any;
    public CENTER!: Point;
    public TOP!: Point;
    public TOP_RIGHT!: Point;
    public TOP_LEFT!: Point;
    public BOTTOM!: Point;
    public BOTTOM_RIGHT!: Point;
    public BOTTOM_LEFT!: Point;
    public defaultText: string;
    public defaultStyle: TextStyle;

    /**
     * Constructor for EScene class.
     * @param {SceneConfig} config - Configuration object containing the scene key.
     */
    protected constructor(config: SceneConfig) {
        super(config.key);
        this.defaultText = "Default Text";
        this.defaultStyle = { fontFamily: 'Courier New', fontSize: '20px', color: '#000' };
    }

    /**
     * Initialization method with default configuration.
     * @param {SceneConfig} [config={ key: 'default' }] - Configuration object.
     */
    init(config: SceneConfig = { key: 'default' }) {
        this.config = config;
    }

    /**
     * Create method for the scene.
     */
    create() {
        this.orientationChangeListener = this.orientationChangeListener.bind(this);
        if(this.canChangeOrientation()){
            this.scale.on('orientationchange', this.orientationChangeListener);
        }else{
            console.log("cannot Change Orientation!");
        }
        this.setGridPoints();
        this.addGraphics();
    }

    abstract addGraphics():void
    abstract startGame():void

    getScaleFactor():number{
        return 1;
    }

    getGlobalState(){
        return this.plugins.get('GlobalStatePlugin') as EGlobalState;
    }

    /**
     * Handles the pointer up event.
     * @param {Phaser.Input.Pointer} pointer - The pointer object.
     */
    handlePointerUp(pointer: Phaser.Input.Pointer) {
        const percX = EMath.roundTo2DecimalPlaces((pointer.x / this.sys.game.canvas.width) * 100);
        const percY = EMath.roundTo2DecimalPlaces((pointer.y / this.sys.game.canvas.height) * 100);
        console.log(`Pointer up at: ${percX}% X, ${percY}% Y`);
    }

    isLandscape():boolean{
        return this.scale.orientation.toString().substring(0, 4) === "land";
    }

    isPortrait():boolean{
        return this.scale.orientation.toString().substring(0, 4) === "port";
    }

    playSound(sound:Sound){
        console.log("playSound");
        //this.sound.play('effect', { delay: 0.1 }); // Adds a 10ms delay
        sound.play({ delay: 0.1 });

        // Add debug info (requires Phaser debug mode)
       /* if(!this.getGlobalState().isMuted()){
            sound.play();
        }*/
    }



    canChangeOrientation():boolean{
        return false; // default. change in child classes if needed
    }


    orientationChangeListener(orientation: string) {
        this.onOrientationChange(orientation);
    }





    getLandscapeWidth():number{
        console.error("getLandscapeWidth: Landscape Width Not Set");
        return 0; //extend in children
    }

    getLandscapeHeight():number{
        console.error("getLandscapeHeight: Landscape Height Not Set");
        return 0; //extend in children
    }

    getAspectRatio():number{
        return this.scale.width / this.scale.height;
    }

    customAdjustPositions():void{} //extend this in child classes

    onOrientationChange(orientation: string) {
        //console.log("onOrientationChange: " , this.children.list);
        const orientationString: string = orientation.substring(0, 4);
        const aspectRatio: number = this.getAspectRatio();
        if ((orientationString === "port" && aspectRatio > 1) ||
            (orientationString === "land" && aspectRatio < 1)) {
            this.scale.setGameSize(this.scale.height, this.scale.width);
            this.setGridPoints();
            this.autoAdjustPositions(aspectRatio);
            this.customAdjustPositions();
        }
    }


    hasPosition(obj: any): obj is Phaser.GameObjects.Components.Transform {
        return 'x' in obj && 'y' in obj;
    }



    /*
    *   Adjusts the positions of all children based on the current aspect ratio.
    *   Occurs after orientation change. OR at the beginning of the game if needed
    *
    *   IMPROVE!!
    *   @param {number} aspectRatio - The current aspect ratio of the game
    * */
    autoAdjustPositions(aspectRatio: number) {
       /* this.children.list.forEach((gameObject) => {
            if (this.hasPosition(gameObject)) {
                gameObject.x *= 1 / aspectRatio;
                gameObject.y *= aspectRatio;
            }else{
                console.log("no x and y, game object: ", gameObject);
            }
        });*/
    }


    /**
     * Sets grid points for positioning.
     */
    setGridPoints() {
        this.CENTER = this.gp(50, 50);
        this.TOP = this.gp(50, 0);
        this.TOP_RIGHT = this.gp(100, 0);
        this.TOP_LEFT = this.gp(0, 0);
        this.BOTTOM = this.gp(50, 100);
        this.BOTTOM_RIGHT = this.gp(100, 100);
        this.BOTTOM_LEFT = this.gp(0, 100);
    }

    /**
     * Checks if the current orientation is portrait.
     * @returns {boolean} - True if orientation is portrait, otherwise false.
     */
    isOrientationPortrait(): boolean {
        return this.scale.orientation.toString().substring(0, 4) === "port";
    }

    /**
     * Adds a button to the scene.
     * @param {string} imageName - The name of the button image.
     * @param {Point} [pos=this.CENTER] - The position of the button.
     * @param {() => void} onClick - The callback function for the button click event.
     * @param {Object} [options={}] - Additional options for the button.
     * @returns {EButton} - The created button.
     */
    addButton(imageName: string, pos: Point = this.CENTER, onClick: () => void, options: Object = {}): EButton {
        return new EButton(this, pos.x, pos.y,{
            imageName,
            onClick,
            ...options
        });
    }

    /**
     * Adds a text button to the scene.
     * @param {string} text - The text of the button.
     * @param {Point} [pos=this.CENTER] - The position of the button.
     * @param {() => void} [onClick=this.defaultCallBack] - The callback function for the button click event.
     * @param {Object} [options={}] - Additional options for the button.
     * @returns {ETextButton} - The created text button.
     */
    addTextButton(text: string, pos: Point = this.CENTER, onClick?:() => void, options: Object = {}): ETextButton {
        return new ETextButton(this, pos.x, pos.y,{
            text,
            onClick,
            ...options
        });
    }

    /**
     * Adds a backing graphic to the scene.
     * @param {Point} [pos=this.CENTER] - The position of the backing graphic.
     * @param {number} [width=32] - The width of the backing graphic.
     * @param {number} [height=16] - The height of the backing graphic.
     * @returns {EGraphics} - The created backing graphic.
     */
    addBacking(pos: Point = this.CENTER, width: number = 32, height: number = 16) {
        return new EGraphics(this, pos).setScale(2).drawBacking(width, height);
    }

    /**
     * Adds a text element to the scene.
     * @param {string} [text=this.defaultText] - The text to display.
     * @param {Point} [position=this.CENTER] - The position of the text element.
     * @param {TextStyle} [style=this.defaultStyle] - The style of the text.
     * @returns {Phaser.GameObjects.Text} - The created text element.
     */
    addText(text: string = this.defaultText, position: Point = this.CENTER, style: TextStyle = this.defaultStyle) {
        return this.add.text(position.x, position.y, text, style).setOrigin(0.5);
    }

    /**
     * Adds an image to the scene.
     * @param {string} name - The name of the image.
     * @param {Point} [pos=this.CENTER] - The position of the image.
     * @param {number} [scale=1] - The scale of the image.
     * @returns {Phaser.GameObjects.Image} - The created image.
     */
    addImage(name: string, pos: Point = this.CENTER, scale: number = 1) {
        return this.add.image(pos.x, pos.y, name).setScale(scale);
    }

    /**
     * Adds a sprite to the scene.
     * @param {string} name - The name of the sprite.
     * @param {Point} [pos=new Point(0, 0)] - The position of the sprite.
     * @param {Function} [onClick] - The callback function for the sprite click event.
     * @returns {Phaser.GameObjects.Sprite} - The created sprite.
     */
    addSprite(name: string, pos: Point = new Point(0, 0), onClick?: Function) {
        const tSpr = this.add.sprite(pos.x, pos.y, name);
        if (onClick) {
            tSpr.setInteractive({ useHandCursor: true });
            tSpr.on('pointerup', onClick, this);
        }
        return tSpr;
    }

    /**
     * Adds a container to the scene.
     * @param {Point} pos - The position of the container.
     * @returns {Phaser.GameObjects.Container} - The created container.
     */
    addContainer(pos: Point) {
        return this.add.container(pos.x, pos.y);
    }

    getDefaultBitmapFont():string{
        console.error("Default Bitmap Font not set");
        return "";
    }

    /**
     * Adds a bitmap text element to the scene.
     * @returns {BitmapText} - The created bitmap text element.
     * @param text
     * @param font
     * @param config
     */
    addBitmapText(text:string, font:string, config?: EBitmapTextConfig): BitmapText {
        const tConfig = {
            text: text,
            pos: this.CENTER,
            size: 8,
            color: 0x000000,
            alpha: 1,
            origin: { x: 0, y: 0 },
            debug: false,
            ...config
        }
        const bitmapText = this.add.bitmapText(tConfig.pos.x, tConfig.pos.y, font, text, tConfig.size)
            .setOrigin(tConfig.origin.x, tConfig.origin.y)
            .setCenterAlign()
            .setTint(tConfig.color)
            .setAlpha(tConfig.alpha);

        if (tConfig.debug) {
            EGfxUtils.drawDebugBox(bitmapText);
        }
        return bitmapText;
    }

    /**
     * Draws a debug border around a bitmap text element.
     * @param {Phaser.GameObjects.BitmapText} bitmapText - The bitmap text element.
     */
 /*   drawDebugBorder(bitmapText: Phaser.GameObjects.BitmapText) {
        const bounds = bitmapText.getTextBounds().global;
        const graphics = this.add.graphics().setPosition(bitmapText.x, bitmapText.y)
        graphics.lineStyle(2, 0xff0000, .4);
        const rectTopleftX = -bounds.width*bitmapText.originX;
        const rectTopleftY = -bounds.height*bitmapText.originY;
        graphics.strokeRect(rectTopleftX, rectTopleftY, bounds.width, bounds.height);
    }*/

    /**
     * Makes all children draggable.
     */
    makeChildrenDraggable() {
        const len = this.children.length;
        for (let i = 0; i < len; i++) {
            const child = this.children.getAt(i);
            if (child instanceof Phaser.GameObjects.Image && child.texture.key !== "bg") {
                this.makeChildDraggable(child);
            }
        }
        this.input.on('dragstart', this.startDrag, this);
    }

    /**
     * Makes a child game object draggable.
     * @param {GameObject} child - The child game object.
     */
    makeChildDraggable(child: GameObject) {
        child.setInteractive({ useHandCursor: true, draggable: true });
    }

    /**
     * Starts the drag operation for a game object.
     * @param {Phaser.Input.Pointer} pointer - The pointer object.
     * @param {GameObject} gameObject - The game object being dragged.
     */
    startDrag(pointer: Phaser.Input.Pointer, gameObject: GameObject) {
        this.input.off('dragstart', this.startDrag, this);
        this.children.bringToTop(gameObject);
        this.input.on('drag', this.doDrag, this);
        this.input.on('dragend', this.stopDrag, this);
    }

    /**
     * Performs the drag operation for a game object.
     * @param {Phaser.Input.Pointer} pointer - The pointer object.
     * @param {DraggableGameObject} gameObject - The game object being dragged.
     * @param {number} dragX - The X coordinate being dragged to.
     * @param {number} dragY - The Y coordinate being dragged to.
     */
    doDrag(pointer: Phaser.Input.Pointer, gameObject: DraggableGameObject, dragX: number, dragY: number) {
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

    /**
     * Stops the drag operation for a game object.
     * @param {Phaser.Input.Pointer} pointer - The pointer object.
     * @param {DraggableGameObject} gameObject - The game object being dragged.
     */
    stopDrag(pointer: Phaser.Input.Pointer, gameObject: DraggableGameObject) {
        this.input.off('drag', this.doDrag, this);
        this.input.off('dragend', this.stopDrag, this);
        this.input.on('dragstart', this.startDrag, this);
        const percX = EMath.roundTo2DecimalPlaces((gameObject.x / this.sys.game.canvas.width) * 100);
        const percY = EMath.roundTo2DecimalPlaces((gameObject.y / this.sys.game.canvas.height) * 100);
        console.log(`Drag ended at: ${percX}% X, ${percY}% Y`);
    }

    /**
     * Navigates to another scene.
     * @param {string} name - The name of the scene to navigate to.
     * @param {Object} [config={}] - The configuration object for the new scene.
     */
    gotoScene(name: string, config: Object = {}) {
        this.removeEventListeners();
        this.scene.start(name, config);
    }

    /**
     * Removes event listeners.
     */
    removeEventListeners() {
        // Remove event listeners
        this.scale.off('orientationchange', this.orientationChangeListener);
    }

    /**
     * Calculates a point based on percentage values.
     * @param {number} percX - The percentage X value.
     * @param {number} percY - The percentage Y value.
     * @param {boolean} [rounded=true] - Whether to round the values.
     * @returns {Point} - The calculated point.
     */
    gp(percX: number, percY: number, rounded: boolean = true) {
        const x = rounded ? Math.round(this.getX(percX)) : this.getX(percX);
        const y = rounded ? Math.round(this.getY(percY)) : this.getY(percY);
        return new Point(x, y);
    }

    /**
     * Calculates the X position based on a percentage.
     * @param {number} perc - The percentage value.
     * @returns {number} - The calculated X position.
     */
    getX(perc: number): number {
        return this.sys.game.canvas.width * perc * .01;
    }

    /**
     * Calculates the Y position based on a percentage.
     * @param {number} perc - The percentage value.
     * @returns {number} - The calculated Y position.
     */
    getY(perc: number) {
        return this.sys.game.canvas.height * perc * .01;
    }
}