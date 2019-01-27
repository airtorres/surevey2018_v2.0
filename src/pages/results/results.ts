import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { File } from '@ionic-native/file';
import * as papa from 'papaparse';

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
  // chartOptions: string = "pie";
  public chartOptions = [];

  survey = [];
  s_id;
  survey_title;
  description;

  questions = [];
  
  responses = [];
  openAnswers = {};

  results = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private alertCtrl: AlertController,
  	private storage: Storage,
  	private file: File,
  	private http: Http) {

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

  		var q_to_opt = [];
  		for ( var q in this.questions){
  			// setting default chart
  			this.chartOptions[q] = '';
  			this.chartOptions[q] = 'pie';

  			var opt_to_res = [];
  			for( var opt in this.questions[q]['options']){
  				var option = this.questions[q]['options'][opt];

  				// only if a question has options
  				if(option){
	  				opt_to_res[option] = [];

	  				for (var rr in this.responses){
	  					// getting the users whose answer is this particular option
						if(this.responses[rr]['answers'][q] && this.responses[rr]['answers'][q] == option){
							opt_to_res[option].push(this.responses[rr]['respondent']);
						}
					}
				}
  			}
  			q_to_opt.push(opt_to_res);
  		}
  		// results with the respondent email attached, can be found here
  		console.log(q_to_opt);

  		// tabulating the votes
  		for (var item in q_to_opt){
  			for( var optn in q_to_opt[item]){
  				q_to_opt[item][optn] = q_to_opt[item][optn].length;
  			}
  		}

  		this.results = q_to_opt;
  		console.log(this.results);
  	});
  }

  ionViewDidLoad() {
  	console.log(this.chartOptions);
    console.log('ionViewDidLoad ResultsPage');
  }

  showResult(idx){
  	console.log(this.questions[idx]['type']);

  	// for questions with options
  	if (this.questions[idx]['type'] == 'multipleChoice' || this.questions[idx]['type'] == 'checkbox' || this.questions[idx]['type'] == 'dropdown'){
  		try{
	  		this.showPieChart(idx);
        var resultsDiv = document.getElementById('graphResult_'+idx);
        var btn = document.getElementById('view_btn_'+idx);
        resultsDiv.style.display = 'block';
        btn.style.display = 'none';
	  	}
	  	catch (e){
	  		this.showInternetConnectionError();
	  	}
  	}
  	else{
  		this.openAnswers[idx] = [];
  		for (var ans in this.responses){
  			if(this.responses[ans]['answers'][idx]){
  				this.openAnswers[idx].push(this.responses[ans]['answers'][idx]);
  			}
  		}

  		console.log("OpenEndedAnswers: "+this.openAnswers);
  		var el = document.getElementById('openAnsDiv_'+idx);
  		el.style.display = 'block';
  	}
  }

  closeResult(idx) {
    var resultsDiv = document.getElementById('graphResult_'+idx);
    var btn = document.getElementById('view_btn_'+idx);
    btn.style.display = 'block';
    resultsDiv.style.display = 'none';
  }

  showPieChart(idx){
  	try{
	  	var question_res = [];

	  	var count = 0;
	  	for( var opt in this.results[idx]){
	  		question_res[count] = [];
	  		question_res[count].push(opt);
	  		question_res[count].push(this.results[idx][opt]);
	  		count++;
	  	}

	  	console.log(question_res);

	  	// Create the data table.
	    var data = new google.visualization.DataTable();
	    data.addColumn('string', this.questions[idx]['message']);
	    data.addColumn('number', 'No. of Votes');
	    data.addRows(question_res);

	    // Set chart options
	    var options = {
	   	  'title':'',
	      'width':600,
	      'height':400,
	      'legend': {
	        position: 'bottom', alignment: 'end', maxLines: 10,
	        textStyle: { fontSize: 16 }
	      },
	      'chartArea': {left:15,top:10,width:'50%',height:'75%'}
		};

	  	document.getElementById('opt_'+idx).style.display = "block";

	    // Instantiate and draw our chart, passing in some options.
	    var chart = new google.visualization.PieChart(document.getElementById('results_div_'+idx));
	    chart.draw(data, options);
	}
	catch (e){
		this.showInternetConnectionError();
	}
  }

  showBarChart(idx){
  	try{
	  	var question_res = [];

	  	var count = 0;
	  	for( var opt in this.results[idx]){
	  		question_res[count] = [];
	  		question_res[count].push(opt);
	  		question_res[count].push(this.results[idx][opt]);
	  		count++;
	  	}

	  	console.log(question_res);

	  	// Create the data table.
	    var data = new google.visualization.DataTable();
	    data.addColumn('string', 'Topping');
	    data.addColumn('number', 'Slices');
	    data.addRows(question_res);

	    // Set chart options
	    var options = {
	    	'title':'',
	        'width':400,
	        'height':300,
	        'legend':'bottom',
		};

	    // Instantiate and draw our chart, passing in some options.
	    var chart = new google.visualization.BarChart(document.getElementById('results_div_'+idx));
	    chart.draw(data, options);
	}
	catch (e){
		this.showInternetConnectionError();
	}
  }

  showDonutChart(idx){
  	try{
	  	var question_res = [];

	  	var count = 0;
	  	for( var opt in this.results[idx]){
	  		question_res[count] = [];
	  		question_res[count].push(opt);
	  		question_res[count].push(this.results[idx][opt]);
	  		count++;
	  	}

	  	console.log(question_res);

	    // Create the data table.
	    var data = new google.visualization.DataTable();
	    data.addColumn('string', 'Topping');
	    data.addColumn('number', 'Slices');
	    data.addRows(question_res);

	    // Set chart options
	    var options = {
	      'title':'',
	      'width':600,
	      'height':400,
	      'pieHole':0.4,
	      'legend': {
	        position: 'bottom', alignment: 'end', maxLines: 10,
	        textStyle: { fontSize: 16 }
	      },
	      'chartArea': {left:15,top:10,width:'50%',height:'75%'}
	    };

	    // Instantiate and draw our chart, passing in some options.
	    var chart = new google.visualization.PieChart(document.getElementById('results_div_'+idx));
	    chart.draw(data, options);
	}
	catch (e){
		this.showInternetConnectionError();
	}
  }

  public ionViewWillEnter(){
  	console.log("loading charts ...");
  }

  public ionViewWillLeave(){
  	console.log("leaving results page ...");
  }

  downloadCSV(){
  	// SAMPLE ONLY - But I'd already deleted the sample.csv file.
  	// this.http.get('assets/sample.csv').subscribe(
  	// 	data => this.extractData(data),
  	// 	err => this.handleError(err)
  	// );
  	// let csvData = data['_body'] || '';
  	// let parseData = papa.parse(csvData).data;

  	var csvHeader = [];
  	for ( var q in this.questions){
  		csvHeader.push(this.questions[q]['message']);
  	}

  	// getting rows of results
  	var resultsData = [];
  	for ( var r in this.responses){
  		resultsData.push(this.responses[r]['answers']);
  	}

  	let csv = papa.unparse({
  		fields: csvHeader,
  		data: resultsData
  	});

  	// this.file.checkDir(this.file.dataDirectory, 'mydir').then(_ =>
  	// 	console.log('Directory exists')).catch(err => console.log('Directory doesn\'t exist');
  	// );
  	// cordova.file.externalRootDirectory + '/Download/'

  	// generating CSV file using Blob
  	var blob = new Blob([csv]);
  	var filename = this.survey_title + " - RESULTS.csv";

  	// this.file.createFile(cordova.file.externalRootDirectory + '/Download/', filename, false);
  	// BELOW: use to download CSV on mobile
  	// this.file.writeFile(this.file.externalRootDirectory + '/Download/', filename, blob, {replace: true});

  	var a = window.document.createElement("a");
  	a.href = window.URL.createObjectURL(blob);
  	a.download = filename;
  	document.body.appendChild(a);
  	a.click();
  	document.body.removeChild(a);
  }

  showInternetConnectionError(){
  	let alert = this.alertCtrl.create({
      title: 'Oppss!',
      message: 'You must be connected to the internet.',
      buttons: ['OK']
    });
    alert.present();
  }

}
