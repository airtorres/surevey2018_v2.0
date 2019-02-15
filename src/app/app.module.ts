import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { WelcomePage } from '../pages/welcome/welcome';
import { SignupPage } from '../pages/signup/signup';
import { SigninPage } from '../pages/signin/signin';
import { MyAppPage } from '../pages/my-app/my-app';

import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { CreateSurveyPage } from '../pages/create-survey/create-survey';
import { SurveyListPage } from '../pages/survey-list/survey-list';
import { ChatBoxPage } from '../pages/chat-box/chat-box';
import { NotificationPage } from '../pages/notification/notification';
import { ProfilePage } from '../pages/profile/profile';
import { SettingPage } from '../pages/setting/setting';
import { QuestionPage } from '../pages/question/question';
import { SurveySummaryPage } from '../pages/survey-summary/survey-summary';
import { SendInvitePage } from '../pages/send-invite/send-invite';
import { ChatPage } from '../pages/chat/chat';
import { NewMsgPage } from '../pages/new-msg/new-msg';
import { AnswerSurveyPage } from '../pages/answer-survey/answer-survey';
import { TemplateListPage } from '../pages/template-list/template-list';
import { ResultsPage } from '../pages/results/results';
import { FiltersPage } from '../pages/filters/filters';
import { EditProfilePage } from '../pages/edit-profile/edit-profile';
import { EditDraftPage } from '../pages/edit-draft/edit-draft';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { IonicStorageModule } from '@ionic/storage';

import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http'; 
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { LoginProvider } from '../providers/login/login';

 // const firebaseAuth = {
 //    apiKey: "AIzaSyCVS6S7r9Fzou64HzePqZ9JSVZKG0-_LAU",
 //    authDomain: "sureveydb.firebaseapp.com",
 //    databaseURL: "https://sureveydb.firebaseio.com",
 //    projectId: "sureveydb",
 //    storageBucket: "sureveydb.appspot.com",
 //    messagingSenderId: "356066623007"
 //  };

 const firebaseAuth = {
    apiKey: "AIzaSyDoso6IQBwpKn2KgQValVvynErc7vhGXHg",
    authDomain: "sureveyuserstempdb.firebaseapp.com",
    databaseURL: "https://sureveyuserstempdb.firebaseio.com",
    projectId: "sureveyuserstempdb",
    storageBucket: "sureveyuserstempdb.appspot.com",
    messagingSenderId: "399527974751"
  };

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    TabsPage,
    WelcomePage,
    SignupPage,
    SigninPage,
    MyAppPage,
    CreateSurveyPage,
    SurveyListPage,
    ChatBoxPage,
    NotificationPage,
    ProfilePage,
    SettingPage,
    QuestionPage,
    SurveySummaryPage,
    SendInvitePage,
    ChatPage,
    NewMsgPage,
    AnswerSurveyPage,
    TemplateListPage,
    ResultsPage,
    FiltersPage,
    EditProfilePage,
    EditDraftPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseAuth),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    TabsPage,
    WelcomePage,
    SignupPage,
    SigninPage,
    MyAppPage,
    CreateSurveyPage,
    SurveyListPage,
    ChatBoxPage,
    NotificationPage,
    ProfilePage,
    SettingPage,
    QuestionPage,
    SurveySummaryPage,
    SendInvitePage,
    ChatPage,
    NewMsgPage,
    AnswerSurveyPage,
    TemplateListPage,
    ResultsPage,
    FiltersPage,
    EditProfilePage,
    EditDraftPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    FileChooser,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LoginProvider
  ]
})
export class AppModule {}
