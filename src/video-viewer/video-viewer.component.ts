import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Input, Output, EventEmitter} from "@angular/core";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
	selector: 'video-viewer',
	templateUrl: './video-viewer.component.html',
	styleUrls: ['./video-viewer.component.scss']
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
		this.videoElem.ended && (this.videoElem.currentTime = 0);
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
