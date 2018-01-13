//configuration
var backendUrl = TOSConfig.php.analytics.url;
if(TOSConfig.language == 'nodeJs') {
    backendUrl = TOSConfig.nodeJs.analytics.url;
}

console.log('At analytics : ' + backendUrl);

/**
 * [padLeft description]
 * @param  {[type]} base [description]
 * @param  {[type]} chr  [description]
 * @return {[type]}      [description]
 */
Number.prototype.padLeft = function(base, chr){
   var  len = (String(base || 10).length - String(this).length)+1;
   return len > 0? new Array(len).join(chr || '0')+this : this;
}

/**
 * [formatDate description]
 * @param  {[type]} dateString [description]
 * @return {[type]}            [description]
 */
function formatDate(dateString) {
    var d = new Date(dateString),
    dformat = [ (d.getMonth()+1).padLeft(),
                d.getDate().padLeft(),
                d.getFullYear()].join('/')+
                ' ' +
              [ d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft()].join(':');
    return dformat;
}

function makeRequest(querystring) {
	var requestUrl = backendUrl;
	if(querystring) {
		requestUrl += '?' + querystring;
	}

	queue()
	    .defer(d3.json, requestUrl)
	    //.defer(d3.json, backendUrl)
	    .await(makeGraphs);
}

makeRequest();


function makeGraphs(error, dataSet) {console.log(dataSet)

	if(!dataSet || !dataSet.length) {
		//No data to show. Display dialog.
		$('#messageDialog').dialog({
            modal: true,
            title: "Reports Message",
           	width: 300,
            height: 150,
            open: function (event, ui) {
                setTimeout(function () {
                    $('#messageDialog').dialog('close');
                }, 3000);
            }
        });

		return false;
	}

	//checkyy(apiData);

	urlPopularity(dataSet);
	
	//var dataSet = apiData;
	//d3.time.format("%Y-%m-%d %H:%M:%S");  another format...
	var dateFormat = d3.time.format("%m/%d/%Y %H:%M:%S");
	dataSet.forEach(function(d) {
		d.entry_time = dateFormat.parse(formatDate(d.entry_time));

		d.tos_user_id = d.tos_user_id ? (d.tos_user_id == 'anonymous' ? 'anonymous' : 'authenticated') : 'anonymous';
		//d.total_donations = +d.total_donations;
	});

	//var originalData = dataSet;
	//console.log(dataSet)
	
	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var dateTracked = ndx.dimension(function(d) {
		return d3.time.day(d.entry_time);
		//return d.entryTime;
	});
	// var gradeLevel = ndx.dimension(function(d) { return d.grade_level; });
	var pageTitle = ndx.dimension(function(d) { return d.title; });
	
	// var povertyLevel = ndx.dimension(function(d) { return d.poverty_level; });
	
	// var totalDonations  = ndx.dimension(function(d) { return d.total_donations; });


	//Calculate metrics
	var viewsByDate = dateTracked.group();
	// var projectsByGrade = gradeLevel.group(); 
	var viewsByPageTitle = pageTitle.group();
	
	// var projectsByPovertyLevel = povertyLevel.group();
	

	var all = ndx.groupAll();

	//Calculate Groups
	// var totalDonationsState = state.group().reduceSum(function(d) {
	// 	return d.total_donations;
	// });

	// var totalDonationsGrade = gradeLevel.group().reduceSum(function(d) {
	// 	return d.grade_level;
	// });

	// var totalDonationsFundingStatus = fundingStatus.group().reduceSum(function(d) {
	// 	return d.funding_status;
	// });



	//var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});

	//Define threshold values for data
	var minDate = dateTracked.bottom(1)[0].entry_time;
	var maxDate = dateTracked.top(1)[0].entry_time;

	console.log('Date chart min, max values...');
	console.log(minDate);
	console.log(maxDate);

    //Charts
	var dateChart = dc.lineChart("#date-chart");
	// var gradeLevelChart = dc.rowChart("#grade-chart");
	var pageTitleChart = dc.rowChart("#resource-chart");
	
	// var povertyLevelChart = dc.rowChart("#poverty-chart");
	var totalViews = dc.numberDisplay("#total-views");
	// var netDonations = dc.numberDisplay("#net-donations");
	

 //  selectField = dc.selectMenu('#menuselect')
 //        .dimension(state)
 //        .group(TOSSessionKeyGroup); 

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


	totalViews
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	// netDonations
	// 	.formatNumber(d3.format("d"))
	// 	.valueAccessor(function(d){return d; })
	// 	.group(netTotalDonations)
	// 	.formatNumber(d3.format(".3s"));

	var newDateFormat = d3.time.format("%a %e %b %H:%M");

	dateChart
		//.width(600)
		.height(220)
		//.height(400)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(dateTracked)
		.group(viewsByDate)
		//.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.brushOn(false)
	    .title(function(d) {
	    	//console.log(d.key);
			return newDateFormat(d.key) + '\nNumber of Events: ' + d.value;
		})
		.elasticY(false)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel('Year')
		.yAxisLabel('Views')
		.yAxis().tickFormat(d3.format('.3s'))







	// setTimeout(function() {
	// 	console.error('going to call....');

	// 	//dateChart.filter(null);
	// 	// dateChart.filterAll();
	// 	// dateChart.filter(dc.filters.RangedFilter(new Date(2017, 3, 5), new Date(2017, 6, 5)));
	// 	dateTracked.filter(dc.filters.RangedFilter(new Date(2017, 1, 1), new Date(2017, 2, 25)));
	// 	var minDate = dateTracked.bottom(1)[0].entryTime;
	// 	var maxDate = dateTracked.top(1)[0].entryTime;
	// 	console.log(minDate)
	// 	console.log(maxDate)

	// dateChart
	// 	//.width(600)
	// 	.height(220)
	// 	//.height(400)
	// 	.margins({top: 10, right: 50, bottom: 30, left: 50})
	// 	.dimension(dateTracked)
	// 	.group(viewsByDate)
	// 	//.renderArea(true)
	// 	.transitionDuration(500)
	// 	.x(d3.time.scale().domain([minDate, maxDate]))
	// 	.brushOn(false)
	//     .title(function(d) {
	//     	//console.log(d.key);
	// 		return newDateFormat(d.key) + '\nNumber of Events: ' + d.value;
	// 	})
	// 	.elasticY(false)
	// 	.renderHorizontalGridLines(true)
 //    	.renderVerticalGridLines(true)
	// 	.xAxisLabel('Year')
	// 	.yAxisLabel('Views')
	// 	.yAxis().tickFormat(d3.format('.3s'))



	// 	dateChart.redraw();

	// 	//dc.redrawAll();
	// }, 8000);
	














	pageTitleChart
        //.width(300)
        .height(220)
        .dimension(pageTitle)
        .group(viewsByPageTitle)
        .elasticX(true)
        .xAxis().ticks(5);

	// povertyLevelChart
	// 	//.width(300)
	// 	.height(220)
 //        .dimension(povertyLevel)
 //        .group(projectsByPovertyLevel)
 //        .xAxis().ticks(4);

	// gradeLevelChart
	// 	//.width(300)
	// 	.height(220)
 //        .dimension(gradeLevel)
 //        .group(projectsByGrade)
 //        .xAxis().ticks(4);

  
          
 	var userType = ndx.dimension(function(d) { return d.tos_user_id; });
    var projectsByUserType = userType.group();
	var userTypeChart = dc.pieChart("#auth-anonymous-chart");

	userTypeChart
            .height(220)
            //.width(350)
            .radius(90)
            //.slicesCap(4)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(userType)
            .group(projectsByUserType)
		    .legend(dc.legend().x(250).y(100)) //LEGEND CODE
    		// .title(function(d){
    		// 	//console.log(d);
    		// 	//return d.geo;
    		// });

    dc.renderAll();

};


/**
 * [getMaxOfArray description]
 * @param  {[type]} arr [description]
 * @return {[type]}     [description]
 */
function getMaxOfArray(arr) {
  return Math.max.apply(null, arr);
}

/**
 * [secondToDuration description]
 * @param  {[type]} sec [description]
 * @return {[type]}     [description]
 */
function secondToDuration(sec) {
  return (parseInt(sec / 86400) + 'd ' + (new Date(sec%86400*1000)).toUTCString().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/, "$1h $2m $3s"));
}

/**
 * [getBigSessionByUrl description]
 * @param  {[type]} url     [description]
 * @param  {[type]} dataArr [description]
 * @return {[type]}         [description]
 */
function getBigSessionByUrl(url, dataArr) {
	var TOPRawArr = [], viewCounter = 0;
	for(var j =0; j < dataArr.length; j++) {
		if(dataArr[j].URL == url) {
			++viewCounter;
			TOPRawArr.push(dataArr[j].timeOnPage);
		}
	}

	TOPRawArr.sort(function(a, b) {
	  return a - b;
	});

	return {
		viewCount: viewCounter,
		bigSession: TOPRawArr[TOPRawArr.length - 1]
	};

}


/**
 * [urlPopularity description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
var datatable   = dc.dataTable("#dc-data-table");
function urlPopularity(data) {
	//console.log('*');console.log(data);
	var uniqueUrlArray,
		titleArr = [], 
		bigPageSession = [], 
		TOPArr = [],
		viewCount = [];
		UrlArr = [],
		UrlDataArr = [];

	data.map(function(d){
		UrlArr.push(d.url);
		UrlDataArr.push({
			URL: d.url,
			title: d.title,
			timeOnPage: d.timeonpage
		});
	});

	// uniqueUrlArray = UrlArr.filter(function(item, pos) {
	//     return UrlArr.indexOf(item) == pos;
	// });
	
	uniqueUrlArray = UrlArr.filter(function(item, pos) {
	    if(UrlArr.indexOf(item) == pos) {
	    	titleArr.push(UrlDataArr[pos].title);

	    	// *** TEMP ***
	    	//bigPageSession.push(UrlDataArr[pos].timeOnPage)
	    	// console.log('**');
	    	// console.log(UrlDataArr);
	    	// *** TEMP ***

	    	return true;
	    };
	});

	for(var i =0; i < uniqueUrlArray.length; i++) {
		var sessionData = getBigSessionByUrl(uniqueUrlArray[i], UrlDataArr);
		TOPArr.push(sessionData.bigSession);
		viewCount.push(sessionData.viewCount);
	}

	//console.log(TOPArr);
	

	var newData = [];
	for(var i = 0; i < uniqueUrlArray.length; i++) {
		var tempArr = [];
		for(var j =0; j < UrlDataArr.length; j++) {
			if(uniqueUrlArray[i] == UrlDataArr[j].URL) {
				tempArr.push(UrlDataArr[j].timeOnPage);
			}
		}
		//var max = getMaxOfArray(tempArr);

		var sum = 0;
		tempArr.map(function(item){ sum += item; }); 

		newData.push({
			URL: uniqueUrlArray[i],
			title: titleArr[i],
			timeOnPage: sum,
			pageViews: viewCount[i],
			bigPageSession: secondToDuration(TOPArr[i]),
			duration: secondToDuration(sum)
		});
	

	

	}
	//console.log(newData);

	var ndx = crossfilter(newData);
	window.TimeOnSiteVars = {};
	window.TimeOnSiteVars.ndx = ndx;

	var urlDim = ndx.dimension(function(d) {return d.URL;});

	datatable
	    .dimension(urlDim)
	    .group(function(d) {
	    	return "Page Popularity Table"
     	})
	    .size(newData.length)
	    // dynamic columns creation using an array of closures
	    .columns([
	    	{
		        label: "Page Url",
		        format: function (d) { return d.URL; }
		    },
		    {
		        label: "Title",
		        format: function (d) { return d.title; }
		    },
		    {
		        label: "Seconds",
		        format: function (d) { return d.timeOnPage; },
		    },
		    {
		    	label: "Page views",
		    	format: function(d) { return d.pageViews; }
		    },
		    {
		        label: "Large Session",
		        format: function (d) { return d.bigPageSession; }
		    },
		    {
		        label: "Duration",
		        format: function (d) { return d.duration; }
		    },
	        // function(d) { return d.URL; },
	        // function(d) {return d.timeOnPage;}
	    ])
	    .sortBy(function(d) {
	        return d.timeOnPage;
	    })
	    .order(d3.descending);

	    updatePagePopularity(ndx);
    	datatable.render();
    	
}

var ofs = 0, //inital offset value for pagination
	pag = 20; //records limit in pagination
/**
 * [displayPagePopularity Updates 'previous' and 'next' button in page popularity table]
 * @param  {[object]} ndx [crossfilter ndx]
 * @return void
 */
function displayPagePopularity(ndx) {
	d3.select('#begin')
		.text(ofs);
	d3.select('#end')
		.text(ofs+pag-1);
	d3.select('#previous')
		.attr('disabled', ofs-pag<0 ? 'true' : null);
	d3.select('#next')
		.attr('disabled', ofs+pag>=ndx.size() ? 'true' : null);
	d3.select('#size').text(ndx.size());
}

/**
 * [updatePagePopularity description]
 * @param  {[object]} ndx [crossfilter ndx]
 * @return void
 */
function updatePagePopularity(ndx) {
	if(ndx) {
		datatable.beginSlice(ofs);
		datatable.endSlice(ofs+pag);
		displayPagePopularity(ndx);
	}
}

/**
 * [nextPagePopularity next button counter incrementer in page popularity table]
 * @return void
 */
function nextPagePopularity() {
	ndx = window.TimeOnSiteVars.ndx;
	if(ndx) {
		ofs += pag;
		updatePagePopularity(datatable, ndx);
		datatable.redraw();
	}
}

/**
 * [previousPagePopularity previous button counter decrementor in page popularity table]
 * @return void
 */
function previousPagePopularity() {
	ndx = window.TimeOnSiteVars.ndx;
	if(ndx) {
		ofs -= pag;
		updatePagePopularity(datatable, ndx);
		datatable.redraw();
	}
}



















/**
 * [checkyy description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function checkyy(data){
	//console.log('*');console.log(data);
	var uniqueSessionArray,
		sessionArr = [],
		sessionTOSArr = [];

	data.map(function(d){
		sessionArr.push(d.TOSSessionKey);
		sessionTOSArr.push({
			TOSSessionKey: d.TOSSessionKey,
			timeOnSite: d.timeOnSite
		});
	});

	uniqueSessionArray = sessionArr.filter(function(item, pos) {
	    return sessionArr.indexOf(item) == pos;
	});

	var newData = [],
		sa = 0;
	for(var i = 0; i < uniqueSessionArray.length; i++) {
		var tempArr = [];
		for(var j =0; j < sessionTOSArr.length; j++) {
			if(uniqueSessionArray[i] == sessionTOSArr[j].TOSSessionKey) {
				tempArr.push(sessionTOSArr[j].timeOnSite);
			}
		}
		var max = getMaxOfArray(tempArr);

		newData.push({
			//TOSSessionKey: uniqueSessionArray[i],
			TOSSessionKey: ++sa,
			timeOnSite: max
		});
		
	}
	console.log(newData);

	var dataSet = newData;
	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);
	
	
	var timeOnSite = ndx.dimension(function(d) { return d.timeOnSite; });
	var TOSSessionKey = ndx.dimension(function(d) { return d.TOSSessionKey; });

	var TOSSessionKeyGroup = TOSSessionKey.group();
	var viewsByTimeOnSite = timeOnSite.group();

	var totalDonationsState = TOSSessionKey.group().reduceSum(function(d) {
		//console.log(d);
		return d.timeOnSite;
	});

	
	

	// var all = ndx.groupAll();

	// var stateDonations = dc.barChart("#state-donations");

 // stateDonations
 //    	//.width(800)
 //        .height(220)
 //        .transitionDuration(1000)
 //        .dimension(TOSSessionKey)
 //        .group(totalDonationsState)
 //        .margins({top: 10, right: 50, bottom: 30, left: 50})
 //        .centerBar(false)
 //        .gap(5)
 //        .elasticY(true)
 //        .x(d3.scale.ordinal().domain(TOSSessionKey))
 //        .xUnits(dc.units.ordinal)
 //        .renderHorizontalGridLines(true)
 //        .renderVerticalGridLines(true)
 //        .ordering(function(d){return d.value;})
 //        .yAxis().tickFormat(d3.format("s"));


    

	// 	    userTypeChart.render();

	// console.log('***');console.log(uniqueSessionArray);
	// console.log(sessionTOSArr);
}










/**
 * Datepicker configuration
 *	https://api.jqueryui.com/datepicker/
 */
$(document).ready(function() {
	var startDate=null,
		endDate=null;

	$("#datepickerPageEntry, #datepickerPageExit").datepicker({
	    autoSize: true,
	    changeMonth: true,
	    changeYear: true,
	    dateFormat: 'yy-mm-dd',
	    showAnim: 'fold',
	    showButtonPanel: true,

	    onSelect: function(date) {

	    	if($(this).attr('id') && $(this).attr('id') == 'datepickerPageEntry' && date) {
	    		startDate = date;
	    	} else if($(this).attr('id') && $(this).attr('id') == 'datepickerPageExit' && date) {
	    		endDate = date;
	    	}

	    	if(startDate && endDate) {
    			var qs = 'startDate=' + startDate + '&endDate=' + endDate;
    			makeRequest(qs);
    		}
		},
	});
});
