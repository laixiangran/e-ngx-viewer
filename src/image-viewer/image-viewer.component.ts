import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

let template = `
<div class="imageViewerContainer" [style.width]="width + 'px'" [style.height]="height + 'px'" #imageViewerContainer>
	<div class="imageViewer"
	     (dragstart)="cancleCurrentImageDrag($event)"
	     (mousedown)="currentImageDragStart($event)"
	     (mousemove)="currentImageDrag($event)"
	     (mouseup)="currentImageDragEnd($event)"
	     [style.width]="imageViewerContainer.style.width"
	     [style.height]="(imageViewerContainer.clientHeight - 150) + 'px'" #imageViewer>

		<img [src]="currentImageUrl"
		     (load)="currentImageLoaded(showImg, imageViewer)" #showImg>

		<div class="previousImg" (click)="preOrNextImg('pre')">
			<span class="fa fa-chevron-circle-left" aria-hidden="true" title="上一张"></span>
		</div>
		<div class="nextImg" (click)="preOrNextImg('next')">
			<span class="fa fa-chevron-circle-right" aria-hidden="true" title="下一张"></span>
		</div>
	</div>
	<div class="smallImageViewer">
		<div class="toImg previousImgs" title="向左查看" (click)="previousImg(moreImg, imageViewer)">
			<i class="fa fa-angle-double-left" aria-hidden="true"></i>
		</div>
		<div class="toImg nextImgs" title="向右查看" (click)="nextImg(moreImg, imageViewer)">
			<i class="fa fa-angle-double-right" aria-hidden="true"></i>
		</div>
		<div class="moreImg" #moreImg [style.left]="moreImgInitLeft + 'px'">
			<img *ngFor="let imgUrl of imageSources;" [src]="imgUrl" (click)="changeCurrentImageUrl(imgUrl)">
		</div>
	</div>
	<div class="imageTools">
		<button class="toolsBtn imageZoomin" title="放大" (click)="imageZoomin()">
			<i class="fa fa-search-plus" aria-hidden="true"></i>
		</button>
		<button class="toolsBtn imageZoomout" title="缩小" (click)="imageZoomout()">
			<i class="fa fa-search-minus" aria-hidden="true"></i>
		</button>
		<button class="toolsBtn rotateLeft" title="向左旋转" (click)="rotateLeft()">
			<i class="fa fa-undo" aria-hidden="true"></i>
		</button>
		<button class="toolsBtn rotateRight" title="向右旋转" (click)="rotateRight()">
			<i class="fa fa-repeat" aria-hidden="true"></i>
		</button>
		<button class="toolsBtn flipVertical" title="垂直翻转" (click)="flipVertical()">
			<i class="fa fa-arrows-v" aria-hidden="true"></i>
		</button>
		<button class="toolsBtn flipHorizontal" title="水平翻转" (click)="flipHorizontal()">
			<i class="fa fa-arrows-h" aria-hidden="true"></i>
		</button>
		<button class="toolsBtn imageReset" title="重置" (click)="currentImgReset()">
			<i class="fa fa-refresh" aria-hidden="true"></i>
		</button>
	</div>
</div>
`;

let styles = `
.imageViewerContainer {
	margin: 0;
	padding: 0;
	height: 100%;
	min-width: 400px;
	min-height: 400px;
	background-color: #3E3E3E;
}

.imageViewerContainer .imageViewer {
	position: relative;
	overflow: hidden;
}

.imageViewerContainer .imageViewer div {
	position: absolute;
	width: 80px;
	height: 100%;
	background: rgba(112, 109, 109, 0);
	transition: all 0.5s;
}

.imageViewerContainer .imageViewer div span {
	position: absolute;
	font-size: 60px;
	width: 1em;
	height: 1em;
	text-align: center;
	top: 50%;
	margin-top: -30px;
	left: 50%;
	margin-left: -30px;
	opacity: 0.2;
	color: #797979;
	transition: all 0.5s;
	cursor: pointer;
}

.imageViewerContainer .imageViewer div:hover {
	background: rgba(112, 109, 109, 0.5);
}

.imageViewerContainer .imageViewer div:hover span {
	opacity: 1;
	color: #F5F5F5;
}

.imageViewerContainer .imageViewer div.previousImg {
	top: 0;
	left: 0;
}

.imageViewerContainer .imageViewer div.nextImg {
	top: 0;
	right: 0;
}

.imageViewerContainer .imageViewer img {
	position: absolute;
	border: 0;
	padding: 0;
	margin: 0;
	width: auto;
	height: 98%;
	visibility: visible;
	transition: all 0.5s ease-out;
}

.imageViewerContainer .smallImageViewer {
	border-top: 2px solid #888484;
	border-bottom: 2px solid #888484;
	margin-top: 2px;
	height: 100px;
	position: relative;
	overflow: hidden;
	white-space: nowrap;
}

.imageViewerContainer .smallImageViewer .moreImg {
	height: 100%;
	position: absolute;
	z-index: 1;
	top: 0;
	transition: left 0.6s ease-out;
}

.imageViewerContainer .smallImageViewer .moreImg img {
	position: relative;
	cursor: pointer;
	margin: 0 2px 0 0;
	height: 100%;
	transform: scale(1);
	transition: transform 0.5s;
	z-index: 1;
}

.imageViewerContainer .smallImageViewer .moreImg img:hover {
	transform: scale(1.5);
	z-index: 2;
}

.imageViewerContainer .smallImageViewer .toImg {
	height: 100%;
	width: 25px;
	color: #FFFFFF;
	text-align: center;
	line-height: 100px;
	font-weight: bold;
	opacity: 0.8;
	cursor: pointer;
	overflow: hidden;
	background-color: #3E3E3E;
	position: absolute;
	z-index: 9;
	top: 0;
	user-select: none;
	transition: opacity 0.5s;
}

.imageViewerContainer .smallImageViewer .toImg:hover {
	opacity: 1;
}

.imageViewerContainer .smallImageViewer .previousImgs {
	left: 0;
}

.imageViewerContainer .smallImageViewer .nextImgs {
	right: 0;
}

.imageViewerContainer .imageTools {
	text-align: center;
	height: 46px;
	line-height: 46px;
}

.imageViewerContainer .imageTools .toolsBtn {
	margin: 0 5px;
	padding: 4px 8px;
	color: #3E3E3E;
	font-size: 16px;
	font-weight: 400;
	line-height: 1.5;
	display: inline-block;
	text-align: center;
	white-space: nowrap;
	vertical-align: middle;
	user-select: none;
	background-image: none;
	background-color: #FFFFFF;
	border: 1px solid #CCCCCC;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.3s;
}

.imageViewerContainer .imageTools .toolsBtn:hover {
	color: #FFFFFF;
	background-color: #3E3E3E;
	border-color: #888484;
}
`;

@Component({
    selector: 'image-viewer',
    template: template,
    styles: [styles]
})
export class ImageViewerComponent implements OnInit {

    @Input() width: number = 0;
    @Input() height: number = 0;
    @Input() source: string[];
    @Output() ready: EventEmitter<any> = new EventEmitter<any>(false);

    private currentImage: HTMLImageElement;
	imageSources: SafeResourceUrl[] = [];
    currentImageUrl: SafeResourceUrl; // 当前主图路径
    private radian: number = 0; // 旋转变换参数
    private x: number = 1; // 水平变换参数
    private y: number = 1; // 垂直变换参数
    private zoom: number = 0.1; // 缩放比率
    private initTop: number; // 图片初始css的top值
    private initLeft: number; // 图片初始css的left值
    moreImgInitLeft: number = 0; // 图片列表容器初始css的left值
    private currentImageTempTop: number = 0;
    private currentImageTempLeft: number = 0;
    private dragStartClientX: number = 0;
    private dragStartClientY: number = 0;
    private isStartMove: boolean = false;

    constructor (public domSanitizer: DomSanitizer) {}

    ngOnInit () {
        if (this.source && this.source.length > 0) {
            this.source.forEach((imgUrl: string) => {
                this.imageSources.push(this.domSanitizer.bypassSecurityTrustResourceUrl(imgUrl));
            });
            this.currentImageUrl = this.imageSources[0];
            this.ready.emit('image viewer initialize!');
        } else {
            throw('没有图片源，请传入！');
        }
    }

    /**
     * 主图加载完成
     * @param img
     * @param viewer
     */
    currentImageLoaded (img: HTMLImageElement, viewer: HTMLDivElement) {
        this.currentImage = img;
        this.initTop = (viewer.clientHeight - img.offsetHeight) / 2;
        this.initLeft = (viewer.clientWidth - img.offsetWidth) / 2;
        this.currentImage.style.top = this.initTop + 'px';
        this.currentImage.style.left = this.initLeft + 'px';

        // viewer注册滚轮事件, 火狐浏览器滚轮事件为DOMMouseScroll，其它浏览器为mousewheel
        if (this.checkBrowser().firefox) {
            viewer.addEventListener('DOMMouseScroll', (e: any) => {
                this.currentImageZoomByWheel(e);
            });
        } else {
            viewer.addEventListener('mousewheel', (e: any) => {
                this.currentImageZoomByWheel(e);
            });
        }
    }

    preOrNextImg (type: string) {
        let index: number = this.imageSources.indexOf(this.currentImageUrl);
        if (type == 'pre') {
            if (index != 0) {
                index--;
                this.currentImageUrl = this.imageSources[index];
            }
        } else if (type == 'next') {
            if (index != this.imageSources.length - 1) {
                index++;
                this.currentImageUrl = this.imageSources[index];
            }
        }
        this.currentImgReset();
    }

    /**
     * 根据变换参数改变主图
     */
    changeCurrentImg () {
        let matrix: any = this.getMatrix(this.radian, this.x, this.y);
        this.currentImage.style.transform = "matrix(" +
            matrix.M11.toFixed(16) + "," +
            matrix.M21.toFixed(16) + "," +
            matrix.M12.toFixed(16) + "," +
            matrix.M22.toFixed(16) + ", 0, 0)";
    }

    /**
     * 获取变换参数函数
     * @param radian
     * @param x
     * @param y
     * @returns {{M11: number, M12: number, M21: number, M22: number}}
     */
    getMatrix (radian: number, x: number, y: number): any {
        let Cos = Math.cos(radian),
            Sin = Math.sin(radian);
        return {
            M11: Cos * x,
            M12: -Sin * y,
            M21: Sin * x,
            M22: Cos * y
        };
    }

    /**
     * 设置垂直翻转有关变量
     */
    vertical () {
        this.radian = Math.PI - this.radian;
        this.y *= -1;
    }

    /**
     * 设置水平翻转有关变量
     */
    horizontal () {
        this.radian = Math.PI - this.radian;
        this.x *= -1;
    }

    /**
     * 设置旋转的弧度
     * @param radian
     */
    rotate (radian: number) {
        this.radian = radian;
    }

    /**
     * 设置弧度为向左转90度
     */
    rotateLeftBy90 () {
        this.radian -= Math.PI / 2;
    }

    /**
     * 设置弧度为向左转90度
     */
    rotateRightBy90 () {
        this.radian += Math.PI / 2;
    }

    /**
     * 根据角度设置旋转的弧度
     * @param degress
     */
    rotateByDegress (degress: number) {
        this.radian = degress * Math.PI / 180;
    }

    /**
     * 判断是否可以放大/缩小
     * @param scale
     * @param zoom
     * @returns {number}
     */
    getZoom (scale: number, zoom: number): number {
        return scale > 0 && scale > -zoom ? zoom : scale < 0 && scale < zoom ? -zoom : 0;
    }

    /**
     * 设置缩放的有关变量
     * @param zoom
     */
    scale (zoom: number) {
        if (zoom) {
            let hZoom: number = this.getZoom(this.x, zoom),
                vZoom: number = this.getZoom(this.y, zoom);
            if (hZoom && vZoom) {
                this.x += hZoom;
                this.y += vZoom;
            }
        }
    }

    /**
     * 设置放大的有关变量
     */
    zoomin () {
        this.scale(Math.abs(this.zoom));
    }

    /**
     * 设置缩小的有关变量
     */
    zoomout () {
        this.scale(-Math.abs(this.zoom));
    }

    /**
     * 重置参数
     */
    reset () {
        this.radian = 0;
        this.x = 1;
        this.y = 1;
        this.zoom = 0.1;
        this.currentImage.style.top = this.initTop + 'px';
        this.currentImage.style.left = this.initLeft + 'px';
    }

    // 以下为工具栏的按钮点击事件

    /**
     * 放大按钮事件
     */
    imageZoomin () {
        this.zoomin();
        this.changeCurrentImg();
    }

    /**
     * 缩小按钮事件
     */
    imageZoomout () {
        this.zoomout();
        this.changeCurrentImg();
    }

    /**
     * 向左旋转按钮事件
     */
    rotateLeft () {
        this.rotateLeftBy90();
        this.changeCurrentImg();
    }

    /**
     * 向右旋转按钮事件
     */
    rotateRight () {
        this.rotateRightBy90();
        this.changeCurrentImg();
    }

    /**
     * 垂直翻转按钮事件
     */
    flipVertical () {
        this.vertical();
        this.changeCurrentImg();
    }

    /**
     * 水平翻转按钮事件
     */
    flipHorizontal () {
        this.horizontal();
        this.changeCurrentImg();
    }

    /**
     * 主图恢复初始状态
     */
    currentImgReset () {
        this.reset();
        this.changeCurrentImg();
    }

    /**
     * 下一页图片
     * @param moreImg
     * @param viewer
     */
    previousImg (moreImg: HTMLDivElement, viewer: HTMLDivElement) {
        let moveVal: number = (Number(moreImg.style.left.split("px")[0]) + viewer.clientWidth);
        this.moreImgInitLeft = moveVal < 0 ? moveVal : 0;
    }

    /**
     * 下一页图片
     * @param moreImg
     * @param viewer
     */
    nextImg (moreImg: HTMLDivElement, viewer: HTMLDivElement) {
        let moveVal: number = (Number(moreImg.style.left.split("px")[0]) - viewer.clientWidth);
        this.moreImgInitLeft = -moreImg.clientWidth < moveVal ? moveVal : this.moreImgInitLeft;
    }

    /**
     * 点击小图加载主图事件
     * @param imgUrl
     */
    changeCurrentImageUrl (imgUrl: string) {
        this.currentImageUrl = imgUrl;
        this.currentImgReset();
    }

    /**
     * 滚轮缩放
     * @param e
     */
    currentImageZoomByWheel(e: any) {
        e.preventDefault(); // 禁用滚轮事件的默认操作
        let scale: number = (e.wheelDelta ? e.wheelDelta / (-120) : (e.detail || 0) / 3) * Math.abs(this.zoom);
        this.scale(scale);
        if (this.x >= 0.1 && this.y >= 0.1) { // 修复chrome下图片缩小到一定程度会突然变大的bug
            this.changeCurrentImg();
        }
    }

    /**
     * 主图拖动开始事件
     * @param e
     */
    currentImageDragStart (e: MouseEvent) {
        this.currentImageTempTop = parseInt(this.currentImage.style.top);
        this.currentImageTempLeft = parseInt(this.currentImage.style.left);
        this.dragStartClientX = e.clientX;
        this.dragStartClientY = e.clientY;
        this.currentImage.style.transition = 'all 0s ease-out';
        this.isStartMove = true;
    }

    /**
     * 主图拖动中事件
     * @param e
     */
    currentImageDrag (e: MouseEvent) {
        if (this.isStartMove) {
            let offsetX: number = e.clientX - this.dragStartClientX;
            let offsetY: number = e.clientY - this.dragStartClientY;
            this.currentImage.style.top = (this.currentImageTempTop + offsetY) + "px";
            this.currentImage.style.left = (this.currentImageTempLeft + offsetX) + "px";
        }
    }

    /**
     * 主图拖动结束事件
     * @param e
     */
    currentImageDragEnd (e: MouseEvent) {
        this.currentImage.style.transition = 'all 0.5s ease-out';
        this.isStartMove = false;
    }

    /**
     * 取消默认的拖拽事件
     * @param e
     */
    cancleCurrentImageDrag (e: DragEvent) {
        e.preventDefault();
    }

    /**
     * 检测浏览器
     * @returns {any}
     */
    checkBrowser (): any {
        let browser: any = {},
            ua: string = navigator.userAgent;

        // 检测Presto内核的Opera浏览器
        if (window['opera']) {
            browser.ver = window['opera'].version();
            browser.opera = parseFloat(browser.ver);
        } else {

            //确定 Microsoft Edge
            if (/Edge\/(\S+)/.test(ua)) {
                browser.ver = RegExp["$1"];
                browser.misEdge = parseFloat(browser.ver);
            }

            // 确定 WebKit内核Opera
            else if (/OPR\/(\S+)/.test(ua)) {
                browser.ver = RegExp["$1"];
                browser.opera = parseFloat(browser.ver);
            }

            // 确定 Chrome
            else if (/Chrome\/(\S+)/.test(ua)) {
                browser.ver = RegExp["$1"];
                browser.chrome = parseFloat(browser.ver);
            }

            // 确定 Safari
            else if (/Version\/(\S+)/.test(ua)) {
                browser.ver = RegExp["$1"];
                browser.safari = parseFloat(browser.ver);
            }

            // 确定 Firefox
            else if (/Firefox\/(\S+)/.test(ua)) {
                browser.ver = RegExp["$1"];
                browser.firefox = parseFloat(browser.ver);
            }

            // 检测 IE
            else if (/MSIE ([^;]+)/.test(ua) || /rv:([^\)]+)\) like Gecko/.test(ua)) {
                browser.ver = RegExp["$1"];
                browser.ie = parseFloat(browser.ver);
            }

            // 检测 KHTML 用于Konqueror3.1及更早版本中不包含KHTML的版本，故而就要使用Konqueror的版本来代替
            else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/(\S+)/.test(ua)) {
                browser.ver = RegExp["$1"];
                browser.konq = parseFloat(browser.ver);
            }
        }
        return browser;
    }
}
