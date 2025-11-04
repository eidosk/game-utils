import { PreloadScene, LayoutRegistry, AsepriteLayoutLoader, Orientation } from 'eidosk/phaser';
/**
 * Base preload scene for games using Aseprite layouts.
 * Handles loading images from layout JSON and registering layouts.
 */
export abstract class AsepritePreloadScene extends PreloadScene {

    preload(): void {
        super.preload();
        const layoutJSON = this.registry.get('layoutData');
        if (layoutJSON) {
            this.loadAsepriteFonts(layoutJSON);  // ADD THIS LINE
            this.loadAsepriteImages(layoutJSON);
        }
        this.loadGameAssets();
    }

    create(): void {
        const layoutJSON = this.registry.get('layoutData');
        if (layoutJSON) {
            this.registerLayouts(layoutJSON);
        }
        this.startNextScene();
    }

    /**
     * Load game-specific assets (fonts, audio, etc.)
     * Override in your game's preload scene.
     */
    protected abstract loadGameAssets(): void;

    /**
     * Start the next scene after preloading.
     * Override to specify which scene to start.
     */
    protected abstract startNextScene(): void;

    /**
     * Load all bitmap fonts referenced in the Aseprite layout JSON.
     * Scans all layers for unique font names and loads them.
     */
    /**
     * Load all bitmap fonts from the fonts array in layout JSON.
     */
    private loadAsepriteFonts(json: any): void {
        // Load all fonts from the fonts array
        if (json.fonts) {
            Object.values(json.fonts).forEach((fontName: any) => {
                console.log("Loading font: " + fontName);
                this.load.bitmapFont(
                    fontName,
                    "assets/fonts/" + fontName + "/font.png",
                    "assets/fonts/" + fontName + "/font.fnt"
                );
            });
        }
    }

    /**
     * Load all images referenced in the Aseprite layout JSON.
     * Automatically handles portrait/landscape variants and hover states.
     */
    /**
     * Load all images referenced in the Aseprite layout JSON.
     * Automatically handles portrait/landscape variants and hover states.
     */
    /**
     * Load all images referenced in the Aseprite layout JSON.
     * Automatically handles portrait/landscape variants and hover states.
     */
    private loadAsepriteImages(json: any): void {
        const isPortrait = Orientation.isPortrait();

        // Load common images
        if (json.common && json.common.layers) {
            const flatLayers = AsepriteLayoutLoader.flattenLayers(json.common.layers);
            flatLayers.forEach(layer => {
                const suffix = (isPortrait && layer.hasPortraitImage) ? '_portrait' : '';
                this.load.image(layer.name, "assets/img/common/" + layer.name + suffix + ".png");

                // Load hover texture if it's a button with a hover state
                if (layer.name.endsWith('.button') && layer.hasHoverImage) {
                    const hoverName = layer.name.replace('.button', '_hover');
                    this.load.image(hoverName, "assets/img/common/" + hoverName + ".png");
                }

                // Load disabled texture if button has a disabled state
                if (layer.name.endsWith('.button') && layer.hasDisabledImage) {
                    const disabledName = layer.name.replace('.button', '_disabled');
                    this.load.image(disabledName, "assets/img/common/" + disabledName + ".png");
                }
            });
        }

        // Load scene images
        if (json.scenes) {
            json.scenes.forEach(scene => {
                if (scene.layers) {
                    const flatLayers = AsepriteLayoutLoader.flattenLayers(scene.layers);
                    flatLayers.forEach(layer => {
                        const suffix = (isPortrait && layer.hasPortraitImage) ? '_portrait' : '';
                        this.load.image(layer.name, "assets/img/scenes/" + scene.name + "/" + layer.name + suffix + ".png");

                        // Load hover texture if it's a button with a hover state
                        if (layer.name.endsWith('.button') && layer.hasHoverImage) {
                            const hoverName = layer.name.replace('.button', '_hover');
                            this.load.image(hoverName, "assets/img/scenes/" + scene.name + "/" + hoverName + ".png");
                        }

                        // Load disabled texture if button has a disabled state
                        if (layer.name.includes('.button') && layer.hasDisabledImage) {
                            const disabledName = layer.name.replace('.button', '_disabled');
                            this.load.image(disabledName, "assets/img/scenes/" + scene.name + "/" + disabledName + ".png");
                        }
                    });
                }
            });
        }
    }


    /**
     * Register all scene layouts with LayoutRegistry.
     */
    private registerLayouts(json: any): void {
        if (json.scenes) {
            json.scenes.forEach(scene => {
                const elements = AsepriteLayoutLoader.parseLayout(json, scene.name);
                LayoutRegistry.register(scene.name, elements);
            });
        }
    }
}