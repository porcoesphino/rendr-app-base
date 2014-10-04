jQuery(document).ready(function($) {
	var base_url = $('BASE').attr('href');

	$('INPUT, TEXTAREA, SELECT').each(function(){
		$(this).hover(
			function(){
				$(this).addClass('hover');
			},
			function(){
				$(this).removeClass('hover');
		});
		$(this).bind('keydown mousedown',function(){ $(this).addClass('clicked'); });
		$(this).bind('keyup mouseup',function(){ $(this).removeClass('clicked'); });
	});

	// input focus
	$('INPUT, TEXTAREA, SELECT').each(function() {
		if ($(this).val() != '') {
			$(this).addClass('has-text');
		}
		if ($(this).attr('placeholder')) {
			$(this).addClass('with-placeholder');
		}
		$(this).focus(function() {
			$(this).addClass('focus').removeClass('wpcf7-not-valid');
			if($(this).val() != "") {
				$(this).addClass('has-text');
			}
		});
		$(this).keyup(function() {
			$(this).addClass('has-text').addClass('focus');
			if($(this).val() == "") {
				$(this).removeClass('has-text');
			}
		});
		$(this).blur(function () {
			if($(this).val() == "") {
				$(this).removeClass('has-text');
			}
			$(this).removeClass('focus');
		});
	});



	// mobile device detection
	var isMobile = {
		Android: function() {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function() {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function() {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function() {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function() {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function() {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};
	
	//$('#title A').addClass('icon icon-airbnb').text('');
	//var site_descr = $('#description').html();
	//$('#title').append('<span>'+site_descr+'</span>');




	
	$('.widget_nav_menu UL').addClass('nav');
	$('.navigation').addClass('span12');
	$('.navigation LI').each(function(i){
		$(this).addClass('nav-'+i).addClass('rounded');
		if (($(this).find('A').text() == 'Next Page»') || ($(this).find('A').text() == '«Previous Page')){ $(this).addClass('hidden'); }
	});

	$('#menu-left LI:odd').addClass('odd');
	
	
	
	
	$('.posts-list .post').each(function(){
		var post_h = $(this).css('height');
		//alert(post_h);
		$(this).find('.post-titles').css('height',post_h);
		setTimeout(function(){
				$('.posts-list .post .post-txt').animate({'opacity':1},500);
			},500);
	});

	

	// values for sliders
	var homepage_slider_h = 510;
	var page_slider_h = 530;
	// for iPad
	if (($('BODY').width() <= 800) && ($('BODY').width() > 480)){
		homepage_slider_h = 530;
		page_slider_h = 400;
	}
	// for iPhone
	if ($('BODY').width() <= 480){
		homepage_slider_h = 350;
		page_slider_h = 240;
	}
	
	// promo slider HOME
	$('#mycarousel').carouFredSel({
		width: "100%",
		height: homepage_slider_h,
		responsive: true,
		items: {
			visible: 1
		},
		scroll: {
			duration: 250,
			timeoutDuration: 2500,
			fx: 'uncover-fade',
			pauseOnHover: true
		},
		next: {
			button: "#next_btn",
			key: "right"
		},
		prev: {
			button: "#prev_btn",
			key: "left"
		}
	});
	// promo slider CATEGORY
	$('#mycarousel-category').carouFredSel({
		width: "100%",
		height: page_slider_h,
		responsive: true,
		items: {
			visible: 1
		},
		scroll: {
			duration: 250,
			timeoutDuration: 2500,
			fx: 'uncover-fade',
			pauseOnHover: true
		},
		next: {
			button: "#next_btn",
			key: "right"
		},
		prev: {
			button: "#prev_btn",
			key: "left"
		}
	});
	// promo slider SINGLE
	$('#mycarousel-single').carouFredSel({
		width: "100%",
		height: page_slider_h,
		responsive: true,
		items: {
			visible: 1
		},
		scroll: {
			duration: 250,
			timeoutDuration: 2500,
			fx: 'uncover-fade',
			pauseOnHover: true
		}
	});


	
	// comments
	$('#comments .comment:last').addClass('last');
	$('#comment').attr('placeholder','Leave a comment');
	$('#respond #commentform .form-submit INPUT#submit').addClass('btn black').val('Post');
	$('#single__post #post-content IFRAME').each(function(){ $(this).attr('width','655').attr('height','410'); });
	$('.single .navigation').removeClass('span12');
	
	// for iPad - 768px
	if (($('BODY').width() <= 800) && ($('BODY').width() > 480)){
		$('#single__post #post-content IFRAME').each(function(){ $(this).attr('width','530').attr('height','333'); });
	}
	


	
	// top nav swipe
	var topswipe_width = 0;
	$('#topswipe LI').each(function(i){
		$(this).addClass('swipeli-'+i);
		topswipe_width = topswipe_width + $(this).width() + parseInt($(this).css('padding-left')) + parseInt($(this).css('padding-right'));
	});
	$('#topswipe UL').width(topswipe_width+5);
	
	/*
	//Enable swiping...
	$("#topswipe").swipe( {
		//Generic swipe handler for all directions
		swipe:function(event, direction, distance, duration, fingerCount) {
			//$(this).text("You swiped " + direction );
			if (direction == 'left'){
				var leftPos = $('#topswipe').scrollLeft();
				$("#topswipe").animate({scrollLeft: leftPos - 100}, 300);
			}
			if (direction == 'right'){
				var leftPos = $('#topswipe').scrollLeft();
				$("#topswipe").animate({scrollLeft: leftPos + 100}, 300);
			}
		},
		//Default is 75px, set to 0 for demo so any distance triggers swipe
		threshold:0
	});
	*/




	$('#basis').attr('data-snap-ignore','true');

	// for iPhone - 320px
	if ($('BODY').width() <= 480){
			$('#title').append('<a href="javascript:void(null)" id="link2nav"></a>');
			$('.category #title SPAN').addClass('title4category').text($('.category-title').text());
			$('.search #title SPAN').addClass('title4category').text('Search');
			
			// SINGLE: set right width for video
			$('#post-content iframe').each(function(){
				var video_w = $(this).width();
				var video_h = $(this).height();
				var ratio_initial = video_w / video_h;
				var container_w = $('.single-post .container').width() - 20; // 320 - 20
				//alert(video_w + ' : ' + video_h + ' | ' + container_w); // 655 : 410 | 300
				var ratio = video_w / container_w;
				var video_h_new = video_h / ratio;
				$(this).width(container_w);
				$(this).height(video_h_new);
			});
			
			// SINGLE: move author block below post content
			$('#block-with-author').insertAfter($('#post-content'));
			
			setTimeout(function(){ $('#topswipe').animate({'left': '177px'}, 200); }, 500);
			
			
			
			// code for left menu
			var snapper = new Snap({
						element: document.getElementById('basis')
					});
			//snapper.settings({disable: 'right', maxPosition: 200});
			snapper.settings({disable: 'right'});
		
			// https://github.com/jakiestfu/Snap.js/blob/master/README.md
			// https://github.com/jakiestfu/Snap.js/pull/68
			
			var addEvent = function addEvent(element, eventName, func) {
				if (element.addEventListener) {
					return element.addEventListener(eventName, func, false);
				} else if (element.attachEvent) {
					return element.attachEvent("on" + eventName, func);
				}
			};
			
		
			addEvent(document.getElementById('open-left'), 'click', function(){
				if ($('#open-left').hasClass('opened')){
					snapper.close('left');
					$('#open-left').removeClass('opened');
				}
				else{
					snapper.open('left');
					$('#open-left').addClass('opened');
				}
			});

	}
	else{
		$('.snap-drawers').css('display', 'none');
	}
	
	


	
	
	
	
	

	if ((window.PIE) && ($.browser.msie)) {
		$('.with-shadow, .rounded').each(function() {
			PIE.attach(this);
		});
	}
});



