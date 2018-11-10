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
    // ***** REMOVE q_id after firguring out the del/edit approach for questions
    this.built_in_templates = {
      '0': {
          'title': 'Customer Satisfaction Survey Template',
          'description': 'We care about your feedback! Please help us improve our services in a way that is most satisfactory to you. We appreciate your honesty. Thank you! ',
          'questions': [
            {
              'q_id' : 0,
              'type' : 'multipleChoice',
              'message': 'For how long have you been using our product?',
              'options' : ['Less than a month', '1-12 months', '1-3 years', 'Over 3 years', 'Never used'],
              'isRequired': false
            },
            {
              'q_id' : 1,
              'type' : 'multipleChoice',
              'message': 'How often do you used our product?',
              'options' : ['Once a week', '2 or 3 times a month', 'Once a month', 'Less than once a month' ],
              'isRequired': false
            },
            {
              'q_id' : 2,
              'type' : 'multipleChoice',
              'message': 'How satisfied are you with the product?',
              'options' : ['Very satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very unsatisfied' ],
              'isRequired': false
            },
            {
              'q_id' : 3,
              'type' : 'multipleChoice',
              'message': 'What impresses you the most about the product?',
              'options' : ['Quality', 'Price', 'Usability', 'Installation or First Use Experience', 'Customer Service' ],
              'isRequired': false
            },
            {
              'q_id' : 4,
              'type' : 'multipleChoice',
              'message': 'What disappointed you the most about the product?',
              'options' : ['Quality', 'Price', 'Usability', 'Installation or First Use Experience', 'Customer Service' ],
              'isRequired': false
            },
            {
              'q_id' : 5,
              'type' : 'longAnswer',
              'message': 'What do you like about the product?',
              'options' : [],
              'isRequired': false
            },
            {
              'q_id' : 6,
              'type' : 'multipleChoice',
              'message': 'Compared to similar products offered by other companies, how do you consider our product?',
              'options' : ['Much better', 'Somewhat better', 'About the same', 'Somewhat Worse', 'Much Worse' ],
              'isRequired': false
            },
            {
              'q_id' : 7,
              'type' : 'multipleChoice',
              'message': 'Would you use our product in the future?',
              'options' : ['Definitely', 'Probably', 'Not sure', 'Probably Not', 'Definitely Not' ],
              'isRequired': false
            },
            {
              'q_id' : 8,
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
              'q_id' : 0,
              'type' : 'shortAnswer',
              'message': 'Name:',
              'options' : [],
              'isRequired': false
            },
            {
              'q_id' : 1,
              'type' : 'shortAnswer',
              'message': 'Address:',
              'options' : [],
              'isRequired': false
            },
            {
              'q_id' : 2,
              'type' : 'date',
              'message': 'Date of birth:',
              'options' : [],
              'isRequired': false
            },
            {
              'q_id' : 3,
              'type' : 'multipleChoice',
              'message': 'Gender:',
              'options' : ['Male', 'Female'],
              'isRequired': false
            },
            {
              'q_id' : 4,
              'type' : 'multipleChoice',
              'message': 'Age:',
              'options' : ['18 and below', '18-25', '26-35', '36-45', '46-60', '60 and above' ],
              'isRequired': false
            },
            {
              'q_id' : 5,
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
              'q_id' : 0,
              'type' : 'shortAnswer',
              'message': 'Name:',
              'options' : [],
              'isRequired': false
            },
            {
              'q_id' : 1,
              'type' : 'shortAnswer',
              'message': 'Student Number:',
              'options' : [],
              'isRequired': false
            },
            {
              'q_id' : 3,
              'type' : 'multipleChoice',
              'message': 'Gender:',
              'options' : ['Male', 'Female'],
              'isRequired': false
            },
            {
              'q_id' : 4,
              'type' : 'dropdown',
              'message': 'Course:',
              'options' : ['BS Statistics', 'BS Apllied Mathematics', 'BS Computer Science', 'BS Chemistry'],
              'isRequired': false
            },
            {
              'q_id' : 5,
              'type' : 'dropdown',
              'message': 'Department:',
              'options' : ['Division of Physical Sciences and Mathematics', 'Division of Chemistry', 'Division of Social Science', 'Division of Humanities'],
              'isRequired': false
            },
             {
              'q_id' : 6,
              'type' : 'multipleChoice',
              'message': 'What is your primary immediate post-graduation plan?(Mark one only):',
              'options' : ['Further study', 'Government employment', 'Business/industries employment', 'Self-employment', 'Family employment'],
              'isRequired': false
            }
          ]
      },
      '3': {
        'title': 'Neighborhood Feedback Template',
        'description': 'By completing this survey, you will help towards research of what activities we will do to increase camaraderie in the neighborhood and also to improve it',
        'questions': [
          {
            'q_id' : 0,
            'type' : 'date',
            'message': 'Today\'s Date:',
            'options' : [],
            'isRequired': false
          },
          {
            'q_id' : 1,
            'type' : 'multipleChoice',
            'message': 'What is your age?',
            'options' : ['18 and below', '18-25', '26-35', '36-45', '46-60', '60 and above' ],
            'isRequired': false
          },
          {
            'q_id' : 2,
            'type' : 'multipleChoice',
            'message': 'How many of your neighbors do you know?',
            'options' : ['All of them', 'Most of them', 'Above half of them', 'A few of them', 'None of them' ],
            'isRequired': false
          },
          {
            'q_id' : 3,
            'type' : 'multipleChoice',
            'message': 'How strong is the sense of community in this neighborhood?',
            'options' : ['Extremely strong', 'Very strong', 'Somewhat strong', 'Not so strong', 'Not at all strong' ],
            'isRequired': false
          },
          {
            'q_id' : 4,
            'type' : 'multipleChoice',
            'message': 'How often do you participate in activities in the neighborhood?',
            'options' : ['Extremely often', 'Very often', 'Somewhat often', 'Not so often', 'Not at all often' ],
            'isRequired': false
          },
          {
            'q_id' : 5,
            'type' : 'longAnswer',
            'message': 'If you do not participate in the activities in the neighborhood, why not?',
            'options' : [],
            'isRequired': false
          },
          {
            'q_id' : 6,
            'type' : 'multipleChoice',
            'message': 'How well are the streets in this neighborhood maintained?',
            'options' : ['Extremely well', 'Very well', 'Somewhat well', 'Not so well', 'Not at all well' ],
            'isRequired': false
          },
          {
            'q_id' : 7,
            'type' : 'multipleChoice',
            'message': 'Overall, how safe do you feel in this neighborhood?',
            'options' : ['Extremely safe', 'Very safe', 'Somewhat safe', 'Not so safe', 'Not at all safe' ],
            'isRequired': false
          },
          {
            'q_id' : 8,
            'type' : 'longAnswer',
            'message': 'What do you like most about this neighborhood?',
            'options' : [],
            'isRequired': false
          },
          {
            'q_id' : 9,
            'type' : 'longAnswer',
            'message': 'What do you like leasts about this neighborhood?',
            'options' : [],
            'isRequired': false
          },
          {
            'q_id' : 10,
            'type' : 'longAnswer',
            'message': 'Do you have any other comments, questions, or concerns?',
            'options' : [],
            'isRequired': false
          },
        ]
      },
      '4': {
        'title': 'Dine In Restaurant Survey',
        'description': 'As our customer, your opinions are very valuable to us. Please take a fw minute and answer the following questions. Thank you.',
        'questions': [
          {
            'q_id' : 0,
            'type' : 'multipleChoice',
            'message': 'How often do you dine with us?',
            'options' : ['Daily', 'Weekly', 'Monthly', 'Once in three months', 'First time', 'Never visited'],
            'isRequired': false
          },
          {
            'q_id' : 1,
            'type' : 'multipleChoice',
            'message': 'Was the server attentive and available when you needed him/her?(Skip this question if you haven\'t visited the restaurant)',
            'options' : ['Yes', 'No' ],
            'isRequired': false
          },
          {
            'q_id' : 2,
            'type' : 'multipleChoice',
            'message': 'How would you rate the taste of your meal?(Skip this question if you haven\'t visited the restaurant)',
            'options' : ['Excellent', 'Good', 'Average', 'Below Average', 'Poor' ],
            'isRequired': false
          },
          {
            'q_id' : 3,
            'type' : 'multipleChoice',
            'message': 'Please rate the cleanliness of the restaurant(Skip this question if you haven\'t visited the restaurant)',
            'options' : ['Excellent', 'Good', 'Average', 'Below Average', 'Poor' ],
            'isRequired': false
          },
          {
            'q_id' : 4,
            'type' : 'multipleChoice',
            'message': 'What do you think about the lighting in the restaurant?(Skip this question if you haven\'t visited the restaurant)',
            'options' : ['Excellent', 'Good', 'Average', 'Below Average', 'Poor' ],
            'isRequired': false
          },
          {
            'q_id' : 5,
            'type' : 'multipleChoice',
            'message': 'What do you think about the music played in the restaurant?(Skip this question if you haven\'t visited the restaurant)',
            'options' : ['Excellent', 'Good', 'Average', 'Below Average', 'Poor' ],
            'isRequired': false
          },
          {
            'q_id' : 6,
            'type' : 'longAnswer',
            'message': 'Do you have any comments?',
            'options' : [],
            'isRequired': false
          },
        ]
      },
    }

    // store templates to local storage
    this.storage.set('built_in_templates', this.built_in_templates).then(() => {});
  }

}