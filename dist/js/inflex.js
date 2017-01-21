 	/* jshint strict:false */
 	/* global $, jQuery, FastClick */
 	/* exported inflex */

 	var $window = $(window), $document = $(document), $body;

 	var inflex =
 	{
 		utils: (function ()
		{
			'use strict';

			// *
			// **
			// ****
			// *********************************************************************************************************
			// Private Object & Methods
			// *********************************************************************************************************
			// ****
			// **
			// *
		
				var initiate =
				{
					body: function ()
					{
						$body = $body || $('body').removeClass('noscript');

						if (typeof FastClick !== 'undefined')
						{
							FastClick.attach(document.body);
						}
					},

					// Window Resize Listener
					// ---------------------------------------------------------

					resize:
					{
						timeout: null,

						listener: function ()
						{
							var resize = this, prev = $window.width(); // Previous width

							$window.on('resize', function()
								{
									clearTimeout(resize.timeout);

									if ($window.width() !== prev) // Fix: stackoverflow.com/q/8898412/
									{										
										$('[data-inflex-monitor]').attr('data-inflex-monitor', 'resizing');

										prev = $window.width();
									}

									resize.timeout = setTimeout(function()
										{
											$document.trigger($.Event('inflex.resized'));

											$('[data-inflex-monitor]').attr('data-inflex-monitor', '');
										}, 
									250);
								}
							);
						}
					},

					// Input Listener(s) - Monitor Interaction States etc
					// ---------------------------------------------------------

					input:
					{
						listeners: function ()
						{
							var input = this;

							$('input, textarea, select').attr('data-inflex', function ()
								{
									var $elem = $(this),

									inflex = ($elem.attr('data-inflex') || '').replace(/\bstate:[0,1]\b/g, '');  // Remove existing state

									inflex += ' state:' + input.state(this, ''); // Determine new state

									$elem.attr('data-inflex', inflex.trim().replace(/\s+/g, ' ')); // Update data-inflex attribute
								}
							);

							$document.on('input change', 'input, textarea, select', function ()
								{
									var $elem = $(this),

									inflex = ($elem.attr('data-inflex') || '').replace(/\bstate:[0,1]\b/g, ''); // Remove existing state

									inflex += ' state:' + input.state(this, 0); // Determine new state

									$elem.attr('data-inflex', inflex.replace(/\s+/g, ' ')); // Update data-inflex attribute
								}
							);
						},

						state: function (el, state)
						{
							var $el = $(el);

							switch (el.nodeName)
							{
								case 'SELECT':

									var selected = $el.find(((state === 0)?':selected':'[selected]') + ':first').text();

									return (selected.length)? 1 : state;

								default:

								return (el.value.length)? 1 : state;
							}
						}
					},

					// Droplets
					// ---------------------------------------------------------

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

							 $droplets.attr('data-inflex', function(){

								return $(this).data('inflex').replace(find, replace);
							});
						}
					}
				};

			// *
			// **
			// ****
			// *********************************************************************************************************
			// Invoke on DOM Ready
			// *********************************************************************************************************
			// ****
			// **
			// *

				$(function ()
					{
						initiate.body();

						initiate.resize.listener();

						initiate.input.listeners();

						initiate.droplet.listeners();
					}
				);

			// *
			// **
			// ****
			// *********************************************************************************************************
			// Declare Public Accessible Methods
			// *********************************************************************************************************
			// ****
			// **
			// *

				return {};
		    //

 		})(document, window, jQuery)
 	};