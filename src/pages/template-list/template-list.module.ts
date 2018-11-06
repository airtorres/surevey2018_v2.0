import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TemplateListPage } from './template-list';

@NgModule({
  declarations: [
    TemplateListPage,
  ],
  imports: [
    IonicPageModule.forChild(TemplateListPage),
  ],
})
export class TemplateListPageModule {}
