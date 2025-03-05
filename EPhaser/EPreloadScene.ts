/**
 * Class representing a preload scene in Phaser.
 */
export default class EPreloadScene extends Phaser.Scene {

    protected loadingText: Phaser.GameObjects.Text;
    protected preloaderBacking: Phaser.GameObjects.Graphics;
    protected preloaderBar: Phaser.GameObjects.Graphics;
    protected fontName:string;
    protected fontColor: number;
    protected fontSize: number;
    protected backingColor: number;
    protected barColor: number;
    protected gameWidth: number;
    protected gameHeight: number;

    /**
     * Create a preload scene.
     * @param options
     */
    constructor(options?: { fontName?: string, fontColor?: number, fontSize?: number, backingColor?: number, barColor?: number }) {
        super({ key: 'Preload' });
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

    preload(){
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        //CREATE LOADING TEXT:
        this.loadingText = this.add.text(
            this.gameWidth / 2,
            this.gameHeight * 0.4,
            'Loading... 0%',
            {
                fontFamily: this.fontName,
                fontSize: this.fontSize+'px',
                color: this.numberToHexString(this.fontColor)
            }
        ).setOrigin(0.5);
        //CREATE BACKING:
        this.preloaderBacking = this.add.graphics();
        this.preloaderBacking.fillStyle(this.backingColor, 1);
        this.preloaderBacking.fillRect(
            this.gameWidth / 2 - this.gameWidth * 0.25,
            this.gameHeight * 0.5,
            this.gameWidth * 0.5,
            20
        );

        // Light blue loading bar
        this.preloaderBar = this.add.graphics();

        this.load.on('progress', (value: number) => {
            this.updateLoadingBar(value);
            this.loadingText.text = `Loading... ${Math.round(value * 100)}%`;
        });
    }

    create(){
        //start first scene here or extend
    }

    updateLoadingBar(value: number): void {
        // Clear previous content of the bar
        this.preloaderBar.clear();

        // Light blue loading bar
        this.preloaderBar.fillStyle(this.barColor, 1);
        const barWidth = this.gameWidth * 0.5 * value;
        this.preloaderBar.fillRect(
            this.gameWidth / 2 - this.gameWidth * 0.25,
            this.gameHeight * 0.5,
            barWidth,
            20
        );
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
        const newFont = new FontFace(name, `url(${url})`);
        newFont.load()
            .then((loaded) => (document.fonts as any).add(loaded))
            .catch((error) => console.error(error));
    }
}