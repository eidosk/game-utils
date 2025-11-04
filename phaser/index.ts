    /**
     * Eidosk Phaser Module
     *
     * This module contains all Phaser-specific implementations of Eidosk components.
     * All code here depends on Phaser and should never be imported into core modules.
     */

    // Export types first
    export * from './types';

    // ------------------------------
    // GameCore Components
    // ------------------------------

    // Scene System
    export { PreloadScene } from './scenes/PreloadScene';

    // Managers
    export { DragManager } from './managers/DragManager';
    export { SceneBuilder } from './managers/SceneBuilder';
    export { Orientation } from './managers/Orientation';
    export { SoundManager } from './managers/SoundManager';
    export { CountdownManager } from './managers/CountdownManager';
    export { CursorManager } from './managers/CursorManager';

    // Layout System
    export { LayoutRegistry } from 'eidosk/phaser/layout/LayoutRegistry';
    export { AsepriteLayoutLoader } from 'eidosk/phaser/layout/AsepriteLayoutLoader';

    // System Classes
    export { Timer } from './system/Timer';
    export type { TimerConfig } from './system/Timer';

    // ------------------------------
    // Grid System - Base
    // ------------------------------
    export { TileFactory } from './grid/TileFactory';
    export type { TileConfig } from './grid/TileFactory';
    export { GridVisualRenderer } from './grid/GridVisualRenderer';
    export type { GridRenderConfig } from './grid/GridVisualRenderer';
    export { GridInputHandler } from './grid/GridInputHandler';
    export type { InputHandlerCallbacks } from './grid/GridInputHandler';
    export { GridTileAnimator } from './grid/GridTileAnimator';

    // ------------------------------
    // Match-3 Grid Implementation
    // ------------------------------
    export { Match3GridView } from './grid/match3/Match3GridView';
    export { Match3TileFactory } from './grid/match3/Match3TileFactory';
    export type { Match3GridConfig } from './grid/match3/Match3GridView';
    export type { Match3TileConfig } from './grid/match3/Match3TileFactory';
    export { Match3Animator } from './grid/match3/Match3Animator';
    export { Match3Matcher } from './grid/match3/Match3Matcher';
    export { Match3InputHandler } from './grid/match3/Match3InputHandler';
    export type { Match3InputCallbacks } from './grid/match3/Match3InputHandler';

    // ------------------------------
    // Word Grid Implementation
    // ------------------------------
    export { LetterTile } from './grid/word/LetterTile';
    export * from './grid/word/LetterTileFactory';
    export { LetterGridView } from './grid/word/LetterGridView';
    export type { LetterGridConfig } from './grid/word/LetterGridView';
    export { WordZagInputHandler } from 'game/phaser/grid/WordZagInputHandler.ts';
    export { LetterGridAnimator } from './grid/word/LetterGridAnimator';

    // ------------------------------
    // UI Components
    // ------------------------------
    export { Button } from './ui/Button';
    export { ProgressBar } from './ui/ProgressBar';
    export { StepProgressBar } from './ui/StepProgressBar';
    export { TimeBar } from './ui/TimeBar';
    export type { ButtonConfig } from './ui/Button';

    // ------------------------------
    // Visual Effects
    // ------------------------------
    export { PopAndFade } from './animation/PopAndFade';

    // ------------------------------
    // Graphics Utilities
    // ------------------------------
    export { DebugUtils } from './graphics/DebugUtils';
    export { DrawingUtils } from './graphics/DrawingUtils';
    export { GeometryUtils } from './graphics/GeometryUtils';


    // ------------------------------
    // Scenes
    export { AutoScene } from './scenes/AutoScene';
    export { AsepritePreloadScene } from './scenes/AsepritePreloadScene';
