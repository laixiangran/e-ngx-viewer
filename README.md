# essence-ng2-viewer

essence-ng2-viewer is an Angular component that can view video/image/pdf.

## Introduce

1. video-viewer（视频播放器）

	支持视频的播放、暂停、快进/退、音量调整等功能

2. image-viewer（图片查看器）

	支持图片的放大、缩小、旋转、翻转、拖动等功能

3. pdf-viewer（pdf阅读器）

	支持pdf的放大、缩小、跳转到指定页、文档搜索、自适应页面、打印等功能

## Usage

1. Install

	```shell
	npm install --save essence-ng2-viewer
	```

2. Use [font-awesome](http://fontawesome.io/icons/)

3. Deploy pdfjs (only for pdf-viewer)

	要能正常使用pdf-viewer，则需要将构建好的[pdfjs](https://github.com/mozilla/pdf.js)部署到服务器上，与要查看的pdf文件为同一个服务器（目前不支持跨域查看）。
	
	检查是否部署成功（根据实际部署的位置）：访问`http://xxx/pdfjs/web/viewer.html`，能正常访问并加载默认的pdf则说明部署成功。

4. Add the EssenceNg2ViewerModule

	```typescript
	import {EssenceNg2ViewerModule} from "essence-ng2-viewer";
	@NgModule({
	    imports: [
	        EssenceNg2ViewerModule
	    ]
	})
	```

5. Template

	```html
	<h2>video viewer</h2>
	<essence-ng2-viewer (ready)="videoViewerReady($event)" [model]="'video'" [poster]="poster" [source]="videoUrl" [width]="1000" [height]="700"></essence-ng2-viewer>
	
	<h2>image viewer</h2>
	<essence-ng2-viewer (ready)="imageViewerReady($event)" [model]="'image'" [source]="images" [width]="1000" [height]="700"></essence-ng2-viewer>
	
	<h2>pdf viewer</h2>
	<essence-ng2-viewer (ready)="pdfViewerReady($event)" [model]="'pdf'" [source]="pdfUrl" [viewerUrl]="pdfViewerUrl" [width]="1000" [height]="700"></essence-ng2-viewer>
	```

6. Component

	```typescript
	pdfViewerUrl: string = 'http://localhost:4200/assets/scripts/pdfjs/web/viewer.html';
	pdfUrl: string = 'http://localhost:4200/assets/mock/test.pdf';
	images: string[] = [];
	videoUrl: string = 'http://localhost:4200/assets/mock/test.mp4';
	poster: string = 'http://localhost:4200/assets/mock/poster.jpg';
	
	constructor () {
	    for (let i = 1; i < 13; i++) {
	        this.images.push(`http://localhost:4200/assets/mock/image-viewer/img_${i}.jpg`);
	    }
	}
	
	videoViewerReady ($event: any) {
		console.log($event);
	}
	
	imageViewerReady ($event: any) {
	    console.log($event);
	}
	
	pdfViewerReady ($event: any) {
	    console.log($event);
	}
	```

## API

### Inputs

- `model`（`?string='pdf'`） - 视图模式，默认`pdf`。支持`pdf`、`image`两种模式，将支持`video`模式

- `width`（`?number=600`） - 查看器宽度

- `height`（`?number=800`） - 查看器高度

- `source`（`string | string[]`） - 查看的pdf路径、图片文件路径数组及视频路径，`pdf`与`video`模式下数据类型为`string`，`image`模式下数据类型为`string[]`

- `poster` (`string`) - 视频预览图（海报图片）路径，`video`模式下有效

- `viewerUrl`（`string`） - pdfjs的viewer.html所在路径(pdfjs/web/viewer.html)，`pdf`模式下有效

### Outputs (event)

- `ready` - 查看器初始完成的事件

## Develop

	```shell
	npm install // 安装依赖包
	
	npm start // 启动项目
	```

# License

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](/LICENSE)
