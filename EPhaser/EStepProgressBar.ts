// Import necessary classes from modules
import Phaser from 'phaser';
import Point = Phaser.Geom.Point;
import EScene from "./EScene";
import {EBitmapTextConfig} from "../interfaces";

// Export the EStepProgressBar class
export class EStepProgressBar extends Phaser.GameObjects.Container {

  public CIRCLES_DISTANCE: number;
  public circleSteps: Phaser.GameObjects.Image[];
  public labels: Phaser.GameObjects.BitmapText[];
  public totWordsToFind: number;

  // Constructor for EStepProgressBar class
  constructor(scene:EScene, pos:Point, wordsToFind:number) {
    // Call the constructor of the parent class (Phaser.GameObjects.Container)
    super(scene);

    // Add this container to the scene
    scene.add.existing(this);

    // Constants and initial values
    this.CIRCLES_DISTANCE = 120;
    this.x = pos.x;
    this.y = pos.y;
    this.circleSteps = [];
    this.labels = [];
    this.totWordsToFind = wordsToFind;

    // Calculate the difference needed to center the circles
    let xDiff = this.CIRCLES_DISTANCE * (this.totWordsToFind - 1) * 0.5;

    // Create circles and labels for each step
    for (let i = 0; i < this.totWordsToFind; i++) {
      // Calculate position for the circle
      let tPos = new Point(i * this.CIRCLES_DISTANCE - xDiff, 0);
      // Calculate position for the label below the circle
      let labelPos = new Point(tPos.x, 32);

      // Create a circle and label
      let circle = scene.addImage("stepper_circle", tPos,1);
      const config:EBitmapTextConfig = {pos:labelPos, size:16, color:0xffffff, origin:{x:.5, y:.5}};
      let label = scene.addBitmapText("", scene.getDefaultBitmapFont(), config);

      // Set the frame for the first circle
      if (i === 0) circle.setFrame(1);
      else circle.setFrame(2);

      // Add the circle and label to the container
      this.add(circle);
      this.add(label);

      // Add the circle and label to their respective arrays
      this.circleSteps.push(circle);
      this.labels.push(label);
      // Add a line between circles for all except the last on
      let tx = circle.x+this.CIRCLES_DISTANCE* 0.5;
      if (i < this.totWordsToFind - 1) {
        let line = scene.addImage("stepper_line", new Point(tx ,circle.y), 1);
        this.add(line);
      }
    }
  }

  // Method to update the progress on providing the right answer
  onRightAnswer(idx:number, word:string, frame = 0) {
    // Update the label with the provided word
    this.labels[idx].text = word;

    // Set the frame for the corresponding circle
    this.circleSteps[idx].setFrame(frame);
  }
}
