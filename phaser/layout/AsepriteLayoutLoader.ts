// eidosk/phaser/loaders/AsepriteLayoutLoader.ts

import { SceneElement } from 'eidosk';

interface AsepriteLayer {
    name: string;
    x: number;
    y: number;
    percX: number;
    percY: number;
    width: number;
    height: number;
    portrait?: {
        x: number;
        y: number;
        percX: number;
        percY: number;
    };
    onlyIn?: string[];
    notIn?: string[]; // ADDED
    hasPortraitImage?: boolean;
    type?: string;
    font?: string;
    text?: string;
    color?: number;
    shadowColor?: number;
    fontSize?: number;
    scale?: number;
    originX?: number;
    originY?: number;
    opacity?: number;
    hasHoverImage?: boolean;
    hasDisabledImage?: boolean; // ADDED
}

interface AsepriteJSON {
    version: string;
    scenes: Array<{
        name: string;
        layers: AsepriteLayer[];
    }>;
    common: {
        layers: AsepriteLayer[];
    };
}

export class AsepriteLayoutLoader {
    static parseLayout(jsonData: AsepriteJSON, sceneName: string): SceneElement[] {
        const elements: SceneElement[] = [];
        // Add common layers (flattened)
        const commonLayers = this.flattenLayers(jsonData.common.layers);
        commonLayers.forEach(layer => {
            elements.push(this.layerToElement(layer));
        });
        // Add scene-specific layers (flattened)
        const scene = jsonData.scenes.find(s => s.name === sceneName);
        if (scene) {
            const sceneLayers = this.flattenLayers(scene.layers);
            sceneLayers.forEach(layer => {
                elements.push(this.layerToElement(layer));
            });
        }
        return elements;
    }

    /**
     * Recursively flatten nested layer groups into a flat array.
     * Groups are organizational only - all layers become individual scene elements.
     */
    public static flattenLayers(layers: any[]): any[] {
        const flattened: any[] = [];
        for (const layer of layers) {
            if (layer.layers && Array.isArray(layer.layers)) {
                // It's a group - recursively flatten its children
                flattened.push(...this.flattenLayers(layer.layers));
            } else {
                // It's a regular layer - add it directly
                flattened.push(layer);
            }
        }
        return flattened;
    }

    private static layerToElement(layer: AsepriteLayer): SceneElement {
        // Determine element type
        let type: SceneElement['type'] = 'image';
        if (layer.type === 'button') type = 'button';
        else if (layer.type === 'text') type = 'bitmapText';

        // Build config
        const config: any = {
            // Landscape defaults
            x: layer.x,
            y: layer.y,
            percX: layer.percX,
            percY: layer.percY,
            scale: layer.scale,
            originX: layer.originX ?? 0.5,
            originY: layer.originY ?? 0.5,
            alpha: layer.opacity ? layer.opacity / 255 : 1,
            // Portrait overrides
            portrait: layer.portrait ? {
                x: layer.portrait.x,
                y: layer.portrait.y,
                percX: layer.portrait.percX,
                percY: layer.portrait.percY,
            } : undefined,
            // Type-specific
            font: layer.font,
            text: layer.text,
            fontSize: layer.fontSize,
            color: layer.color,
            onlyIn: layer.onlyIn,
            notIn: layer.notIn, // ADDED
            texture: layer.name, // Base texture
            hoverTexture: layer.hasHoverImage ? layer.name.replace('.button', '_hover') : undefined,
            disabledTexture: layer.hasDisabledImage ? layer.name.replace('.button', '_disabled') : undefined,
        };

        return {
            name: layer.name,
            type,
            config
        };
    }
}