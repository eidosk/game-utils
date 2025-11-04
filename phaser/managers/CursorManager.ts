import {Scene} from "phaser";

export class CursorManager {
    private scene: Scene;
    private cursorStack: string[] = ['default'];
    private hoverEnabled: boolean = true;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // Set base default cursor
    setDefault(cursor: string = 'default'): void {
        this.cursorStack[0] = cursor;
        this.applyCursor();
    }

    // Push a mode cursor (swap, bomb, etc)
    push(cursor: string): void {
        this.cursorStack.push(cursor);
        this.applyCursor();
    }

    // Pop mode cursor, restore previous
    pop(): void {
        if (this.cursorStack.length > 1) {
            this.cursorStack.pop();
            this.applyCursor();
        }
    }

    // Enable/disable tile hover cursor
    setHoverEnabled(enabled: boolean): void {
        this.hoverEnabled = enabled;

        // If disabling hover while hovering, reset cursor
        if (!enabled) {
            this.applyCursor();
        }
    }

    // Called by GridInputHandler on tile hover
    onTileHover(): void {
        if (this.hoverEnabled) {
            this.scene.input.setDefaultCursor('pointer');
        }
    }

    // Called by GridInputHandler on tile rollout
    onTileRollout(): void {
        if (this.hoverEnabled) {
            this.applyCursor();
        }
    }

    private applyCursor(): void {
        const current = this.cursorStack[this.cursorStack.length - 1];
        this.scene.input.setDefaultCursor(current);
    }

    // Debug
    getCurrentCursor(): string {
        return this.cursorStack[this.cursorStack.length - 1];
    }

    getStack(): string[] {
        return [...this.cursorStack];
    }
}