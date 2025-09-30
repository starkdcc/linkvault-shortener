$(document).ready(function(){
    'use strict';

	let path = location.pathname.substring(1);
	if (path) {
		$('#main-menu a').removeClass("active");
		$('#main-menu a[href$="' + path + '"]').addClass('active');
	}

	if($('[data-toggle=typed]').length > 0){
		$('[data-toggle=typed]').each(function(){
			let list = $(this).data('list').split(',');
			new Typed($(this)[0], {
				strings: list,
				typeSpeed: 100,
				backSpeed: 80,
				loop: true,
			})
		});
	}

	$(window).scroll(function(){
		if(window.pageYOffset > 250){
			$('body').addClass('fixed');
		  	$("#main-header").addClass("affix");
			$("#scroll-to-top").removeClass('opacity-0').fadeIn();
		}else{
			$('body').removeClass('fixed');
		  	$("#main-header").removeClass("affix");
			$("#scroll-to-top").fadeOut();
		}
	});

	$(document).on('click', '[data-trigger=scrollto]', function(e){
		e.preventDefault();
		$('[data-trigger=scrollto]').removeClass('active');
		$(this).addClass('active');
		var el = $(this).attr('href');
        var offset = $(this).data('scrollto-offset') ? $(this).data('scrollto-offset') : 0;
		var options = {
			scrollTop: (typeof $(this).data('top') != 'undefined' ? $(this).data('top') : ($(el).offset().top) - offset)
		};
        $('html, body').stop(true, true).animate(options, 300);
	});

	$(document).on('click', '[data-pricing]', function(){
		let a = $(this).data('pricing'),
            b = $(this).parents('.pricing-container'),
            c = $('.'+b.attr('class')+' [data-pricing-'+a+']');
		if(a == 'yearly'){
			$('[data-toggle=discount]').removeClass('d-none');
		}else{
			$('[data-toggle=discount]').addClass('d-none');
		}
		$('[data-toggle=pricingterm]').text($('[data-toggle=pricingterm]').data('term-'+a));
        if(!$(this).hasClass('btn-primary')) {
            $('.'+b.attr('class')+' [data-pricing]').removeClass('btn-primary').addClass('bg-white');
            $(this).removeClass('bg-white').addClass('btn-primary');
            c.each(function() {
                var new_price = $(this).data('pricing-'+a);
                var old_price = $(this).find('span.price').html();
                $(this).find('span.price').html(new_price);
                $(this).data('pricing-value', old_price);
            });
			$('[data-trigger=checkout]').each(function(){
				let link = $(this).attr('href').split('/');
				if(link != "#"){
					link.pop();
					$(this).attr('href', link.join('/')+'/'+a);
				}
			})
        }
	});

	[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl)
	});

	if($('#cookieconsent-script').length > 0){
		var cc = initCookieConsent();
		cc.run({
			current_lang : 'app',
			autoclear_cookies : true,
			cookie_name: 'cc_cookie',
			cookie_expiration : 365,
			page_scripts: true,
			autorun: true,
			languages: {
				'app': {
					consent_modal: {
						title: lang.cookie.title,
						description: lang.cookie.description + lang.cookie.button,
						primary_btn: {
							text: lang.cookie.accept_all,
							role: 'accept_all'
						},
						secondary_btn: {
							text: lang.cookie.accept_necessary,
							role: 'accept_necessary'
						}
					},
					settings_modal: {
						title: lang.cookie.title,
						save_settings_btn: lang.cookie.save,
						accept_all_btn: lang.cookie.accept_all,
						reject_all_btn: lang.cookie.accept_necessary,
						close_btn_label: lang.cookie.close,
						blocks: [
							{
								description: lang.cookie.description,
							}, {
								title: lang.cookie.necessary.title,
								description: lang.cookie.necessary.description,
								toggle: {
									value: 'necessary',
									enabled: true,
									readonly: true
								}
							}, {
								title: lang.cookie.analytics.title,
								description: lang.cookie.analytics.description,
								toggle: {
									value: 'analytics',
									enabled: false,
									readonly: false
								},
							}, {
								title: lang.cookie.ads.title,
								description: lang.cookie.ads.description,
								toggle: {
									value: 'ads',
									enabled: false,
									readonly: false
								}
							},{
								title: lang.cookie.extra.title,
								description: lang.cookie.extra.description,
								toggle: {
									value: 'extra',
									enabled: false,
									readonly: false
								}
							}, {
								title: lang.cookie.privacy.title,
								description: lang.cookie.privacy.description,
							}
						]
					}
				}
			}

		});
	}
	
	if($('[data-countup]').length > 0){
		$('[data-countup]').each(function(){			
			let countTo = $(this).attr('data-countup');
			$({countNum:$(this).text()}).animate({countNum:countTo},{
				duration:8000,
				easing:'linear',
				step: function(){
					$(this).text(Math.floor(this.countNum));
				},
				complete: function(){
					$(this).text(this.countNum);
				}
			});
		});		
	}

	if($('.code-selector').length > 0){
		$(".code-selector").hide();		
		$(".code-selector[data-id=curl]").fadeIn('fast');
		$(".code-selector[data-id=curl]").addClass('active');
		$(".code-lang a").click(function(e){
			e.preventDefault();
			$(".code-selector").removeClass('active');
			let $id = $(this).attr("href");
			$(".code-lang a").removeClass("active");
			$("a[href='"+$id+"']").addClass("active");
			$(".code-selector").hide();
			let c = $id.replace("#","");
			$(".code-selector[data-id='"+c+"']").fadeIn();
			$(".code-selector[data-id='"+c+"']").addClass('active');
		});
	}
	$(document).on('click', '[data-trigger=copycode]', function(){
		let el = $(this).parents('.code-area').find('.code-selector.active');
		let text = el.text();	
		el.attr('data-clipboard-text', text.trim());
		el.click();
	});

	if($('[data-trigger=copycode]').length > 0){
		new ClipboardJS('.code-selector');
	}
	
	if($('html').data('auto-scheme')){
		if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){			
			setDark($('[data-trigger=darkmode]'));
		}else{
			setLight($('[data-trigger=lightmode]'));
		}
	}

	$('[data-trigger=darkmode]').on('click', function(e){
		e.preventDefault();
		setDark($(this));
	});

	$('[data-trigger=lightmode]').on('click', function(e){
		e.preventDefault();
		setLight($(this));
	});

	$('[data-trigger=schememode]').click('prop', function(e){
		if($(this).is(':checked')){
			setDark($('[data-trigger=lightmode]'));
		}else{
			setLight($('[data-trigger=darkmode]'));
		}
	});

	$('[data-bs-toggle=buttons] .btn').click(function(){
		let parent = $(this).parent('[data-bs-toggle=buttons]');
		parent.find('.active').removeClass('active');
		$(this).addClass('active');
	});

	
	$('[data-trigger=applycoupon]').click(function(e){
		e.preventDefault();
		$('#coupon').next('.form-text').remove();
		$.ajax({
			type: "GET",
			url: $('#coupon').data('url'),
			data: "code="+$('#coupon').val()+"&country="+$("#country").val(),        
			success: function (response) { 
				if(response.error){
					$('#coupon').addClass("is-invalid");    
					$('#couponresponse').html('<p class="form-text text-sm text-danger">'+response.message+'</p>');
				}else{				
					$('#coupon').removeClass("is-invalid");
					$('#couponresponse').html("<p class='form-text text-sm text-success'>"+response.message+"</p>");
					$("#discount").text(response.discount).parents('.collapse').addClass('show');
					$("#total").text(response.newprice);
					if(response.tax){
						$("#taxamount").text(response.tax);
					}
				}
			}
		}); 
	});

	$('[data-toggle=multibuttons] a').click(function(e){	
		e.preventDefault();	
		let href = $(this).attr('href');
		let parent = $(this).data('bs-parent');
		$(parent).find('.collapse').removeClass('show');
		$(parent).find(href).addClass('show');
		$(this).parent('[data-toggle=multibuttons]').find('.active').attr('class', 'btn flex-fill');
		$(this).attr('class', 'btn flex-fill shadow-sm bg-white border rounded-pill fw-bold active');
	});

});

function setDark(el){
	const d = new Date();
	d.setTime(d.getTime() + (30*24*60*60*1000));
	let expires = "expires="+ d.toUTCString();
	document.cookie = 'darkmode' + "=1;" + expires + ";path=/";
	$('html').attr('data-theme', 'dark');
	el.addClass('d-none');
	$('[data-trigger=lightmode]').removeClass('d-none');
}

function setLight(el){
	document.cookie = "darkmode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	$('html').removeAttr('data-theme');
	el.addClass('d-none');
	$('[data-trigger=darkmode]').removeClass('d-none');	
}