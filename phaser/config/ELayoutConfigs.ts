import { LayoutConfig } from "eidosk/core";
import { ButtonConfig, ImageConfig, TextConfig, BitmapTextConfig } from "eidosk/phaser";

export class ELayoutConfigs {
    static readonly DEFAULT: LayoutConfig = {
        percX: 50,
        percY: 50,
        originX: 0.5,
        originY: 0.5,
        scale: 1,
        alpha: 1,
        visible: true
    };

    static readonly DEFAULT_IMAGE_CONFIG: ImageConfig = {
        ...ELayoutConfigs.DEFAULT  // ✅ Use class name instead of 'this'
    };

    static readonly DEFAULT_TEXT_CONFIG: TextConfig = {
        ...ELayoutConfigs.DEFAULT,
        font: "Arial",
        fontSize: 32,
        color: 0xffffff
    };

    static readonly DEFAULT_BITMAP_TEXT_CONFIG: BitmapTextConfig = {
        ...ELayoutConfigs.DEFAULT,
        // NO font - games must specify their bitmap font
        fontSize: 40,
        color: 0xffffff
    };

    static readonly DEFAULT_BUTTON_CONFIG: ButtonConfig = {
        ...ELayoutConfigs.DEFAULT
    };

}