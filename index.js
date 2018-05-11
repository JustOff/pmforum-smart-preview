var self = require("sdk/self");
var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: "https://forum.palemoon.org/*",
  attachTo: ["existing", "top"],
  contentStyleFile: self.data.url("smart-preview.css?" + self.version),
  contentScriptFile: [self.data.url("jquery-3.3.1.slim.min.js"), 
                      self.data.url("smart-preview.js?" + self.version)]
});

pageMod.PageMod({
  include: "https://forum.palemoon.org/*",
  attachTo: "frame",
  contentStyle: "#page-header, #page-footer {display: none;} html {height: 100%;} body.section-viewonline th.active {width: 20%;}"
});
