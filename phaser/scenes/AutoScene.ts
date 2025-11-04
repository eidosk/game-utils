import { Scene } from 'phaser';
import {
    BitmapText, Image,
    Button, SceneElement, SceneBuilder, DragManager,
    Orientation, SoundManager, LayoutRegistry
} from 'eidosk/phaser';

export abstract class AutoScene extends Scene {
    protected sceneBuilder!: SceneBuilder;
    protected dragManager!: DragManager;
    protected orientationManager!: Orientation;
    protected soundManager!: SoundManager;
    private initialOrientation!: 'landscape' | 'portrait';

    protected constructor(key: string) {
        super(key);
    }

    protected abstract setupGameLogic(): void;
    protected abstract onButtonClick(btn: Button, buttonName: string): void;

    protected onOrientationChanged(aspectRatio: number): void {}

    create(): void {
        try {
            this.initialOrientation = Orientation.isPortrait() ? 'portrait' : 'landscape';
            console.log(`Creating scene: ${this.scene.key} (${this.initialOrientation}, ${this.scale.width}x${this.scale.height})`);
            this.initializeManagers();
            this.buildScene();
            this.addInteractions();
            this.setupGameLogic();
            this.setupCleanup();
        } catch (error) {
            console.error(`Error creating scene ${this.scene.key}:`, error);
        }
    }

    /**
     * Navigate to another scene
     * @param sceneKey The key of the scene to navigate to
     * @param config Optional configuration data to pass to the scene
     */
    protected gotoScene(sceneKey: string, config?: object): void {
        try {
            this.scene.start(sceneKey, config);
        } catch (error) {
            console.error(`Error navigating to scene ${sceneKey}:`, error);
        }
    }

    private initializeManagers(): void {
        try {
            this.dragManager = new DragManager(this);
            this.orientationManager = new Orientation(this);
            this.soundManager = new SoundManager(this);
            this.orientationManager.setup();
            this.events.on('orientationChanged', this.onOrientationChanged, this);
        } catch (error) {
            console.error(`Error initializing managers in ${this.scene.key}:`, error);
        }
    }

    protected addInteractions(): void {
        const allButtons = this.sceneBuilder.getAllButtons();

        allButtons.forEach((btn, buttonName) => {
            const baseName = this.getBaseName(buttonName);
            btn.setOnClick(() => this.onButtonClick(btn, baseName));
        });
    }

    private buildScene(): void {
        try {
            const sceneBuilderElements = this.getSceneElements();
            this.sceneBuilder = new SceneBuilder(this, sceneBuilderElements);
            this.sceneBuilder.autoCreateAll();
        } catch (error) {
            console.error(`Error creating sceneBuilder for ${this.scene.key}:`, error);
        }
    }

    private getSceneElements(): SceneElement[] {
        const sceneKey = this.scene.key;
        const config = LayoutRegistry.get(sceneKey);

        if (!config) {
            console.warn(`Layout not found for scene: ${sceneKey}. Available: ${LayoutRegistry.getAvailableLayouts().join(', ')}`);
            return [];
        }

        return config;
    }

    private setupCleanup(): void {
        this.events.once('shutdown', this.cleanup, this);
        this.events.once('destroy', this.cleanup, this);
    }

    protected cleanup(): void {
        try {
            this.dragManager?.destroy();
            this.orientationManager?.destroy();
            this.events.off('orientationChanged', this.onOrientationChanged, this);
        } catch (error) {
            console.error(`Error during cleanup in ${this.scene.key}:`, error);
        }
    }

    /**
     * Extract base name from layout object name
     * "GameScene_mute.button" → "mute"
     * "GameScene_score_text.bitmaptext" → "score_text"
     */
    protected getBaseName(fullName: string): string {
        // Remove scene prefix (everything before and including first underscore)
        let name = fullName;
        const firstUnderscore = name.indexOf('_');
        if (firstUnderscore > 0) {
            name = name.substring(firstUnderscore + 1);
        }

        // Remove suffix after dot
        const dotIndex = name.indexOf('.');
        if (dotIndex > 0) {
            name = name.substring(0, dotIndex);
        }

        return name;
    }

    // Element access methods
    public getSceneElement(name: string): any {
        return this.sceneBuilder?.getElement(name);
    }

    public getSceneBitmapText(name: string): BitmapText | undefined {
        return this.sceneBuilder?.getBitmapText(name);
    }

    public getSceneButton(name: string): Button | undefined {
        return this.sceneBuilder?.getButton(name);
    }

    public getSceneText(name: string): Phaser.GameObjects.Text | undefined {
        return this.sceneBuilder?.getText(name);
    }

    public getSceneImage(name: string): Image | undefined {
        return this.sceneBuilder?.getImage(name);
    }
}