import Phaser from "phaser";
import Point = Phaser.Geom.Point;
import Container = Phaser.GameObjects.Container;
import Text = Phaser.GameObjects.BitmapText;
import Scene = Phaser.Scene;

export interface ETimerConfig {
	pos: Point;
	totSec: number;
	onEndTimer: (scene: Scene) => void;
	timerText: Text;
	showMinutes?: boolean;
}

//optimize...

export class ETimer extends Container {
	public scene: Scene;
	protected totSeconds: number;
	private onEndTimer: (scene: Scene) => void;
	public running: boolean;
	private startTime: number;
	private addedTime: number;
	private beepValue: number;
	public timeLeft: number;
	private showMinutes: boolean;
	private timerText: Text;
	private pauseTime: number;

	constructor(scene: Scene, config: ETimerConfig) {
		super(scene);
		this.scene = scene;
		this.scene.add.existing(this);
		this.totSeconds = config.totSec;
		this.onEndTimer = config.onEndTimer;
		this.running = false;
		this.startTime = 0;
		this.beepValue = 0;
		this.addedTime = 0;
		this.timeLeft = 0;
		this.showMinutes = config.showMinutes ?? false;
		this.timerText = config.timerText;
		this.timerText.x = config.pos.x;
		this.timerText.y = config.pos.y;
	}

	// Method to start the timer
	start() {
		//console.log("STARTT");
		this.startTime = Date.now();
		this.addedTime = 0;
		this.running = true;
	}

	pause(){
		this.pauseTime = Date.now();
		this.running = false;
	}

	resume() {
		let diff = Date.now() - this.pauseTime;
		this.addedTime += diff / 1000;
		this.running = true;
	}


	// Method called from scene update method to update the timer
	update() {
		if(!this.running)return;
		this.timeLeft = this.totSeconds * 1000 - (Date.now() - this.startTime) + this.addedTime * 1000;

		// /console.log("this.timeLeft: " +this.timeLeft);

		if (this.timeLeft <= 0) {
			console.log("TIME OVER this.timeLeft <= 0");
			this.timeLeft = 0;
			this.running = false;
			if (this.onEndTimer != null) this.onEndTimer(this.scene);
		}

		// Update the timer text
		this.timerText.text = ETimer.getTimerString(this.timeLeft, this.showMinutes);
	}

	getProgress(): number {
		// Calculate time left as a percentage of the total time
		let remainingTime = this.timeLeft / (this.totSeconds * 1000);

		// Ensure the progress value is within the range [0, 1]
		return Math.max(0, Math.min(1, remainingTime));
	}

	// Method to get the timer string, with optional minutes. Time is in Milliseconds
	static getTimerString(timeMs: number, includeMinutes: boolean = false): string {
		let sec = Math.floor(timeMs / 1000) % 60;
		let min = Math.floor(timeMs / 60000);
		let timerString = "";
		if (includeMinutes) {
			if (min < 10) timerString += "0";
			timerString += min.toString() + ":";
		}
		if (sec < 10) timerString += "0";
		timerString += sec.toString();
		return timerString;
	}

	addTime(seconds: number) {
		let newTime:number = Math.round(this.timeLeft/1000) + this.addedTime + seconds;
		if(newTime > this.totSeconds){
			let diff:number = newTime - this.totSeconds;
			seconds-=diff;
		}
		this.addedTime += seconds;
		this.beepValue += seconds * 1000;
		//if(this.beepValue>this.startBeepMs)this.beepValue = this.startBeepMs;
	}

	getTotalTime(){
		return this.totSeconds + this.addedTime;
	}


	/*
	* TO DO
	* */
	checkBeep() {
		/*if (this.timeLeft <= _startBeepMs) {
			if (!_colorChanged) {
				Gfx.setColor(this, _beepColor);
				_colorChanged = true;
			}else {
				//_beepValue = Math.floor( this.timeLeft * .001) * 1000;
			}
			//timerScaleAnim();
		}else if (this.timeLeft > _startBeepMs) {
			if (_colorChanged) {
				Gfx.setColor(this, 0x000000);
				_colorChanged = false;
				this.scaleX = this.scaleY = _timerStartScale;
				_beepValue = _startBeepMs;
			}
		}

		if (this.timeLeft <= _beepValue && this.timeLeft > 1000) {
			SoundManager.playSound(_beepSound);
			if (_beepValue >= 1)_beepValue-=1000;
			else _beepValue = -99999;
		}*/
	}

	timerScaleAnim() {
		/*_timerScale += .1;
		var sc:Number = _timerStartScale + (Math.sin(_timerScale) + 1) / 20;
		scaleX = scaleY = sc;*/
	}

	enableBeeping(beepSound, startBeepMs = 6000, beepColor = 0x990000) {
		/*
		this.beepingEnabled = true;
		this.startBeepMs = this.beepValue = startBeepMs;
		this.beepColor = beepColor;
		this.beepSound = beepSound;
		this.colorChanged = false;
		this.timerScale = this.timerStartScale = this.scaleX;
		*/
	}
}
