export * from './types';

// ====================================
// eidosk/core/index.ts - Framework Independent
// ====================================

// config
//export { Constants } from './config/constants.ts';
export { EGlobal } from './config/EGlobal.ts';
export { ELayoutConfigs } from '../phaser/config/ELayoutConfigs.ts';

export { EventBus } from './events/EventBus.ts';

// Grid System
export { Grid } from './grid/Grid';
export { GravityGrid } from './grid/GravityGrid';
export { GridShapes } from './grid/GridShapes';
export type { GridShapeFunction } from './grid/GridShapes';
export { GridPositionUtils } from './utils/GridPositionUtils.ts';

// Grid Cache
export { GridCache } from './grid/cache/GridCache';

// Match-3 GameCore Logic
export { Match3Logic } from './grid/match3/Match3Logic';
export { Match3Grid } from './grid/match3/Match3Grid.ts';
export type { Match3Position, Match3Match } from './grid/match3/Match3Logic';

// Word Grid GameCore Logic
export { LetterGrid } from './grid/word/LetterGrid';
export type { GridPosition } from './utils/GridPositionUtils.ts';

// Word System
export { WordDictionary } from './word/WordDictionary';
export * from './word/LetterValues';
// eidosk/core/index.ts
export * from './word/ScrabbleScorer';
export { WordValidator } from './word/WordValidator';
export { WordPathFinder } from './word/WordPathFinder';
export type {WordPath} from './word/WordPathFinder';
export { LetterGridConfig } from './word/LetterGridConfig';
export { LetterGenerator } from './word/LetterGenerator';
export type { ValidationResult, ValidationOptions } from './word/WordValidator';

// GameCore Utilities
export { Trie } from './utils/data/Trie.ts';

// GameCore Utilities (E-prefixed) //todo organize, decide whther to stick with E or not
export { WeightedPicker } from './utils/data/WeightedPicker.ts';
export { ArrayUtils } from './utils/data/ArrayUtils';
