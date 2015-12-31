(function ($) {
	"use strict";

	$(function () {

		// Grab initial filter if there's a hash on the URL

		var initialFilter = [];

		if (window.location.hash) {
			initialFilter = $.map(window.location.hash.substr(1).split(","), function(f){ return "." + f; });
		}

		// Initialize Isotope
		var $container = $('#iso-loop').imagesLoaded( function () {
			$container.fadeIn().isotope({
				itemSelector : '.iso-post',
				layoutMode : iso_vars.iso_layout,
				filter : initialFilter.join('')
			});
		});

		// initialize activeFilter
		$("[data-filter]").each(function(index){
			if (initialFilter.indexOf($(this).attr('data-filter')) !== -1) {
				$(this).addClass('filteractive');
			}
		});


		// Initialize infinite scroll if required
		if ( iso_vars.iso_paginate == 'yes' ){
			$container.infinitescroll({
				loading: {
					finishedMsg: iso_vars.finished_message,
					img: iso_vars.loader_gif,
					msgText: "",
					selector: ".iso-posts-loading",
					speed: 0,
				},
				binder: $(window),
				navSelector: ".iso-pagination",
				nextSelector: ".more-iso-posts a",
				itemSelector: ".iso-post",
				path: function generatePageUrl(currentPageNumber) {
					if ( $('body').hasClass('home') ) {
						return (iso_vars.page_url + 'page/' + currentPageNumber + "/");
					} else {
						return (iso_vars.page_url + currentPageNumber + "/");
					}
				},
				prefill : true
			},
				function ( newElements ) {
					var $newElems = $( newElements ).hide();
					$newElems.imagesLoaded(function () {
						$newElems.fadeIn();
						$container.isotope( 'appended', $newElems );
					});
				}
			);
		}

		// Create helper function to check if posts should be added after filtering
		function needPostsCheck() {
			if ( iso_vars.iso_paginate == 'yes' ) {
				if ( ( $container.height() < $(window).height() ) || ( $container.children(':visible').length == 0 ) ){
					$container.infinitescroll('retrieve');
				}
			} else {
				return false;
			}
		}

		// Check if posts are needed for filtered pages when they load
		$container.imagesLoaded(function () {
			if ( window.location.hash ) {
				needPostsCheck();
			}
		});

		var $filters = $('#filters');

		var inclusive_selectors = initialFilter;

		// Set up the click event for filtering
		$filters.on('click', 'a', function ( event ) {

			event.preventDefault();

			var selector = $(this).attr('data-filter');

			if (selector !="*") {
				// toggle ftw
				if (inclusive_selectors.indexOf(selector) !== -1) {
					console.log("deleting" + selector);
					inclusive_selectors = $.grep(inclusive_selectors, function(n, i){
						return n !== selector;
					});
					console.log(inclusive_selectors);
				}else{
					inclusive_selectors.push(selector);
				}

				// setting the filter active class
				$('#filters a.filteractive').removeClass('filteractive');
				$("[data-filter]").each(function(index){
					if (inclusive_selectors.indexOf($(this).attr('data-filter')) !== -1) {
						$(this).addClass('filteractive');
					}
				});
			} else {
				inclusive_selectors = [];
				$('#filters a.filteractive').removeClass('filteractive');
				$('#filters [data-filter="*"]').addClass('filteractive');
			}

			//nice url stuff, this should be an input above, but whatever
			var niceSelectors = $.map(inclusive_selectors,function(s){
				return s.substr(1);
			});

			if (history.pushState) {
				history.pushState( null, null, '#' + niceSelectors.join(","));
			}else{
				location.hash = niceSelectors.join("_");
			}

			var filterValue = inclusive_selectors.length ? inclusive_selectors.join('') : '*';

			$container.isotope({ filter: filterValue });
			needPostsCheck();
		});

	});

}(jQuery));
