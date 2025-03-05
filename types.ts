import {ETextButton} from "./EPhaser/ETextButton";
import {EButton} from "./EPhaser/EButton";
type Image = Phaser.GameObjects.Image;
type Container = Phaser.GameObjects.Container;
type BitmapText = Phaser.GameObjects.BitmapText;
type Point = Phaser.Geom.Point;
type APGameObject = Image | Container | BitmapText | ETextButton | EButton | null;
type Sound = Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
export {Image, Container, BitmapText, Point, APGameObject, Sound};

