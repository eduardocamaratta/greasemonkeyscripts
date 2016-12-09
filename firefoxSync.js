#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


/*************************************************************************************************
 ** File Checksum **
 *************************************************************************************************/

// Credits: Tom Pawlak, 2014/01/20, https://blog.tompawlak.org/calculate-checksum-hash-nodejs-javascript
var checksum = function(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex');
};

var sameChecksum = function(path1, path2) { return checksum(fs.readFileSync(path1)) == checksum(fs.readFileSync(path2)); };


/*************************************************************************************************
 ** File Copy **
 *************************************************************************************************/

 // Credits: MiguelSanchezGonzalez, 2012/07/02, http://stackoverflow.com/a/11295106
var copyFile = function(origin, destination) { fs.createReadStream(origin).pipe(fs.createWriteStream(destination)); };


/*************************************************************************************************
 ** Sync Script **
 *************************************************************************************************/

var firefoxProfilesPaths = {
  'win32': [process.env.APPDATA, 'Mozilla', 'Firefox', 'Profiles'],
  'darwin': [process.env.HOME, 'Library', 'Application\ Support', 'Firefox', 'Profiles']
};

var firefoxProfilesFullPath = path.join.apply(null, firefoxProfilesPaths[process.platform]);
var scriptsDestination = path.join(firefoxProfilesFullPath, fs.readdirSync(firefoxProfilesFullPath)[0], 'gm_scripts');
var activeScripts = fs.readdirSync('.').filter((f) => f.match(/^.*\.user\.js$/));

activeScripts.forEach(function(s) {
  var name = s.replace(/^(.*)\.user\.js$/, "$1");
  var profilePath = path.join(scriptsDestination, name, s);

  // Ignore if the files are bitwise identical
  if(sameChecksum(s, profilePath)) {
    return;
  }

  var profileStat = fs.statSync(path.join(scriptsDestination, name, s));
  var repoStat = fs.statSync(s);

  // Repo version is newer
  if(repoStat.ctime > profileStat.ctime) {
    copyFile(s, profilePath);

  // Profile version is newer
  } else if (profileStat.ctime > repoStat.ctime) {
    copyFile(profilePath, s);
  }
});
