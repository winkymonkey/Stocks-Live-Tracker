$(document).ready(function() {
    let mapping = {
    	'tumpu': {
	        '01.DEBT_SBI': 'https://api.mfapi.in/mf/119824',
	        '02.SMALL_NIPPON': 'https://api.mfapi.in/mf/118778',
	        '03.SMALL_SBI': 'https://api.mfapi.in/mf/125497',
	        '04.SMALL_HDFC': 'https://api.mfapi.in/mf/130503',
	        '05.FLEXI_KOTAK': 'https://api.mfapi.in/mf/120166',
	        '06.FLEXI_PARAG': 'https://api.mfapi.in/mf/122639',
	        '07.FLEXI_UTI': 'https://api.mfapi.in/mf/120662',
	        '08.FLEXI_MOTILAL': 'https://api.mfapi.in/mf/129046',
	        '09.LARGE_SBI (R)': 'https://api.mfapi.in/mf/103504',
	        '10.HYBRID_ICICI': 'https://api.mfapi.in/mf/120251'
    	},
    	'maa': {
    		'01.DEBT_SBI': 'https://api.mfapi.in/mf/119824',
    		'02.SMALL_NIPPON': 'https://api.mfapi.in/mf/118778',
    		'03.SMALL_HDFC': 'https://api.mfapi.in/mf/130503',
    		'04.FLEXI_KOTAK': 'https://api.mfapi.in/mf/120166',
    		'05.FLEXI_PARAG': 'https://api.mfapi.in/mf/122639',
            '06.FLEXI_UTI': 'https://api.mfapi.in/mf/120662',
    		'07.FLEXI_MOTILAL': 'https://api.mfapi.in/mf/129046',
    		'08.LARGE_SBI': 'https://api.mfapi.in/mf/119598',
    		'09.HYBRID_ICICI': 'https://api.mfapi.in/mf/120251'
    	},
        'ria': {
            '01.DEBT_SBI': 'https://api.mfapi.in/mf/119824',
            '02.SMALL_AXIS': 'https://api.mfapi.in/mf/125354',
            '03.SMALL_SBI': 'https://api.mfapi.in/mf/125497',
            '04.FLEXI_UTI': 'https://api.mfapi.in/mf/120662',
            '05.FLEXI_PARAG': 'https://api.mfapi.in/mf/122639'
        }
    };
    
    $('#date_picker').datepicker({
        changeMonth: true,
        changeYear: true,
        'dateFormat': 'dd-mm-yy',
        'minDate': new Date('January 29, 2013'),
        'beforeShowDay': $.datepicker.noWeekends
    });
    
    
	$(document).ajaxSend(function() {
		addOverlay();
	});


    $('#how_many_days').on('focusin', function() {
        $('#how_many_days').prop('readonly',false);
        $('#dayCountSubmit').prop('disabled',false);
        $('#date_picker').val("");
        $('#date_picker').prop('readonly',true);
        $('#dateSubmit').prop('disabled',true);
    });
    $('#date_picker').on('focusin', function() {
        $('#date_picker').prop('readonly',false);
        $('#dateSubmit').prop('disabled',false);
        $('#how_many_days').val("");
        $('#how_many_days').prop('readonly',true);
        $('#dayCountSubmit').prop('disabled',true);
    });

    
    $('#how_many_days').on('focusout', function() {
        clipInput($(this));
    });
    
    $('#dayCountSubmit').click(function() {
    	if (isValidMultiDayTracker()) {
    		generateMultiDayTracker();
    	}
    });
    
    $('#dateSubmit').click(function() {
    	if (isValidOneDayTracker()) {
    		generateOneDayTracker();
    	}
    });
    
    
    
    
    // BUSINESS FUNCTIONS
    function generateMultiDayTracker() {
    	let myInvestor = $("input[name='investorName']:checked").val();
    	try {
	    	$('#records_table').empty();
	    	$('#date_picker').val('');
	    	let dayCount = $('#how_many_days').val();
	    	
	    	let promises = [];
	    	let responseArr = [];
	    	
	    	for (key in mapping[myInvestor]) {
	    		let fundName = key;
	    		let endpoint = mapping[myInvestor][key];
	    		var settings = {
	                'url': endpoint,
	                'method': 'GET',
	                'timeout': 0,
	            };
	    		var request = $.ajax(settings).done(function (response) {
	    			let obj = {
	    				'fundName':fundName, 
	    				'data':response.data
	    			};
	    			responseArr.push(obj);
	    		})
	    		.error(function () {
	    			console.log('error fetching data for fundName='+fundName);
	    			flashErrorMsg();
	        		removeOverlay();
	    		});
	    		promises.push(request);
	    	}
    		
	    	$.when.apply(null, promises).done(function() {
	    		responseArr.sort(compare);
	        	console.log(responseArr);
	        	processResponse(responseArr, dayCount);
	        	removeOverlay();
	        });
    	}
    	catch (err) {
    		console.error('error in generateMultiDayTracker'+err);
    		flashErrorMsg();
    		removeOverlay();
    	}
    }
    
    
    function generateOneDayTracker() {
    	let myInvestor = $("input[name='investorName']:checked").val();
    	try {
	    	$('#records_table').empty();
	        $('#how_many_days').val('');
	        let mydate = $('#date_picker').val();
	        
	        let promises = [];
	    	let responseArr = [];
	    	
	    	for (key in mapping[myInvestor]) {
	    		let fundName = key;
	    		let endpoint = mapping[myInvestor][key];
	    		var settings = {
	                'url': endpoint,
	                'method': 'GET',
	                'timeout': 0,
	            };
	    		var request = $.ajax(settings).done(function (response) {
	    			let result = response.data.filter(item => item.date==mydate);
	                response.data = result;
	                
	    			let obj = {
	    				'fundName':fundName, 
	    				'data':response.data
	    			};
	    			responseArr.push(obj);
	    		})
	    		.error(function () {
	    			console.log('error fetching data for fundName='+fundName);
	    			flashErrorMsg();
	        		removeOverlay();
	    		});;
	    		promises.push(request);
	    	}
	    	
	    	$.when.apply(null, promises).done(function() {
	    		responseArr.sort(compare);
	        	console.log(responseArr);
	        	processResponse(responseArr, 1);
	        	removeOverlay();
	        });
    	}
    	catch (err) {
    		console.error('error in generateOneDayTracker'+err);
    		flashErrorMsg();
    		removeOverlay();
    	}
    }
    
    
    
    
    // Helper function
    function isValidMultiDayTracker() {
    	if ($('#how_many_days').val() == '') {
    		flashWarn_invalidInput();
    		return false;
    	}
    	return true;
    }
    
    function isValidOneDayTracker() {
    	if ($('#date_picker').val() == '') {
    		flashWarn_invalidInput();
    		return false;
    	}
    	return true;
    }
    
    function compare(a, b) {
    	if (a.fundName < b.fundName) {
    		return -1;
    	}
    	if (a.fundName > b.fundName) {
    		return 1;
    	}
    	return 0;
    }
    
    function processResponse(responseArr, dayCount) {
    	let _rowHead = $('<thead>').append($('<th>').text('Fund Name'));
    	for (i=0; i<dayCount; i++) {
    		if (responseArr[0].data.length > 0) {
    			_rowHead.append($('<th>').text(responseArr[0].data[i].date));
    		}
    		else {
    			flashWarn_noData();		//invalid date is chosen
    			return;
    		}
    	}
    	$('#records_table').append(_rowHead);
    	
    	let _rowBody = $('<tbody>');
    	for (j=0; j<responseArr.length; j++) {
    		let _eachRow = $('<tr>').append($('<td>').text(responseArr[j].fundName));
    		for (k=0; k<dayCount; k++) {
    			let nav = parseFloat(responseArr[j].data[k].nav).toFixed(4);
    			_eachRow.append($('<td>').text(nav));
        	}
    		_rowBody.append(_eachRow);
    	}
    	$('#records_table').append(_rowBody);
    }
    
    
    
    
    // UTILITY FUNCTIONS
    function addOverlay() {
        $('#overlay').fadeIn(300);
    }
    
    function removeOverlay() {
        setTimeout(function(){
            $('#overlay').fadeOut(300);
        },500);
    }
    
    function flashErrorMsg() {
        $('#myError').fadeIn(500);
        setTimeout(function(){
            $('#myError').fadeOut(500);
        },1500);
    }
    
    function flashWarn_invalidInput() {
    	$('#records_table').empty();
        $('#inputWarning').fadeIn(500);
        setTimeout(function(){
            $('#inputWarning').fadeOut(500);
        },1500);
    }

    function flashWarn_noData() {
        if ($('#records_table tbody tr td:nth-child(2)').length == 0) {
            $('#records_table').empty();
            $('#dateWarning').fadeIn(500);
            setTimeout(function(){
                $('#dateWarning').fadeOut(500);
            },1500);
        }
    }
    
    function clipInput(elem) {
        if (elem.val() > 300)
            elem.val(300);
        if (elem.val() < 0)
            elem.val(0);
    }
    
});
