$(document).ready(function() {

	var table_init = false

	//change column to Net Payment
	$('#booking_table tfoot th').eq(
		$('#booking_table thead th').index(
			$('#booking_table thead th.location').removeClass("location").addClass("net_payment").text("Net Payment")
		)
	).text("Net Payment");

	var table = $('#booking_table').DataTable({
	  "initComplete": function(settings, json) {
		table_init = true;
	  },
	  "processing": true,
	  "serverSide": true,
	  "ajax": {
		"url": "/bookings/",
	  },
	  "dom":
		"<'row'<'col-sm-2'l><'col-sm-1'B><'col-sm-6 text-center'<'filters'>><'col-sm-3'f>>" +
		"<'row'<'col-sm-12'tr>>" +
		"<'row'<'col-sm-5'i><'col-sm-7'p>>",
	  "columns": [
		  { "data":"str_created" },
		  { "data":"guest_name" },
		  { "data":"property_name" },
		  { "data":"net_payment" },
		  { "data":"platform_name" },
		  { "data":"check_in_date" },
		  { "data":"check_out_date" },
		  { "data":"status" },
		  { "data":"id" },
		],
	  "columnDefs": [
		{
		  "targets": "property",
		  "render": function ( data, type, row ) {
			var href = "'/properties/"+row.property+"/'";
			return "<a href="+href+">"+data+"</a>";
		  },
		},
		{
			"targets": "net_payment",
			"render": function(data, type, row) {
				return "£" + data;
			}
		},
		{
		  "targets": "check-in",
		  "render": $.fn.dataTable.render.moment( 'D MMM YYYY' ),
		},
		{
		  "targets": "check-out",
		  "render": $.fn.dataTable.render.moment( 'D MMM YYYY' ),
		},
		{
		  "targets": "status",
		  "render": function ( data, type, row ) {
			var status_dictionary = {'Complete':'success', 'On Schedule':'info', 'Attention':'warning', 'Urgent':'danger'}
			var btn_class = status_dictionary[data]
			return "<button class='btn btn-xs btn-block btn-"+btn_class+"' data-ajaxload-toggle='"+row.id+"' data-placement='left' data-html='true' data-content=''><b>"+data+"</b></button>"
		  },
		  "orderable": false,
		},
		{
		  "targets": "view",
		  "data": "id",
		  "render": function ( data, type, row ) {
			var href = "'/bookings/"+data+"/'";
			return "<a data-test='booking_view_button' class='btn btn-success btn-xs btn-block' href="+href+"><span class='glyphicon glyphicon-share-alt'></span></a>";
		  },
		  "orderable": false,
		},
	  ],
	  "order": [[ 0, "desc" ]],
	  "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
	});
  
	table.on( 'draw.dt', function () {
	  $(function () {
		$('[data-toggle="popover"]').popover()
	  });
	  checkInitFunction();
	});
  
	$("div.filters").html(
	  '<row>' +
	  '<div class="col-sm-3 checkbox table-filter"><label><input id="complete_filter" type="checkbox" class="filter"> Complete</label></div>' +
	  '<div class="col-sm-3 checkbox table-filter"><label><input id="on_schedule_filter" type="checkbox" class="filter"> On Schedule</label></div>' +
	  '<div class="col-sm-3 checkbox table-filter"><label><input id="attention_filter" type="checkbox" class="filter"> Attention</label></div>' +
	  '<div class="col-sm-3 checkbox table-filter"><label><input id="urgent_filter" type="checkbox" class="filter"> Urgent</label></div>' +
	  '</row>'
	);
  
	$("#complete_filter")[0].checked=true;
	$("#on_schedule_filter")[0].checked=true;
	$("#attention_filter")[0].checked=true;
	$("#urgent_filter")[0].checked=true;
  
	$('input.filter').on('change', function () {
	  dataFiltration()
	});
  
	function dataFiltration() {
	  var complete = $('#complete_filter')[0].checked;
	  var on_schedule = $('#on_schedule_filter')[0].checked;
	  var attention = $('#attention_filter')[0].checked;
	  var urgent = $('#urgent_filter')[0].checked;
	//   var location = $('#location_filter').select2('val');
	  var querystring = '?status=';
	  if ( complete ) {
		querystring += 'complete,cancelled,';
	  }
	  if ( on_schedule ) {
		querystring += 'on_schedule,';
	  }
	  if ( attention ) {
		querystring += 'attention,';
	  }
	  if ( urgent ) {
		querystring += 'urgent,';
	  }
	//   if ( location ) {
	// 	querystring += '&locations=' + location;
	//   }
	  table.ajax.url("/bookings/"+querystring);
	  table.load();
	}
  
	function initPopoverHover() {
	  $('*[data-ajaxload-toggle]').hover(
		function() {
		  var e = $(this);
		  var id = e.attr('data-ajaxload-toggle');
		  if (e.attr('data-content') == "") {
			$.ajax({
			  type : "GET",
			  url : "/bookings/"+id+"/status_popover/",
			  success : function(data) {
				e.attr('data-content', data['status_popover']);
				e.popover('show');
			  },
			  error : function(data) {
				alert('An error has occured. This status could not be loaded. Please refresh the page and try again.');
			  },
			});
		  } else {
			e.popover('show');
		  }
		},
		function () {
		  var e = $(this);
		  e.popover('hide');
		}
	  );
	}
  
	var checkInit = setInterval(checkInitFunction, 100);
	function checkInitFunction() {
	   if(table_init==true){
		 clearInterval(checkInit);
		 initPopoverHover();
	  }
	 }
  
	 var searchbox = $('#booking_table_filter input');
	 searchbox.unbind();
	 searchbox.bind('input', function (e) {
		if(this.value.length >= 3) {
		   table.search(this.value).draw();
		}
		if(this.value == '') {
		   table.search('').draw();
		}
		return;
	 });
  
  });