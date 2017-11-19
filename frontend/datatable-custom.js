//configuration
var backendUrl = TOSConfig.php.reports.url;
var dataSyncUrl = TOSConfig.php.syncData.url;
if(TOSConfig.language == 'nodeJs') {
    backendUrl = TOSConfig.nodeJs.reports.url;
    dataSyncUrl = TOSConfig.nodeJs.syncData.url;
}

/**
 * padLeft function
 */
Number.prototype.padLeft = function(base, chr) {
   var  len = (String(base || 10).length - String(this).length)+1;
   return len > 0? new Array(len).join(chr || '0')+this : this;
};

/**
 * [formatDate format date to desired format yyyy-mm-dd hh-mm-ss.ms]
 * @param  {[string]} dateString [date string]
 * @return {[string]}            [formatted date string]
 */
function formatDate(dateString) {
    var d = new Date(dateString),
    dformat = [ d.getFullYear(),
                (d.getMonth()+1).padLeft(),
                d.getDate().padLeft()
                ].join('-')+
                ' ' +
              [ d.getHours().padLeft(),
                d.getMinutes().padLeft(),
                d.getSeconds().padLeft()
                ].join(':')+
                '.' +
                d.getMilliseconds().padLeft();
    return dformat;
}


$(document).ready(function() {

    // Setup - add a text input to each footer cell
    // https://datatables.net/examples/api/multi_filter.html
    $('#TimeOnSiteReports tfoot th').each( function () {
        var title = $(this).text();
        if (title == 'Page Entry' || title == 'Page Exit') {
            // input not included due to datatable jquery UI bug
        } else {
            $(this).html( '<input type="text" id=' + title + ' placeholder="Search ' + title + '" />' );
        }
    });

    //Initialize DataTable
    var newTable = $('#TimeOnSiteReports').DataTable({
        // server-side options
        processing: true,
        serverSide: true,
        ajax: {
            url: backendUrl,
            type: 'POST',
            error: function(xhr, error, thrown) {  // error handling
                //console.log(xhr);console.log(error);console.log(thrown);
                $(".TimeOnSiteReports-error").html("");
                $("#TimeOnSiteReports").append('<tbody class="TimeOnSiteReports-error"><tr><th colspan="3">No data found in the server</th></tr></tbody>');
                $("#TimeOnSiteReports_processing").css("display", "none");
                alert('Something went wrong!');
            }
        },

        /**
         * Adding title tag
         */
        createdRow: function (row, data, rowIndex) {
            $.each($('td', row), function (colIndex) {
                // For example, add data-* attributes to the cell if required
                if(colIndex == 1) {
                   $(this).attr('title', data.url); 
                }   
            });
        },

        /**
         * table styling properties
         */
        scrollY: '500px',
        
        scrollX: true,
        
        /*
        lengthMenu: [[10, 25, 50, 100, 500, -1], [10, 25, 50, 100, 500, 'All']],
         */
        lengthMenu: [[10, 25, 50, 100, 500], [10, 25, 50, 100, 500]],

        pageLength: 50,

        jQueryUI: true,

        //pagingType: 'full_numbers',

        // saves currrent state of data table to local storage
        //stateSave: true,

        columns: [
            { data: 'tos_id' },
            { data: 'tos_session_key' },
            { data: 'url' },
            { data: 'title' },
            { data: 'tos_user_id',
                render: function ( data, type, row ) {
                    return row.tos_user_id != 'anonymous' ? 'authenticated' : 'anonymous'; 
                }
            },
            { data: 'entry_time',
                render: function ( data, type, row ) {
                    return formatDate(row.entry_time)
                }
            },
            { data: 'exit_time',
                render: function ( data, type, row ) {
                    return formatDate(row.exit_time)
                },
            },
            { data: 'timeonpage' },
            { data: 'timeonsite' },
            { data: 'timeonsite_by_duration',
                render: function(data, type, row) {
                    if(row.timeonsite_by_duration) {
                       return (row.timeonsite_by_duration).slice(3, (row.timeonsite_by_duration).length);  
                    }
                    return row.timeonsite_by_duration;  
                } 
            },
            { data: 'timeonpage_tracked_by' },
            { data: 'timeonpage_by_duration',
                render: function(data, type, row) {
                    if(row.timeonpage_by_duration) {
                       return (row.timeonpage_by_duration).slice(3, (row.timeonpage_by_duration).length);  
                    }
                    return row.timeonpage_by_duration;  
                }
            }
        ],

        columnDefs: [{
            'visible': false, 
            'targets': [ 0 ] // tos_id is hidden by this configuration
        }],

        // footerCallback: function ( row, data, start, end, display ) {

        //     // console.log(row)
        //     // console.log(data);
        //     // console.log(start)
        //     // console.log(end)
        //     // console.log(display)


        //     var api = this.api(), data;

        //     // Remove the formatting to get integer data for summation
        //     var intVal = function ( i ) {
        //         return typeof i === 'string' ?
        //             i.replace(/[\$,]/g, '')*1 :
        //             typeof i === 'number' ?
        //                 i : 0;
        //     };
 
        //     // Total over all pages
        //     total = api
        //         .column( 7 )
        //         .data()
        //         .reduce( function (a, b) {
        //             return intVal(a) + intVal(b);
        //         }, 0 );
 
        //     // Total over this page
        //     pageTotal = api
        //         .column( 7, { page: 'current'} )
        //         .data()
        //         .reduce( function (a, b) {
        //             return intVal(a) + intVal(b);
        //         }, 0 );//console.log(total)
 
        //     // Update footer
        //     $( api.column( 7 ).footer() ).html(
        //         'TOP: '+pageTotal +'secs & Overall: '+ total +' secs)'
        //     );

        //     // $( api.column( 7 ).footer() ).html(
        //     //     'TOP: '+pageTotal +' secs)'
        //     // );
        // }


    });


    /**
     * Hiding global search input box
     */
    $('#TimeOnSiteReports_filter').css('display', 'none');


    /**
     * Datatable search functionlity
     */
    $('.search-input-text').on( 'keyup click', function () {   // for text boxes
        var i =$(this).attr('data-column');  // getting column index
        var v =$(this).val();  // getting search input value
        newTable.columns(i).search(v).draw();
    });


    /**
     * toggle column visisbility (https://datatables.net/examples/api/show_hide.html)
     */
    $('a.toggle-visibility').on( 'click', function (e) {
        e.preventDefault();
 
        // Get the column API object
        var column = newTable.column( $(this).attr('data-column') );
 
        // Toggle the visibility
        column.visible( ! column.visible() );

        // applying css active toggle
        if($(this).attr('data-active') == '1') {
            $(this).attr('data-active', '0');
            $(this).css('color', '#aa7dff');
        } else {
            $(this).attr('data-active', '1');
            $(this).css('color', '#fff');
        }

    });


    /**
     * Apply the search for search columns
     */
    newTable.columns().every(function() {
        var that = this;

        $('input', this.footer()).on('keyup change', function(){
            if ( that.search() !== this.value ) {
                that
                    .search( this.value )
                    .draw();
            }
        });
    });


    //Entry time search event based on column no. due to datatable jquery UI bug
    $('#datepickerPageEntry').on('keyup change', function(){
        newTable
            .column(5)
            .search(this.value)
            .draw();
    });


    //Entry time search event based on column no. due to datatable jquery UI bug
    $('#datepickerPageExit').on('keyup change', function(){
        newTable
            .column(6)
            .search(this.value)
            .draw();
    });

    /**
     * Get real-time data from DB and refresh session data
     */
    $('#dataSync').on('click', function(e) {
        e.preventDefault();

        $.ajax({
            url: dataSyncUrl,
            type: 'POST',
            data: {
                timestamp: (new Date()).getTime()
            },
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            dataType: 'json',
            success: function(response) {
                if(response.code == 'refresh_success') {
                    $('#dataSyncTitle').fadeOut();

                    /* https://datatables.net/reference/api/draw() */
                    newTable.draw('full-hold');
                    $('#refreshFailure').css('display', 'none');
                    $('#refreshSuccess').fadeIn().delay(3800).fadeOut();
                    $('#dataSyncTitle').delay(4000).fadeIn();
                } else {
                    $('#refreshFailure').fadeIn().delay(4000).fadeOut();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $('#dataSyncTitle').fadeOut();
                $('#refreshFailure').fadeIn();
                console.log(thrownError);
            }
        });
    });
    
    /**
     * Clear all search filters in input boxes(external) and datatable(internal)
     */
    $('.search-filter-clear').on('click', function() {
        //clear date filters
        $('#datepickerPageEntry').val('');
        $('#datepickerPageExit').val('');

        //clear individual column search box and remove applied datatable filters
        $('.dataTable tfoot input[type="text"]').val('');
        $('#TimeOnSiteReports').DataTable().search('').columns().search('').draw();
    });

    /**
     * Allow numeric inputs only for column time on page(TOP) and time on site(TOS)
     */
    $(function() {
        $(document).on('keydown', '#TOP, #TOS', function(e){-1!==$.inArray(e.keyCode,[46,8,9,27,13,110,190])||(/65|67|86|88/.test(e.keyCode)&&(e.ctrlKey===true||e.metaKey===true))&&(!0===e.ctrlKey||!0===e.metaKey)||35<=e.keyCode&&40>=e.keyCode||(e.shiftKey||48>e.keyCode||57<e.keyCode)&&(96>e.keyCode||105<e.keyCode)&&e.preventDefault()});
    });


});

/**
 * Date picker for page entry and page exit columns
 */
$(document).ready(function() {
    $('#datepickerPageEntry, #datepickerPageExit').datepicker({
        autoSize: true,
        changeMonth: true,
        changeYear: true,
        dateFormat: 'yy-mm-dd'
    });
});
