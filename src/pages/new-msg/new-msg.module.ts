import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewMsgPage } from './new-msg';

@NgModule({
  declarations: [
    NewMsgPage,
  ],
  imports: [
    IonicPageModule.forChild(NewMsgPage),
  ],
})
export class NewMsgPageModule {}
