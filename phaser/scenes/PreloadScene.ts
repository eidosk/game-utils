import { PreloaderBar } from '../ui/PreloaderBar';

/**
 * Class representing a preload scenes in Phaser.
 */
export class PreloadScene extends Phaser.Scene {

    protected loadingText: Phaser.GameObjects.Text;
    protected preloaderBar: PreloaderBar;
    protected fontName: string;
    protected fontColor: number;
    protected fontSize: number;
    protected backingColor: number;
    protected barColor: number;
    protected gameWidth: number;
    protected gameHeight: number;
    protected hasCustomProgressBar: boolean = false;

    /**
     * Create a preload scenes.
     * @param key
     * @param options
     */
    constructor(key: string = 'Preload', options?: { fontName?: string, fontColor?: number, fontSize?: number, backingColor?: number, barColor?: number }) {
        super({ key: key });
        const {
            fontName = "Verdana",
            fontColor = 0xff0000,
            fontSize = 16,
            backingColor = 0x000000,
            barColor = 0x8cd1c8
        } = options || {};
        this.fontName = fontName;
        this.fontColor = fontColor;
        this.fontSize = fontSize;
        this.backingColor = backingColor;
        this.barColor = barColor;
    }

    preload() {
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // Only create the default progress UI if not overridden
        if (!this.hasCustomProgressBar) {
            this.createDefaultProgressBar();
        }

        // Always register the progress event
        this.load.on('progress', (value: number) => {
            this.updateLoadingProgress(value);
        });
    }

    create() {
        //start first scenes here or extend
    }

    /**
     * Creates the default progress bar UI.
     * Override this in child classes to create custom progress UI.
     */
    protected createDefaultProgressBar(): void {
        // Create the progress bar using the PreloaderBar component
        this.preloaderBar = new PreloaderBar(this, {
            x: this.gameWidth / 2,
            y: this.gameHeight / 2,
            width: this.gameWidth * 0.5,
            height: 20,
            backingColor: this.backingColor,
            barColor: this.barColor,
            borderColor: 0xffffff,
            borderWidth: 1
        });

        // Create loading text
        this.loadingText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight * 0.4,
            'Loading... 0%',
            {
                fontFamily: this.fontName,
                fontSize: this.fontSize + "px",
                color: this.numberToHexString(this.fontColor)
            }
        ).setOrigin(0.5);
    }

    /**
     * Updates the loading progress.
     * Override this in child classes for custom progress updates.
     * @param value Progress value between 0 and 1
     */
    protected updateLoadingProgress(value: number): void {
        // Only update if we have components to update and we're not using a custom progress bar
        if (!this.hasCustomProgressBar) {
            if (this.preloaderBar) {
                this.preloaderBar.updateProgress(value);
            }

            if (this.loadingText) {
                this.loadingText.text = "Loading... " + Math.round(value * 100) + "%";
            }
        }
    }

    numberToHexString(colorNumber: number): string {
        return '#' + colorNumber.toString(16).padStart(6, '0');
    }

    /**
     * Load an image asset.
     * @param {string} name - The name of the image asset.
     * @param {string} [folderPath="assets/img/"] - The folder path where the image is located.
     * @param {string} [fileType="png"] - The file type of the image.
     */
    loadImage(name: string, folderPath: string = "assets/img/", fileType: string = "png"): void {
        this.load.image(name, folderPath + name + "." + fileType);
    }

    /**
     * Load an audio asset.
     * @param {string} name - The name of the audio asset.
     * @param {string} fileName - The file name of the audio.
     * @param {string} [fileType="mp3"] - The file type of the audio.
     */
    loadAudio(name: string, fileName?: string, fileType: string = "mp3"): void {
        fileName = fileName || name;
        this.load.audio(name, 'assets/sounds/'+fileName+'.'+fileType);
    }

    /**
     * Load a bitmap font asset.
     * @param {string} name - The name of the bitmap font asset.
     */
    loadBitmapFont(name: string): void {
        this.load.bitmapFont(
            name,
            'assets/fonts/'+name+'/font.png',
            'assets/fonts/'+name+'/font.fnt'
        );
    }

    /**
     * Loads a TrueType font from a given URL and adds it to the document's font list.
     *
     * @param {string} name - The name of the font.
     * @param {string} url - The URL of the font file.
     */
    loadTtfFont(name: string, url: string): void {
        const newFont = new FontFace(name, "url(" + url + ")");
        newFont.load()
            .then((loaded) => (document.fonts as any).add(loaded))
            .catch((error) => console.error(error));
    }
}