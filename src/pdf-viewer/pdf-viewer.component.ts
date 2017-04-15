import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
    selector: 'pdf-viewer',
    templateUrl: './pdf-viewer.component.html',
    styleUrls: ['./pdf-viewer.component.scss']
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
