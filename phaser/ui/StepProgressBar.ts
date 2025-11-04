import { Scene, Point, BitmapText } from "../types";

export interface StepProgressBarConfig {
  position: Point;
  wordsToFind: number;
  circleDistance?: number;
  defaultBitmapFont?: string;
}

export class StepProgressBar {
  private container: Phaser.GameObjects.Container;
  private scene: Scene;
  public circleSteps: Phaser.GameObjects.Image[];
  public labels: BitmapText[];
  public totWordsToFind: number;
  public CIRCLES_DISTANCE: number;

  constructor(scene: Scene, config: StepProgressBarConfig) {
    const { position, wordsToFind } = config;

    this.scene = scene;
    this.CIRCLES_DISTANCE = config.circleDistance ?? 120;
    this.totWordsToFind = wordsToFind;
    this.circleSteps = [];
    this.labels = [];

    // Create container
    this.container = scene.add.container(position.x, position.y);

    // Calculate centering offset
    const xDiff = this.CIRCLES_DISTANCE * (this.totWordsToFind - 1) * 0.5;

    // Create circles and labels for each step
    for (let i = 0; i < this.totWordsToFind; i++) {
      const circlePos = new Phaser.Geom.Point(i * this.CIRCLES_DISTANCE - xDiff, 0);
      const labelPos = new Phaser.Geom.Point(circlePos.x, 32);

      // Create circle
      const circle = scene.add.image(circlePos.x, circlePos.y, "stepper_circle")
          .setScale(1);

      // Create label
      const label = scene.add.bitmapText(
          labelPos.x,
          labelPos.y,
          config.defaultBitmapFont ?? "default",
          ""
      ).setOrigin(0.5, 0.5)
          .setFontSize(16)
          .setTint(0xffffff);

      // Set initial frame
      circle.setFrame(i === 0 ? 1 : 2);

      // Add to container
      this.container.add([circle, label]);

      // Store references
      this.circleSteps.push(circle);
      this.labels.push(label);

      // Add connecting line (except for last circle)
      if (i < this.totWordsToFind - 1) {
        const lineX = circle.x + this.CIRCLES_DISTANCE * 0.5;
        const line = scene.add.image(lineX, circle.y, "stepper_line")
            .setScale(1);
        this.container.add(line);
      }
    }
  }

  onRightAnswer(idx: number, word: string, frame: number = 0): void {
    if (idx >= 0 && idx < this.labels.length) {
      this.labels[idx].setText(word);
      this.circleSteps[idx].setFrame(frame);
    }
  }

  setPosition(x: number, y: number): this {
    this.container.setPosition(x, y);
    return this;
  }

  setAlpha(alpha: number): this {
    this.container.setAlpha(alpha);
    return this;
  }

  destroy(): void {
    this.container.destroy();
  }

  get gameObject(): Phaser.GameObjects.Container {
    return this.container;
  }
}