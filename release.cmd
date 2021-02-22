@echo off
set VER=1.3.4

sed -i -E "s/\"version\": \".+?\"/\"version\": \"%VER%\"/; s/\"name\": \".+?\"/\"name\": \"pmforum-smart-preview-%VER%\"/" package.json
sed -i -E "s/version>.+?</version>%VER%</; s/download\/.+?\/pmforum-smart-preview-.+?\.xpi/download\/%VER%\/pmforum-smart-preview-%VER%\.xpi/" update.xml

set XPI=pmforum-smart-preview-%VER%.xpi
if exist %XPI% del %XPI%
if exist bootstrap.js del bootstrap.js
if exist install.rdf del install.rdf
call jpm xpi
unzip %XPI% bootstrap.js install.rdf
