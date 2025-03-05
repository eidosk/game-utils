import DefaultScene from "../../scenes/DefaultScene";
import Point = Phaser.Geom.Point;
import EScene from "../EPhaser/EScene";
import Container = Phaser.GameObjects.Container;
import Image = Phaser.GameObjects.Image;

export default class EAchievement{

    protected name: string;
    protected textureName: string;
    protected completedText: string;

    constructor(name:string, textureName:string, completedText:string) {
        this.name = name;
        this.textureName = textureName == "" ? name : textureName;
        this.completedText = completedText;
    }
    complete(scene:EScene){
        console.log("COMPLETE textureName!" + this.textureName);
    }
}