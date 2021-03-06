var linkObj, isCtrlDown = false;

function hide_preview(e) {
  if (e && e.data.key == "newtab") {
    window.open($('#previewframe').attr('src'), '_blank');
  }
  $('#previewframe').remove();
  $('#closediv, #newtabdiv, #previewdiv').hide();
  linkObj && linkObj.parents('dl[class*="_read"], dl[class*="_unread"]').filter(function() {
    var that = this;
    setTimeout(function() {
      $(that).css("background-color", "");
    }, 700);
    if (this.className.match(/item .+?_unread/)
        && (linkObj.prop("href").indexOf("#") != -1 || linkObj.attr("class") == "topictitle")) {
      this.className = this.className.replace("_unread", "_read");
      $(this).children("dt").attr("title", "There are no new unread posts for this topic.");
      return true;
    }
  }).find('a[href*="view=unread#unread"]').remove();
  linkObj = null;
}

function show_iframe(href, title = "") {
  self.port.emit('update_history', href, title);
  $('#previewdiv').append($('<iframe>', {id: "previewframe", src: href}));
  $('#previewdiv, #closediv, #newtabdiv').show();
  $('#previewframe').on("load", function(){
    $(document.getElementById("previewframe").contentWindow.document).on("keydown", function(e) {
      if (e.key == "Escape"){
        el = document.getElementById("previewframe").contentWindow.document.activeElement.tagName;
        if (el != "INPUT" && el != "TEXTAREA") {
          hide_preview();
        }
      }
    });
  });
}

function show_preview(e) {
  var el = document.elementFromPoint(e.clientX, e.clientY);
  if (e.data.key == '.topictitle' || e.data.key == 'a[href*="&p="]') {
    if (!el.classList.contains("list-inner") && el.parentElement.className != "lastpost") {
      return;
    }
    $(this).parents('dl[class*="_read"], dl[class*="_unread"]').each(function() {
      var href;
      $(this).css("background-color", "LightSteelBlue");
      $(this).find(e.data.key).each(function() {
        if (!this.title || this.title != "Topic is solved") {
          href = this.href;
          linkObj = $(this);
          return false;
        }
      });
      if (href && href.indexOf("#") == -1 && this.className.match(/item .+?_unread/)) {
        href += "&view=unread#unread";
      }
      show_iframe(href, linkObj.text());
      return false;
    });
  } else if (e.data.key == 'search') {
    if (el.tagName == "A" || $(el).parents('a').length) {
      return;
    }
    $(this).find('a[href*="&p="]').each(function() {
      linkObj = $(this);
      show_iframe(this.href, linkObj.text());
      return false;
    });
  } else if (e.data.key == 'notification') {
    var href;
    if (this.parentNode.tagName == "A") {
      linkObj = $(this.parentNode);
      href = this.parentNode.href;
    } else if (this.firstElementChild.tagName == "A") {
      if ($(el).parents('a').length) {
        return;
      }
      linkObj = $(this.firstElementChild);
      href = this.firstElementChild.href;
    } else {
      return;
    }
    show_iframe(href, linkObj.text());
  } else if (e.data.key == 'href-context') {
    if (e.ctrlKey && is_pmforum.call(this)) {
      linkObj = $(this);
      show_iframe(this.href, linkObj.text());
    } else {
      return;
    }
  } else if (e.data.key == 'href-normal') {
    if (!e.ctrlKey && !e.shiftKey && is_pmforum.call(this)) {
      linkObj = $(this);
      show_iframe(this.href, linkObj.text());
    } else {
      return;
    }
  }
  return false;
}

function is_pmforum() {
  return this.href.match(/forum\.palemoon\.org/) 
    && this.href.split("#")[0] != window.location.href.split("#")[0];
}

function handle_key(e) {
  if (e.data.key == "down") {
    if (e.ctrlKey && !isCtrlDown) {
      isCtrlDown = true;
      $("a").filter(is_pmforum).toggleClass("rclickview", true);
    } else if (e.key == "Escape") {
      hide_preview();
    }
  } else {
    if (isCtrlDown) {
      isCtrlDown = false;
      $("a").filter(is_pmforum).toggleClass("rclickview", false);
    }
  }
}

function who_online() {
  $("#iou-list").remove();
  var request = new XMLHttpRequest(/* {mozAnon: true} */);
  request.open("GET", "https://forum.palemoon.org/index.php");
  request.responseType = "document";
  request.onload = function() {
    var span = $('<span id="iou-list"><span id="iou-head"><a href="./viewonline.php">Online users</a>:</span></span>');
    var ulist = "";
    var olist = $(this.responseXML).find('.online-list');
    olist.find('.username, .username-coloured').each(function() {
      if (this.style.color != "rgb(170, 119, 119)" && this.firstChild.nodeName != "EM") {
        span.append(this).append(document.createTextNode(', '));
        ulist += this.textContent + ", ";
      }
    });
    olist.find('p').each(function() {
      var hg = this.textContent.match(/(\d+ hidden) and (\d+ guests)/);
      if (hg) {
        span.append($('<span class="hg-wsnowrap">' + hg[1] + '</span>'));
        span.append(document.createTextNode(', '));
        span.append($('<span class="hg-wsnowrap">' + hg[2] + '</span>'));
        ulist += hg[1] + ", " + hg[2];
      }
      return false;
    });
    $("#page-body > h2").append(span);
    $("#iou-head").attr("title", ulist);
    $("#iou-head").on("click", who_online);
    $("#iou-list a").on("click", {key: 'href-normal'}, show_preview);
  }
  request.send();
}

$(document).ready(function() {
  $('#nav-breadcrumbs').append('<li class="rightside"><a href="./search.php?search_id=unanswered" role="menuitem"><i class="icon fa-file-o fa-fw icon-gray" aria-hidden="true"></i><span>Unanswered posts</span></a></li><li class="rightside"><a href="./search.php?search_id=active_topics" role="menuitem"><i class="icon fa-file-o fa-fw icon-gray" aria-hidden="true"></i><span>Active topics</span></a></li>');
  $('#site-description > p:first-of-type').append('<span class="smart-preview"><br>Explore <a href="https://addons.palemoon.org/extensions/" target="_blank" style="color:yellow;">Extensions</a> and <a href="https://addons.palemoon.org/themes/" target="_blank" style="color:yellow;">Themes</a></span>');
  $('body').append($('<div>', {id: "previewdiv"}), $('<div>', {id: "closediv"}), $('<div>', {id: "newtabdiv"}));
  $('#closediv').on("click", {key: 'close'}, hide_preview);
  $('#newtabdiv').on("click", {key: 'newtab'}, hide_preview);
  $(".topics .list-inner, .pmlist .list-inner").on("click", {key: '.topictitle'}, show_preview);
  $(".lastpost > span").on("click", {key: 'a[href*="&p="]'}, show_preview);
  $(".search.post > .inner").on("click", {key: 'search'}, show_preview);
  $(".notification-block > .notification_text, .notifications").on("click", {key: 'notification'}, show_preview);
  $("a").on("contextmenu", {key: 'href-context'}, show_preview);
  $(document).on("keydown", {key: 'down'}, handle_key);
  $(document).on("keyup", {key: 'up'}, handle_key);
  if ($("#username_logged_in").length && $("#page-body > h2").length && window.location.href.indexOf("viewonline.php") == -1) {
    who_online();
  }
});

self.port.on("detach", function() {
  $('#closediv, #newtabdiv, #previewdiv, #iou-list, li.smart-preview, span.smart-preview').remove();
  $(".topics .list-inner, .pmlist .list-inner").off();
  $(".lastpost > span").off();
  $(".search.post > .inner").off();
  $(".notification-block > .notification_text, .notifications").off();
  $("a").off();
  try { $(document).off(); } catch(e) {}
});
