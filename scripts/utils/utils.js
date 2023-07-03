const constants = {
    platforms: "platforms",
    android: {
      platform: "android",
      wwwFolder: "assets/www",
      trapezeFileExtension: ".yaml"
    },
    ios: {
      platform: "ios",
      wwwFolder: "www",
      trapezeFileExtension: ".yaml"
    },
    zipExtension: ".zip",
    folderNameSuffix: ".trapeze",
    folderNamePrefix: "trapeze."
  };

  function handleError(errorMessage, defer) {
    console.log(errorMessage);
    defer.reject();
  }
  
  function checkIfFolderExists(path) {
    return fs.existsSync(path);
  }
  
  function getFilesFromPath(path) {
    return fs.readdirSync(path);
  }
  
  function createOrCheckIfFolderExists(path) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  }
  
  function getSourceFolderPath(context, wwwPath) {
    let sourceFolderPath;
    const appId = getAppId(context);
    const cordovaAbove7 = isCordovaAbove(context, 7);
  
    console.log("cordovaAbove7: " + cordovaAbove7);
  
    // New way of looking for the configuration files' folder
    if (cordovaAbove7) {
      sourceFolderPath = path.join(context.opts.projectRoot, "www", appId + constants.folderNameSuffix);
      console.log("Using #1 sourceFolderPath: " + sourceFolderPath);
    } else {
      sourceFolderPath = path.join(wwwPath, appId + constants.folderNameSuffix);
      console.log("Using #2 sourceFolderPath: " + sourceFolderPath);
    }
  
    // Fallback to deprecated way of looking for the configuration files' folder
    if(!checkIfFolderExists(sourceFolderPath)) {
      console.log("Using deprecated way to look for configuration files' folder");
      if (cordovaAbove7) {
        sourceFolderPath = path.join(context.opts.projectRoot, "www", constants.folderNamePrefix + appId);
        console.log("Using #3 sourceFolderPath: " + sourceFolderPath);
      } else {
        sourceFolderPath = path.join(wwwPath, constants.folderNamePrefix + appId);
        console.log("Using #4 sourceFolderPath: " + sourceFolderPath);
      }
    }
  
    console.log("Using sourceFolderPath: " + sourceFolderPath);
  
    return sourceFolderPath;
  }
  
  function getResourcesFolderPath(context, platform, platformConfig) {
    const platformPath = path.join(context.opts.projectRoot, constants.platforms, platform);
    return path.join(platformPath, platformConfig.wwwFolder);
  }
  
  function getPlatformConfigs(platform) {
    if (platform === constants.android.platform) {
      return constants.android;
    } else if (platform === constants.ios.platform) {
      return constants.ios;
    }
  }
  
  function getZipFile(folder, zipFileName) {
    try {
      const files = getFilesFromPath(folder);
      for (var i = 0; i < files.length; i++) {
        if (files[i].endsWith(constants.zipExtension)) {
          var fileName = path.basename(files[i], constants.zipExtension);
          if (fileName === zipFileName) {
            return path.join(folder, files[i]);
          }
        }
      }
    } catch (e) {
      console.log(e);
      return;
    }
  }
  
  function getAppId(context) {
    const cordovaAbove8 = isCordovaAbove(context, 8);
    let et;
    if (cordovaAbove8) {
      et = require('elementtree');
    } else {
      et = context.requireCordovaModule('elementtree');
    }
  
    const config_xml = path.join(context.opts.projectRoot, 'config.xml');
    const data = fs.readFileSync(config_xml).toString();
    const etree = et.parse(data);
    return etree.getroot().attrib.id;
  }
  
  function isCordovaAbove(context, version) {
    const cordovaVersion = context.opts.cordova.version;
    console.log(cordovaVersion);
    const sp = cordovaVersion.split('.');
    return parseInt(sp[0]) >= version;
  }
  
  
  function copyFromSourceToDestPath(defer, sourcePath, destPath) {
  
    console.log('copyFromSourceToDestPath sourcePath: ' + sourcePath + " and destPath: " + destPath);
  
    fs.createReadStream(sourcePath).pipe(fs.createWriteStream(destPath))
    .on("close", function (err) {
      defer.resolve();
    })
    .on("error", function (err) {
      console.log(err);
      defer.reject();
    });
  }
  
  module.exports = {
    isCordovaAbove,
    handleError,
    getZipFile,
    getResourcesFolderPath,
    getPlatformConfigs,
    getAppId,
    copyFromSourceToDestPath,
    getFilesFromPath,
    createOrCheckIfFolderExists,
    checkIfFolderExists,
    getSourceFolderPath
  };