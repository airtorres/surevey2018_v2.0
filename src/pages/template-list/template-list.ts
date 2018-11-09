import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { TemplatesPage } from '../templates/templates';

/**
 * Generated class for the TemplateListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-template-list',
  templateUrl: 'template-list.html',
})
export class TemplateListPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TemplateListPage');
  }

  edit_templates(title) {
    let data = {
      surveyTitle: title
    }
  	this.navCtrl.push(TemplatesPage, data);
  }

}
