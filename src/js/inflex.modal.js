/*!
 * [inflex.modal.js] - Copyright (©) 2015, Paragon Internet Group Ltd | All Rights Reserved.
 */
    /* global inflex */
    /* global $document */
    /* global $body */
    /* global jQuery */

    inflex.modal = (function (window, document, $)
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

            var modal =
            {
                // Timeout
                // ---------------------------------------------------------

                xhr     : null,
                active  : false,
                $overlay: $('<div></div>'),
                $content: $('<div></div>'),

                // Defaults
                // ---------------------------------------------------------

                defaults:
                {
                    callback  : false,
                    classes   : null,
                    close     : true,
                    data      : null,
                    method    : 'GET',
                    selector  : "[data-inflex~='modal:return']",
                    strict    : false,
                    transition: 300
                },

                // Initiate
                // ---------------------------------------------------------

                initiate: function (options)
                {
                    modal.defaults = $.extend(modal.defaults, options); // Merge options from initiation, with defaults

                    modal.events(); // Register event listeners
                },

                // Events
                // ---------------------------------------------------------

                events: function ()
                {
                    $document.on('click.inflex.modal.open', '[data-inflex-modal]', function(event)
                        {   
                            event.preventDefault(); // Prevent default behaviour (navigation to target/form submission)

                            modal.$trigger = $(this); // Reference trigger element

                            modal.preconfigure(); // Preconfigure settings required for XHR, if applicable

                            modal.construct(); // Construct modal
                        }
                    );

                    $document.on('click.inflex.modal.close', 'div.inflex-modal-overlay, [data-inflex-modal-close]', function (event)
                        {
                            // NOTE: This listener cannot have preventDefault() or stopPropagation() as it breaks overflow scrolling, tooltips etc

                            if (event.target !== this && !$(event.target).parents('[data-inflex-modal-close]').length)
                            {
                                return; // If click was NOT on valid selector element, abort subsequent actions
                            }

                            modal.close();
                        }
                    );
                },

                // Preconfigure Modal
                // ---------------------------------------------------------

                preconfigure: function ()
                {
                    var options = {};

                    switch (modal.$trigger[0].tagName)
                    {
                        case 'BUTTON':

                            if (modal.$trigger.attr('type') === 'submit')
                            {
                                var $form = modal.$trigger.parents('form:first'); // Reference parent form

                                options.url = $form.attr('action'); // Set destination 'url'
                                
                                options.data = $form.serializeArray(); // Serialize and set form 'data'
                                
                                options.method = 'POST'; // Set AJAX method
                                
                                if (modal.$trigger[0].name && modal.$trigger[0].value) // If button has a name/value pair
                                {
                                    options.data.push( // Push name/value pair to data array, otherwise it gets forgotten
                                        {
                                            name: modal.$trigger[0].name, value: modal.$trigger[0].value
                                        }
                                    );
                                }
                            }

                            break;

                        case 'A':

                            options.url = modal.$trigger.attr('href');

                            break;

                        default:

                            throw Error('MODAL initiated with invalid trigger. No content target specified.');
                    }

                    modal.options = $.extend({}, modal.defaults, options, modal.$trigger.data('inflexModal'));
                },

                // Construct Modal
                // ---------------------------------------------------------

                construct: function ()
                {
                    $body.removeClass('inflex-modal-loaded').addClass('inflex-modal-loading'); // Remove 'loaded' class & add 'loading' class

                    if (modal.active) // If modal is active we're triggering a modal from within a modal (inception!!!)
                    {
                        modal.$content.animate({ 'opacity': 0 }, modal.options.transition, function () // Animate the container out of view to remove harsh content swap
                            {
                                modal.loadContent(null); // Load Content
                            }
                        );                
                    }
                    else // Else if modal is not already active
                    {   
                        modal.active = true;

                        $body.append(modal.$overlay.addClass('inflex-modal-overlay').append(modal.$content)); // Append $overlay to $body

                        modal.$overlay.animate({ 'opacity': 1 }, modal.options.transition, function ()
                            {
                                if (modal.active) // Protect against 'abort'
                                {
                                    modal.loadContent(null); // Load Content
                                }
                            }
                        );
                    }
                },

                // Fetch Modal Content
                // ---------------------------------------------------------

                fetchContent: function()
                {
                    modal.xhr = $.ajax(
                        {
                            url     : modal.options.url,
                            data    : modal.options.data,
                            type    : modal.options.method,
                            dataType: 'html',
                            timeout : 8000
                        }
                    );

                    return modal.xhr;
                },

                // Load Modal Content
                // ---------------------------------------------------------

                loadContent: function (html)
                {
                    if (modal.options.content) // If content is passed directly
                    {
                        html = modal.options.content;

                        modal.publishContent(html);
                    }
                    else if (modal.options.url && modal.options.url.match(/^#/)) // If source is local ID target (prefixed with #)
                    {
                        html = $(modal.options.url).html();

                        modal.publishContent(html);
                    }
                    else
                    {
                        modal.fetchContent()

                            .done(function(data)
                                {
                                    html = $(data).find(modal.options.selector).andSelf().filter(modal.options.selector).last(); // Filter response data by selector

                                    modal.publishContent(html); // Publish loaded content
                                }
                            ).error(function(data)
                                {
                                    switch (data.statusText)
                                    {
                                        case 'abort':

                                            return;

                                        default:

                                            console.error('MODAL loading error: ' + data.status + ' ("+data.statusText+").');

                                            alert('This content could not be loaded due to the following XMLHttpRequest error(s): ' + data.status + ' ("+data.statusText+").');

                                            break;
                                    }

                                    modal.remove(); // Remove all modal instances
                                }
                            );
                        //
                    } 
                },

                // Publish Modal Content
                // ---------------------------------------------------------

                publishContent: function(html)
                {
                    modal.$content.html(html); // Insert HTML into modal content

                    modal.$content.attr('class', 'inflex-modal-content').addClass(modal.options.classes); // Add 'content' class plus additional classes, if specified

                    modal.$content.css({ maxWidth: '' }).css({ maxWidth: modal.options.width }); // Set content 'max-width', if specified

                    modal.$content.prepend((modal.options.close)? '<a class="inflex-modal-close" data-inflex-modal-close></a>' : false); // Prepend 'Close' button, unless specified not to

                    modal.$content.animate({ 'opacity': 1 }, modal.options.transition, function () // Reveal modal content
                        {   
                            if (modal.active)
                            {
                                $body.removeClass('inflex-modal-loading').addClass('inflex-modal-loaded'); // End loading
                                
                                if (modal.options.callback) // If callback
                                {
                                    modal.options.callback.call(modal.$overlay); // Trigger callback
                                }
                            }
                        }
                    );

                    $document.trigger($.Event('inflex.modal.loaded')); // Trigger modal loaded event
                },

                // Close Modal
                // ---------------------------------------------------------

                close: function ()
                {
                    if (modal.xhr) // If active XMLHttpRequest
                    {
                        modal.xhr.abort(); // Abort XHR
                    }

                    if (modal.options.strict) // If strict close specified
                    {
                        if (confirm(modal.options.strict.replace(/\\n/g,'\n'))) // Confirm closure with custom message
                        {
                            modal.remove(); // Remove modal
                        }
                    } 
                    else 
                    {
                        modal.remove(); // Remove modal 
                    }
                },

                // Remove Modal
                // ---------------------------------------------------------

                remove: function ()
                {
                    modal.active = false; // Set modal 'active' state to false

                    modal.$overlay.animate({ 'opacity': 0 }, modal.options.transition, function () // Animate modal out
                        {
                            $body.removeClass('inflex-modal-loaded inflex-modal-loading'); // Remove $body classes

                            modal.$content.css({ 'opacity': 0 });

                            $(this).remove(); // Remove modal instance

                            modal.options = {}; // Reset modal options
                        }
                    );
                },

                // API - Dynamic Object Load
                // ---------------------------------------------------------

                load: function (params, callback)
                {
                    modal.options = $.extend({}, modal.defaults, params);

                    if ($.isFunction(callback) && typeof modal.options.callback !== 'function')
                    {
                        modal.options.callback = callback;
                    }

                    modal.construct();
                }
            };

        // *
        // **
        // ****
        // *********************************************************************************************************
        // Declare Public Accessible Methods (API)
        // *********************************************************************************************************
        // ****
        // **
        // *

            return {

                close   : modal.close,
                initiate: modal.initiate,
                load    : modal.load
            };

    })(window, document, jQuery);