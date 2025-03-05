import Point = Phaser.Geom.Point;
import Image = Phaser.GameObjects.Image;
import BitmapText = Phaser.GameObjects.BitmapText;
import EScene from "../EPhaser/EScene";
import { EButton } from "../EPhaser/EButton";
import APGlobal from "./APGlobal";
import { ETextButton } from "../EPhaser/ETextButton";
import {APGameObject} from "../types";
import {EBitmapTextConfig} from "../interfaces";
import EGlobalState from "../settings/EGlobalState";
import {EGfxUtils} from "../EPhaser/EGfxUtils";
import {Layer} from "../interfaces";
import GameObject = Phaser.GameObjects.GameObject;
import {customizeArray} from "webpack-merge";


/**
 * Class representing a scene in AsePhaser.
 * @extends EScene
 */
export default class APScene extends EScene {
    /**
     * Constructor for APScene.
     * @param {Object} config - Configuration object.
     */
    constructor(config: { key: string }) {
        super({ key: config.key });
    }

    /**
     * Initializes the scene.
     * @param {any} config - Configuration object.
     */
    init(config?:any) {
        super.init();    /**/
    }

    /**
     * Adds graphics to the scene.
     */
    addGraphics() {
        this.addLayers(APGlobal.commonLayers); //add common layers
        if(this.isAsepriteScene(this.scene.key)){
            let sceneLayers = APGlobal.scenes[this.scene.key];
            this.addLayers(sceneLayers); //add scene layers
        }
        this.removeGuidelines();
        if(this.canChangeOrientation() && this.isPortrait()) this.customAdjustPositions();
    }

    startGame(){}//must be here

    /*
    *   Adjusts the positions of APGameObects only, according to orientation
    *   @param {number} aspectRatio - The current aspect ratio of the game
    * */
    autoAdjustPositions(aspectRatio: number) {
        this.children.list.forEach((gameObject:GameObject) => {
            if (this.hasPosition(gameObject)) {
                const layer:Layer = this.getLayer(gameObject.name); //CHECK ABOUT CHILDREN WITH NO NAME!
                if(layer){
                    console.log("layer : ", layer);
                    const newPos:Point = this.getAPGameObjectPosition(layer);
                    gameObject.setPosition(newPos.x, newPos.y);
                    if(this.getGlobalState().isDebug()) EGfxUtils.drawDebugBox(gameObject);
                }
            }else{
                console.log("no x and y, game object: ", gameObject);
            }
        });




       /* if(this.isLandscape()){

        }else if(this.isPortrait()){

        }



        */
    }


    addLayers(layers:Layer[], excludeArr: string[] = []){
        layers.forEach(currentLayer => {
            if (currentLayer.excludeScenes && currentLayer.excludeScenes.includes(this.scene.key) || excludeArr.includes(currentLayer.name)) {
                console.log("excluding: " + currentLayer.name);
            }else{
                this.addAPGameObject(currentLayer);
            }
        });
    }

    getLayer(layerName:string):Layer{
        if(layerName.split("_")[0] === "Common")return APGlobal.commonLayers.find((layer:Layer) => layer.name === layerName);
        else return APGlobal.scenes[this.scene.key].find((layer:Layer) => layer.name === layerName);
    }

    getAPGameObjectPosition(layer:Layer):Point{
        console.log("getAPGameObjectPosition");
        const scaleFactor: number = this.getScaleFactor();
        const aspectRatio: number = this.getAspectRatio();
        let pos:Point = new Point();
        pos.x = layer.x * scaleFactor;
        pos.y = layer.y * scaleFactor;
        if(this.isPortrait()) {
            if(layer.snapTo){
                pos = layer.snapTo=="topLeft" ? pos : this.getPortraitSnapPosition(pos, layer.snapTo);
            }else{
                pos.x *= aspectRatio;
                pos.y *= 1/aspectRatio;
            }
        }
        return pos;
    }

    getPortraitSnapPosition(currentPos:Point, snapTo:string):Point{
        let pos:Point = currentPos;
        const landWidth = this.getLandscapeWidth();
        const landHeight = this.getLandscapeHeight();
        let diffX:number;
        let diffY:number;
        switch (snapTo){ //top left is not needed... same as landscape
                case "topRight":
                    diffX = landWidth - pos.x;
                    diffY = pos.y;
                    pos.x = this.scale.width - diffX;
                    pos.y = diffY;

                    console.log("topRight, landWidth: " + landWidth);
                    break;
                case "bottomLeft":
                    diffX = pos.x;
                    diffY = landHeight - pos.y;
                    pos.x = diffX;
                    pos.y = this.scale.height - diffY;
                    break;
                case "bottomRight":
                    diffX = landWidth - pos.x;
                    diffY = landHeight - pos.y;
                    pos.x = this.scale.width - diffX;
                    pos.y = this.scale.height - diffY;
                    break;
        }
        return pos;
    }


    getDefaultBitmapFont():string{ //extend this
        console.error("getDefaultBitmapFont: DEFAULT FONT NOT DEFINED!");
        return "";
    }

    getDefaultBitmapFontSize():number{ //extend this
        console.error("getDefaultBitmapFont: DEFAULT FONT SIZE NOT DEFINED!");
        return 0;
    }

    /**
     * Checks if there's a replacement image for the current layer.
     * @returns {APGameObject | null} - Replacement image or null if no replacement is found.
     *
     *  - BitmapText
     *  - EButton
     *  - ETextButton
     *  - Image (Default)
     * @param layer
     */
    addAPGameObject(layer: Layer): APGameObject {
        console.log("addAPGameObject named: " + layer.name);
        const scaleFactor:number = this.getScaleFactor();
        console.log("scaleFactor: " + scaleFactor);
        const alpha: number = layer.opacity ? layer.opacity / 255 : 1;
        const pos:Point = this.getAPGameObjectPosition(layer);
        let gameObject: APGameObject;
        if(this.isBitmapText(layer)){
            let bitmapFont = layer.font || this.getDefaultBitmapFont();
            if(!bitmapFont){
                console.error("NO BITMAP FONT");
                return null;
            }
            if(layer.text)console.log("layer.text: " + layer.text);

            const loc:boolean = layer.loc || false;
            const originalText = layer.text ? layer.text : layer.name.split("_")[1];
            const finalText :string = loc ? this.getLocText(originalText) : originalText;
            const size:number = layer.size || this.getDefaultBitmapFontSize();
            const config: EBitmapTextConfig = {
                pos: pos,
                color: layer.color || 0x0000ff,
                size: size,
                origin: { x: 0.5, y: 0.5 },
                debug: this.getGlobalState().isDebug()
            };
            gameObject = this.addBitmapText(finalText, bitmapFont, config);
            if(layer.shadowColor) gameObject.setDropShadow(2,2, layer.shadowColor, 1);
        }else if (this.isEButton(layer)) {
            const str: string = layer.name;
            const textureKey: string = layer.name;
            const buttonName: string = str.substring(str.indexOf('_') + 1)
            const buttonConfig= {
                imageName: textureKey,
                scale: scaleFactor,
                alpha: alpha,
                imageHoverName: this.getButtonImageHoverName(textureKey),
                onClick: () => {
                    this.onButtonClick(buttonName);
                }
            }
            gameObject = new EButton(this, pos.x, pos.y, buttonConfig);
        }else if (this.isTextButton(layer)) {
            const str: string = layer.name;
            const buttonName: string = str.substring(str.indexOf('_') + 1)
            const buttonConfig = {
                width: layer.width,
                height: layer.height,
                text: buttonName,
                alpha:alpha,
                onClick: () => {
                    this.onButtonClick(buttonName);
                }
            };
            gameObject = new ETextButton(this, pos.x, pos.y, buttonConfig);
        }else{ //Image, default
            const origin = layer.origin!=undefined ? layer.origin : .5;
            const originX = layer.originX!=undefined ? layer.originX : origin;
            const originY = layer.originY!=undefined ? layer.originY : origin;
            const snapTo = layer.snapTo!=undefined ? layer.snapTo : "none";
            console.log("snapTo: " + snapTo);
            gameObject = this.addImage(layer.name, pos).setAlpha(alpha).setScale(scaleFactor).setOrigin(originX, originY);
            (gameObject as any).snapTo = snapTo;
        }
        gameObject.name = layer.name;
        const globalState = this.plugins.get('GlobalStatePlugin') as EGlobalState;
        if(globalState.isDebug()){
            console.log("drawDebugBox");
            EGfxUtils.drawDebugBox(gameObject);
        }
        (gameObject as any).layer = layer;
        return gameObject;
    }


    removeGuidelines() {
        const layers = ["lines", "LINES", "Lines",
            "guidelines", "GUIDELINES", "Guidelines",
        "Debug", "debug"];
        layers.forEach(layer => {
            const gameObject = this.getAPGameObject(layer);
            if (gameObject) {
                gameObject.destroy();
            }
        });
    }

    isAsepriteScene(key:string):boolean{
        return APGlobal.scenes.hasOwnProperty(key);
    }

    /**
     * Gets the version of AsePhaser.
     * @returns {string} - AsePhaser version.
     */
    getVersion(): string{
        return APGlobal.asePhaserVersion;
    }

    
    /*Gets Game Object from layer name, which is also the name of the game object*/
    getAPGameObject(layerName:string) : APGameObject{
        let fullName:string;
        if(layerName.split("_")[0] === "Common")fullName = layerName;
        else fullName = this.scene.key + "_" + layerName;
        return this.children.getByName(fullName) as APGameObject;
    }

    getETextButtonFromLayer(layerName:string):ETextButton{
        const gameObject:APGameObject | null = this.getAPGameObject(layerName);
        if (gameObject instanceof ETextButton) {
            return gameObject
        } else {
            throw new Error("The graphic object is not a ETextButton");
        }
    }


    getBitmapTextFromLayer(layerName:string):BitmapText{
        const gameObject:APGameObject | null = this.getAPGameObject(layerName);
        if (gameObject instanceof BitmapText) {
            return gameObject
        } else {
            throw new Error("The graphic object "+layerName+" is not a BitmapText");
        }
    }

    replaceLayerImage(layerName:string, replacementImageTexture:string){
        const gameObject:APGameObject | null = this.getAPGameObject(layerName);
        if (gameObject instanceof Image) {
            this.addImage(replacementImageTexture, new Point(gameObject.x + gameObject.displayWidth/2, gameObject.y + gameObject.displayHeight/2));
            gameObject.destroy();
        } else {
            throw new Error("The graphic object is not a Image");
        }
    }

    /**
     * Checks if a layer represents a button.
     * @param {Layer} currentLayer - Current layer.
     * @returns {boolean} - Whether the layer represents a button.
     */
    isEButton(currentLayer: Layer){
        return currentLayer.type === "EButton";
    }

    isBitmapText(currentLayer: Layer):boolean{
        return currentLayer.type === "BitmapText" || currentLayer.font!=undefined;
    }



    /**
     * Checks if a layer represents a text button.
     * @param {Layer} currentLayer - Current layer.
     * @returns {boolean} - Whether the layer represents a text button.
     */
    isTextButton(currentLayer: Layer):boolean{
        return currentLayer.type === "ETextButton";
    }



    isAsepriteString(str: string): boolean {
        return str.includes("=");
    }

    /*stringToObject(str: string): { [key: string]: any } {
        const obj: { [key: string]: any } = {};

        // Check if there's a space followed by a string and then an "=" sign after the space
        const regex = / (?=[a-zA-Z]+=)/;

        // Split the string at spaces while considering the condition
        const substrings = str.split(regex);

        substrings.forEach(substring => {
            const [key, value] = substring.split("=");
            obj[key] = value;
        });

        return obj;
    }*/

    getLocText(text:string):string{
        return text; //extend
    }



    getButtonImageHoverName(texture:string):string{
        return "";
    }



    /**
     * Handles button click events.
     * @param {string} name - Name of the button.
     */
    onButtonClick(name: string) {
        //console.log("onButtonClick: " + name);
    }
}