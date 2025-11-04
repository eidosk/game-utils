/**
 * Default animation settings for letter grid word games
 *
 * TWEAK THESE VALUES TO CHANGE ANIMATION FEEL:
 * - Increase durations for slower, more deliberate animations
 * - Decrease durations for snappy, fast-paced gameplay
 * - Change easing functions for different motion feels
 * - Adjust colors and scales for visual impact
 */
export const DEFAULT_LETTER_ANIMATIONS: LetterAnimationSettings = {
    letterRemoval: {
        duration: 400,        // How long letters take to disappear
        staggerDelay: 50,     // Delay between each letter removal
        ease: 'Back.In',      // Easing function for removal
        rotation: Math.PI * 2, // Full rotation during removal
        startScale: 1.0,      // Starting size
        endScale: 0           // Final size (0 = disappeared)
    },

    letterFalling: {
        duration: 500,        // How long new letters take to fall
        ease: 'Bounce.Out',   // Bouncy landing effect
        dropDistance: 200,    // Distance letters fall from (pixels)
        gravity: 9.8,         // Gravity acceleration (pixels/s²)
        yVelocity: 200,       // Initial Y velocity (pixels/s)
        bounce: true          // Enable bounce effect
    },

    wordPath: {
        scaleDuration: 150,   // Speed of scale animation on selection
        scaleAmount: 1.1,     // How much selected letters grow
        alpha: 0.8,           // Transparency of selected letters
        staggerDelay: 50,     // Delay between each letter selection
        ease: 'Back.Out'      // Easing for selection scaling
    },

    wordFound: {
        celebrationDuration: 300,  // Duration of success celebration
        celebrationScale: 1.3,     // How much letters grow in celebration
        staggerDelay: 30,          // Stagger celebration across letters
        ease: 'Back.Out'           // Celebration easing
    },

    invalidWord: {
        shakeDuration: 60,    // Duration of each shake
        shakeDistance: 3,     // How far letters shake (pixels)
        shakeRepeats: 3,      // Number of shakes
        fadeAlpha: 0.5,       // How transparent letters become
        ease: 'Power2'        // Sharp shake motion
    },

    pathGlow: {
        radius: 35,           // Size of glow effect
        alpha: 0.3,           // Glow transparency
        pulseDuration: 800,   // Speed of glow pulse
        pulseScale: 1.2,      // How much glow grows/shrinks
        validColor: 0x00ff00, // Green for valid words
        invalidColor: 0xff6600, // Orange for invalid words
        ease: 'Sine.easeInOut' // Glow pulse easing
    },

    floatingScore: {
        floatDistance: 60,    // How far score text floats up
        duration: 1500,       // How long score is visible
        fontSize: '20px',     // Text size
        color: '#ffff00',     // Yellow text
        strokeColor: '#000000', // Black outline
        strokeThickness: 2,   // Outline thickness
        finalScale: 1.5,      // Final size of score text
        ease: 'Power2'        // Floating score easing
    },

    hint: {
        duration: 600,        // Duration of hint pulse
        alpha: 0.6,           // Hint transparency
        scale: 1.05,          // Slight size increase
        repeats: 2,           // Number of pulses
        staggerDelay: 100,    // Delay between letter hints
        ease: 'Sine.easeInOut' // Smooth hint motion
    },

    clearPath: {
        duration: 200,        // Speed of path clearing
        ease: 'Power2'        // Quick clear motion
    }
};


export interface LetterAnimationSettings {
    letterRemoval: {
        duration: number;
        staggerDelay: number;
        ease: string;
        rotation: number;
        startScale: number;
        endScale: number;
    };
    letterFalling: {
        duration: number;
        ease: string;
        dropDistance: number;
        gravity: number;
        yVelocity: number;
        bounce: boolean;
    };
    wordPath: {
        scaleDuration: number;
        scaleAmount: number;
        alpha: number;
        staggerDelay: number;
        ease: string;
    };
    wordFound: {
        celebrationDuration: number;
        celebrationScale: number;
        staggerDelay: number;
        ease: string;
    };
    invalidWord: {
        shakeDuration: number;
        shakeDistance: number;
        shakeRepeats: number;
        fadeAlpha: number;
        ease: string;
    };
    pathGlow: {
        radius: number;
        alpha: number;
        pulseDuration: number;
        pulseScale: number;
        validColor: number;
        invalidColor: number;
        ease: string;
    };
    floatingScore: {
        floatDistance: number;
        duration: number;
        fontSize: string;
        color: string;
        strokeColor: string;
        strokeThickness: number;
        finalScale: number;
        ease: string;
    };
    hint: {
        duration: number;
        alpha: number;
        scale: number;
        repeats: number;
        staggerDelay: number;
        ease: string;
    };
    clearPath: {
        duration: number;
        ease: string;
    };
}

/**
 * Animation presets for different game feels
 */
export const ANIMATION_PRESETS = {
    FAST: {
        letterRemoval: { duration: 200, staggerDelay: 25 },
        letterFalling: { duration: 300 },
        wordPath: { scaleDuration: 100 },
        wordFound: { celebrationDuration: 200, staggerDelay: 15 }
    } as Partial<LetterAnimationSettings>,

    SLOW: {
        letterRemoval: { duration: 600, staggerDelay: 80 },
        letterFalling: { duration: 800 },
        wordPath: { scaleDuration: 250 },
        wordFound: { celebrationDuration: 500, staggerDelay: 50 }
    } as Partial<LetterAnimationSettings>,

    DRAMATIC: {
        letterRemoval: { rotation: Math.PI * 4, endScale: 1.5 },
        wordFound: { celebrationScale: 1.5 },
        pathGlow: { pulseScale: 1.4, radius: 50 },
        floatingScore: { finalScale: 2.0, floatDistance: 100 }
    } as Partial<LetterAnimationSettings>,

    SUBTLE: {
        wordPath: { scaleAmount: 1.05, alpha: 0.9 },
        wordFound: { celebrationScale: 1.15 },
        pathGlow: { alpha: 0.15, pulseScale: 1.1 },
        invalidWord: { shakeDistance: 1, fadeAlpha: 0.8 }
    } as Partial<LetterAnimationSettings>
};

/**
 * Utility function to merge animation settings
 */
export function mergeAnimationSettings(
    base: LetterAnimationSettings,
    overrides: Partial<LetterAnimationSettings>
): LetterAnimationSettings {
    const result = { ...base };

    for (const key in overrides) {
        if (overrides[key as keyof LetterAnimationSettings]) {
            result[key as keyof LetterAnimationSettings] = {
                ...base[key as keyof LetterAnimationSettings],
                ...overrides[key as keyof LetterAnimationSettings]
            } as any;
        }
    }

    return result;
}