import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {EssenceNg2ViewerModule} from "../../../src";

@NgModule({
    imports: [
        BrowserModule,
		EssenceNg2ViewerModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
