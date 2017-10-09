import {Component} from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {

	pdfViewerUrl: string = 'http://localhost:4201/assets/scripts/pdfjs/web/viewer.html';
	pdfUrl: string = 'http://localhost:4201/assets/mock/test.pdf';
	images: string[] = [];
	videos: string[] = ['http://localhost:4201/assets/mock/test.mp4', 'http://localhost:4201/assets/mock/mv.mp4'];
	poster: string = 'http://localhost:4201/assets/mock/poster.jpg';

	constructor() {
		for (let i = 1; i < 13; i++) {
			this.images.push(`http://localhost:4201/assets/mock/image-viewer/img_${i}.jpg`);
		}
	}

	ngOnInit() {
	}

	videoViewerReady($event: any) {
		console.log($event);
	}

	imageViewerReady($event: any) {
		console.log($event);
	}

	pdfViewerReady($event: any) {
		console.log($event);
	}
}
