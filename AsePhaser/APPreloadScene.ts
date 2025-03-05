import EPreloadScene from "../EPhaser/EPreloadScene";
import APGlobal from "./APGlobal";

/**
 * Class representing a preload scene in AsePhaser.
 */
export default class APPreloadScene extends EPreloadScene {

    /**
     * Create a preload scene.
     * @param {any} config - The configuration object.
     */
    constructor() {
        super();
    }


    preload(): void {
        super.preload();
        const layoutJSON = this.cache.json.get('layoutJSON');
        // Set AsePhaser global variables
        APGlobal.asePhaserVersion = layoutJSON.version;
        APGlobal.commonLayers = layoutJSON.common.layers;

        // Load common layers
        APGlobal.commonLayers.forEach(layerObject => {
            this.loadImage(layerObject.name, "assets/img/common/");
        });

        let totScenes = layoutJSON.scenes.length;

        // Load specific scene layers
        for (let i = 0; i < totScenes; i++) {
            let currentSceneName = layoutJSON.scenes[i].name;
            let currentSceneLayers = layoutJSON.scenes[i].layers;
            APGlobal.scenes[currentSceneName] = currentSceneLayers;
            currentSceneLayers.forEach(layerObject=>{
                console.log("loadImage: " + layerObject.name);
                this.loadImage(layerObject.name, "assets/img/scenes/"+currentSceneName+"/");
            });
        }
    }
}
