import ELocalStorage from "./ELocalStorage";
import EAchievement from "./EAchievement";
import EScene from "../EPhaser/EScene";

export default class EAchievements {

    public static readonly COMPLETED:string = "Achievement Completed!"; //could be used both for local storange AND as a message
    protected static list: { [key: string]: EAchievement } = {};

    public static currentScene:EScene;

    public static wasCompleted(name:string):boolean{
        return ELocalStorage.getItem(name) === this.COMPLETED;
    }

    public static checkComplete(scene:EScene, name:string){
        if(!this.wasCompleted(name)){
            ELocalStorage.setItem(name, this.COMPLETED);
            let achObj:EAchievement = this.list[name];
            achObj.complete(scene);
            console.log("ACHIEVEMENT COMPLETED! " + name);
        }else{
            console.log("ACHIEVEMENT "+name+" had been already completed...");
        }
    }

    public static updateIcon(key:string){
        //extend and update ach icon in children classes
    }


    public static getCompletedItems():number{
        let counter:number = 0;
        for (const key in this.list) {
            if (this.list.hasOwnProperty(key)) {
                if (this.wasCompleted(key)) {
                    counter++;
                    //this.updateIcon(key);
                }
            }
        }
        return counter;
    }

    public static getCompletedString():string{
        return this.getCompletedItems() + "/" + this.getTotalItems();
    }

    public static wereAllCompleted():boolean{
        return this.getCompletedItems() >= this.getTotalItems();
    }

    public static getTotalItems(): number {
        return Object.keys(this.list).length;
    }
}
