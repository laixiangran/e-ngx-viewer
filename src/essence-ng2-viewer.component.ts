import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

let template = `
<div class="essence-ng2-viewer">
	<pdf-viewer *ngIf="model == 'pdf'" [width]="width" [height]="height" [source]="source" [viewerUrl]="viewerUrl" (ready)="viewerReady($event)"></pdf-viewer>
	<image-viewer *ngIf="model == 'image'" [source]="source" [width]="width" [height]="height" (ready)="viewerReady($event)"></image-viewer>
	<video-viewer *ngIf="model == 'video'" [poster]="poster" [source]="source" [width]="width" [height]="height" (ready)="viewerReady($event)"></video-viewer>
</div>
`;

@Component({
    selector: 'essence-ng2-viewer',
    template: template
})
export class EssenceNg2ViewerComponent implements OnInit {

	@Input() model: string = 'pdf'; // 视图模式，默认pdf。将实现image与video模式
    @Input() width: number = 600; // 查看器宽度
    @Input() height: number = 800; // 查看器高度
    @Input() source: string | string[]; // pdf路径、图片文件路径数组及视频路径
	@Input() poster: string; // 视频预览图（海报图片）路径
	@Input() viewerUrl: string; // pdf查看器路径(pdfjs/web/viewer.html)
    @Output() ready: EventEmitter<any> = new EventEmitter<any>(false); // 查看器初始完成事件

    constructor () {}

    ngOnInit () {}

    viewerReady ($event: any) {
        this.ready.emit($event);
    }
}
