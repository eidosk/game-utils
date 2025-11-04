import { Scene, GameObjects } from 'phaser';
import { MathUtils } from '../../core/utils/math/MathUtils.ts';

interface DraggableGameObject extends GameObjects.GameObject {
    x: number;
    y: number;
}

export class DragManager {
    private isDragEnabled = false;

    constructor(private scene: Scene) {}

    enableDragForAll(): void {
        if (this.isDragEnabled) return;

        this.makeChildrenDraggable();
        this.scene.input.on('dragstart', this.onDragStart, this);
        this.isDragEnabled = true;
    }

    disableDrag(): void {
        this.scene.input.off('dragstart', this.onDragStart, this);
        this.scene.input.off('drag', this.onDrag, this);
        this.scene.input.off('dragend', this.onDragEnd, this);
        this.isDragEnabled = false;
    }

    makeDraggable(gameObject: GameObjects.GameObject): void {
        gameObject.setInteractive({ useHandCursor: true, draggable: true });
    }

    private makeChildrenDraggable(): void {
        const len = this.scene.children.length;
        for (let i = 0; i < len; i++) {
            const child = this.scene.children.getAt(i);
            if (child instanceof GameObjects.Image && child.texture.key !== "bg") {
                this.makeDraggable(child);
            }
        }
    }

    private onDragStart(pointer: Phaser.Input.Pointer, gameObject: GameObjects.GameObject): void {
        this.scene.input.off('dragstart', this.onDragStart, this);
        this.scene.children.bringToTop(gameObject);
        this.scene.input.on('drag', this.onDrag, this);
        this.scene.input.on('dragend', this.onDragEnd, this);
    }

    private onDrag(pointer: Phaser.Input.Pointer, gameObject: DraggableGameObject, dragX: number, dragY: number): void {
        gameObject.x = dragX;
        gameObject.y = dragY;
    }

    private onDragEnd(pointer: Phaser.Input.Pointer, gameObject: DraggableGameObject): void {
        this.scene.input.off('drag', this.onDrag, this);
        this.scene.input.off('dragend', this.onDragEnd, this);
        this.scene.input.on('dragstart', this.onDragStart, this);

        const percX = MathUtils.roundTo2DecimalPlaces((gameObject.x / this.scene.sys.game.canvas.width) * 100);
        const percY = MathUtils.roundTo2DecimalPlaces((gameObject.y / this.scene.sys.game.canvas.height) * 100);
        console.log(`Drag ended at: ${percX}% X, ${percY}% Y`);
    }

    destroy(): void {
        this.disableDrag();
    }
}