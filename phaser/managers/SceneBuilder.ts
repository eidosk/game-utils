import { Scene } from "phaser";
import { BitmapText, BitmapTextConfig, Button, Image, SceneElement, TextConfig, ImageConfig, ButtonConfig, Orientation, DebugUtils } from "eidosk/phaser";
import { ELayoutConfigs } from "eidosk/core";
import { LayoutConfig } from "eidosk/core";

export class SceneBuilder {
    private createdElements: Map<string, any> = new Map();
    private localizationMap: Map<string, string> = new Map();
    private scale:number = 2; //temp todo: get from config

    constructor(
        private scene: Scene,
        private elements: SceneElement[]
    ) {}

    // Set translations for localization
    setLocalization(translations: Record<string, string>): void {
        Object.entries(translations).forEach(([key, value]) => {
            this.localizationMap.set(key, value);
        });
    }

    // Create all elements in array order (preserves z-index)
    autoCreateAll(): void {
        const currentSceneName = this.scene.scene.key;
        this.elements.forEach(element => {
            // Filter common elements based on onlyIn property
            const config = element.config as any;
            console.log("config: ", config);
            if (config.onlyIn && !config.onlyIn.includes(currentSceneName)) {
                console.log("Skipping " + element.name + " (not in onlyIn list for " + currentSceneName + ")");
                return; // Skip this element
            }
            if (config.notIn && config.notIn.includes(currentSceneName)) { // ADDED
                console.log("Skipping " + element.name + " (in notIn list for " + currentSceneName + ")"); // ADDED
                return; // ADDED
            }
            let gameObject;
            switch(element.type) {
                case 'image':
                    console.log("adding image: " + element.name);
                    gameObject = this.addImage(element.name);
                    break;
                case 'text':
                    gameObject = this.addText(element.name);
                    break;
                case 'bitmapText':
                    const bitmapConfig = element.config as BitmapTextConfig;
                    gameObject = this.addBitmapText(element.name, bitmapConfig?.text);
                    break;
                case 'button':
                    gameObject = this.addButton(element.name);
                    break;
            }
            if (gameObject) {
                //if(gameObject.scene) DebugUtils.drawDebugBox(gameObject);
                const elementScale = (element.config as any).scale ?? this.scale;
                gameObject.setScale(elementScale);
                const names = this.extractAllNames(element.name);
                names.forEach(name => {
                    this.createdElements.set(name, gameObject);
                });
            }
        });
    }

    /**
     * Extract all possible name variants for an element
     * Example: "GameScene_play.button" produces:
     * - "GameScene_play.button" (full name)
     * - "play.button" (layer name)
     * - "play" (short name)
     */
    private extractAllNames(fullName: string): string[] {
        const names: string[] = [];
        // 1. Full name: "GameScene_play.button"
        names.push(fullName);
        // 2. Layer name: "play.button" (remove scene prefix)
        const firstUnderscore = fullName.indexOf('_');
        const layerName = firstUnderscore > 0 ? fullName.substring(firstUnderscore + 1) : fullName;
        if (layerName !== fullName) {
            names.push(layerName);
        }
        // 3. Short name: "play" (remove both scene prefix and suffix)
        const dotIndex = layerName.indexOf('.');
        const shortName = dotIndex > 0 ? layerName.substring(0, dotIndex) : layerName;
        if (shortName !== layerName) {
            names.push(shortName);
        }
        return names;
    }

    // Element creation methods
    addImage(name: string): Image {
        const config = this.resolveLayout<ImageConfig>(name);
        console.log("x: " + config.x);
        console.log("y: " + config.y);
        return this.scene.add.image(config.x, config.y, name)
            .setScale(config.scale)
            .setOrigin(config.originX, config.originY)
            .setAlpha(config.alpha)
            .setVisible(config.visible ?? true);
    }

    addText(name: string, text?: string): Phaser.GameObjects.Text {
        const config = this.resolveLayout<TextConfig>(name);
        let finalText = text || config.text || name;
        // Apply localization if loc flag is true
        if (config.loc && this.localizationMap.has(finalText)) {
            finalText = this.localizationMap.get(finalText)!;
        }
        return this.scene.add.text(config.x, config.y, finalText, {
            fontFamily: config.font || "Arial",
            fontSize: config.fontSize || 32,
            color: this.resolveColor(config.color),
            align: "center"
        }).setOrigin(config.originX, config.originY);
    }

    addBitmapText(name: string, text?: string): BitmapText {
        const config = this.resolveLayout<BitmapTextConfig>(name);
        let finalText = text || config.text || name;
        // Apply localization if loc flag is true
        if (config.loc && this.localizationMap.has(finalText)) {
            finalText = this.localizationMap.get(finalText)!;
        }
        // Calculate final font size: base size × scale
        // If scale not specified, use game scale (this.scale)
        //const fontScale = config.scale ?? this.scale;
        //let finalSize = config.fontSize * fontScale;
        //if(finalText=="Level 0")console.log("finalSize: " + finalSize);
        const bitmapText = this.scene.add.bitmapText(
            config.x,
            config.y,
            config.font || "NO FONT",
            finalText,
            config.fontSize
        ).setOrigin(config.originX, config.originY);

        // Apply color if specified
        if (config.color !== undefined) {
            bitmapText.setTint(config.color);
        }

        return bitmapText;
    }

    addButton(name: string, cfg?: ButtonConfig): Button {
        const element = this.elements.find(el => el.name === name);
        const config = this.resolveLayout<ButtonConfig>(name);

        // Check for hover texture: "TitleScene_play.button" → "TitleScene_play_hover"
        const hoverTextureName = name.replace(".button", "_hover");
        const hasHoverTexture = this.scene.textures.exists(hoverTextureName);

        // Check for disabled texture: "TitleScene_play.button" → "TitleScene_play_disabled" // ADDED
        const disabledTextureName = name.replace(".button", "_disabled"); // ADDED
        const hasDisabledTexture = this.scene.textures.exists(disabledTextureName); // ADDED

        const buttonConfig: ButtonConfig = {
            ...config,
            ...cfg,
            texture: cfg?.texture ?? config.texture ?? name,
            hoverTexture: hasHoverTexture ? hoverTextureName : undefined,
            disabledTexture: hasDisabledTexture ? disabledTextureName : undefined, // ADDED
            name: name
        };

        // Map Aseprite element data to ButtonConfig
        if (element?.config) {
            if (element.config.text) {
                buttonConfig.text = element.config.text;
                // Apply localization if needed
                if (element.config.loc && this.localizationMap.has(buttonConfig.text)) {
                    buttonConfig.text = this.localizationMap.get(buttonConfig.text)!;
                }
            }
            if (element.config.font) buttonConfig.font = element.config.font;
            if (element.config.color) buttonConfig.color = element.config.color;
        }

        const btn: Button = new Button(this.scene, buttonConfig);
        this.createdElements.set(name, btn);
        return btn;
    }

    // Filter buttons when needed
    getAllButtons(): Map<string, Button> {
        const buttons = new Map<string, Button>();
        this.createdElements.forEach((element, name) => {
            if (element && element instanceof Button) {
                buttons.set(name, element);
            }
        });
        return buttons;
    }

    /** Get appropriate defaults based on element type */
    private getDefaultsForType<T extends LayoutConfig>(type: string): T {
        switch(type) {
            case 'image':
                return ELayoutConfigs.DEFAULT_IMAGE_CONFIG as T;
            case 'text':
                return ELayoutConfigs.DEFAULT_TEXT_CONFIG as T;
            case 'bitmapText':
                return ELayoutConfigs.DEFAULT_BITMAP_TEXT_CONFIG as T;
            case 'button':
                return ELayoutConfigs.DEFAULT_BUTTON_CONFIG as T;
            default:
                return ELayoutConfigs.DEFAULT_IMAGE_CONFIG as T;
        }
    }

    /** Resolve layout: determine defaults, merge config, and calculate position */
    private resolveLayout<T extends LayoutConfig>(name: string): T & { x: number; y: number } {
        const element = this.elements.find(el => el.name === name);
        if (!element) {
            console.warn("Layout element '" + name + "' not found. Available: " + this.elements.map(e => e.name).join(', '));
            const fallbackDefaults = this.getDefaultsForType<T>('image');
            return { ...fallbackDefaults, x: 0, y: 0 };
        }

        // Get appropriate defaults for this element type
        const defaults = this.getDefaultsForType<T>(element.type);

        return this.calculateLayout<T>(element.config || {}, defaults);
    }

    /** Calculate final layout with position */
    private calculateLayout<T extends LayoutConfig>(config: any, defaults: T): T & { x: number; y: number } {
        const layout = { ...defaults, ...config };

        // Handle orientation
        const isPortrait = Orientation.isPortrait();
        const merged = isPortrait && layout.portrait ? { ...layout, ...layout.portrait } : layout;

        // Calculate final positions - priority: absolute > percentage > 0
        let finalX: number;
        let finalY: number;

        if (merged.x !== undefined) {
            // Absolute position from Aseprite - apply scale
            finalX = merged.x * this.scale;
        } else if (merged.percX !== undefined) {
            // Percentage-based position for manual layout
            const percX = Math.max(0, Math.min(100, merged.percX));
            finalX = percX * this.scene.cameras.main.width / 100;
        } else {
            finalX = 0;
        }

        if (merged.y !== undefined) {
            // Absolute position from Aseprite - apply scale
            finalY = merged.y * this.scale;
        } else if (merged.percY !== undefined) {
            // Percentage-based position for manual layout
            const percY = Math.max(0, Math.min(100, merged.percY));
            finalY = percY * this.scene.cameras.main.height / 100;
        } else {
            finalY = 0;
        }

        return { ...merged, x: finalX, y: finalY };
    }

    /** Convert number → hex string */
    private resolveColor(color?: number): string {
        const c = color ?? 0xffffff;
        return "#" + c.toString(16).padStart(6, "0");
    }

    // Element retrieval methods
    getButton(name: string): Button | undefined {
        const element = this.createdElements.get(name);
        return element instanceof Button ? element : undefined;
    }

    getText(name: string): Phaser.GameObjects.Text | undefined {
        const element = this.createdElements.get(name);
        return element instanceof Phaser.GameObjects.Text ? element : undefined;
    }

    getBitmapText(name: string): BitmapText | undefined {
        //this.listElements();
        const element = this.createdElements.get(name);
        return element instanceof Phaser.GameObjects.BitmapText ? element : undefined;
    }

    getImage(name: string): Image | undefined {
        //this.listElements();
        const element = this.createdElements.get(name);
        return element instanceof Phaser.GameObjects.Image ? element : undefined;
    }

    getElement(name: string): any {
        return this.createdElements.get(name);
    }

    getAllElements(): Map<string, any> {
        return new Map(this.createdElements);
    }

    // Utility methods
    listElements(): void {
        console.log('Layout elements:', this.elements.map(e => e.name + " (" + e.type + ")"));
        console.log('Created elements:', Array.from(this.createdElements.keys()));
    }

    hasElement(name: string): boolean {
        return this.elements.some(el => el.name === name);
    }

    getElementCount(): number {
        return this.elements.length;
    }

    getCreatedElementCount(): number {
        return this.createdElements.size;
    }
}