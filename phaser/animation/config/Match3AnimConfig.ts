/**
 * Default animation settings for Match3 games
 *
 * TWEAK THESE VALUES TO CHANGE ANIMATION FEEL:
 * - Increase durations for slower, more deliberate gameplay
 * - Decrease durations for snappy, fast-paced matching
 * - Change easing functions for different motion feels
 * - Adjust scales and effects for visual impact
 */
export const DEFAULT_MATCH3_ANIMATIONS: Match3AnimationSettings = {
    tileSwap: {
        duration: 300,        // How long tile swap takes
        ease: 'Power2',       // Smooth swap motion
        overshoot: 0.1        // Slight overshoot for polish
    },

    invalidSwap: {
        duration: 50,         // Quick rejection animation
        distance: 5,          // How far tiles move during rejection
        repeats: 2,           // Number of shake repeats
        ease: 'Power2'        // Sharp rejection motion
    },

    matchRemoval: {
        duration: 300,        // How long matched tiles take to disappear
        staggerDelay: 30,     // Delay between each tile removal
        scale: 1.3,           // How much tiles grow before disappearing
        ease: 'Power2',       // Removal easing
        rotation: 0           // Optional rotation during removal
    },

    tileFalling: {
        duration: 3000,        // How long tiles take to fall
        ease: 'Bounce.Out',   // Bouncy landing effect
        gravity: 9.8,         // Gravity acceleration (pixels/s²)
        yVelocity: 150,       // Initial Y velocity (pixels/s)
        bounce: true          // Enable bounce effect
    },

    newTileEntry: {
        duration: 350,        // How long new tiles take to appear
        ease: 'Back.Out',     // Pop-in effect
        startScale: 0.3,      // Starting size
        endScale: 1.0,        // Final size
        staggerDelay: 40      // Delay between new tile appearances
    },

    selection: {
        scaleDuration: 150,   // Speed of selection scale animation
        scaleAmount: 1.1,     // How much selected tiles grow
        alpha: 0.7,           // Transparency of selected tiles
        ease: 'Back.Out',     // Selection easing
        glowColor: 0xffffff,  // Selection glow color
        glowAlpha: 0.3        // Selection glow transparency
    },

    hint: {
        duration: 600,        // Duration of hint pulse
        alpha: 0.6,           // Hint transparency
        scale: 1.08,          // Slight size increase for hint
        repeats: 3,           // Number of hint pulses
        staggerDelay: 150,    // Delay between hinted tiles
        ease: 'Sine.easeInOut', // Smooth hint motion
        glowColor: 0xffff00   // Yellow hint glow
    },

    cascade: {
        pauseBetween: 200,    // Pause between cascade stages
        speedMultiplier: 0.9  // Each cascade gets faster (0.9x previous)
    },

    powerup: {
        chargeDuration: 500,  // Time to charge special effects
        activeDuration: 800,  // Duration of powerup effects
        scale: 1.5,           // Size during powerup
        glowRadius: 40,       // Powerup glow size
        ease: 'Elastic.Out'   // Dramatic powerup motion
    }
};

export interface Match3AnimationSettings {
    tileSwap: {
        duration: number;
        ease: string;
        overshoot: number;
    };
    invalidSwap: {
        duration: number;
        distance: number;
        repeats: number;
        ease: string;
    };
    matchRemoval: {
        duration: number;
        staggerDelay: number;
        scale: number;
        ease: string;
        rotation: number;
    };
    tileFalling: {
        duration: number;
        ease: string;
        gravity: number;
        yVelocity: number;
        bounce: boolean;
    };
    newTileEntry: {
        duration: number;
        ease: string;
        startScale: number;
        endScale: number;
        staggerDelay: number;
    };
    selection: {
        scaleDuration: number;
        scaleAmount: number;
        alpha: number;
        ease: string;
        glowColor: number;
        glowAlpha: number;
    };
    hint: {
        duration: number;
        alpha: number;
        scale: number;
        repeats: number;
        staggerDelay: number;
        ease: string;
        glowColor: number;
    };
    cascade: {
        pauseBetween: number;
        speedMultiplier: number;
    };
    powerup: {
        chargeDuration: number;
        activeDuration: number;
        scale: number;
        glowRadius: number;
        ease: string;
    };
}

/**
 * Animation presets for different Match3 game feels
 */
export const MATCH3_PRESETS = {
    CLASSIC: {
        tileSwap: { duration: 300, ease: 'Linear' },
        matchRemoval: { duration: 400, ease: 'Linear' },
        tileFalling: { ease: 'Linear', bounce: false },
        selection: { scaleAmount: 1.0 }  // No selection scaling
    } as Partial<Match3AnimationSettings>,

    SNAPPY: {
        tileSwap: { duration: 150 },
        matchRemoval: { duration: 200, staggerDelay: 15 },
        tileFalling: { duration: 250 },
        newTileEntry: { duration: 200, staggerDelay: 20 }
    } as Partial<Match3AnimationSettings>,

    JUICY: {
        tileSwap: { overshoot: 0.2, ease: 'Back.Out' },
        matchRemoval: { scale: 1.5, rotation: Math.PI },
        newTileEntry: { ease: 'Elastic.Out', startScale: 0.1 },
        selection: { scaleAmount: 1.2, ease: 'Elastic.Out' }
    } as Partial<Match3AnimationSettings>,

    SMOOTH: {
        tileSwap: { duration: 250, ease: 'Sine.easeInOut' },
        matchRemoval: { ease: 'Sine.easeIn' },
        tileFalling: { ease: 'Sine.easeOut', bounce: false },
        hint: { ease: 'Sine.easeInOut' }
    } as Partial<Match3AnimationSettings>
};

/**
 * Utility function to merge Match3 animation settings
 */
export function mergeMatch3AnimationSettings(
    base: Match3AnimationSettings,
    overrides: Partial<Match3AnimationSettings>
): Match3AnimationSettings {
    const result = { ...base };

    for (const key in overrides) {
        if (overrides[key as keyof Match3AnimationSettings]) {
            result[key as keyof Match3AnimationSettings] = {
                ...base[key as keyof Match3AnimationSettings],
                ...overrides[key as keyof Match3AnimationSettings]
            } as any;
        }
    }

    return result;
}