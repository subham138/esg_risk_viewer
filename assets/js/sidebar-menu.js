    $(".toggle-nav").click(function () {
        $('.nav-menu').css("left", "0px");
    });
    $(".mobile-back").click(function () {
        $('.nav-menu').css("left", "-410px");
    });

    $(".page-wrapper").attr("class", "page-wrapper "+localStorage.getItem("page-wrapper"));
    $(".page-body-wrapper").attr("class", "page-body-wrapper "+localStorage.getItem("page-body-wrapper"));

    if (localStorage.getItem("page-wrapper") === null) {
        $(".page-wrapper").addClass("compact-wrapper");
    }   

  // Helper to check if a menu title has child sub-menus or sub-sub-menus
  function hasMenuChildren($el) {
      if ($el.hasClass('link-nav')) return false;
      var $li = $el.closest('li');
      if ($li.hasClass('mega-menu') || $li.children('.mega-menu-container').length > 0) return true;
      if ($li.children('ul.nav-submenu, ul.projects-vertical-menu, ul.menu-content').length > 0) return true;
      if ($el.next('ul, .mega-menu-container, .menu-content').length > 0) return true;
      if ($li.find('> ul, > .mega-menu-container, > .menu-content').length > 0) return true;
      return false;
  }

  function hasSubmenuChildren($el) {
      if ($el.next('ul, .submenu-content').length > 0) return true;
      var $parent = $el.closest('.link-section, li');
      if ($parent.find('> ul, > .submenu-content').length > 0) return true;
      return false;
  }

  // left sidebar and horizotal menu
    if($('#pageWrapper').hasClass('compact-wrapper')){
          jQuery('.submenu-title').each(function () {
              if (hasSubmenuChildren(jQuery(this))) {
                  if (jQuery(this).find('.according-menu').length === 0) {
                      jQuery(this).append('<div class="according-menu"><i class="fa fa-angle-right"></i></div>');
                  }
              } else {
                  jQuery(this).find('.according-menu').remove();
              }
          });
          jQuery('.submenu-title').click(function () {
              if (!hasSubmenuChildren(jQuery(this))) return;
              jQuery('.submenu-title').removeClass('active');
              jQuery('.submenu-title').find('.according-menu i').removeClass('fa-angle-down').addClass('fa-angle-right');
              jQuery('.submenu-content').slideUp('normal');
              if (jQuery(this).next().is(':hidden') == true) {
                  jQuery(this).addClass('active');
                  jQuery(this).find('.according-menu i').removeClass('fa-angle-right').addClass('fa-angle-down');
                  jQuery(this).next().slideDown('normal');
              } else {
                  jQuery(this).find('.according-menu i').removeClass('fa-angle-down').addClass('fa-angle-right');
              }
          });
          jQuery('.submenu-content').hide();

          jQuery('.menu-title').each(function () {
              if (hasMenuChildren(jQuery(this))) {
                  if (jQuery(this).find('.according-menu').length === 0) {
                      jQuery(this).append('<div class="according-menu"><i class="fa fa-angle-right"></i></div>');
                  }
              } else {
                  jQuery(this).find('.according-menu').remove();
              }
          });
          jQuery('.menu-title').click(function (e) {
              if (!hasMenuChildren(jQuery(this))) {
                  return; // Standalone link without sub-menu; allow normal navigation
              }
              if ($(this).attr('id') === 'custActMenuProject') {
                  e.preventDefault();
                  var $dropdown = $(this).closest('li');
                  var $menu = $dropdown.find('> ul.projects-vertical-menu');
                  var $arrow = $(this).find('.according-menu i');

                  if ($menu.is(':visible')) {
                      $menu.slideUp('normal');
                      $arrow.removeClass('fa-angle-down').addClass('fa-angle-right');
                      $dropdown.removeClass('active');
                      $(this).removeClass('active');
                  } else {
                      $menu.slideDown('normal');
                      $arrow.removeClass('fa-angle-right').addClass('fa-angle-down');
                      $dropdown.addClass('active');
                      $(this).addClass('active');
                  }
                  return false;
              }
              if ($(this).next('ul.nav-submenu').length > 0 || $(this).closest('li').find('> ul.nav-submenu').length > 0) {
                  e.preventDefault();
                  return false;
              }
              jQuery('.menu-title').each(function () {
                  if (hasMenuChildren(jQuery(this))) {
                      jQuery(this).removeClass('active');
                      jQuery(this).find('.according-menu i').removeClass('fa-angle-down').addClass('fa-angle-right');
                  }
              });
              jQuery('.menu-content').slideUp('normal');
              if (jQuery(this).next().is(':hidden') == true) {
                  jQuery(this).addClass('active');
                  jQuery(this).find('.according-menu i').removeClass('fa-angle-right').addClass('fa-angle-down');
                  jQuery(this).next().slideDown('normal');
              } else {
                  jQuery(this).find('.according-menu i').removeClass('fa-angle-down').addClass('fa-angle-right');
              }
          });
          jQuery('.menu-content').hide();
    } else if ($('#pageWrapper').hasClass('horizontal-wrapper')) {
        var contentwidth = jQuery(window).width();
        if ((contentwidth) < '992') {
            $('#pageWrapper').removeClass('horizontal-wrapper').addClass('compact-wrapper');
            $('.page-body-wrapper').removeClass('horizontal-menu').addClass('sidebar-icon');
            jQuery('.submenu-title').each(function () {
                if (hasSubmenuChildren(jQuery(this))) {
                    if (jQuery(this).find('.according-menu').length === 0) {
                        jQuery(this).append('<div class="according-menu"><i class="fa fa-angle-right"></i></div>');
                    }
                } else {
                    jQuery(this).find('.according-menu').remove();
                }
            });
            jQuery('.submenu-title').click(function () {
                if (!hasSubmenuChildren(jQuery(this))) return;
                jQuery('.submenu-title').removeClass('active');
                jQuery('.submenu-title').find('.according-menu i').removeClass('fa-angle-down').addClass('fa-angle-right');
                jQuery('.submenu-content').slideUp('normal');
                if (jQuery(this).next().is(':hidden') == true) {
                    jQuery(this).addClass('active');
                    jQuery(this).find('.according-menu i').removeClass('fa-angle-right').addClass('fa-angle-down');
                    jQuery(this).next().slideDown('normal');
                } else {
                    jQuery(this).find('.according-menu i').removeClass('fa-angle-down').addClass('fa-angle-right');
                }
            });
            jQuery('.submenu-content').hide();

            jQuery('.menu-title').each(function () {
                if (hasMenuChildren(jQuery(this))) {
                    if (jQuery(this).find('.according-menu').length === 0) {
                        jQuery(this).append('<div class="according-menu"><i class="fa fa-angle-right"></i></div>');
                    }
                } else {
                    jQuery(this).find('.according-menu').remove();
                }
            });
            jQuery('.menu-title').click(function (e) {
                if (!hasMenuChildren(jQuery(this))) {
                    return;
                }
                if ($(this).attr('id') === 'custActMenuProject') {
                    e.preventDefault();
                    var $dropdown = $(this).closest('li');
                    var $menu = $dropdown.find('> ul.projects-vertical-menu');
                    var $arrow = $(this).find('.according-menu i');

                    if ($menu.is(':visible')) {
                        $menu.slideUp('normal');
                        $arrow.removeClass('fa-angle-down').addClass('fa-angle-right');
                        $dropdown.removeClass('active');
                        $(this).removeClass('active');
                    } else {
                        $menu.slideDown('normal');
                        $arrow.removeClass('fa-angle-right').addClass('fa-angle-down');
                        $dropdown.addClass('active');
                        $(this).addClass('active');
                    }
                    return false;
                }
                if ($(this).next('ul.nav-submenu').length > 0 || $(this).closest('li').find('> ul.nav-submenu').length > 0) {
                    e.preventDefault();
                    return false;
                }
                jQuery('.menu-title').each(function () {
                    if (hasMenuChildren(jQuery(this))) {
                        jQuery(this).removeClass('active');
                        jQuery(this).find('.according-menu i').removeClass('fa-angle-down').addClass('fa-angle-right');
                    }
                });
                jQuery('.menu-content').slideUp('normal');
                if (jQuery(this).next().is(':hidden') == true) {
                    jQuery(this).addClass('active');
                    jQuery(this).find('.according-menu i').removeClass('fa-angle-right').addClass('fa-angle-down');
                    jQuery(this).next().slideDown('normal');
                } else {
                    jQuery(this).find('.according-menu i').removeClass('fa-angle-down').addClass('fa-angle-right');
                }
            });
            jQuery('.menu-content').hide();
        }

    }

// toggle sidebar


    if (localStorage.getItem("sidebar_squeezed") === "true") {
        $("body").addClass("sidebar-icon-only");
        $(".page-wrapper").addClass("sidebar-icon-only");
        $("footer").addClass("close_nav");
    } else {
        $("body").removeClass("sidebar-icon-only");
        $(".page-wrapper").removeClass("sidebar-icon-only");
        $("footer").removeClass("close_nav");
    }

    function toggleSidebarState(forceCollapse) {
        const isCurrentlyCollapsed = $("body").hasClass("sidebar-icon-only");
        const willCollapse = (forceCollapse !== undefined) ? forceCollapse : !isCurrentlyCollapsed;

        if (willCollapse) {
            $("body").addClass("sidebar-icon-only");
            $(".page-wrapper").addClass("sidebar-icon-only");
            $("footer").addClass("close_nav");
            localStorage.setItem("sidebar_squeezed", "true");
            // Temporarily suppress hover re-expansion so click visibly collapses sidebar immediately
            $("header.main-nav").addClass("sidebar-just-collapsed");
        } else {
            $("body").removeClass("sidebar-icon-only");
            $(".page-wrapper").removeClass("sidebar-icon-only");
            $("footer").removeClass("close_nav");
            localStorage.setItem("sidebar_squeezed", "false");
            $("header.main-nav").removeClass("sidebar-just-collapsed");
        }
    }

    $(document).on("click", "#sidebar-toggle-btn, .toggleSidebarTogle", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebarState();
    });

    $(document).on("mouseleave", "header.main-nav", function () {
        $(this).removeClass("sidebar-just-collapsed");
    });

    // Toggle Projects vertical submenu on click
    $(document).on("click", "#custActMenuProject", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $dropdown = $(this).closest("li.projects-vertical-dropdown");
        var $menu = $dropdown.find("> ul.projects-vertical-menu");
        var $arrow = $(this).find(".according-menu i");

        if ($menu.is(":visible")) {
            $menu.slideUp(200);
            $arrow.removeClass("fa-angle-down").addClass("fa-angle-right");
            $dropdown.removeClass("active");
        } else {
            $menu.slideDown(200);
            $arrow.removeClass("fa-angle-right").addClass("fa-angle-down");
            $dropdown.addClass("active");
        }
    });

    // Initialize Projects arrow and menu on page load if active
    if ($("li.projects-vertical-dropdown").hasClass("active")) {
        $("li.projects-vertical-dropdown #custActMenuProject .according-menu i")
            .removeClass("fa-angle-right")
            .addClass("fa-angle-down");
        $("li.projects-vertical-dropdown > ul.projects-vertical-menu").show();
    }

//responsive sidebar
var $window = $(window);
var widthwindow = $window.width();
(function($) {
"use strict";
if(widthwindow+17 <= 993) {   
    $('.toggle-sidebar').attr('checked', false);
    $('.main-nav').addClass("close_icon");
    $('.page-main-header').addClass("close_icon");
}
})(jQuery);


$( window ).resize(function() {
var widthwindaw = $window.width();

if(widthwindaw+17 <= 991){
    $('.toggle-sidebar').attr('checked', false);
    $('.main-nav').addClass("close_icon");
    $('.page-main-header').addClass("close_icon");
}else{
    $('.toggle-sidebar').attr('checked', false);
    $('.main-nav').removeClass("close_icon");
    $('.page-main-header').removeClass("close_icon");
}

if(widthwindow >= 768) {   
    $('.toggle-sidebar').click(function() {    
        $('.main-nav').toggleClass('close_icon');
        $('.page-main-header').toggleClass('close_icon');
    });
}
});

// horizontal arrowss
var view = $("#mainnav");
var move = "500px";
var leftsideLimit = -500


// get wrapper width
var getMenuWrapperSize = function () {
    return $('.sidebar-wrapper').innerWidth();
}
var menuWrapperSize = getMenuWrapperSize();

if ((menuWrapperSize) >= '1660') {
    var sliderLimit = -3000
    
} else if ((menuWrapperSize) >= '1440') {
    var sliderLimit = -3600
} else {
    var sliderLimit = -4200
}

$("#left-arrow").addClass("disabled");
$("#right-arrow").click(function () {
    var currentPosition = parseInt(view.css("marginLeft"));
    if (currentPosition >= sliderLimit) {
        $("#left-arrow").removeClass("disabled");
        view.stop(false, true).animate({
            marginLeft: "-=" + move
        }, {
            duration: 400
        })
        if (currentPosition == sliderLimit) {
            $(this).addClass("disabled");
            console.log("sliderLimit", sliderLimit);
        }
    }
});

$("#left-arrow").click(function () {
    var currentPosition = parseInt(view.css("marginLeft"));
    if (currentPosition < 0) {
        view.stop(false, true).animate({
            marginLeft: "+=" + move
        }, {
            duration: 400
        })
        $("#right-arrow").removeClass("disabled");
        $("#left-arrow").removeClass("disabled");
        if (currentPosition >= leftsideLimit) {
            $(this).addClass("disabled");
        }
    }

});

// page active detection & synchronization
    var currentPath = window.location.pathname;
    var currentSearch = window.location.search;
    var currentFull = currentPath + currentSearch;

    // Remove previous active classes
    $(".main-navbar").find("a").removeClass("active cust-active");
    $(".main-navbar").find("li").removeClass("active");

    var frameworkCodeMap = {
        'SQ%3D%3D': 'ifrs_flag', 'SQ==': 'ifrs_flag', 'I': 'ifrs_flag',
        'SUY%3D': 'ifrs_fr_flag', 'SUY=': 'ifrs_fr_flag', 'IF': 'ifrs_fr_flag',
        'RQ%3D%3D': 'esrs_flag', 'RQ==': 'esrs_flag', 'E': 'esrs_flag',
        'RUY%3D': 'esrs_fr_flag', 'RUY=': 'esrs_fr_flag', 'EF': 'esrs_fr_flag',
        'RVY%3D': 'esrs_vsme_flag', 'RVY=': 'esrs_vsme_flag', 'EV': 'esrs_vsme_flag',
        'RVZG': 'esrs_vsme_fr_flag', 'EVF': 'esrs_vsme_fr_flag',
        'Rw%3D%3D': 'gri_flag', 'Rw==': 'gri_flag', 'G': 'gri_flag',
        'Rg%3D%3D': 'gri_fr_flag', 'Rg==': 'gri_fr_flag', 'GF': 'gri_fr_flag', 'F': 'gri_fr_flag'
    };

    var ghgFlags = ['SUM%3D', 'SUM=', 'RkM%3D', 'RkM=', 'IC', 'FC'];

    // Rule 1: The project will be active if router equals /my_project, /project_report_view, /my_project_add, /cal_report_full_view, /vsme/questionnaire, /vsme/xbrl-preview (and /cal_proj_report_view, /report_full_view)
    var isProjectRoute = (
        currentPath.indexOf('/my_project') !== -1 ||
        currentPath.indexOf('/project_report_view') !== -1 ||
        currentPath.indexOf('/report_full_view') !== -1 ||
        currentPath.indexOf('/cal_proj_report_view') !== -1 ||
        currentPath.indexOf('/cal_report_full_view') !== -1 ||
        currentPath.indexOf('/vsme/') !== -1
    );

    if (isProjectRoute) {
        var flagVal = '';
        var flagMatch = currentSearch.match(/[?&]flag=([^&#]+)/);
        if (flagMatch && flagMatch[1]) {
            flagVal = flagMatch[1];
        }

        var encDataObj = null;
        var encMatch = currentSearch.match(/[?&]enc_data=([^&#]+)/);
        if (encMatch && encMatch[1]) {
            try {
                var raw = decodeURIComponent(encMatch[1]);
                var decodedStr = window.atob(raw);
                encDataObj = JSON.parse(decodedStr);
            } catch (e) {}
        }

        var isGhg = (
            currentPath.indexOf('/cal_proj_report_view') !== -1 ||
            currentPath.indexOf('/cal_report_full_view') !== -1 ||
            (flagVal && (ghgFlags.indexOf(flagVal) !== -1 || ghgFlags.indexOf(decodeURIComponent(flagVal)) !== -1)) ||
            (encDataObj && (ghgFlags.indexOf(encDataObj.dec_flag) !== -1 || ghgFlags.indexOf(encDataObj.flag) !== -1))
        );

        var isSus = (
            currentPath.indexOf('/project_report_view') !== -1 ||
            currentPath.indexOf('/report_full_view') !== -1 ||
            currentPath.indexOf('/vsme/') !== -1 ||
            (!isGhg && isProjectRoute)
        );

        var targetSubSubCode = null;
        if (flagVal) {
            var decFlagVal = decodeURIComponent(flagVal);
            if (frameworkCodeMap[flagVal]) targetSubSubCode = flagVal;
            else if (frameworkCodeMap[decFlagVal]) targetSubSubCode = decFlagVal;
        }
        if (!targetSubSubCode && encDataObj) {
            var dFlag = encDataObj.dec_flag || encDataObj.flag;
            if (dFlag && frameworkCodeMap[dFlag]) {
                var key = frameworkCodeMap[dFlag];
                $("ul.horizontal-flyout-menu a").each(function () {
                    var h = $(this).attr("href");
                    var m = h && h.match(/flag=([^&#]+)/);
                    if (m && frameworkCodeMap[m[1]] === key) {
                        targetSubSubCode = m[1];
                        return false;
                    }
                });
            }
        }
        if (!targetSubSubCode && currentPath.indexOf('/vsme/') !== -1) {
            targetSubSubCode = 'RVY%3D';
        }

        var $topLi = $("li.projects-vertical-dropdown");
        var $topLink = $topLi.find("> a#custActMenuProject");
        var $vertMenu = $topLi.find("> ul.projects-vertical-menu");

        // Rule 1: Project menu is active & expanded
        $topLi.addClass("active");
        $topLink.addClass("active cust-active");
        $topLink.find(".according-menu i").removeClass("fa-angle-right").addClass("fa-angle-down");
        $vertMenu.show();

        if (isGhg) {
            // Rule 3: GHG Emissions Module sub-menu is active
            var $ghgLink = $vertMenu.find("a.ghg-module-btn");
            var $ghgLi = $ghgLink.closest("li");
            $ghgLi.addClass("active");
            $ghgLink.addClass("active");
        } else if (isSus) {
            // Rule 2: Sustainability Module sub-menu is active
            var $susLi = $vertMenu.children("li.has-horizontal-sub");
            var $susLink = $susLi.children("a");
            $susLi.addClass("active");
            $susLink.addClass("active");

            // Rule 4: Sub-sub-menu active assignment
            if (targetSubSubCode) {
                var decTarget = decodeURIComponent(targetSubSubCode);
                var found = false;
                $susLi.find("ul.horizontal-flyout-menu a").each(function () {
                    var href = $(this).attr("href");
                    if (href && (href.indexOf("flag=" + targetSubSubCode) !== -1 || href.indexOf("flag=" + decTarget) !== -1)) {
                        $(this).addClass("active");
                        $(this).closest("li").addClass("active");
                        found = true;
                        return false;
                    }
                });
                if (!found && frameworkCodeMap[targetSubSubCode]) {
                    var targetKey = frameworkCodeMap[targetSubSubCode];
                    $susLi.find("ul.horizontal-flyout-menu a").each(function () {
                        var href = $(this).attr("href");
                        var m = href && href.match(/flag=([^&#]+)/);
                        if (m && frameworkCodeMap[m[1]] === targetKey) {
                            $(this).addClass("active");
                            $(this).closest("li").addClass("active");
                            return false;
                        }
                    });
                }
            }
        }

        // Also highlight link for single mode platform_mode == 'C'
        $(".main-navbar a[href*='/my_project']").each(function () {
            if ($(this).closest(".projects-vertical-dropdown").length === 0) {
                $(this).addClass("active cust-active");
                $(this).closest("li").addClass("active");
            }
        });
    } else {
        // Standard page active match for non-project routes (e.g. /dashboard, /manage_user)
        var $matchedLink = null;

        if (currentSearch && currentSearch !== "") {
            $(".main-navbar a").each(function () {
                var href = $(this).attr("href");
                if (href && href !== "javascript:void(0)" && $(this).closest(".projects-vertical-dropdown").length === 0) {
                    if (href === currentFull || currentFull.indexOf(href) === 0) {
                        $matchedLink = $(this);
                        return false;
                    }
                }
            });
        }

        if (!$matchedLink && currentPath && currentPath !== "/") {
            $(".main-navbar a").each(function () {
                var href = $(this).attr("href");
                if (href && href !== "javascript:void(0)" && href.indexOf("?") === -1 && $(this).closest(".projects-vertical-dropdown").length === 0) {
                    if (href === currentPath) {
                        $matchedLink = $(this);
                        return false;
                    }
                }
            });
        }

        if ($matchedLink && $matchedLink.length > 0) {
            $matchedLink.addClass("active cust-active");
            $matchedLink.closest("li").addClass("active");

            if ($matchedLink.closest(".nav-menu > li ul, .nav-menu > li .mega-menu-container").length > 0) {
                var $topLi = $matchedLink.closest(".nav-menu > li");
                var $topLink = $topLi.find("> a");

                $topLi.addClass("active");
                $topLink.addClass("active cust-active");

                var $submenu = $topLi.find("> ul.menu-content, > .mega-menu-container");
                if ($submenu.length > 0 && !$submenu.hasClass("nav-submenu")) {
                    $submenu.show();
                    $topLink.find(".according-menu i").removeClass("fa-angle-right").addClass("fa-angle-down");
                }
            }
        }
    }

    if ($('a.nav-link.menu-title.active').length > 0) {
        $('.custom-scrollbar').animate({
            scrollTop: $('a.nav-link.menu-title.active').offset().top - 500
        }, 1000);
    }

    // Dynamic vertical alignment for fixed right flyouts on hover
    function alignFlyout($li) {
        var $submenu = $li.children('ul.nav-submenu');
        if ($submenu.length) {
            var rect = $li[0].getBoundingClientRect();
            var sidebarWidth = $('header.main-nav').outerWidth() || 260;
            var topPos = rect.top;
            var submenuHeight = $submenu.outerHeight() || 240;
            if (topPos + submenuHeight > window.innerHeight - 10) {
                topPos = Math.max(10, window.innerHeight - submenuHeight - 10);
            }
            $submenu.css({
                'top': topPos + 'px',
                'left': (sidebarWidth + 6) + 'px'
            });
        }
    }

    function alignHorizontalFlyout($li) {
        var $flyout = $li.children('ul.horizontal-flyout-menu');
        if ($flyout.length) {
            var rect = $li[0].getBoundingClientRect();
            var sidebarWidth = $('header.main-nav').outerWidth() || 260;
            var topPos = rect.top;
            var flyoutHeight = $flyout.outerHeight() || 200;
            if (topPos + flyoutHeight > window.innerHeight - 10) {
                topPos = Math.max(10, window.innerHeight - flyoutHeight - 10);
            }
            $flyout.css({
                'top': topPos + 'px',
                'left': (sidebarWidth + 6) + 'px'
            });
        }
    }

    $(document).on('mouseenter mousemove', 'header.main-nav .main-navbar .nav-menu > li', function () {
        alignFlyout($(this));
    });

    $(document).on('mouseenter mousemove', 'header.main-nav .main-navbar .nav-menu li.has-horizontal-sub', function () {
        alignHorizontalFlyout($(this));
    });

    // Keep flyout aligned if sidebar is scrolled while hovering
    $('header.main-nav nav').on('scroll', function () {
        $('header.main-nav .main-navbar .nav-menu > li:hover').each(function () {
            alignFlyout($(this));
        });
        $('header.main-nav .main-navbar .nav-menu li.has-horizontal-sub:hover').each(function () {
            alignHorizontalFlyout($(this));
        });
    });