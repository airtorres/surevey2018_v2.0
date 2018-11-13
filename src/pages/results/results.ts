import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';

/**
 * Generated class for the ResultsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 declare var google;
 // google.charts.load('current', {packages: ['table']});

@IonicPage()
@Component({
  selector: 'page-results',
  templateUrl: 'results.html',
})
export class ResultsPage {

  survey = [];
  s_id;
  survey_title;
  description;

  questions = [];
  
  responses = [];
  openAnswers = [];

  tables = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private storage: Storage) {

  	if(this.navParams.get('responses')){
  		this.responses = this.navParams.get('responses');
  	}

  	if(this.navParams.get('s_id')){
  		this.s_id = this.navParams.get('s_id');
  	}

  	this.storage.get('surveys').then( val => {
  		for( var v in val['surveys']){
  			// getting this particular survey
  			if( v == this.s_id ){
  				this.survey = val['surveys'][v];
  				break;
  			}
  		}

  		console.log(this.survey);

  		this.survey_title = this.survey['title'];
  		this.description = this.survey['description'];
  		this.questions = this.survey['questions'];
  	});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultsPage');
  }

  showResult(idx){
  	console.log(this.questions[idx]['type']);

  	// for questions with options
  	if (this.questions[idx]['type'] == 'multipleChoice' || this.questions[idx]['type'] == 'checkbox' || this.questions[idx]['type'] == 'dropdown'){
  		document.getElementById('opt_'+idx).style.display = "block";
  		this.showPieChart(idx);
  	}
  	else{
  		for (var ans in this.responses){
  			if(this.responses[ans]['answers'][idx]){
  				this.openAnswers.push(this.responses[ans]['answers'][idx]);
  			}
  		}

  		var el = document.getElementById('openAnsDiv_'+idx);
  		el.style.display = 'block';
  	}
  }

  loadOpenEndedAnswers(){

  }

  showPieChart(idx){
  	// Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['Mushrooms', 3],
      ['Onions', 1],
      ['Olives', 1],
      ['Zucchini', 1],
      ['Pepperoni', 2],
      ['Pineapple', 1],
      ['Ham', 1],
      ['Cheese', 1],
      ['Pepper', 2]
    ]);

    // Set chart options
    var options = {
   	  'title':'',
      ' width':500,
      'height':400,
      'chartArea':{
          left:25,top:100
        },
      'legend': {
        position: 'top', alignment: 'left', maxLines: 4
      },
      'titleTextStyle': {
        fontSize: 16
      }
	};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('results_div_'+idx));
    chart.draw(data, options);
  }

  showBarChart(){
  	// Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['Mushrooms', 3],
      ['Onions', 1],
      ['Olives', 1],
      ['Zucchini', 1],
      ['Pepperoni', 2]
    ]);

    // Set chart options
    var options = {
    	'title':'1. How Much Pizza I Ate Last Night?',
        'width':400,
        'height':300,
        'legend':'bottom',
	};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById('bar_chartdiv'));
    chart.draw(data, options);
  }

  showDonutChart(){
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
      ['Mushrooms', 3],
      ['Onions', 1],
      ['Olives', 1],
      ['Zucchini', 1],
      ['Pepperoni', 2]
    ]);

    // Set chart options
    var options = {
      'title':'1. How Much Pizza I Ate Last Night?',
      'width':500,
      'height':400,
      'pieHole':0.4,
      'chartArea':{
          left:25, top:100
        },
      'legend': {
        position: 'top', alignment: 'left', maxLines: 4
      },
      'titleTextStyle': {
        fontSize: 16
      }
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('donut_chart_div'));
    chart.draw(data, options);
  }

  showTable() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Pizza Toppings');
    data.addColumn('number', 'Number');
    data.addRows([
      ['Mushrooms',  {v: 3, f: '3'}],
      ['Onions',   {v:1,   f: '1'}],
      ['Olives', {v: 1, f: '1'}],
      ['Zucchini',   {v: 1,  f: '1'}],
      ['Pepperoni',   {v: 2,  f: '2'}]
    ]);

    var options = {
      'title':'1. How Much Pizza I Ate Last Night?',
      'width':'90%',
      'height':'100%',
      showRowNumber: true
    }

    var table = new google.visualization.Table(document.getElementById('table_div'));

    table.draw(data, options);
  }

  public ionViewWillEnter(){
  	console.log("loading charts ...");
  }

  public ionViewWillLeave(){
  	console.log("leaving results page ...");
  }

}
