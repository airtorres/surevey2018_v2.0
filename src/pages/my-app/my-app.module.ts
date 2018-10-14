import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyAppPage } from './my-app';

@NgModule({
  declarations: [
    MyAppPage,
  ],
  imports: [
    IonicPageModule.forChild(MyAppPage),
  ],
})
export class MyAppPageModule {}
