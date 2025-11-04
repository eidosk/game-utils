import {SceneElement} from "eidosk";

export class LayoutRegistry {
    private static layouts = new Map<string, SceneElement[]>();

    static register(key: string, layout: SceneElement[]): void {
        this.layouts.set(key, layout);
    }

    static get(key: string): SceneElement[] | undefined {
        return this.layouts.get(key);
    }

    static has(key: string): boolean {
        return this.layouts.has(key);
    }

    static clear(): void {
        this.layouts.clear();
    }

    static getAllKeys(): string[] {
        return Array.from(this.layouts.keys());
    }

    static getAvailableLayouts(): string[] {
        return Array.from(this.layouts.keys());
    }
}