# Eidosk

A TypeScript library for building games with Phaser 3.

## Architecture

Eidosk follows a strict separation between framework-agnostic game logic and Phaser-specific rendering:

```
eidosk/
├── core/          # Framework-independent (NO Phaser imports)
│   ├── config/    # Configuration classes  
│   ├── grid/      # Pure game logic & algorithms
│   ├── utils/     # Utility functions
│   └── word/      # Word game systems
│
└── phaser/        # Phaser-specific (uses Phaser APIs)
    ├── grid/      # Visual containers & factories
    ├── managers/  # Scene management
    ├── scenes/    # Base scene classes
    └── ui/        # UI components
```

**Decision Rule:** "Could this work without Phaser?"
- **YES** → `eidosk/core/`
- **NO** → `eidosk/phaser/`

This architecture allows you to:
- Test game logic without rendering
- Port core logic to other frameworks
- Keep visual code separate from game rules

## Features

### Grid System
- **Grid** - Generic grid data structure
- **GravityGrid** - Grid with gravity and falling mechanics
- **GridCache** - Caching system for grid operations
- **GridShapes** - Predefined grid shapes and custom shape functions

### Match-3 Games
- **Match3Grid** - Core match-3 logic
- **Match3Logic** - Pattern matching algorithms
- **Match3GridView** - Phaser visual renderer
- **Match3Animator** - Animation system for matches

### Word Games
- **LetterGrid** - Letter-based grid system
- **WordDictionary** - Dictionary management with Trie
- **WordValidator** - Word validation with scoring
- **WordPathFinder** - Path finding for word formation
- **LetterGridView** - Phaser visual renderer

### Managers & Systems
- **SceneBuilder** - Scene construction utilities
- **DragManager** - Touch and mouse drag handling
- **SoundManager** - Audio management
- **CountdownManager** - Timer and countdown system
- **Orientation** - Device orientation handling
- **CursorManager** - Cursor state management

### UI Components
- **Button** - Interactive buttons
- **ProgressBar** - Progress visualization
- **StepProgressBar** - Multi-step progress indicator
- **TimeBar** - Time-based progress bar

## Basic Usage

### Match-3 Game Example

```typescript
import { Match3Grid, Match3Logic } from 'eidosk/core';
import { Match3GridView } from 'eidosk/phaser';

// Core logic (framework-independent)
const grid = new Match3Grid(8, 8);
grid.fill(() => Math.floor(Math.random() * 6));

const matches = Match3Logic.findMatches(grid);

// Phaser rendering
class GameScene extends Phaser.Scene {
  create() {
    const gridView = new Match3GridView(this, grid, {
      x: 100,
      y: 100,
      tileSize: 64
    });
  }
}
```

### Word Game Example

```typescript
import { LetterGrid, WordDictionary, WordValidator } from 'eidosk/core';
import { LetterGridView } from 'eidosk/phaser';

// Setup dictionary
const dictionary = new WordDictionary();
await dictionary.loadFromUrl('path/to/words.txt');

// Core logic
const letterGrid = new LetterGrid(5, 5);
const validator = new WordValidator(dictionary);

const result = validator.validate('HELLO', letterGrid);
if (result.valid) {
  console.log('Score: ' + result.score);
}

// Phaser rendering
class WordScene extends Phaser.Scene {
  create() {
    const gridView = new LetterGridView(this, letterGrid, {
      x: 100,
      y: 100,
      tileSize: 80
    });
  }
}
```

## Core Principles

### Separation of Concerns
- **Data classes** manage state (core)
- **Visual classes** display state (phaser)
- Never mix data management with rendering

### Composition Over Inheritance
- Favor "HAS-A" relationships over "IS-A"
- Use inheritance only for true specialization

### Single Responsibility
- Each class does ONE thing
- If you can't describe it in 5 words, split it

## TypeScript

Eidosk is written in TypeScript and provides full type definitions for all exports.

```typescript
import type { 
  GridPosition, 
  Match3Match, 
  ValidationResult 
} from 'eidosk/core';

import type { 
  Match3GridConfig, 
  ButtonConfig 
} from 'eidosk/phaser';
```

## License

MIT
