#! /usr/bin/env node

const fs = require('fs'),
    path = require('path'),
  crypto = require('crypto'),
    uuid = require('uuid/v4'),
  xml2js = require('xml2js');


/*************************************************************************************************
 ** Path Accessible **
 *************************************************************************************************/

var exitIfPathInacessible = function(path, errorMsg) {
  try {
    fs.accessSync(path);
  } catch(err) {
    if(err.code === 'ENOENT') {
      console.log('Error: ' + (errorMsg ? errorMsg + '. ' : '') +  'Path \'' + firefoxProfilesPath + '\' was not found.');
      process.exit(1);
    }
  }
}


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
 ** Greasemonkey Configuration **
 *************************************************************************************************/

 // Documentation: https://wiki.greasespot.net/Metadata_Block

var addOptionsFromFile = function(scriptInfo, obj) {
  var fileContent = fs.readFileSync(scriptInfo.fileName, 'utf8');
  var singleMatch = {
    namespace:   fileContent.match(/@namespace\s+([^\n]+)\n/),
    description: fileContent.match(/@description\s+([^\n]+)\n/),
    runAt:       fileContent.match(/@run-at\s+([^\n]+)\n/),
    version:     fileContent.match(/@version\s+([^\n]+)\n/)
  };
  var Grant = /@grant\s+([^\n]+)\n/g;
  var multipleMatches = {
    Include: /@include\s+([^\n]+)\n/g,
    Exclude: /@exclude\s+([^\n]+)\n/g
  };

  // Parameters, single match
  for(var key in singleMatch) {
    if(singleMatch[key]) {
      obj.$[key] = singleMatch[key][1];
    }
  }

  // 'Grant' node, multiple matches
  var grantMatch = Grant.exec(fileContent);
  while(grantMatch) {
    if(obj.$.Grant) {
      obj.$.Grant.push(grantMatch[1]);
    } else {
      obj.$.Grant = [grantMatch[1]];
    }
    grantMatch = Grant.exec(fileContent);
  }

  // Include and Exclude nodes, multiple matches
  for(var key in multipleMatches) {
    var match = multipleMatches[key].exec(fileContent);
    while(match) {
      if(obj[key]) {
        obj[key].push(match[1]);
      } else {
        obj[key] = [match[1]];
      }
      match = multipleMatches[key].exec(fileContent);
    }
  }

  return obj;
};

var createNewConfig = function(scriptInfo, greasemonkeyPath) {
  const scriptPath = 'file://' + path.join(greasemonkeyPath, scriptInfo.name, scriptInfo.fileName).replace(/ /g, '%20');
  const currentTime = (new Date()).valueOf();
  return addOptionsFromFile(scriptInfo, { '$': {
      basedir: scriptInfo.name,
      checkRemoteUpdates: '1',
      enabled: 'true',
      filename: scriptInfo.fileName,
      name: scriptInfo.name,
      noframes: 'false',
      updateMetaStatus: 'unknown',
      dependhash: checksum(scriptInfo.name, 'sha1'),
      uuid: uuid(),
      installTime: currentTime,
      modified: currentTime,
      installurl: scriptPath,
      updateurl: scriptPath
    }
  });
};

/*************************************************************************************************
 ** Scripts Metadata **
 *************************************************************************************************/

const firefoxProfilesPaths = {
  'win32': [process.env.APPDATA, 'Mozilla', 'Firefox', 'Profiles'],
  'darwin': [process.env.HOME, 'Library', 'Application\ Support', 'Firefox', 'Profiles']
};

// Check if Firefox profiles are accessible
const firefoxProfilesPath = path.join.apply(null, firefoxProfilesPaths[process.platform]);
exitIfPathInacessible(firefoxProfilesPaths, 'Check if Firefox is correctly installed');

// Check if the Greasemonkey config file is accessible
const greasemonkeyPath = path.join(firefoxProfilesPath, fs.readdirSync(firefoxProfilesPath)[0], 'gm_scripts');
const greasemonkeyConfigPath = path.join(greasemonkeyPath, 'config.xml');
exitIfPathInacessible(greasemonkeyConfigPath, 'Check if Greasemonkey is correctly installed');

// Parse the configuration file
const parser = new xml2js.Parser();
const configFile = fs.readFileSync(greasemonkeyConfigPath);
var configuration;
parser.parseString(configFile, (err, result) => {
  if(err) {
    console.log('Error: Parsing of \'' + greasemonkeyConfigPath + '\' failed.');
    process.exit(1);
  } else {
    configuration = result;
  }
});

// Find the related object for each script, and create one for the files which don't have it
var scripts = fs.readdirSync('.')
                .filter((f) => f.match(/^.*\.user\.js$/))
                .map((s) => ({fileName: s, name: s.replace(/^(.*)\.user\.js$/, "$1")}));
if(!configuration.UserScriptConfig.Script) {
  configuration.UserScriptConfig.Script = [];
}
scripts.forEach((s) => {
  var obj = configuration.UserScriptConfig.Script.filter((us) => us.$.name == s.name);
  if(obj.length > 0) {
    s.obj = obj[0];
  } else {
    s.obj = createNewConfig(s, greasemonkeyPath);
  }
});


/*************************************************************************************************
 ** Scripts Update **
 *************************************************************************************************/

var dirty = false;

// Remove directories which do not have an equivalent script in the repository
const repositoryScriptsNames = scripts.map((s) => s.name)
const greasemonkeyScriptDirs = fs.readdirSync(greasemonkeyPath).filter((p) => !p.match(/^.*\.xml$/));
greasemonkeyScriptDirs.forEach((f) => {
  if(repositoryScriptsNames.indexOf(f) == -1) {
    // TODO: Test this!
    // fs.rmdirSync(path.join(greasemonkeyPath, f));
    console.log('TODO: Remove dir ' + path.join(greasemonkeyPath, f));
    dirty = true;
  }
});

// Update the scripts which are different
scripts.forEach((s) => {
  const profileScriptDir = path.join(greasemonkeyPath, s.name);
  const profileScriptPath = path.join(profileScriptDir, s.fileName);
  if(greasemonkeyScriptDirs.indexOf(s.name) != -1) {
    if(checksum(fs.readFileSync(s.fileName)) != checksum(fs.readFileSync(profileScriptPath))) {
      if(fs.statSync(s.fileName).mtime > fs.statSync(profileScriptPath).mtime, s.name) {
        // TODO: Test this!
        // copyFile(s.fileName, profileScriptPath);
        console.log('TODO: different checksums, repo is newer', s.name);
        s.obj.$.modified = (new Date()).valueOf();
        dirty = true;
      } else {
        // TODO: Test this!
        // copyFile(profileScriptPath, s.fileName);
        console.log('TODO: different checksums, profile is newer', s.name);
      }
    }

// Create the directories (and copy the scripts) when the files are new
  } else {
    // TODO: Test this!
    // fs.mkdirSync(profileScriptDir);
    console.log('TODO: create directory', profileScriptDir);
    // TODO: Test this!
    // copyFile(s.fileName, profileScriptPath);
    console.log('TODO: copy file', profileScriptPath);
    dirty = true;
  }
});

// Backup the configuration file
if(dirty) {
  const greasemonkeyConfigBackupPath = path.join(greasemonkeyPath, 'config-1.xml');
  // TODO: Test this!
  // copyFile(greasemonkeyConfigPath, greasemonkeyConfigBackupPath);
  console.log('TODO: copy ', greasemonkeyConfigPath, 'to', greasemonkeyConfigBackupPath);

// Write the new configuration file
  var newConfiguration = {
    UserScriptConfig: {
      Script: scripts.map((s) => s.obj)
    }
  }
  var builder = new xml2js.Builder();
  var xml = builder.buildObject(newConfiguration);
  // TODO: Test this!
  // fs.writeFileSync(greasemonkeyConfigPath, xml);
  console.log('TODO: write new xml to ', greasemonkeyConfigPath);

  // TODO: remove this debug information
  const util = require('util');
  console.log('**************** Compare xmls: Original ************************** ');
  console.log(util.inspect(configuration, false, null));
  console.log('**************** Compare xmls: Generated ************************** ');
  console.log(util.inspect(newConfiguration, false, null));
}
