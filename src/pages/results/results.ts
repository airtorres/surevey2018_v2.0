import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import * as papa from 'papaparse';

import  * as FileSaver  from 'file-saver';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

/**
 * Generated class for the ResultsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 declare var google;
 // google.charts.load('current', {packages: ['table']});
 declare var cordova: any;

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
    public configService: ConfigurationProvider,
  	private file: File,
    public platform: Platform) {

  	if(this.navParams.get('responses')){
  		this.responses = this.navParams.get('responses');
  	}

  	if(this.navParams.get('s_id')){
  		this.s_id = this.navParams.get('s_id');
  	}

    this.survey = this.configService.getSurveyData(this.s_id);

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
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResultsPage');
  }

  showResult(idx){
  	console.log(this.questions[idx]['type']);
  	this.chartOptions[idx] = 'pie';

  	// for questions with options
  	if (this.questions[idx]['type'] == 'multipleChoice' || this.questions[idx]['type'] == 'checkbox' || this.questions[idx]['type'] == 'dropdown'){
  		try{
	  		this.showPieChart(idx);
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
  	}

  	var resultsDiv = document.getElementById('resDiv_'+idx);
    var btn = document.getElementById('view_btn_'+idx);
    var closebtn = document.getElementById('closeIcon_'+idx);
    resultsDiv.style.display = 'block';
    btn.style.display = 'none';
    closebtn.style.display = 'block';

    this.shiftBgColor(idx);
  }

  closeResult(idx) {
    var resultsDiv = document.getElementById('resDiv_'+idx);
    var btn = document.getElementById('view_btn_'+idx);
    var closebtn = document.getElementById('closeIcon_'+idx);
    btn.style.display = 'block';
    resultsDiv.style.display = 'none';
    closebtn.style.display = 'none';

    this.chartOptions[idx] = 'pie';
    this.shiftToWhiteBg(idx);
  }

  shiftBgColor(idx){
  	var item = document.getElementById('item_'+idx);
  	item.style.backgroundColor = '#12608A';
  	item.style.color = 'white';

  	var closebtn = document.getElementById('closeIcon_'+idx);
  	closebtn.style.backgroundColor = '#12608A';
  	closebtn.style.color = 'white';

  	var div = document.getElementById('questionAndResultDiv_'+idx);
  	div.style.borderColor = 'rgba(18, 96, 138, 0.14)';
  }

  shiftToWhiteBg(idx){
  	var item = document.getElementById('item_'+idx);
  	item.style.backgroundColor = 'white';
  	item.style.color = 'black';

  	var closebtn = document.getElementById('closeIcon_'+idx);
  	closebtn.style.backgroundColor = 'white';
  	closebtn.style.color = '#12608A';

  	var div = document.getElementById('questionAndResultDiv_'+idx);
  	div.style.borderColor = '#F0F0F0';
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
	      'width':320,
	      'height':375,
	      'legend': {
	        position: 'bottom', alignment: 'start',
	        textStyle: { fontSize: 12 }
	      },
	      'chartArea': {left:10,top:10,width:'95%',height:'75%'}
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
	    data.addColumn('string', this.questions[idx]['message']);
	    data.addColumn('number', 'No. of votes');
	    data.addRows(question_res);

	    // Set chart options
	    var options = {
	    	'title':'',
        // 'isStacked': 'percent',
        'bar': { groupWidth: "90%" },
        'width':320,
        'legend': 'bottom',
        'chartArea': {left:50,right:5,top:10,width:'95%',height:'75%'}
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
	      'width':320,
        'height':375,
	      'pieHole':0.4,
	      'legend': {
	        position: 'bottom', alignment: 'start',
	        textStyle: { fontSize: 12 }
	      },
	      'chartArea': {left:10,top:10,width:'95%',height:'75%'}
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
  	console.log("enetering results page & loading charts ...");
  }

  public ionViewWillLeave(){
  	console.log("leaving results page ...");
  }

  downloadCSV(){
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

    var filename = this.survey_title + " - RESULTS.csv";
    // var filename = this.survey_title + " - RESULTS.xls"; // binary file format
    let blob = new Blob([csv]);
    // {type: 'application/octet-stream'}
    // { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' }

  	if (this.platform.is('android')) {
        console.log("ANDROID");

        let filePath = this.file.externalRootDirectory? this.file.externalRootDirectory : this.file.cacheDirectory;
        // let filePath = cordova.file.externalDataDirectory;

        this.file.writeFile(filePath, filename, blob, {replace: false}).then(()=> {
            console.log("Donwloaded: "+filePath);
        }).catch( err =>{
          console.log(err);
        });

        // FileSaver.saveAs(blob, filename);
    }else{
      console.log("NOTTTT ANDROID");

      // FileSaver.saveAs(blob, filename);
    }

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
