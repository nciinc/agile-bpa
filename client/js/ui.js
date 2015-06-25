/*
     __  ___  _____     _   _____  __    
  /\ \ \/ __\ \_   \   /_\ /__   \/ _\   
 /  \/ / /     / /\/  //_\\  / /\/\ \    
/ /\  / /___/\/ /_   /  _  \/ /   _\ \   
\_\ \/\____/\____/   \_/ \_/\/    \__/   
                                         
*/

// **********************************************************
// ui.js

var map;
var markers;
var states;
var ready = false;

var style_off = {
    fillColor: '#ffffff',
    fillOpacity: 0.0,
	color: '#ffffff',
    opacity: 0.0,
    weight: 1
};

var style_highlight_1 = {
    fillColor: '#00539B',
    fillOpacity: 0.5,
	color: '#00539B',
    opacity: 0.9,
    weight: 2
};
var style_highlight_2 = {
    fillColor: '#A3C658',
    fillOpacity: 0.5,
	color: '#A3C658',
    opacity: 0.9,
    weight: 2
};
var style_highlight_3 = {
    fillColor: '#E2C752',
    fillOpacity: 0.5,
	color: '#E2C752',
    opacity: 0.9,
    weight: 2
};

$(function() {
	
	// setup map
	L.mapbox.accessToken = 'pk.eyJ1IjoiY29tcHV0ZWNoIiwiYSI6ImMyMzI0YTkyYWNkODg5NjkzZjU3NTEzNjdiZmI3ZWViIn0.P_biJ0yDpChjDr9XccH5Bg';
	map = L.mapbox.map('map', 'computech.j86bnb99', {
		maxZoom: 19
	})
	.setView([40, -97], 3);
	
	// map controls
	L.control.scale({
		position: 'bottomleft'
	}).addTo(map);
	
	map.attributionControl.addAttribution('<a href="http://nciinc.com">NCI Inc.</a>');
	
	var map_street = L.mapbox.tileLayer('computech.j86bnb99').addTo(map);
	var map_sat = L.mapbox.tileLayer('computech.jh7ic2j0');
	var map_topo = L.mapbox.tileLayer('computech.jh7ih1gk'); 

	L.control.layers({
		'Street': map_street.addTo(map),
		'Satellite': map_sat,
		'Terrain': map_topo
	}, 
	{},
	{
		position: 'topleft'
	}).addTo(map);
	 
	// geocoder
	geocoder = L.mapbox.geocoder('mapbox.places-v1');

	
	// current location
	$('#btn-geo-current').click(function(event) {
		getCurrentLocation(false);
		return false;
	});

	// nationwide
	$("#btn-geo-nation").on("click", function() {
		setNationwide();
	});	
	
	// get current location
	//getCurrentLocation(true);	

	// load markers
	loadMarkers();
	
	// load states
	states = L.mapbox.featureLayer()
		.loadURL('/data/state.geojson')		
		.on('ready', readyState);
		
	//console.log('states.features.length : '+ states.features.length);
		
	// load charts
	loadCharts();
	
});

function loadCharts() {
	
	var class_url = '/api/count.json?count=class&food='+q_food+'&state='+q_state+'&date='+q_date+'&class='+q_class+'&status='+q_status;	
	console.log('class_url : '+ class_url);	
	$.ajax({
		type: 'GET',
		url: class_url,
		dataType: 'json',
		success: function(data) {

			//console.log('data : '+ JSON.stringify(data) );			
			setChartClass(data);
		}
	});
	
	var status_url = '/api/count.json?count=status&food='+q_food+'&state='+q_state+'&date='+q_date+'&class='+q_class+'&status='+q_status;	
	console.log('status_url : '+ status_url);	
	$.ajax({
		type: 'GET',
		url: status_url,
		dataType: 'json',
		success: function(data) {

			console.log('data : '+ JSON.stringify(data) );			
			setChartStatus(data);
		}
	});
	
	var date_url = '/api/count.json?count=date&food='+q_food+'&state='+q_state+'&date='+q_date+'&class='+q_class+'&status='+q_status;	
	console.log('date_url : '+ date_url);	
	$.ajax({
		type: 'GET',
		url: date_url,
		dataType: 'json',
		success: function(data) {

			console.log('data : '+ JSON.stringify(data) );			
			setChartDate(data);
		}
	});
	
}

function setChartDate(data) {
	
	var date_arr = [];
	
	for (var i = 0; i < data.results.date_count.length; i++) {
	
		var this_date = data.results.date_count[i][0];
		var format_date = Date.UTC(this_date.substring(0,4), this_date.substring(4,6), this_date.substring(6,8))
		console.log(this_date);
		
		console.log(this_date.substring(0,4));
		console.log(this_date.substring(4,6));
		console.log(this_date.substring(6,8));
		
		console.log(format_date);
		console.log(data.results.date_count[i][1]);
		//data.results.date
		
		date_arr.push([format_date, data.results.date_count[i][1]])
	
	}
	
	
	$('#chart-div-date').highcharts({
		
		title: {
            text: 'Recall Dates',
            x: -20 //center
        },
		credits: {
			enabled: false
		},
        xAxis: {
            type: 'datetime',
            title: {
                text: ''
            }
        },
        yAxis: {
            title: {
                text: 'Number of Recalls'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
		plotOptions: {
            spline: {
                marker: {
                    enabled: true
                }
            }
        },
        tooltip: {

        },
        series: [{
            name: 'Recalls',
            data: date_arr
        }]	
	
	});
	
}

function setChartStatus(data) {

	$('#chart-div-status').highcharts({
		chart: {
            type: 'bar',
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false
        },
        title: {
            text: 'Recall Status'
        },
		tooltip: {
			pointFormat: '{series.name}: <b>{point.y:.0f}</b>'
		},
		tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
            footerFormat: '</table>',
            //shared: true,
            useHTML: true
        },
		plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
		credits: {
			enabled: false
		},
        xAxis: {
            categories: ['']
        },
        yAxis: {
            title: {
                text: 'Recall Status'
            }
        },
        series: [{
            name: 'Ongoing',
            data: [data.results.ongoing]
        }, {
            name: 'Completed',
            data: [data.results.completed]
        }, {
            name: 'Terminated',
            data: [data.results.terminated]
        }]
	});		
}

function setChartClass(data) {

	$('#chart-div-class').highcharts({
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		credits: {
			enabled: false
		},
		title: {
			text: 'Recall Classification'
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false
				},
				showInLegend: true
			}
		},
		series: [{
			name: "Recalls",
			colorByPoint: true,
			innerSize: '50%',
			data: [{
				name: "Class I",
				y: data.results.class1
			}, {
				name: "Class II",
				y: data.results.class2
			}, {
				name: "Class III",
				y: data.results.class3
			}]
		}]
	});		
}

function readyState() {
	states.setStyle(style_off).addTo(map);
	ready = true;
}

function highlightState(states_array, classification) {
	//console.log('states.features.length : '+ states.features.length);
	//console.log('states : '+ JSON.stringify(states) );
	if (ready) {
		states.setStyle(style_off);
		
		states.eachLayer(function(layer) {			

			var layer_state = layer.feature.properties.STUSPS;	
			 
			var high_style = style_highlight_1;
			if (classification == "Class I") {
				high_style = style_highlight_1;
			}
			else if (classification == "Class II") {
				high_style = style_highlight_2;
			}
			else if (classification == "Class III") {
				high_style = style_highlight_3;
			}
			
			if ($.inArray( layer_state, states_array ) >= 0) {
				layer.setStyle(high_style);
			}
			/*
			else {
				layer.setStyle(style_off);
			}
			*/		 
		});		
	}
}

var q_food = '';
var q_state = '';
var q_date = '';
var q_class = '';
var q_status = '';

$("#select_food").on("change", function() {
	q_food = $("#select_food").val();
	loadMarkers();	
	loadCharts();
});	

$("#select_state").on("change", function() {
	q_state = $("#select_state").val();
	loadMarkers();	
	loadCharts();
});	

$("#select_date").on("change", function() {
	q_date = $("#select_date").val();
	loadMarkers();	
	loadCharts();
});	

$("#select_class").on("change", function() {
	q_class = $("#select_class").val();
	loadMarkers();	
	loadCharts();
});

$("#select_status").on("change", function() {
	q_status = $("#select_status").val();
	loadMarkers();	
	loadCharts();
});		

var data_json;
var selected_json;

function loadMarkers() {
		
	var api_url = '/api/search.json?food='+q_food+'&state='+q_state+'&date='+q_date+'&class='+q_class+'&status='+q_status;
	
	//console.log('api_url : '+ api_url);
	
	$.ajax({
		type: 'GET',
		url: api_url,
		dataType: 'json',
		success: function(data) {

			//console.log('data : '+ JSON.stringify(data) );
			
			data_json = data;
			
			setMarkers();

		}
	});

}

function getIconColor(m_class) {
    var m_color = '#FAF75C';
    if (m_class == 'Class I') { m_color = '#00539B'; }
    if (m_class == 'Class II') { m_color = '#A3C658'; }
    if (m_class == 'Class III') { m_color = '#E2C752'; }
    
    return m_color;
}

function getIconSymbol(m_status) {
    var m_symbol = 'circle-stroked';
    if (m_status == 'Ongoing') { m_symbol = 'circle-stroked'; }
    if (m_status == 'Terminated') { m_symbol = 'cross'; }
    if (m_status == 'Completed') { m_symbol = 'circle'; }
    
    return m_symbol;
}


function setMarkers() {
	
	//console.log('data_json.results : '+ JSON.stringify(data_json.results) );
	
	
	if (markers) {
		map.removeLayer(markers);
	}
	
	//map.removeLayer(markers);
	//markers = L.layerGroup();
	
	markers = L.mapbox.featureLayer();
	//markers.addLayer(marker);
	//markerGroup.removeLayer(marker);
	
	if (data_json.results) {
	
		
		for (var i = 0; i < data_json.results.length; i++) {
		
			try {
				var m_lat = data_json.results[i].recall_location.lat;
				var m_lon = data_json.results[i].recall_location.long;
                
                var m_class = data_json.results[i].classification;
                var m_status = data_json.results[i].status;
                
                var m_icon = L.mapbox.marker.icon({
                    'marker-color': getIconColor(m_class),
                    'marker-size': 'medium',
                    'marker-symbol': getIconSymbol(m_status)
                });
                                
                //console.log('m_icon : '+ JSON.stringify(m_icon.options) );
				
				var result_json = data_json.results[i];
				
				if ((m_lat != 0) && (m_lon != 0)) {
				
					//console.log('lat : '+ JSON.stringify(lat) );		
					
					var new_marker = L.marker([m_lat,m_lon], data_json.results[i])
						.on('click',function(e) {
						
							//console.log('this : '+ JSON.stringify(this.options) );
							
							selected_json = this.options;
                            
                            var c_class = selected_json.classification;
                            var c_status = selected_json.status;
                            
                            //console.log('c_class : '+ c_class );	
                            //console.log('c_status : '+ c_status );	
                            
                            markers.eachLayer(function(marker) {

                                //console.log('marker !!!!!!! : '+ JSON.stringify(marker.options.icon.options) );
                                
                                var reset_marker = marker.options.icon.options;
                                
                                //console.log('reset_marker !!!!!!! : '+ JSON.stringify(reset_marker) );
                                
                                reset_marker.iconSize = [30,70];
                                reset_marker.iconAnchor = [15,35];
                                reset_marker.popupAnchor = [0,-35];
                                
                                marker.setIcon(L.icon(
                                    reset_marker
                                ));
                                
                            });
                            
                            this.setIcon(L.mapbox.marker.icon({
                                'marker-color': getIconColor(c_class),
                                'marker-size': 'large',
                                'marker-symbol': getIconSymbol(c_status)
                            }));
                            
							clickMarkers();							
					
						});
                    
                    new_marker.setIcon(m_icon);
                    
						//.addTo(map);
						
					markers.addLayer(new_marker);
				}
			}
			catch(err) {			
			}
		}
		
		markers.addTo(map);
		
	}
}

function clickMarkers() {
	
	//console.log('selected_json : '+ JSON.stringify(selected_json) );	
	
	$("#api_recall_number").text(selected_json.recall_number);
	$("#api_recalling_firm").text(selected_json.recalling_firm);
	$("#api_product_description").text(selected_json.product_description);
	$("#api_reason_for_recall").text(selected_json.reason_for_recall);
	$("#api_status").text(selected_json.status);
	$("#api_classification").text(selected_json.classification);
	$("#api_distribution_pattern").text(selected_json.distribution_pattern);
	$("#api_product_quantity").text(selected_json.product_quantity);
	$("#api_recall_initiation_date").text(selected_json.recall_initiation_date);
	$("#api_report_date").text(selected_json.report_date);
	$("#api_population_census").text(selected_json.affected_population_census);
	
	highlightState(selected_json.affected_state, selected_json.classification);
	
	//$("#api_crowdsource").text(selected_json.api_recall_initiation_date);
}

function setNationwide() {
	map.setView([40, -97], 3);
}

function getCurrentLocation(load) {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;

			map.setView([lat, lon], 10);

		}, function(error) { 
			if (load) {	
				setNationwide();
			}
			else {
				alert('Current location not found.');
			}
		}, {
			timeout: 4000
		});
	} 
	else {
		if (load) {	
			setNationwide();
		}
		else {
			alert('Current location not found.');
		}
	}
	return false;
}












 

