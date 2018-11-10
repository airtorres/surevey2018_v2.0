import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { CreateSurveyPage } from '../create-survey/create-survey';
import { ProfilePage } from '../profile/profile';
import { SettingPage } from '../setting/setting';
import { TemplateListPage } from '../template-list/template-list';

import { AngularFireAuth } from '@angular/fire/auth';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentUser;
  built_in_templates;

  constructor(public navCtrl: NavController,
  	private fire: AngularFireAuth,
  	public app: App,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currentUser = x;
    });

    // load built-in templates to local DB
    this.loadBuiltInTemplates();
  }

  gotoProfile(){
  	this.navCtrl.push(ProfilePage, {});
  }

  gotoSettings(){
  	this.navCtrl.push(SettingPage, {});
  }

  logout(){
  	this.fire.auth.signOut().then()
  	.catch( function(error) {
      console.log("got an error:", error);
      
      // only temporary alert. Show error later.
      alert(error.message);
    });

  	// navigate back to sign-in page
  	this.navCtrl.popToRoot();
  	this.app.getRootNav().setRoot(SigninPage);
  }

  create_survey(){
  	this.navCtrl.push(CreateSurveyPage, {});
  }

  browse_templates(){
    this.navCtrl.push(TemplateListPage, {})
  }

  loadBuiltInTemplates(){
    this.built_in_templates = {
      '0': {
          'title': 'Customer Satisfaction Survey Template',
          'description': 'We care about your feedback! Please help us improve our services in a way that is most satisfactory to you. We appreciate your honesty. Thank you! ',
          'questions': [
            {
              'type' : 'multipleChoice',
              'message': 'For how long have you been using our product?',
              'options' : ['Less than a month', '1-12 months', '1-3 years', 'Over 3 years', 'Never used'],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'How often do you used our product?',
              'options' : ['Once a week', '2 or 3 times a month', 'Once a month', 'Less than once a month' ],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'How satisfied are you with the product?',
              'options' : ['Very satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very unsatisfied' ],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'What impresses you the most about the product?',
              'options' : ['Quality', 'Price', 'Usability', 'Installation or First Use Experience', 'Customer Service' ],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'What disappointed you the most about the product?',
              'options' : ['Quality', 'Price', 'Usability', 'Installation or First Use Experience', 'Customer Service' ],
              'isRequired': false
            },
            {
              'type' : 'longAnswer',
              'message': 'What do you like about the product?',
              'options' : [],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'Compared to similar products offered by other companies, how do you consider our product?',
              'options' : ['Much better', 'Somewhat better', 'About the same', 'Somewhat Worse', 'Much Worse' ],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'Would you use our product in the future?',
              'options' : ['Definitely', 'Probably', 'Not sure', 'Probably Not', 'Definitely Not' ],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'Would you recommend our product to other people?',
              'options' : ['Definitely', 'Probably', 'Not sure', 'Probably Not', 'Definitely Not' ],
              'isRequired': false
            },
          ]
      },
      '1': {
          'title': 'Demographic Survey Template',
          'description': 'We care about your feedback! Please help us improve our services in a way that is most satisfactory to you. We appreciate your honesty. Thank you! ',
          'questions': [
            {
              'type' : 'shortAnswer',
              'message': 'Name:',
              'options' : [],
              'isRequired': false
            },
            {
              'type' : 'shortAnswer',
              'message': 'Address:',
              'options' : [],
              'isRequired': false
            },
            {
              'type' : 'date',
              'message': 'Date of birth:',
              'options' : [],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'Gender:',
              'options' : ['Male', 'Female'],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'Age:',
              'options' : ['18 and below', '18-25', '26-35', '36-45', '46-60', '60 and above' ],
              'isRequired': false
            },
            {
              'type' : 'shortAnswer',
              'message': 'Phone Number:',
              'options' : [],
              'isRequired': false
            },
          ]
      },
      '2': {
          'title': 'Graduation Exit Survey for CAS Students Template',
          'description': 'Congratulations on your graduation! Please take a few minutes to evaluate current programs and assess their needs in order to develop new ones. Please note that your response is confidential and that any data summaries made available will not include your individual responses.',
          'questions': [
            {
              'type' : 'shortAnswer',
              'message': 'Name:',
              'options' : [],
              'isRequired': false
            },
            {
              'type' : 'shortAnswer',
              'message': 'Student Number:',
              'options' : [],
              'isRequired': false
            },
            {
              'type' : 'multipleChoice',
              'message': 'Gender:',
              'options' : ['Male', 'Female'],
              'isRequired': false
            },
            {
              'type' : 'dropdown',
              'message': 'Course:',
              'options' : ['BS Statistics', 'BS Apllied Mathematics', 'BS Computer Science', 'BS Chemistry'],
              'isRequired': false
            },
            {
              'type' : 'dropdown',
              'message': 'Department:',
              'options' : ['Division of Physical Sciences and Mathematics', 'Division of Chemistry', 'Division of Social Science', 'Division of Humanities'],
              'isRequired': false
            },
             {
              'type' : 'multipleChoice',
              'message': 'What is your primary immediate post-graduation plan?(Mark one only):',
              'options' : ['Further study', 'Government employment', 'Business/industries employment', 'Self-employment', 'Family employment'],
              'isRequired': false
            }
          ]
      }
    }

    // store templates to local storage
    this.storage.set('built_in_templates', this.built_in_templates).then(() => {});
  }

}