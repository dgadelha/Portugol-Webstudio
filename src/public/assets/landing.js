function debounce(func, wait, immediate) {
    // utility to trigger events after set time (used on scroll principally)
    var timeout;

    return function() {
        var context = this,
            args = arguments;

        clearTimeout(timeout);

        timeout = setTimeout(function() {
            timeout = null;

            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);

        if (immediate && !timeout) {
            func.apply(context, args);
        }
    };
}

$(function() {
    var $header = $('.header'),
        $hasHint = $('.has-hint'),
        $hero = $('.level-hero');

    // hint arrows
    var levelHandler = function() {
        var st = $(window).scrollTop(),
            wh = $(window).height(),
            hh = $hero.outerHeight(true),
            headerh = $header.outerHeight(true);

        if ($hasHint.length) {
            if (wh > (hh + headerh)) {
                $hasHint.removeClass('active-state');
            } else {
                if (st <= 50) {
                    $hasHint.addClass('active-state');
                } else {
                    $hasHint.removeClass('active-state');
                }
            }
        }

    };

    // run on doc ready
    levelHandler();

    var scrollTrigger = debounce(function() {
        // re-run on scroll :)
        levelHandler();
    }, 1);

    $(window).on('resize scroll', scrollTrigger);

    // scroll to next level clicking on hint arrow - cheap!
    $('.hint-arrow').on('click', function(e) {
        var $parentLevel = $(this).closest('.level');

        if (!$parentLevel.length) {
            $parentLevel = $('.level-hero');
        }

        var $nextLevel = $parentLevel.next('.level'),
            target = $nextLevel.offset(),
            target = target.top;

        if ($nextLevel) {
            $('body, html').animate({
                scrollTop: target
            }, 700, 'linear');
        }
    });
});
