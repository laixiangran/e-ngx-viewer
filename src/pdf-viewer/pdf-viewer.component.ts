import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

let template = `
<div class="pdfViewerContainer">
	<iframe [width]="width" [height]="height" *ngIf="pdfUrl" [src]="pdfUrl" frameborder="0"></iframe>
</div>
`;

@Component({
    selector: 'pdf-viewer',
    template: template
})
export class PDFViewerComponent implements OnInit {

    @Input() width: number = 0;
    @Input() height: number = 0;
	@Input() viewerUrl: string;
    @Input() source: string;
    @Output() ready: EventEmitter<any> = new EventEmitter<any>(false);

	pdfUrl: SafeResourceUrl;

    constructor (public domSanitizer: DomSanitizer) {}

    ngOnInit () {
        this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.viewerUrl + '?file=' + this.source);
        this.ready.emit('pdf viewer initialize!');
    }
}
