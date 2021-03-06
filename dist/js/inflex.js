/* jshint strict:false */
/* global $, jQuery, FastClick */
/* exported inflex */

var $window = $(window), $document = $(document), $body;

var inflex = {

	utils: (function (){

		'use strict';

		// --------------------------------------------------------------------------------------------------------
		// Private Object & Methods
		// --------------------------------------------------------------------------------------------------------

		var initiate = {

			body: function (){

				$body = $body || $('body').removeClass('noscript');

				if (typeof FastClick !== 'undefined'){

					FastClick.attach(document.body);
				}
			},

			// Window Resize Listener(s)
			// ----------------------------------------------------

			resize: {

				timeout: null,

				listener: function (){

					var resize = this, prev = $window.width(); // Previous width

					$window.on('resize', function(){

						clearTimeout(resize.timeout);

						if ($window.width() !== prev){ // Fix: stackoverflow.com/q/8898412/
					
							$('[data-inflex-monitor]').attr('data-inflex-monitor', 'resizing');

							prev = $window.width();
						}

						resize.timeout = setTimeout(function(){

							$document.trigger($.Event('inflex.resized'));

							$('[data-inflex-monitor]').attr('data-inflex-monitor', '');
						
						}, 250);
					});
				}
			},

			// Input State Listener(s)
			// ----------------------------------------------------

			input: {

				listeners: function (){

					var input = this;

					$('input, textarea, select').attr('data-inflex', function (){

						var $elem = $(this),

						inflex = ($elem.attr('data-inflex') || '').replace(/\bstate:[0,1]\b/g, '');  // Remove existing state

						inflex += ' state:' + input.state(this, ''); // Determine new state

						$elem.attr('data-inflex', inflex.trim().replace(/\s+/g, ' ')); // Update data-inflex attribute
					});

					$document.on('input change', 'input, textarea, select', function (){

						var $elem = $(this),

						inflex = ($elem.attr('data-inflex') || '').replace(/\bstate:[0,1]\b/g, ''); // Remove existing state

						inflex += ' state:' + input.state(this, 0); // Determine new state

						$elem.attr('data-inflex', inflex.replace(/\s+/g, ' ')); // Update data-inflex attribute
					});
				},

				state: function (el, state){

					var $el = $(el);

					switch (el.nodeName){

						case 'SELECT':

							var selected = $el.find(((state === 0)?':selected':'[selected]') + ':first').text();

							return (selected.length)? 1 : state;

						default:

						return (el.value.length)? 1 : state;
					}
				}
			},

			// Droplets
			// ----------------------------------------------------

			droplet: {

				listeners: function (){

					var self = this;

					$('[data-inflex~="droplet"]').on('click', '[data-inflex~="droplet:toggle"]', function(event){

						event.stopPropagation();

						var $droplet = $(event.delegateTarget);
						
						self.toggle($('[data-inflex~="droplet:toggled"]'), "droplet:toggled", "droplet"); // Close all droplets

						self.toggle($droplet, "droplet", "droplet:toggled"); // Open droplet

						$document.off('click.offDroplet').on('click.offDroplet', function(event){

							if (!$droplet.find($(event.target)).length){

								self.toggle($droplet, "droplet:toggled", "droplet");

								$document.off('click.offDroplet');
							}
						});
					});
				},

				toggle: function ($droplets, find, replace){

						$droplets.attr('data-inflex', function (){

						return $(this).data('inflex').replace(find, replace);
					});
				}
			},

			// Droplets
			// ----------------------------------------------------

			accordion: {

				initiate: function (){

					var initiate = this;

					initiate.listeners();

					initiate.calibration();
				},

				listeners: function (){

					var accordion = this;

					$('nav[data-inflex~="accordion"]').on('click', 'li[data-inflex~="accordion:parent"] > a span[data-inflex~="accordion:toggle"]', function (event){

						event.preventDefault(); event.stopPropagation(); // Stop event bubbling

						accordion.toggle($(this).parent('a'));
					});
					
					$('nav[data-inflex~="accordion"]').on('click', 'li[data-inflex~="accordion:parent"]:not(.hc-expand) > a', function (event){

						event.preventDefault();

						accordion.toggle($(this));
					});
				},

				calibration: function(){

					$('nav[data-inflex~="accordion"] li[data-inflex~="accordion:parent"][data-active]').children('a').click(); // Expand active parent

					$('nav[data-inflex~="accordion"] li[data-active]').parents('li[data-inflex~="accordion:parent"]').children('a').click(); // Expand parents of active child
				},

				toggle: function ($a){

					var $li = $a.parents('li:first');

					inflex.utils.findReplace($li, 'accordion:parent', 'accordion:parent:expand');

					var $toggle = $a.children('span.hc-accordion-toggle');

					var toggleIcon = $toggle.data('toggleIcon') || null;

					if ($toggle.data('toggleIcon')){

						var $icon = $toggle.children('i');

						$toggle.data('toggleIcon', $icon.text());

						$icon.text(toggleIcon);
					}
				}
			}
		};

		// --------------------------------------------------------------------------------------------------------
		// Private Methods
		// --------------------------------------------------------------------------------------------------------

		function findReplace ($el, find, replace){

			var regExp = new RegExp('\\b'+find+'\\b', 'g');

			var value = ($el.attr('data-inflex') || '').replace(regExp, replace); // Find and replace value

			$el.attr('data-inflex', value);
		}

		// --------------------------------------------------------------------------------------------------------
		// Invoke on DOM Ready
		// --------------------------------------------------------------------------------------------------------

		$(function (){

			initiate.body();

			initiate.resize.listener();

			initiate.input.listeners();

			initiate.droplet.listeners();

			initiate.accordion.initiate();
		});

		// --------------------------------------------------------------------------------------------------------
		// Declare Public Accessible Methods
		// --------------------------------------------------------------------------------------------------------

		return {

			findReplace: findReplace
		};

	})(document, window, jQuery)
};