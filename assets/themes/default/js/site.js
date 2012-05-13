/**
 * Copyright 2010 Michael Monteleone
 */
jQuery(function($){
    var browser = {
        isIe: $.browser.msie,
        isIe6: $.browser.msie && $.browser.version < 7,
        acceleratesCssAnimations: /webkit(.*?)mobile/gim.test(window.navigator.userAgent),
        isTouchPanel: /webkit(.*?)mobile/gim.test(window.navigator.userAgent)
    };
    
    $.accelerateCss(browser.acceleratesCssAnimations);
    
    // if the screen isn't a touchpanel (iphone, ipad, etc)
    // then add in some fancy rollover effects for links
    if(!browser.isTouchPanel) {
        $('nav#main_nav').peek({
            unpeekedWrapperOffset: browser.acceleratesCssAnimations ? 0 : -5,
            speed: 250
        });
        $('nav#main_nav a').colorTranspose();       
    }

    if(browser.isIe6) { 
        // in ie6, don't show the slidey background ghost title
        $('#inner_wrapper').addClass('no-bg'); 
        // pass all items that contain transparent pngs to an ie6-fixer-upper
        $('header#title h1 a, div#backpages div, body').iepng();
    } else {
        // hack - in any version of ie, don't animate the slidey title, just show it since it does such an 
        // ugly, jagged, flickery, distraction with it.  Need to change this to test for 
        // feature instead of browser identity  
        $('body[class!=home] #content').slideyTitle({
            animate: !browser.isIe
        });
    }
    
    $('body.home #content h1').rainbow().sunrise({
        to: browser.acceleratesCssAnimations ? 0 : -10
    });
    
    $.grid({
        columns: 9,
        columnWidth: 80
    });
    
    // twitter integration
    $("footer section.twitter nav").tweet({
        username: 'yadazula',
        count: 4,
        loading_text: 'loading twitter stream...'
    });
});

/**
 * Simplistic translation between pure-js-based jquery animation to native css3-based transforms
 * Does not support remotely as much API surface area as jQuery.animate, but enough for this 
 * site's animations to be blissfully unaware of whether they are running on a CSS or JS animation engine
 */
(function($){      
    var propNames = ['transitionProperty', 'transitionDuration', 'transitionTimingFunction'],
        browserPrefixes = ["-moz-", "-o-", "-webkit-"],
        timing = {
            "swing": "default",
            "linear": "linear",
            "easeOutExpo": "ease-out"
        },
        toCamelCase = function(value) {
            var dashAlpha = /-([a-z])/ig;
            var camelCase = function( all, letter ) {
                return letter.toUpperCase();
            };
            return value.replace(dashAlpha, camelCase);
        };
        
    $.fn.originalCss = $.fn.css;
    $.fn.originalAnimate = $.fn.animate;
        
               
    $.fn.cssanimate = function(properties, options) {
        var selection = this;        
        
        // make a base new style to convert to
        var newStyle = {
            transitionProperty: [],
            transitionDuration: [],
            transitionTimingFunction: []
        };
        
        // add in all the properties, durations, and easing specified by animate
        $.each(properties, function(key, value) {
            if($.isArray(value)) {
                value = value[0];
            }
            if(key === 'top') {
                key = "webkitTransform";
                value = "translateY("+value+")";
            } else if (key === "left") {
                key = "webkitTransform";
                value = "translateX("+value+")";                
            }
            newStyle.transitionProperty.push(key);
            newStyle.transitionDuration.push(options.duration / (1000) + "s");
            newStyle.transitionTimingFunction.push(timing[options.ease || "swing"] || "default");
            newStyle[key] = value;
        });
        
        // convert all specified props, durations, and easing into
        // css3-compliant values along with their browser-specific variants
        $.each(propNames, function(i, prop) {            
            newStyle[prop] = newStyle[prop].join(', ');
            $.each(browserPrefixes, function(i, prefix) {
                newStyle[toCamelCase(prefix + prop)] = newStyle[prop];
            });
        });
        
        // apply the naew style
        selection.css(newStyle);
        
        return selection;
    };

    // wraps jquery-based css styling of top/left with webkit transform versions
    $.fn.cssoffset = function(props) {
        if(props.top || props.left) {
            if(props.top && props.left) {
                props.webkitTransform = 'translate('+props.left+','+props.top+')';
                delete props.top;                
            } else if(props.top) {
                props.webkitTransform = 'translateY('+props.top+')';
                delete props.top;                
            } else if(props.left) {
                props.webkitTransform = 'translateX('+props.left+')';
                delete props.left;                
            }
        }
        return this.originalCss(props);
    };
    
    var overriden = false;
    $.accelerateCss = function(value) {
        if(value) {
            overriden = true;
            $.fn.animate = $.fn.cssanimate;
            $.fn.css = $.fn.cssoffset;
        } else {
            overriden = false;
            $.fn.animate = $.fn.originalAnimate;
            $.fn.css = $.fn.originalCss;
        }
        return overriden;
    };
    
})(jQuery);

// easing
(function($){
    $.extend($.easing, {
        easeOutBack: function (x, t, b, c, d, s) {
            if (typeof(s) === 'undefined') {
                s = 1.70158;
            }
            return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;
        },
        easeOutExpo: function (x, t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        }
    });    
})(jQuery);

/**
 * Creates a special 'explicitenter' event which behaves exactly like
 * 'mouseenter' except it is *not* triggered if the mouse happens to 
 * already be over the bound elements when the page first loads.  Therefore,
 * it only triggers when the mouse is *explicitly* moved over the element
 * 
 * example:
 *  $('a').bind('explicitenter', function(){ 
 *      alert('explicitly mouse entered into this link'); 
 *  });
 */
(function($){    
    /**
     * Returns whether a given mouse x/y position can be considered
     * within the bounds of an element
     */
    var isOverElement = function(elm, mouseX, mouseY) {
            elm = $(elm);
            var offset = elm.offset();
            var range = {x: [offset.left, offset.left + elm.width()],
                         y: [offset.top, offset.top + elm.height()]};
            return  mouseX >= range.x[0] && mouseX <= range.x[1] &&
                    mouseY >= range.y[0] && mouseY <= range.y[1];
        };    
    /**
     * define special 'explicitenter' event
     */
    $.event.special.explicitenter = {
        setup: function(data, namespaces) {
            var elem = $(this), activated = false;
            $(document).one('mousemove.explicitenter', function(event){
                // on the mouse's very first move over the page, if it's already
                // over the bound elements, wait until it leaves the element before activating 'enter' events
                if(isOverElement(elem, event.pageX, event.pageY)) {
                    elem.one('mouseout', function(){
                        activated = true;
                    });
                // otherwise, go ahead and activate enter events right away
                } else {
                    activated = true;
                }
            });
            elem.bind('mouseenter.explicitenter', function(event) {
                // only handle enter events if the elements are "activated"
                if(activated) {
                    event.type = 'explicitenter';
                    $.event.handle.apply(this, arguments);
                }
            });
        },
        teardown: function(namespaces) {
            $(document).unbind('mousemove.explicitenter');
            $(this).unbind('mouseenter.explicitenter');
        }
    };
})(jQuery);


/**
 * Simplstic grid layout helper jquery plugin
 * ctrl+shift+L toggles a grid-overlay guide on top of page
 * 
 * usage:  $.grid(); 
 * usage:  $.grid({columns: 9, columnWidth: 80});
 * usage:  $.grid({columns: 4, columnWidth: 180});
 */
(function($){
    var gridWrapper, grid, inited = false,
        init = function(settings) {
            if(!inited) {
                inited = true;
                
                gridWrapper = $('<div id="jq_grid_wrapper"></div>').css({
                    zIndex: 5000,
                    position: 'absolute',
                    top: '0px',
                    height: $(document).height(),
                    width: '100%' }).hide();
                grid = $('<div id="jq_grid"></div>').css({
                    height: '100%',
                    width: settings.columns * settings.columnWidth + 'px'
                }).appendTo(gridWrapper);
                
                if(settings.align === 'left' || settings.align === 'right') {
                    grid.css('position','absolute').css(settings.align,'0px');            
                } else {
                    grid.css({ marginLeft: 'auto', marginRight: 'auto' });            
                }
                
                for(var i = 0; i < settings.columns; i++) {
                    grid.append($('<div class="jq_grid_column"></div>').css({
                        backgroundColor: settings.color,
                        opacity: i % 2 === 0 ? 0.2 : 0.1,
                        width: settings.columnWidth + 'px',
                        height: '100%',
                        'float': 'left'}));
                }        
            }
        };
    $.grid = function(options) {
        var settings = $.extend({}, $.grid.defaults, options || {});
        $(document).bind('keydown', function(e){
            init(settings);
            if(e.ctrlKey && e.shiftKey && e.keyCode === settings.toggleKeyCode) {
                if(gridWrapper.is(':hidden')) {
                    gridWrapper.prependTo('body').show();
                } else {
                    gridWrapper.hide().remove();
                }
            }
        });
    }; 
    $.extend($.grid, {
        defaults: {
            columns: 9,
            columnWidth: 80,
            align: 'center', // left|center|right
            toggleKeyCode: 76, // ctrl+G
            color: 'red'
        }
    });
})(jQuery);


/* a naive IE6 transparent png background-url fix */
/* usage: */
/*    $('body').iepng(); */
(function($){    
    $.fn.iepng = function() {
        return this.each(function(){
            var elm = $(this);
            if(elm.css('background-image').match(/\.png/i) !== null) {
                var bg = elm.css('background-image');
                var src = bg.substring(5,bg.length-2);
                elm.css({
                    filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "')",
                    backgroundImage: 'url(x.gif)'
                });
            }
        });
    };        
})(jQuery);


(function($){
    $.fn.colorTranspose = function(options) {
        var settings = $.extend({}, $.fn.colorTranspose.defaults, options || {});
        var selection = this;
        var to = $(settings.toElementBgSelector);

        // build an invisible wrapper on the page to hold placeholder divs for sampling colors
        var transposeWrapper = $('<div></div>').hide().appendTo($('body'));
        var colors = {};  // hash to hold captured values of sampled colors
        this.each(function(){
            // sample each color by creating an element and adding to the invisible wrapper
            var colorName = $(this).attr('class');
            colors[colorName] = $('<div class="'+colorName+'"></div>')
                .appendTo(transposeWrapper)
                .css('color');
        });
        // no need to keep the wrapper around
        transposeWrapper.remove(); 
        
        // bind so that rolling over the links animates changing the background
        // color to one of the sampled ones matching the link's css class's color property
        $(selection.selector).live('mouseenter', function(e){
            var color = colors[$(e.target).attr('class')];
            to.animate({backgroundColor: color}, {duration: settings.duration, queue: false});
        });
        
        return this;
    };
    $.extend($.fn.colorTranspose, {
        defaults: {
            duration: 225,
            fromAttribute: 'color',
            toElementBgSelector: 'body'
        }
    });
})(jQuery);


(function($){
    var peekingKey = "__isPeeking", 
        previewKey = '__preview',
        /**
         * Adds in the necessary extra markup and re-arrangements of existing markup
         * to support peeking/sliding         
         */
        createUi = function(selection, settings) {
            // move navigation outside of sliding current area
            selection.insertAfter(
                $(settings.previewWrapperHtml).prependTo('body'))
                .find('a')
                // create preview links for each link
                .each(function(){
                    var link = $(this);
                    var preview = 
                        $(settings.previewItemHtml
                            .replace('?', $(this).attr('class')))
                            .appendTo('#backpages')
                            .css({ top: settings.wrapperOffset * 2 + 'px' });
                    link.data(previewKey, preview);
                });
        },
        /**
         * Sets up the internal event model when previews should be shown, switched, and re-hidden
         */
        initiateEventModel = function(selection, settings) {                
            selection.bind({
                explicitenter: function(e){
                    if(!selection.data(peekingKey)) {
                        selection.data(peekingKey,true);
                        // raise 'peek' whenever user first peeks any given link
                        // only raised if wasn't previously peeking
                        $(e.target).trigger('peek');
                    } else {
                        // raise 'peekchange' whenever user immeidately switches from peeking
                        // a current link to another
                        // only raised if was already previously peeking
                        $(e.target).trigger('peekchange');
                    }
                },
                mousedown: function(e){
                    // peeking can also be initiated by mouseing down a link
                    // on desktop browsers, would already be peeked at this point,
                    // but on touch screens, this would be the first peek
                    if(!selection.data(peekingKey)) {
                        selection.data(peekingKey,true);
                        $(e.target).trigger('peek');
                    }
                },
                mouseleave: function(e){
                    // raise unpeek if user stops peeking at any link (only raised if not peeking another)
                    if(selection.data(peekingKey) && !$(e.relatedTarget).is(selection.selector)) {
                        selection.data(peekingKey, false);
                        $(e.target).trigger('unpeek', {navigated:false});
                    }
                },
                click: function(e) {
                    // since browsers cache back page state,
                    // want to pre-set that state to act like it wasn't peeking at time
                    // even though it was.  otherwise, back button
                    // shows a weird half-peeked state even though you might
                    // not be peeking, since you were when you clicked it
                    selection.data(peekingKey,false);
                    $(e.target).trigger('unpeek', {navigated:true});
                }
            });
        },
        /**
         * Bind to internal peeking event model to render UI changes on 
         * peeking/switching/unpeeking events
         */
        bindEvents = function(selection, settings) {
            var wrapper = $(settings.wrapper),
                body = $('body'),
                currentPeek;
            selection.bind({
                peek: function(e, data) {
                    // hide any currently peeked item first, and stop any animation it might currently have
                    if(typeof currentPeek !== 'undefined') {
                        currentPeek.stop().css({top: settings.hiddenOffset + 'px' });                        
                    }
                    var preview = $(e.target).data(previewKey);
                    preview.css({top: '0px'});
                    currentPeek = preview;
                    body.addClass('open');
                },
                peekchange: function(e, data) {
                    currentPeek = $(e.target).data(previewKey);                    
                    var preview = currentPeek;
                },
                unpeek: function(e, data) {
                    // if being unpeeked from clicking a link,
                    // don't immediately remove the open class
                    // as this will cause a flash of improperly highlighted link (FOIHL)
                    if(!data.navigated) {
                        body.removeClass('open');                        
                    }
                }
            });
        };    
    $.fn.peek = function(options) {        
        var settings = $.extend({}, $.fn.peek.defaults, options || {});
        createUi(this, settings);
        var links = this.find('a');        
        bindEvents(links, settings);
        initiateEventModel(links, settings);
        
        // make sure that the peeking state 
        // is fully reset to not-peeking after the page is
        // being navigated away from, mainly for when 
        // back-buttoned back in by modern browsers
        // which cache historical page state
        $(window).bind("unload", function(){
            $('body').removeClass('open');
        });
        
        return this;
    };
    $.extend($.fn.peek, {
        defaults: {
            previewWrapperHtml: '<div id="backpages"></div>',
            previewItemHtml: '<div class="?"></div>',
            wrapper: '#wrapper',
            wrapperOffset: 100,
            previewOffset: 30,
            hiddenOffset: 130,
            ease: 'easeOutBack',
            speed: 300,
            unpeekedWrapperOffset: -5,
            unpeekedOffset: 0
        }        
    });    
})(jQuery);

// little animation that makes an item appear to rise up out of nowhere 
(function($){
    $.fn.sunrise = function(options) {
        var settings = $.extend({}, $.fn.sunrise.defaults, options || {});        
        if(this.length === 0) {
            return this;
        }
        
        this.css({
            position: 'relative',
            opacity: 0,
            top: settings.from + 'px'});
        var self = this;
        setTimeout(function(){
            self.animate(
                {
                    top: settings.to + 'px',
                    opacity: 1.0 
                },
                {
                    duration:settings.duration, 
                    easing:settings.easing,
                    // ugly hack to avoid IE issue where 
                    // bold cleartyped text which has had its
                    // opacity changed ends up looking jagged
                    // and un-antialiased.  Removing the 'filter'
                    // attribute at the end of it returns to normal
                    complete: function(){
                        if ($.browser.msie) {
                            this.style.removeAttribute('filter');                        
                        }
                    }                    
                });
            
        }, 100);
        
        return this;
    };
    $.extend($.fn.sunrise, {
        defaults: {
            from: 100,
            to: -10,
            duration: 300,
            easing: 'easeOutBack'

        }        
    });
})(jQuery);

// rainbow text
(function($){
    $.fn.rainbow = function(options) {
        var settings = $.extend({}, $.fn.rainbow.defaults, options || {});
        
        if(this.length === 0) {
            return this;
        }
        
        var text = this.html();
        this.empty();
        for(var i=0;i<text.length;i++) { 
            var letter = $('<span>'+text.charAt(i)+'</span>').data('to-color',settings.colors[i % 3]);
            this.append(letter);
        }
        var animationSettings = {duration: settings.duration, queue: false};
        $(this.selector + ' span')
            .bind('mouseover', function(e){
                var span = $(e.target);
                span.animate({color: span.data('to-color')}, {duration: settings.colorDuration, queue: false});
            })
            .bind('mouseout', function(e){
                $(e.target).animate({color: settings.defaultColor}, {duration: settings.unColorDuration, queue: false});
            });
        return this;
    };
    $.extend($.fn.rainbow, {
        defaults: {
            defaultColor: '#000000',
            colorDuration: 100,
            unColorDuration: 500,
            colors: ['#009ff7','#87d14b','#FF007C']
        }        
    });
})(jQuery);


// slidey title plugin
(function($){
    $.fn.slideyTitle = function(options) {
        var settings = $.extend({}, $.fn.slideyTitle.defaults, options || {});
        
        // don't even bother if there's no h1 on the page
        // also, h1 content might be in a link.  so find first h1 with link or first h1.
        // and take the last one of that set, since if there was a link, it would have been 
        // last as it's lower in the dom
        var h1 = this.find('h1:first a,h1:first').last(); 
        if(h1.length === 0) {
            return this;
        }
        
        return this.each(function(){
            var title = h1.html().substr(0, 10);
            var content = $(this),
                width = $(document).width(),
                slideyTitle = $(settings.html.replace('?',title)).insertBefore(content);
                
            if(settings.animate) {
                slideyTitle = slideyTitle.find('span');
                slideyTitle.css({ 
                    opacity: 0,
                    left: '1000px'
                    });
                setTimeout(function(){
                    slideyTitle.animate({ 
                        opacity: [1, settings.appearEase],
                        left: '10px'
                        }, { 
                        easing: settings.slideEase,
                        duration: settings.speed, 
                        queue: false });                    
                }, 10);
            }
        });
    };
    $.extend($.fn.slideyTitle, {
        defaults: {
            html: '<div class="slidey_title_wrapper"><div class="slidey_title"><span>?</span></div></div>',
            slideEase: 'easeOutExpo',
            appearEase: 'swing',
            animate: true,
            speed: 300
        }
    });
})(jQuery);



/* third-party plugins below */


/*
 * jQuery Color Animations
 * Copyright 2007 John Resig
 * Released under the MIT and GPL licenses.
 */

(function(jQuery){

    // We override the animation for all of these color styles
    jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function(i,attr){
        jQuery.fx.step[attr] = function(fx){
            if ( fx.state === 0 ) {
                fx.start = getColor( fx.elem, attr );
                fx.end = getRGB( fx.end );
            }

            fx.elem.style[attr] = "rgb(" + [
                Math.max(Math.min( parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0], 10), 255), 0),
                Math.max(Math.min( parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1], 10), 255), 0),
                Math.max(Math.min( parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2], 10), 255), 0)
            ].join(",") + ")";
        };
    });

    // Color Conversion functions from highlightFade
    // By Blair Mitchelmore
    // http://jquery.offput.ca/highlightFade/

    // Parse strings looking for color tuples [255,255,255]
    function getRGB(color) {
        var result;

        // Check if we're already dealing with an array of colors
        if ( color && color.constructor === Array && color.length === 3 ) {
            return color;
        }

        // Look for rgb(num,num,num)
        if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color)) {
            return [parseInt(result[1], 10), parseInt(result[2], 10), parseInt(result[3], 10)];
        }

        // Look for rgb(num%,num%,num%)
        if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color)) {
            return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];
        }

        // Look for #a0b1c2
        if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color)) {
            return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];
        }

        // Look for #fff
        if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color)) {
            return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];
        }

        // Otherwise, we're most likely dealing with a named color
        return colors[jQuery.trim(color).toLowerCase()];
    }
    
    function getColor(elem, attr) {
        var color;

        do {
            color = jQuery.curCSS(elem, attr);

            // Keep going until we find an element that has color, or we hit the body
            if ( color != '' && color != 'transparent' || jQuery.nodeName(elem, "body") ) {
                break;              
            }

            attr = "backgroundColor";
        } while ( elem = elem.parentNode );

        return getRGB(color);
    }
    
    // Some named colors to work with
    // From Interface by Stefan Petre
    // http://interface.eyecon.ro/

    var colors = {
        /* don't need these in my app and it's lots of data, so... */
        /*
        aqua:[0,255,255],
        azure:[240,255,255],
        beige:[245,245,220],
        black:[0,0,0],
        blue:[0,0,255],
        brown:[165,42,42],
        cyan:[0,255,255],
        darkblue:[0,0,139],
        darkcyan:[0,139,139],
        darkgrey:[169,169,169],
        darkgreen:[0,100,0],
        darkkhaki:[189,183,107],
        darkmagenta:[139,0,139],
        darkolivegreen:[85,107,47],
        darkorange:[255,140,0],
        darkorchid:[153,50,204],
        darkred:[139,0,0],
        darksalmon:[233,150,122],
        darkviolet:[148,0,211],
        fuchsia:[255,0,255],
        gold:[255,215,0],
        green:[0,128,0],
        indigo:[75,0,130],
        khaki:[240,230,140],
        lightblue:[173,216,230],
        lightcyan:[224,255,255],
        lightgreen:[144,238,144],
        lightgrey:[211,211,211],
        lightpink:[255,182,193],
        lightyellow:[255,255,224],
        lime:[0,255,0],
        magenta:[255,0,255],
        maroon:[128,0,0],
        navy:[0,0,128],
        olive:[128,128,0],
        orange:[255,165,0],
        pink:[255,192,203],
        purple:[128,0,128],
        violet:[128,0,128],
        red:[255,0,0],
        silver:[192,192,192],
        white:[255,255,255],
        yellow:[255,255,0]
        */
    };
    
})(jQuery);