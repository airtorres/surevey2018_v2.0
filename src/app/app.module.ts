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

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { IonicStorageModule } from '@ionic/storage';

import { HttpModule } from '@angular/http';
import { File } from '@ionic-native/file';

 const firebaseAuth = {
    apiKey: "AIzaSyCVS6S7r9Fzou64HzePqZ9JSVZKG0-_LAU",
    authDomain: "sureveydb.firebaseapp.com",
    databaseURL: "https://sureveydb.firebaseio.com",
    projectId: "sureveydb",
    storageBucket: "sureveydb.appspot.com",
    messagingSenderId: "356066623007"
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
    ResultsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
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
    ResultsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
