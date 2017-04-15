/**
 * Created by laixiangran on 2016/11/29.
 * homepage：http://www.laixiangran.cn.
 */

import {CommonModule} from "@angular/common";
import {NgModule} from '@angular/core';
import {EssenceNg2ViewerComponent} from "./essence-ng2-viewer.component";
import {PDFViewerComponent} from "./pdf-viewer/pdf-viewer.component";
import {ImageViewerComponent} from "./image-viewer/image-viewer.component";
import {VideoViewerComponent} from './video-viewer/video-viewer.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        EssenceNg2ViewerComponent,
        PDFViewerComponent,
        ImageViewerComponent,
        VideoViewerComponent
    ],
    exports: [
        EssenceNg2ViewerComponent
    ]
})
export class EssenceNg2ViewerModule {
}