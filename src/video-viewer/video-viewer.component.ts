import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Input, Output, EventEmitter} from "@angular/core";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

let template = `
<div class="videoViewerContainer"
	 (mouseover)="videoMouseover($event)"
	 (mouseout)="videoMouseout($event)"
	 [style.width]="width + 'px'" #videoViewerContainer>
	<div class="videoViewer">
		<video (click)="playOrPause()"
		       [width]="width"
		       [poster]="poster"
		       (loadedmetadata)="onLoadedmetadata($event)"
		       (ended)="OnPlayEnded($event)"
		       (timeupdate)="onTimeupdate($event)"
		       (progress)="onProgress($event)"
		       (canplaythrough)="onCanplaythrough($event)"
		       (play)="onPlay($event)">
			<source [src]="videoUrl" type="video/mp4"/>
		</video>
		<div *ngIf="videoElem && videoElem.paused">
			<span class="fa"
			      (click)="playOrPause()"
			      [ngClass]="{'fa-repeat': videoElem.ended, 'fa-play-circle-o': !videoElem.ended}"
			      [title]="videoElem.ended ? '重播' : '播放'">
			</span>
		</div>
	</div>
	<div class="videoToolbar" *ngIf="videoElem" #videoToolbar>
		<div class="videoToolbar_progress"
			 [style.height]="videoToolbarProgressHeight + 'px'">
			<span
				(mousedown)="progressBallDragStart($event)"
				(mousemove)="progressBallDrag($event)"
				(mouseup)="progressBallDragEnd($event)"
				(mouseleave)="progressBallDragEnd($event)"
				[style.left]="play_progress + 'px'"
				[style.margin-left]="play_progress > 16 ? '-16px' : '0'"
				[style.opacity]="showProgressBall ? 1 : 0"
				class="progress_val_ball">

				<span>
					{{getFormatTime(play_progress / videoToolbar.clientWidth * videoElem.duration)}}
				</span>

			</span>
			<div (mousemove)="videoToolbarProgressMove($event)" (click)="videoToolbarProgressClick($event)"
				class="videoToolbar_play_progress" [style.width]="play_progress + 'px'">
			</div>
			<div (mousemove)="videoToolbarProgressMove($event)" (click)="videoToolbarProgressClick($event)"
				class="videoToolbar_buffer_progress">
			</div>
			<span class="timeTip" [style.left]="(timeTipOffsetX -16) + 'px'">
				{{timeTip}}
			</span>
		</div>
		<div class="videoToolbar_play_btn">
			<span (click)="playOrPause()" *ngIf="videoElem.paused" class="playBtn fa fa-play-circle-o"
				  aria-hidden="true" [title]="videoElem.ended ? '重播' : '播放'"></span>
			<span (click)="playOrPause()" *ngIf="!videoElem.paused" class="playBtn fa fa-pause-circle-o"
				  aria-hidden="true" title="暂停"></span>
			<span class="playTime">
				<span>{{currentTime}}</span>&nbsp;/&nbsp;{{totalTime}}
			</span>
		</div>
		<div class="videoToolbar_volume_btn">
			<span (click)="isMuted()" class="mutedBtn fa" [ngClass]="{'fa-volume-down': videoElem.volume > 0 && videoElem.volume < 0.5, 'fa-volume-up': videoElem.volume >= 0.5, 'fa-volume-off': videoElem.volume == 0}"
				  aria-hidden="true" title="静音设置"></span>
			<span class="volume_val"
				  #volume_val>
				<span class="volume_val_ball"
					  (mousedown)="volumeBallDragStart($event)"
					  (mousemove)="volumeBallDrag($event, volume_val.clientWidth)"
					  (mouseup)="volumeBallDragEnd($event)"
					  (mouseleave)="volumeBallDragEnd($event)"
					  [style.left]="(videoElem.volume * 100 - 8) + 'px'">

					<span>
						{{(videoElem.volume * 100).toFixed(0) + '%'}}
					</span>
				</span>
				<span (click)="volumeValClick($event, volume_val.clientWidth)" class="volume_val_active" [style.width]="(videoElem.volume * 100) + 'px'"></span>
				<span (click)="volumeValClick($event, volume_val.clientWidth)" class="volume_val_notActive"></span>
			</span>
		</div>
	</div>
</div>
`;

let styles = `
.videoViewerContainer {
	position: relative;
	margin: 0;
	padding: 0;
	height: 100%;
	min-width: 400px;
	min-height: 400px;
	background-color: #3E3E3E;
}

.videoViewerContainer .videoViewer {
	position: relative;
	margin-bottom: 53px;
}

.videoViewerContainer .videoViewer div {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: rgba(62, 62, 62, 0.5);
}

.videoViewerContainer .videoViewer div span {
	font-size: 80px;
	position: absolute;
	left: 50%;
	top: 50%;
	margin-left: -40px;
	margin-top: -40px;
	color: #E2E2E2;
	transition: color 0.8s;
}

.videoViewerContainer .videoViewer div span:hover {
	color: #4BCEF2;
	cursor: pointer;
}

.videoViewerContainer .videoToolbar {
	position: absolute;
	width: 100%;
	left: 0;
	bottom: 0;
	font-size: 40px;
	color: #BFB9B9;
}

.videoViewerContainer .videoToolbar .videoToolbar_play_btn {
	float: left;
	padding: 0 10px;
}

.videoViewerContainer .videoToolbar .videoToolbar_play_btn > span {
	display: inline-block;
	margin-right: 20px;
}

.videoViewerContainer .videoToolbar .videoToolbar_play_btn > span.playBtn:hover {
	color: #45bdde;
	cursor: pointer;
}

.videoViewerContainer .videoToolbar .videoToolbar_play_btn > span.playTime {
	font-size: 0.5em;
	vertical-align: middle;
}

.videoViewerContainer .videoToolbar .videoToolbar_play_btn > span.playTime span {
	color: #E2E2E2;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn {
	float: right;
	padding: 0 15px;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span {
	display: inline-block;
	cursor: pointer;
	font-size: 0.8em;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span.mutedBtn {
	height: 32px;
	width: 32px;
	text-align: left;
	line-height: 32px;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span.volume_val {
	position: relative;
	width: 100px;
	margin-bottom: 3px;
	height: 6px;
	vertical-align: middle;
	cursor: pointer;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span.volume_val > span {
	width: 100%;
	height: 100%;
	position: absolute;
	border-radius: 2px;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span.volume_val > span.volume_val_ball {
	bottom: 0;
	height: 16px;
	width: 16px;
	border-radius: 16px;
	background: #E2E2E2;
	z-index: 3;
	margin-bottom: -5px;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span.volume_val > span.volume_val_ball span {
	position: absolute;
	display: none;
	font-size: 12px;
	top: -25px;
	left: -8px;
	padding: 2px;
	background: #000000;
	color: #FFFFFF;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span.volume_val > span.volume_val_ball:hover span {
	display: inline-block;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span.volume_val > span.volume_val_active {
	z-index: 2;
	background: #45bdde;
}

.videoViewerContainer .videoToolbar .videoToolbar_volume_btn span.volume_val > span.volume_val_notActive {
	z-index: 1;
	background: #989393;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress {
	position: relative;
	width: 100%;
	background: rgba(112, 109, 109, 0.6);
	transition: height 0.5s;
	cursor: pointer;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress .timeTip {
	position: absolute;
	display: none;
	top: -25px;
	left: -16px;
	padding: 2px;
	background: #000000;
	font-size: 12px;
	color: #FFFFFF;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress .videoToolbar_play_progress:hover ~ .timeTip, .videoViewerContainer .videoToolbar .videoToolbar_progress .videoToolbar_buffer_progress:hover ~ .timeTip {
	display: inline-block;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress .progress_val_ball {
	position: absolute;
	left: 0;
	bottom: 0;
	height: 16px;
	width: 16px;
	border-radius: 16px;
	background: #f7f7f7;
	z-index: 3;
	opacity: 0;
	transition: opacity 0.5s;
	font-size: 12px;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress .progress_val_ball span {
	position: absolute;
	display: none;
	top: -25px;
	left: -16px;
	padding: 2px;
	background: #000000;
	color: #FFFFFF;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress .progress_val_ball:hover span {
	display: inline-block;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress div {
	position: absolute;
	width: 0;
	height: 100%;
	border-radius: 16px;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress div.videoToolbar_play_progress {
	z-index: 2;
	background: #45bdde;
}

.videoViewerContainer .videoToolbar .videoToolbar_progress div.videoToolbar_buffer_progress {
	width: 100%;
	z-index: 1;
	background: rgba(191, 185, 185, 0.6);
}

`;

@Component({
	selector: 'video-viewer',
	template: template,
	styles: [styles]
})
export class VideoViewerComponent implements OnInit {

	@ViewChild('videoToolbar') videoToolbar: ElementRef;
	@Input() width: number = 0;
	@Input() height: number = 0;
	@Input() source: string;
	@Input() poster: string;
	@Output() ready: EventEmitter<any> = new EventEmitter<any>(false);

	videoElem: HTMLVideoElement; // video dom对象
	videoUrl: SafeResourceUrl; // 视频路径
	currentTime: string; // 视频播放的当前时间
	totalTime: string; // 视频总时间
	play_progress: number = 0; // 播放的进度条长度值
	videoToolbarProgressHeight: number = 3; // 进度条高度
	preVolume: number = 1; // 静音设置前的音量值
	showProgressBall: boolean = false; // 是否显示进度条上滑动的球
	progressBallDragStartClientX: number = 0; // 进度条上滑动的球初始x位置
	isProgressBallStartMove = false; // 进度条上的球是否开始滑动
	volumeBallDragStartClientX: number = 0; // 音量条上滑动的球初始x位置
	isVolumeBallStartMove = false; // 音量条上的球是否开始滑动
	timeTip: string; // 时间提示
	timeTipOffsetX: number = 0;

	constructor (public domSanitizer: DomSanitizer) {
	}

	ngOnInit () {
		this.videoUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.source);
		this.ready.emit('video viewer initialize!');
	}

	/**
	 * 视频的元数据已加载事件
	 * @param e
	 */
	onLoadedmetadata (e: any) {
		this.videoElem = e.target as HTMLVideoElement;
		this.totalTime = this.getFormatTime(this.videoElem.duration);
		this.currentTime = this.getFormatTime(this.videoElem.currentTime);
	}

	/**
	 * 播放结束事件
	 * @param e
	 */
	OnPlayEnded (e: any) {
		console.log(`播放结束：${this.videoElem.ended}`);
	}

	/**
	 * 开始播放事件
	 * @param e
	 */
	onPlay (e: any) {
		console.log('play');
	}

	/**
	 * 播放时间改变事件
	 * @param e
	 */
	onTimeupdate (e: any) {
		this.currentTime = this.getFormatTime(this.videoElem.currentTime);
		this.play_progress = this.videoElem.currentTime / this.videoElem.duration * this.videoToolbar.nativeElement.clientWidth;
	}

	onProgress (e: any) {
		console.log('progress');
	}

	onCanplaythrough (e: any) {
		console.log('canplaythrough');
	}

	videoToolbarProgressClick (e: MouseEvent) {
		this.play_progress = e.offsetX;
		let tempCurrentTime: number = this.play_progress / this.videoToolbar.nativeElement.clientWidth * this.videoElem.duration;
		this.videoElem.currentTime = tempCurrentTime;
		this.currentTime = this.getFormatTime(tempCurrentTime);
	}

	videoToolbarProgressMove (e: MouseEvent) {
		let tempCurrentTime: number = e.offsetX / this.videoToolbar.nativeElement.clientWidth * this.videoElem.duration;
		this.timeTipOffsetX = e.offsetX;
		this.timeTip = this.getFormatTime(tempCurrentTime);
	}

	progressBallDragStart (e: MouseEvent) {
		e.stopPropagation();
		this.progressBallDragStartClientX = e.clientX;
		this.isProgressBallStartMove = true;
	}

	progressBallDrag (e: MouseEvent) {
		e.stopPropagation();
		if (this.isProgressBallStartMove) {
			let offsetX: number = e.clientX - this.progressBallDragStartClientX;
			this.progressBallDragStartClientX = e.clientX;
			this.play_progress = (this.play_progress + offsetX);
			if (this.play_progress >= this.videoToolbar.nativeElement.clientWidth) {
				this.play_progress = this.videoToolbar.nativeElement.clientWidth;
			} else if (this.play_progress <= 0) {
				this.play_progress = 0;
			}
			let tempCurrentTime: number = this.play_progress / this.videoToolbar.nativeElement.clientWidth * this.videoElem.duration;
			this.videoElem.currentTime = tempCurrentTime;
			this.currentTime = this.getFormatTime(tempCurrentTime);
		}
	}

	progressBallDragEnd (e: MouseEvent) {
		e.stopPropagation();
		this.isProgressBallStartMove = false;
	}

	volumeValClick (e: MouseEvent, width: number) {
		console.log(e.offsetX);
		this.videoElem.volume = e.offsetX / width;
	}

	volumeBallDragStart (e: MouseEvent) {
		e.stopPropagation();
		this.volumeBallDragStartClientX = e.clientX;
		this.isVolumeBallStartMove = true;
	}

	volumeBallDrag (e: MouseEvent, width: number) {
		e.stopPropagation();
		if (this.isVolumeBallStartMove) {
			let offsetX: number = e.clientX - this.volumeBallDragStartClientX;
			this.volumeBallDragStartClientX = e.clientX;
			let volume: number = this.videoElem.volume + offsetX / width;
			if (volume <= 0) {
				this.videoElem.volume = 0;
			} else if (volume >= 1) {
				this.videoElem.volume = 1;
			} else {
				this.videoElem.volume = volume;
			}
		}
	}

	volumeBallDragEnd (e: MouseEvent) {
		e.stopPropagation();
		this.isVolumeBallStartMove = false;
	}

	videoMouseover (e: any) {
		this.videoToolbarProgressHeight = 16;
		this.showProgressBall = true;
	}

	videoMouseout (e: any) {
		this.videoToolbarProgressHeight = 3;
		this.showProgressBall = false;
	}

	/**
	 * 播放视频
	 */
	play () {
		this.videoElem.ended && this.videoElem.load();
		this.videoElem.play();
	}

	/**
	 * 暂停视频
	 */
	pause () {
		this.videoElem.pause();
	}

	/**
	 * 播放/暂停
	 */
	playOrPause () {
		this.videoElem.paused ? this.play() : this.pause();
	}

	isMuted () {
		if (this.videoElem.muted) {
			this.videoElem.muted = false;
			this.videoElem.volume = this.preVolume;
		} else {
			this.videoElem.muted = true;
			this.preVolume = this.videoElem.volume;
			this.videoElem.volume = 0;
		}
	}

	getFormatTime (value: number): string {
		let h: string = parseInt(value / 3600 + '') < 10 ? '0' + parseInt(value / 3600 + '') : '' + parseInt(value / 3600 + ''),
			m: string = parseInt(value % 3600 / 60 + '') < 10 ? '0' + parseInt(value % 3600 / 60 + '') : '' + parseInt(value % 3600 / 60 + ''),
			s: string;
		if (value >= 60) {
			s = value % 3600 % 60 < 10 ? '0' + parseInt(value % 3600 % 60 + '') : '' + parseInt(value % 3600 % 60 + '');
		} else if (value < 60 && value >= 10) {
			s = '' + parseInt(value + '');
		} else if (value < 10) {
			s = '0' + parseInt(value + '');
		}
		return `${h}:${m}:${s}`;
	}
}
