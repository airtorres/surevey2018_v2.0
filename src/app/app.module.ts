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
import { TemplatesPage } from '../pages/templates/templates';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { IonicStorageModule } from '@ionic/storage';

 const firebaseAuth = {
    apiKey: "AIzaSyDllAkdkwDHAifL7d_1aGkCFcXMT_zY09s",
    authDomain: "surevey2018.firebaseapp.com",
    databaseURL: "https://surevey2018.firebaseio.com",
    projectId: "surevey2018",
    storageBucket: "surevey2018.appspot.com",
    messagingSenderId: "1031322702252"
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
    TemplatesPage
  ],
  imports: [
    BrowserModule,
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
    TemplatesPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
