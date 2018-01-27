var linkObj, isCtrlDown = false;

function hide_preview(e) {
  if (e.data.key == "newtab") {
    window.open($('#previewframe').attr('src'), '_blank');
  }
  $('#previewframe').remove();
  $('#closediv, #newtabdiv, #previewdiv').hide();
  linkObj && linkObj.parents('dl[class*="_read"], dl[class*="_unread"]').filter(function() {
    var that = this;
    setTimeout(function() {
      $(that).css("background-color", "");
    }, 700);
    if (this.className.match(/icon .+?_unread/)
        && (linkObj.prop("href").indexOf("#") != -1 || linkObj.attr("class") == "topictitle")) {
      this.className = this.className.replace("_unread", "_read");
      $(this).children("dt").attr("title", "There are no new unread posts for this topic.");
      return true;
    }
  }).find('a[href*="view=unread#unread"]').remove();
  linkObj = null;
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
        href = this.href;
        linkObj = $(this);
        return false;
      });
      if (href && href.indexOf("#") == -1 && this.className.match(/icon .+?_unread/)) {
        href += "&view=unread#unread";
      }
      $('#previewdiv').append($('<iframe>', {id: "previewframe", src: href}));
      $('#previewdiv, #closediv, #newtabdiv').show();
      return false;
    });
  } else if (e.data.key == 'search') {
    if (el.tagName == "A" || $(el).parents('a').length > 0) {
      return;
    }
    $(this).find('a[href*="&p="]').each(function() {
      linkObj = $(this);
      $('#previewdiv').append($('<iframe>', {id: "previewframe", src: this.href}));
      $('#previewdiv, #closediv, #newtabdiv').show();
      return false;
    });
  } else if (e.data.key == 'notification') {
    var href;
    if (this.parentNode.tagName == "A") {
      linkObj = $(this.parentNode);
      href = this.parentNode.href;
    } else if (this.firstElementChild.tagName == "A") {
      if ($(el).parents('a').length > 0) {
        return;
      }
      linkObj = $(this.firstElementChild);
      href = this.firstElementChild.href;
    } else {
      return;
    }
    $('#previewdiv').append($('<iframe>', {id: "previewframe", src: href}));
    $('#previewdiv, #closediv, #newtabdiv').show();
  } else if (e.data.key == 'href') {
    if (e.ctrlKey && is_pmforum.call(this)) {
      linkObj = $(this);
      $('#previewdiv').append($('<iframe>', {id: "previewframe", src: this.href}));
      $('#previewdiv, #closediv, #newtabdiv').show();
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

function check_ctrl(e) {
  if (e.data.key == "down") {
    if (e.ctrlKey && !isCtrlDown) {
      isCtrlDown = true;
      $("a").filter(is_pmforum).toggleClass("rclickview", true);
    }
  } else {
    if (isCtrlDown) {
      isCtrlDown = false;
      $("a").filter(is_pmforum).toggleClass("rclickview", false);
    }
  }
}

$(document).ready(function() {
  $('body').append($('<div>', {id: "previewdiv"}), $('<div>', {id: "closediv"}), $('<div>', {id: "newtabdiv"}));
  $('#closediv').on("click", {key: 'close'}, hide_preview);
  $('#newtabdiv').on("click", {key: 'newtab'}, hide_preview);
  $(".topics .list-inner, .pmlist .list-inner").on("click", {key: '.topictitle'}, show_preview);
  $(".lastpost > span").on("click", {key: 'a[href*="&p="]'}, show_preview);
  $(".search.post > .inner").on("click", {key: 'search'}, show_preview);
  $(".notification-block > .notification_text, .notifications").on("click", {key: 'notification'}, show_preview);
  $("a").on("contextmenu", {key: 'href'}, show_preview);
  $(document).on("keydown", {key: 'down'}, check_ctrl);
  $(document).on("keyup", {key: 'up'}, check_ctrl);
});

self.port.on("detach", function() {
  $("#closediv").off();
  $("#newtabdiv").off();
  $(".topics .list-inner, .pmlist .list-inner").off();
  $(".lastpost > span").off();
  $(".search.post > .inner").off();
  $(".notification-block > .notification_text, .notifications").off();
  $("a").off();
  try { $(document).off(); } catch(e) {}
  $('#closediv, #newtabdiv, #previewdiv').remove();
});
