import GameObject = Phaser.GameObjects.GameObject;
import Graphics = Phaser.GameObjects.Graphics;
import {Scene} from "phaser";
import {ETextButton} from "./ETextButton";
import BitmapText = Phaser.GameObjects.BitmapText;
import Image = Phaser.GameObjects.Image;
import Rectangle = Phaser.Geom.Rectangle;
import Container = Phaser.GameObjects.Container;

interface Bounds {
    width:number,
    height:number
}

export class EGfxUtils {


    static drawDebugBox(gameObject:GameObject, graphics?:Graphics, color:number = 0xFF00FF, alpha:number = .75){
        if(!gameObject.name) return; //temp hack. fix
        console.log("drawDebugBox, name: " + gameObject.name + ", obj: ", gameObject);
        const scene: Scene = gameObject.scene;
        const name:string = gameObject.name + "_debugBox";
        console.log("name: " + name);
        const existingGraphics = scene.children.getByName(name);
        if(existingGraphics){
            existingGraphics.destroy();
            console.log("destroyers");
        }
        graphics = graphics ? graphics : scene.add.graphics();
        graphics.name = name;
        if (gameObject instanceof BitmapText ||
            gameObject instanceof Image ||
            gameObject instanceof Container) {
            const bounds:Bounds = EGfxUtils.getBounds(gameObject) as Bounds;
            graphics.alpha = alpha;
            graphics.setPosition(gameObject.x, gameObject.y)
            graphics.lineStyle(2, color, alpha);
            const rectTopleftX = -bounds.width*gameObject.originX;
            const rectTopleftY = -bounds.height*gameObject.originY;
            graphics.strokeRect(rectTopleftX, rectTopleftY, bounds.width, bounds.height);
            EGfxUtils.drawOrigin(gameObject, graphics, color, alpha);
        }else {
            console.error("Cannot draw debug box: GameObject is not a BitmapText, Image, or Container.");
        }
        /*if(EGfxUtils.hasCoordinates(gameObject)) {
            const bounds = gameObject.getTextBounds().global;
            const graphics = this.add.graphics().setPosition(bitmapText.x, bitmapText.y)
            graphics.lineStyle(2, 0xff0000, .4);
            const rectTopleftX = -bounds.width*bitmapText.originX;
            const rectTopleftY = -bounds.height*bitmapText.originY;
            graphics.strokeRect(rectTopleftX, rectTopleftY, bounds.width, bounds.height);
        }*/
    }

    static getBounds(gameObject:GameObject):Bounds | undefined
    {
        if(gameObject instanceof BitmapText){
            return gameObject.getTextBounds().global as Bounds;
        }else if(gameObject instanceof Image || gameObject instanceof Container){
            return gameObject.getBounds() as Bounds;
        }
    }

    static hasCoordinates(gameObject:GameObject):boolean{
        return gameObject["x"] && gameObject["y"];
    }

    static drawOrigin(gameObject:GameObject, graphics?:Graphics, color:number = 0xFF00FF, alpha:number = .7){
        if(gameObject["x"] && gameObject["y"]) {
            const scene: Scene = gameObject.scene;
            graphics = graphics ? graphics : scene.add.graphics();
            graphics.alpha = alpha;
            graphics.setPosition(gameObject["x"], gameObject["y"]);
            EGfxUtils.drawX(graphics, alpha);
        }else{
            console.error("Cannot draw origin: GameObject does not have x and y properties.");
        }
    }

    static drawX(graphics:Graphics, alpha:number = .7, size:number = 8, color:number = 0x00FF00){
        graphics.lineStyle(2, color, alpha);
        graphics.beginPath();
        graphics.moveTo(-size, -size);
        graphics.lineTo(size, size);
        graphics.moveTo(size, -size);
        graphics.lineTo(-size, size);
        graphics.closePath();
        graphics.strokePath();
    }


}