import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ENgxViewerModule } from "../../src/e-ngx-viewer.module";

@NgModule({
    imports: [
        BrowserModule,
        ENgxViewerModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
