# essence-ng2-viewer v1.0.0

This is a video/image/pdf viewer component for Angular.

## 功能点

### video-viewer（视频播放器）

支持视频的播放、暂停、快进/退、音量调整等功能

### image-viewer（图片查看器）

支持图片的放大、缩小、旋转、翻转、拖动等功能

### pdf-viewer（pdf阅读器）

支持pdf的放大、缩小、跳转到指定页、文档搜索、自适应页面、打印等功能

## 依赖

```json
{
  "typescript": ">=2.0.3",
  "angular2": ">=2.4.8",
  "font-awesome": "^4.7.0",
  "pdfjs": "^1.7.395"
}
```

## 用法

### 部署pdfjs

要能正常使用pdf-viewer，则需要将构建好的pdfjs(`../../assets/scripts/pdfjs`)包部署到服务器上，与要查看的pdf文件为同一个服务器（目前不支持跨域查看）。

检查是否部署成功（根据实际部署的位置）：访问`http://xxx/pdfjs/web/viewer.html`，能正常加载pdf则说明部署成功。

### module中导入

```typescript
import {EssenceNg2ViewerModule} from "../components/essence-ng2-viewer/essence-ng2-viewer.module";
@NgModule({
    imports: [
        EssenceNg2ViewerModule
    ]
})
```

### template中使用

```html
<h2>video viewer</h2>
<essence-ng2-viewer (ready)="videoViewerReady($event)" [model]="'video'" [poster]="poster" [source]="videoUrl" [width]="1000" [height]="700"></essence-ng2-viewer>

<h2>image viewer</h2>
<essence-ng2-viewer (ready)="imageViewerReady($event)" [model]="'image'" [source]="images" [width]="1000" [height]="700"></essence-ng2-viewer>

<h2>pdf viewer</h2>
<essence-ng2-viewer (ready)="pdfViewerReady($event)" [model]="'pdf'" [source]="pdfUrl" [viewerUrl]="pdfViewerUrl" [width]="1000" [height]="700"></essence-ng2-viewer>
```

### 对应的component

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

## API说明

### 输入属性

- `model`（`?string='pdf'`） - 视图模式，默认`pdf`。支持`pdf`、`image`两种模式，将支持`video`模式

- `width`（`?number=600`） - 查看器宽度

- `height`（`?number=800`） - 查看器高度

- `source`（`string | string[]`） - 查看的pdf路径、图片文件路径数组及视频路径，`pdf`与`video`模式下数据类型为`string`，`image`模式下数据类型为`string[]`

- `poster` (`string`) - 视频预览图（海报图片）路径，`video`模式下有效

- `viewerUrl`（`string`） - pdfjs的viewer.html所在路径(pdfjs/web/viewer.html)，`pdf`模式下有效

### 事件

- `ready` - 查看器初始完成的事件
