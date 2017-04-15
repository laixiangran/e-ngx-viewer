import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
    selector: 'image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
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
