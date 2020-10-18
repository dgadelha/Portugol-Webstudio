function debounce(func, wait, immediate) {
  // utility to trigger events after set time (used on scroll principally)
  let timeout;

  return function () {
    const context = this;
    const args = arguments;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
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

$(() => {
  const $header = $(".header");
  const $hasHint = $(".has-hint");
  const $hero = $(".level-hero");

  // hint arrows
  const levelHandler = function () {
    const st = $(window).scrollTop();
    const wh = $(window).height();
    const hh = $hero.outerHeight(true);
    const headerh = $header.outerHeight(true);

    if ($hasHint.length) {
      if (wh > hh + headerh) {
        $hasHint.removeClass("active-state");
      } else if (st <= 50) {
        $hasHint.addClass("active-state");
      } else {
        $hasHint.removeClass("active-state");
      }
    }
  };

  // run on doc ready
  levelHandler();

  const scrollTrigger = debounce(() => {
    // re-run on scroll :)
    levelHandler();
  }, 1);

  $(window).on("resize scroll", scrollTrigger);

  // scroll to next level clicking on hint arrow - cheap!
  $(".hint-arrow").on("click", function (e) {
    let $parentLevel = $(this).closest(".level");

    if (!$parentLevel.length) {
      $parentLevel = $(".level-hero");
    }

    const $nextLevel = $parentLevel.next(".level");
    var target = $nextLevel.offset();
    var target = target.top;

    if ($nextLevel) {
      $("body, html").animate(
        {
          scrollTop: target,
        },
        700,
        "linear",
      );
    }
  });
});
