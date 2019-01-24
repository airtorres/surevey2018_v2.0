import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CreateSurveyPage } from '../create-survey/create-survey';

import * as firebase from 'firebase/app';
import 'firebase/database';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-template-list',
  templateUrl: 'template-list.html',
})
export class TemplateListPage {

  built_in_templates = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage) {

    // load built-in surveys from firebase
    try{
      const templateRef:firebase.database.Reference = firebase.database().ref('/built_in_templates');
      templateRef.on('value', templateSnapshot => {
        this.built_in_templates = [];
        var tempRef = templateSnapshot.val();
        for ( var temp in tempRef){
          this.built_in_templates.push(tempRef[temp]);
        }

        // store to local storage
        this.storage.set('built_in_templates', this.built_in_templates); 
      });
    }catch(err){
      console.log("Unable to load data. No Internet Connection.");

      // load the built-in survey templates from local DB
      try{
        this.storage.get("built_in_templates").then( templates => {
          this.built_in_templates = [];
          for ( var temp in templates){
            this.built_in_templates.push(templates[temp]);
          }
        });
      }catch (e){
        console.log("Problems with built_in_templates in Local Storage. ");
      }
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TemplateListPage');
  }

  edit_templates(title) {
    for( var temp in this.built_in_templates){
      if( this.built_in_templates[temp]['title'] == title){
        this.navCtrl.push(CreateSurveyPage, {surveyFromTemplate: this.built_in_templates[temp]});
      }
    }  	
  }

  public ionViewWillEnter() {
  }

}
