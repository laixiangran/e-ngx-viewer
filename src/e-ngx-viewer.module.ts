/**
 * Created by laixiangran on 2016/11/29.
 * homepage：http://www.laixiangran.cn.
 */

import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { ENgxViewerComponent } from "./e-ngx-viewer.component";
import { PDFViewerComponent } from "./pdf-viewer/pdf-viewer.component";
import { ImageViewerComponent } from "./image-viewer/image-viewer.component";
import { VideoViewerComponent } from './video-viewer/video-viewer.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ENgxViewerComponent,
        PDFViewerComponent,
        ImageViewerComponent,
        VideoViewerComponent
    ],
    exports: [
        ENgxViewerComponent
    ]
})
export class ENgxViewerModule {
}