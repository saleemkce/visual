//configuration
var backendUrl = TOSConfig.php.analytics.url;
if(TOSConfig.language == 'nodeJs') {
    backendUrl = TOSConfig.nodeJs.analytics.url;
}

console.log('At analytics : ' + backendUrl);

/**
 * [padLeft It performs left padding in given string]
 */
Number.prototype.padLeft = function(base, chr) {
   var  len = (String(base || 10).length - String(this).length)+1;
   return len > 0? new Array(len).join(chr || '0')+this : this;
}

/**
 * [formatDate It formats given date like "2000-01-04 21:48:48.344"]
 * @param  {[string]} dateString [the date string]
 * @return {[string]}            [the formatted datetime value]
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

/**
 * [makeRequest It makes HTTP request to fetch data to be used in creating charts]
 * @param  {[string]} querystring [the query string]
 * @return {[void]}
 */
function makeRequest(querystring) {
	var requestUrl = backendUrl;
	if(querystring) {
		requestUrl += '?' + querystring;
	}

	queue()
	    .defer(d3.json, requestUrl)
	    .await(makeCharts);
}

// Make request and initiate data visualization
makeRequest();

/**
 * [makeCharts It uses the dataset to create charts]
 * @param  {[object]} error   [the error response]
 * @param  {[array]} dataSet [the dataset]
 * @return {[void]}
 */
function makeCharts(error, dataSet) {console.log(dataSet)

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

	recentSessionsChart(dataSet);

	urlPopularity(dataSet);
	
	//var dataSet = apiData;
	//d3.time.format("%Y-%m-%d %H:%M:%S");  another format...
	var dateFormat = d3.time.format("%m/%d/%Y %H:%M:%S");
	dataSet.forEach(function(d) {
		d.entry_time = dateFormat.parse(formatDate(d.entry_time));
		d.tos_user_id = d.tos_user_id ? (d.tos_user_id == 'anonymous' ? 'anonymous' : 'authenticated') : 'anonymous';
	});
	
	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var dateTracked = ndx.dimension(function(d) {
		return d3.time.day(d.entry_time);
		//return d.entry_time;
	});
	var pageTitle = ndx.dimension(function(d) { return d.title; });

	//Calculate metrics
	var viewsByDate = dateTracked.group();
	var viewsByPageTitle = pageTitle.group();
	
	var all = ndx.groupAll();

	//Define threshold values for data
	var minDate = dateTracked.bottom(1)[0].entry_time;
	var maxDate = dateTracked.top(1)[0].entry_time;

	console.log('Date chart min, max values...');
	console.log(minDate);console.log(maxDate);

    //Charts
	var dateChart = dc.lineChart("#date-chart");
	var pageTitleChart = dc.rowChart("#page-title-chart");
	var totalViews = dc.numberDisplay("#total-views");

   	dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);

    /* total views rendering */
	totalViews
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	var newDateFormat = d3.time.format("%a %e %b %H:%M");
	/* date chart renderer */
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
		.yAxis().tickFormat(d3.format('.3s'));


	/* page title chart renderer */
	pageTitleChart
        //.width(300)
        .height(220)
        .dimension(pageTitle)
        .group(viewsByPageTitle)
        .elasticX(true)
        .xAxis().ticks(5);
          
 	var userType = ndx.dimension(function(d) { return d.tos_user_id; });
    var userTypeGroup = userType.group();
	var userTypeChart = dc.pieChart("#auth-anonymous-chart");
	/* user type chart renderer */
	userTypeChart
            .height(220)
            //.width(350)
            .radius(90)
            //.slicesCap(4)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(userType)
            .group(userTypeGroup)
		    .legend(dc.legend().x(250).y(100)) //LEGEND CODE
    		// .title(function(d){
    		// 	//console.log(d);
    		// 	//return d.geo;
    		// });

    dc.renderAll();
};


/**
 * [getMaxOfArray It finds the large value in array]
 * @param  {[array]} arr [the array of numerical values]
 * @return {[integer]}
 */
function getMaxOfArray(arr) {
  return Math.max.apply(null, arr);
}

/**
 * [secondToDuration It converts seconds to readable format]
 * @param  {[integer]} sec [time in seconds]
 * @return {[string]} [formatted duration e.g, 0d 00h 00m 00s]
 */
function secondToDuration(sec) {
  return (parseInt(sec / 86400) + 'd ' + (new Date(sec%86400*1000)).toUTCString().replace(/.*(\d{2}):(\d{2}):(\d{2}).*/, "$1h $2m $3s"));
}

/**
 * [getBigSessionByUrl It computes large session by URL]
 * @param  {[string]} url     [page URL]
 * @param  {[array]} dataArr [given dataset]
 * @return {[object]}         [data for large session]
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

//data table chart
var datatable = dc.dataTable("#dc-data-table");

/**
 * [urlPopularity It computes page popularity by URL]
 * @param  {[array]} the dataset
 */
function urlPopularity(data) {
	//console.log('*');console.log(data);
	var uniqueUrlArray,
		titleArr = [],
		TOPArr = [],
		viewCount = [];
		UrlArr = [],
		UrlDataArr = [];

	data.map(function(d) {
		UrlArr.push(d.url);
		UrlDataArr.push({
			URL: d.url,
			title: d.title,
			timeOnPage: d.timeonpage
		});
	});
	
	uniqueUrlArray = UrlArr.filter(function(item, pos) {
	    if(UrlArr.indexOf(item) == pos) {
	    	titleArr.push(UrlDataArr[pos].title);
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
	    	return '';
	    	//return 'Page Popularity Table';
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
		    // {
		    //     label: "Seconds",
		    //     format: function (d) { return d.timeOnPage; },
		    // },
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
 * [updatePagePopularity It reassigns previous and next pages in chart and updates it]
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
 * [secondsToMinutesAdjuster converts seconds to minutes, rounding the value and rasie to 1 minute
 * that are less than 60 seconds]
 * @param  {[array]} arr [simplified tos and session key array]
 * @return {[array]}     [formatted array]
 */
function secondsToMinutesAdjuster(arr) {
	arr.forEach(function(item, index) {
		// Raise second parameter to 1 minute that are lesser than 60 seconds.
		if(item.timeOnSite < 60) {
			item.timeOnSite = 60;
		}

		//convert seconds to minutes and round the value.
		item.timeOnSite = Math.round((item.timeOnSite / 60));
	});

	return arr;
}

/**
 * [recentSessionsChart computes session duration]
 * @param  {[array]} the dataset
 */
function recentSessionsChart(data) {//console.log(data);
	var uniqueSessionArray,
		sessionArr = [],
		sessionTOSArr = [];

	data.map(function(d){
		sessionArr.push(d.tos_session_key);
		sessionTOSArr.push({
			TOSSessionKey: d.tos_session_key,
			timeOnSite: d.timeonsite
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
			TOSSessionKey: uniqueSessionArray[i],
			timeOnSite: max,
			alternateIndex: (++sa)
		});	
	}

	//console.log(uniqueSessionArray);
	//console.log(sessionTOSArr);

	newData = secondsToMinutesAdjuster(newData);

	var dataSet = newData;

	/* Limit no. of sessions shown */
	var sessionsLimit = 75; //recent 75 sessions
	if(dataSet && dataSet.length > sessionsLimit) {
		dataSet = dataSet.slice(0, sessionsLimit);
	}

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);
	
	var timeOnSite = ndx.dimension(function(d) { return d.timeOnSite; });
	var TOSSessionKey = ndx.dimension(function(d) { return d.alternateIndex; });

	var TOSSessionKeyGroup = TOSSessionKey.group();
	var viewsByTimeOnSite = timeOnSite.group();

	var totalSessionDuration = TOSSessionKey.group().reduceSum(function(d) {
		return d.timeOnSite;
	});

	var all = ndx.groupAll();

	var sessionsChart = dc.barChart("#sessions-chart");

 	sessionsChart
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(TOSSessionKey)
        .group(totalSessionDuration)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(TOSSessionKey))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .xAxisLabel('Recent ' + sessionsLimit + ' sessions')
		.yAxisLabel('Duration (TOS)')
        .yAxis().tickFormat(d3.format("s"));

	sessionsChart.render();
}



/**
 * Datepicker configuration
 *	https://api.jqueryui.com/datepicker/
 */
$(document).ready(function() {
	var startDate = null,
		endDate = null;

	$("#datepickerPageEntry, #datepickerPageExit").datepicker({
	    autoSize: true,
	    changeMonth: true,
	    changeYear: true,
	    dateFormat: 'yy-mm-dd',
	    showAnim: 'fold',
	    //showButtonPanel: true,

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

	$('#resetAll').on('click', function() {
		//clear date filters
		$('#datepickerPageEntry').val('');
        $('#datepickerPageExit').val('');
        startDate = null;
        endDate = null;

        makeRequest();
	});
});
