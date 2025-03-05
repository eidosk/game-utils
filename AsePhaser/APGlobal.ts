import {ETextButton} from "../EPhaser/ETextButton";
import {EButton} from "../EPhaser/EButton";
import Image = Phaser.GameObjects.Image;
import Container = Phaser.GameObjects.Container;
import BitmapText = Phaser.GameObjects.BitmapText;

//IMPROVE: This is a temporary solution to avoid circular dependencies.

type GraphicObject = Image | Container | BitmapText | ETextButton | EButton;
export default {
    commonLayers: [] as any[], // array of layer objects
    scenes: {} as Record<string, any>, // object mapping scene names to scene data
    asePhaserVersion: "",
    //layoutGameObjects:{} as GraphicObject
};
