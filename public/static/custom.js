$(document).ready(function(){

	$('.sidebar-dropdown').on('shown.bs.collapse', function(){
		window.simpleBar.recalculate();
	});
	// Active Menu
	let path = location.pathname.substring(1);
	if (path) {
		$('#sidebar .sidebar-item').removeClass("active");
		$('#sidebar .sidebar-link[href$="' + path + '"]').removeClass('collapsed'); 
		$('#sidebar li ul').removeClass('show'); 
		$('#sidebar .sidebar-link[href$="' + path + '"]').parents("li").addClass('active'); 
		$('#sidebar .sidebar-link[href$="' + path + '"]').parents("li").find('ul').addClass('show'); 
		$('.list-group-item[href$="' + path + '"], .nav-link[href$="' + path + '"]').addClass('active');
	} 

	$('[data-toggle=addable]').each(function(){
        window['addable'+$(this).data('label')] = $(this).html();
    });
    $("[data-trigger=addmore]").click(function(e){
        e.preventDefault();
        $('#'+$(this).data('for')+'').append('<div class="row mt-2">'+window['addable'+$(this).data('for')]+'</div><p><a href="#" class="btn btn-danger btn-sm mt-1" data-trigger="deletemore">'+lang.del+'</a></p>');
		$('[data-toggle="select"]').select2();
		initautocomplete();
    }); 
    $(document).on('click','[data-trigger=deletemore]',function(e){
        e.preventDefault();
        let t = $(this);
        $(this).parent('p').prev('.row').slideUp('slow',function(){
            $(this).remove();
            t.parent('p').remove();
        });
        return false;
    });

	$('[data-trigger=darkmode]').click(function(e){
		e.preventDefault();
			const d = new Date();
			d.setTime(d.getTime() + (30*24*60*60*1000));
			let expires = "expires="+ d.toUTCString();
			document.cookie = 'darkmode' + "=1;" + expires + ";path=/";
			$('body').addClass('dark');
			$(this).addClass('d-none');
			$('[data-trigger=lightmode]').removeClass('d-none');
	});

	$('[data-trigger=lightmode]').click(function(e){
		e.preventDefault();
			document.cookie = "darkmode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
			$('body').removeClass('dark');
			$(this).addClass('d-none');
			$('[data-trigger=darkmode]').removeClass('d-none');
	});

	$('[data-trigger=viewnews').click(function(e){
		e.preventDefault();
		let hash = $(this).data('hash');
		const d = new Date();
			d.setTime(d.getTime() + (30*24*60*60*1000));
			let expires = "expires="+ d.toUTCString();
			document.cookie = 'notification' + "="+hash+";" + expires + ";path=/";
			$(this).find('.indicator').fadeOut();
	});
	$('[data-toggle=buttons] label').click(function(){
		$(this).parent('[data-toggle=buttons]').find('.border-secondary').removeClass('border-secondary');
		$(this).addClass('border-secondary');
	});
	$('[data-toggle=multibuttons] a').click(function(e){	
		e.preventDefault();	
		let href = $(this).attr('href');
		let parent = $(this).data('bs-parent');
		$(parent).find('.collapse').removeClass('show');
		$(parent).find(href).addClass('show');
		$(this).parent('[data-toggle=multibuttons]').find('.active').attr('class', 'btn flex-fill');
		$(this).attr('class', 'btn flex-fill shadow-sm bg-white border rounded-pill fw-bold active');
	})

	initautocomplete();

	// SelectJS
	let $select = $('[data-toggle="select"]');
	if ($select.length) {
		$select.each(function() {
			$(this).select2();
		});
	}
	// Tags Input
	let $tags = $('[data-toggle="tags"]');
	if ($tags.length) {
		$tags.each(function() {
			$(this).tagsinput({
				tagClass: 'badge badge-primary'
			});
		});
	}	

	let $dtpicker = $('[data-toggle=datetimepicker]');
	if ($dtpicker.length) {
		$dtpicker.each(function() {
			let el = $(this);
			$(this).daterangepicker({
				singleDatePicker: true,
				showDropdowns: true,
				autoApply: true,
				autoUpdateInput: false,
				timePicker: true,
				locale: {
					format: 'YYYY-MM-DD HH:ii'
				}
			}, function(s){
				el.val(s.format('YYYY-MM-DD HH:mm'));
			});
		});
	}	
	let $dpicker = $('[data-toggle=datepicker]');
	if ($dpicker.length) {
		$dpicker.each(function() {
			let el = $(this)
			$(this).daterangepicker({
				singleDatePicker: true,
				showDropdowns: true,
				autoApply: true,
				autoUpdateInput: false,
				locale: {
					format: 'YYYY-MM-DD'
				}
			}, function(s){
				el.val(s.format('YYYY-MM-DD'));
			});
		});
	}

	// Custom Checkbox
	$('[data-toggle=togglefield]').change(function(){
		let $this = $(this);
		let fields = $(this).data('toggle-for');
		if(!fields) return false;
		fields.split(',').forEach(function(field){
			if($this.is(':checked') == true) {
				$('#'+field+'').parent('.form-group').removeClass('d-none');
				$('#'+field+'').removeClass('d-none');
			}else{
				$('#'+field+'').parent('.form-group').addClass('d-none');
				$('#'+field+'').addClass('d-none');
			}
		});
	});
	$('input[data-binary=true]').each(function(){
		$(this).before('<input type="hidden" value="0" name="'+ $(this).attr('name')+'">');
	});
	$(document).on('change', '[data-toggle=select]', function(){
		let callback = $(this).data('trigger');
		if(callback !==undefined){
			window[callback]($(this));
		} 
	});
	$('[data-trigger=removeimage]').click(function(e){
		e.preventDefault();
		$(this).parents('form').prepend("<input type='hidden' name='"+$(this).attr("id")+"' value='1'>");
		$(this).text("Image will be removed upon submission");
	  });  
	// Modal Trigger
	$(document).on('click', '[data-trigger=modalopen]', function(e){
		e.preventDefault();
		let target = $(this).data('bs-target');
		$(target).find('a[data-trigger=confirm]').attr('href', $(this).attr('href'));
	});
	$(document).on('click','[data-toggle=updateFormContent]', function(e){
		e.preventDefault();
		let target = $(this).data('bs-target');
		let content = $(this).data('content');
		$(target).find('form').attr('action', $(this).attr('href'));
		for(input in content){
			
			if($(target).find('#'+input).attr('type') == 'color'){
				
				$(target).find('#'+input).val(content[input]);

				$('[data-trigger="colorpicker"]').spectrum({
					color: content[input],
					showInput: true,
					preferredFormat: "hex"
				});				

			}else if($(target).find('#'+input).attr('type') == 'checkbox'){
				if(content[input] == '1'){
					$(target).find('#'+input).attr('checked', true);
				}
			} else {
				$(target).find('#'+input).val(content[input]);
			}
		}
	});		
	$('[data-trigger=checkall]').on('click', function() {
		if($(this).prop('checked')){
		  $('[data-dynamic]').prop('checked', true);
		}else{
		  $('[data-dynamic]').prop('checked', false);
		}    
	}); 
	$('a[data-trigger=submitchecked]').click(function(e){
		e.preventDefault();
		$('[data-trigger=options]').attr('action', $(this).attr('href'));
		let ids = [];
		$('[data-dynamic]').each(function(){
			if($(this).prop('checked')) ids.push($(this).val());
		});

		$('input[name=selected]').val(JSON.stringify(ids));
		$('[data-trigger=options]').submit();
	});
	$('[data-trigger=getchecked]').click(function(e){
		e.preventDefault();
		let ids = [];
		$('[data-dynamic]').each(function(){
			if($(this).prop('checked')) ids.push($(this).val());
		});

		$($(this).data('for')).val(JSON.stringify(ids));
	});
	if($(".copy").length > 0){
		new ClipboardJS('.copy');  
		$(document).on("click", ".copy", function(e){
			e.preventDefault();  
			var t = $(this);
			var o = $(this).text();
			if(t.data('lang')){
				t.find('small').text(t.data('lang'));
			}
			t.prev("small").addClass("float-away");
			setTimeout(function() {
			  $("small").removeClass('float-away');
			}, 400);
			setTimeout(function() {
				t.find('small').text(o);
			}, 2500);
		}); 		
	}	
	$('[data-trigger=preview]').click(function(e){
		e.preventDefault();
		let data = new FormData($(this).parents('form')[0]);
		$.ajax({
            type: "POST",
            url: $(this).data('url'),
            data: data,		
			contentType: false,
			processData: false,
            beforeSend: function() {
              $("#return-ajax").html('<div class="preloader"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>');
            },
            complete: function() {      
              $('.preloader').fadeOut("fast", function(){$(this).remove()});
            },          
            success: function (response) { 
                $('#return-ajax').html(response);
            }
        }); 
	});
	$('[data-trigger=color]').click(function(){
		let id = $(this).attr('href');
		let input = $('input[name=mode]');
		if(input.length > 0){
			input.val(id.replace('#', ''));
		}
	});	
	$('[data-trigger=generateqr]').submit(function(e){
		e.preventDefault();
		let data = new FormData($(this).parents('form')[0]);
		$.ajax({
            type: "POST",
            url: $(this).data('url'),
            data: data,
			contentType: false,
			processData: false,
            beforeSend: function() {
              $("#return-ajax").html('<div class="preloader"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>');
            },
            complete: function() {      
              $('.preloader').fadeOut("fast", function(){$(this).remove()});
            },          
            success: function (response) { 
                $('#return-ajax').html(response);
            }
        }); 
	});
	$('[data-trigger=translate]').click(function(e){
		e.preventDefault();
		let el = $(this);
		if($('#code').val().length < 1){
			return $.notify({
				message: 'Cannot detect language code. Please enter an ISO 639-1 code in the code input.'
			},{
				type: 'danger',
				placement: {
					from: "bottom",
					align: "right"
				},
			});			
		}
		$.ajax({
            type: "POST",
            url: $(this).data('url'),
            data: 'lang='+$('#code').val()+'&string='+$(this).data('string'),
            success: function (response) { 
               el.parent('div').find('textarea[data-new]').html(response);
            }
        }); 
	});
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
	tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	});

	$('[data-bs-toggle=collapse]').click(function() {
		let parent = $(this).data('bs-parent')
		$(parent).find('.collapse.show').collapse('hide');
		$(this).parents('.btn-group').find('.active').removeClass('active');
		$(this).parents('.dropdown-nav').find('.active').removeClass('active');
		$(this).parents('.list-group').find('.active').removeClass('active');
		$(this).parents('.nav-pills').find('.active').removeClass('active');
		$(this).addClass('active');
	});
	$('[data-trigger=toggleSM]').click(function(e){
		let value = $(this).data('value');
		if(value == 'multiple'){
			$('input[name=custom]').parents('.form-group').parent('div').hide();
			$('button[data-bs-target=\"#metatags\"]').hide();
			$('#metatags').removeClass('show');
			$('button[data-bs-target=\"#geo\"]').hide();
			$('#geo').removeClass('show');
			$('button[data-bs-target=\"#device\"]').hide();
			$('#device').removeClass('show');
			$('input[name=multiple]').val('1');
			$("#multiple").addClass('show');
		} else {
			$('button[data-bs-target=\"#metatags\"]').show();			
			$('button[data-bs-target=\"#geo\"]').show();
			$('button[data-bs-target=\"#device\"]').show();			
			$('input[name=custom]').parents('.form-group').parent('div').show();
			$('input[name=multiple]').val('0');
			$("#single").addClass('show');
		}
	});
	$('.list-group-dynamic a').click(function(){
		$('.list-group-dynamic a').removeClass('active');
		$(this).addClass('active');
		$('input[name=type]').val($(this).attr('href').replace('#', ''));
	})
	$(document).on('click', '[data-trigger=shortinfo]', function(e){
		e.preventDefault();
		triggerShortModal($(this).data('shorturl'));
	});
	$(document).on('click',"[data-trigger=clearsearch]",function(e){
		e.preventDefault();
		$("#return-ajax").slideUp('medium',function(){
		  $(this).html('');
		  $("#search").find("input[type=text]").val('');
		  $("#link-holder").slideDown('medium');
		  $('#search button[type=submit]').removeClass('d-none'); 
		  $('#search button[type=button]').addClass('d-none');
		});
	}); 
	$(document).on('click','[data-trigger=selectall]',function(e) {
		e.preventDefault();   
		if($(this).hasClass("fa-check-square")){
		  	$(this).removeClass('fa-check-square').addClass('fa-minus-square');
		  	$('[data-dynamic]').prop('checked', true);
		}else{
			$(this).addClass('fa-check-square').removeClass('fa-minus-square');
		  	$('[data-dynamic]').prop('checked', false);
		}
	}); 

	$("[data-trigger=filterlanguage]").click(function(e){
		e.preventDefault();
		let type = $(this).data('type');

		if(type == "all"){
			$('.strings').removeClass('d-none');
		}

		if(type == "translated"){
			$('.strings').addClass('d-none');
			$('.strings:not(.is-empty)').removeClass('d-none');
		}

		if(type == "untranslated"){
			$('.strings').addClass('d-none');
			$('.strings.is-empty').removeClass('d-none');
		}

		$("[data-trigger=filterlanguage]").removeClass('active');
		$(this).addClass('active');
	});
	if($('[data-trigger="colorpicker"]').length > 0){
		$('[data-trigger="colorpicker"]').spectrum({
			showInput: true,
			preferredFormat: "hex"
		});
	}
	$('[data-toggle=addtochannel]').click(function(){
		$('input[name=channelids]').val('['+$(this).data('id')+']');
	});

	$('#mailprovider').change(function(){
		let v = $(this).val();
		$('.mailblock').addClass('d-none');
		$('#'+v).removeClass('d-none');
	});

	$('[data-permission]').click(function(){
		let p = $(this).data('permission');
		$('#permissionModal .modal-body div').html(p);
	});

	$('[data-trigger=downloadqr]').click(function(e){
		e.preventDefault();
		let svgurl = $(this).data('svg');
		const format = $(this).data('format');
		let http = new XMLHttpRequest();
		http.onreadystatechange = () => {
			
			if (http.readyState == 4 && http.status == 200) {
			  	svg = http.responseText.replace('<?xml version="1.0" encoding="UTF-8"?>\n', '').replace('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n', '').replace(/(\r\n|\n|\r)/gm, '');
			  	const data = svg;
				const svgBlob = new Blob([data], {
					type: 'image/svg+xml;charset=utf-8'
				});
				const url = URL.createObjectURL(svgBlob);
				const img = new Image();
				console.log(url, svgBlob, data);
				img.addEventListener('load', () => {
					let filename = null;
					let mime = null;

					if(format == 'webp'){
						filename = 'QRcode.webp';
						mime = 'image/webp';
					} else {
						filename = 'QRcode.png';
						mime = 'image/png';
					}
					const canvas = document.createElement('canvas');
					canvas.width = 1000;
					canvas.height = 1000;
				
					const context = canvas.getContext('2d');
					if(format == 'jpg') context.fillStyle = '#ffffff';
					context.drawImage(img, 0, 0, 1000, 1000);
				
					URL.revokeObjectURL(url);
				
					const a = document.createElement('a');
					a.download = filename;
					document.body.appendChild(a);
					a.href = canvas.toDataURL(mime);
					a.click();
					a.remove();
				});
				img.src = url;
			};
		}
		http.open("GET", svgurl, true);
		http.send();
	});
});
window.redirect = function(e){
	window.location = "?"+e.data('name')+"="+e.val();
}
window.paymentkeys = function(e){
	$('.toggles').addClass('d-none');
	$('#'+e.val()+'holder').removeClass('d-none');
}
function initautocomplete(){
	var parameters = [
		{ value: 'utm_source', data: 'utm_source' },
		{ value: 'utm_medium', data: 'utm_medium' },
		{ value: 'utm_campaign', data: 'utm_campaign' },
		{ value: 'utm_term', data: 'utm_term' },
		{ value: 'utm_content', data: 'utm_content' },
		{ value: 'tag', data: 'tag' },
	  ];
	  if($().devbridgeAutocomplete){
		$("[data-trigger=autofillparam]").devbridgeAutocomplete({
		  lookup: parameters
		});
	  }
}
function getStates(el){
	$.ajax({
		type: "GET",
		url: $('[data-label=geo]').data('states')+'?country='+el.val()+'&output=true',
		success: function (response) { 
			var html = '<option value="0">All States</option>';
			for(var key in response){
				html += '<option value="'+response[key].name.toLowerCase()+'">'+response[key].name+'</option>';
			}
		  	el.parents('.col').parent('.row').find('select[name="state[]"]').html(html);
			$('[data-toggle="select"]').select2();
		}
	});   
}
function validateForm(e){
  
	$(".form-group").removeClass("has-danger");
	$(".form-control-feedback").remove();
	let error = 0;
  
	e.find("[data-required]").each(function(){
  
	  let type = $(this).attr("type");
  
	  if(type == "email"){
		let regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if(!regex.test($(this).val())) error = 1;    
	  } else {    
		if($(this).val() == "") error = 1;
	  }
  
	  if(error == 1) {
		$(this).parents(".form-group").addClass("has-danger");
		$(this).after("<div class='form-control-feedback'>This field is required</div>");
	  }
  
	});
	if(error == 1) {
	  return false;
	}  
  
	return true;
}
