import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'e-ngx-viewer',
    templateUrl: './e-ngx-viewer.component.html',
    styleUrls: ['./e-ngx-viewer.component.scss']
})
export class ENgxViewerComponent implements OnInit {

    @Input() model: string = 'pdf'; // 视图模式，默认pdf。将实现image与video模式
    @Input() width: number = 600; // 查看器宽度
    @Input() videoWidth: number = 400; //视频播放器宽度
    @Input() height: number = 800; // 查看器高度
    @Input() source: string | string[]; // pdf路径、图片文件路径数组及视频路径
    @Input() poster: string; // 视频预览图（海报图片）路径
    @Input() viewerUrl: string; // pdf查看器路径(pdfjs/web/viewer.html)
    @Output() ready: EventEmitter<any> = new EventEmitter<any>(false); // 查看器初始完成事件

    constructor() {}

    ngOnInit() {}

    viewerReady($event: any) {
        this.ready.emit($event);
    }
}
