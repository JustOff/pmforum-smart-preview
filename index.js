var self = require("sdk/self");
var pageMod = require("sdk/page-mod");
var privateBrowsing = require("sdk/private-browsing");
var {Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/PlacesUtils.jsm");

pageMod.PageMod({
  include: "https://forum.palemoon.org/*",
  attachTo: ["existing", "top"],
  contentStyleFile: self.data.url("smart-preview.css?" + self.version),
  contentScriptFile: [self.data.url("jquery-3.4.0.slim.min.js"), 
                      self.data.url("smart-preview.js?" + self.version)],
  onAttach: previewListener
});

function previewListener(worker) {
  worker.port.on('update_history', function(href, title) {
      if (privateBrowsing.isPrivate(worker)) {
        return;
      }
      var places = [{
        uri: Services.io.newURI(href, null, null),
        title: title,
        visits: [{
          transitionType: PlacesUtils.history.TRANSITION_LINK,
          visitDate: Date.now() * 1000
        }],
      }];
      PlacesUtils.asyncHistory.updatePlaces(places);
  });
}

pageMod.PageMod({
  include: "https://forum.palemoon.org/*",
  attachTo: "frame",
  contentStyle: "#page-header, #page-footer {display: none;} html {height: 100%;} body.section-viewonline th.active {width: 20%;}"
});
