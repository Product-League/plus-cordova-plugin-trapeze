"use strict";

const path = require("path");
const AdmZip = require("adm-zip");

const utils = require("./utils/utils");

const constants = {
  trapezeConf: "trapeze-conf"
};

module.exports = function(context) {
  const cordovaAbove8 = utils.isCordovaAbove(context, 8);
  const cordovaAbove7 = utils.isCordovaAbove(context, 7);
  let defer;
  if (cordovaAbove8) {
    defer = require("q").defer();
  } else {
    defer = context.requireCordovaModule("q").defer();
  }
  
  const platform = context.opts.plugin.platform;
  const platformConfig = utils.getPlatformConfigs(platform);
  if (!platformConfig) {
    utils.handleError("Invalid platform", defer);
  }

  const wwwPath = utils.getResourcesFolderPath(context, platform, platformConfig);
  const sourceFolderPath = utils.getSourceFolderPath(context, wwwPath);
  const trapezeZipFile = utils.getZipFile(sourceFolderPath, constants.trapezeConf);
  if (!trapezeZipFile) {
    throw new Error("No configuration zip file found (trapeze-conf.zip).");
  }

  const zip = new AdmZip(trapezeZipFile);

  const targetPath = path.join(wwwPath, constants.trapezeConf);
  zip.extractAllTo(targetPath, true);

  const files = utils.getFilesFromPath(targetPath);
  if (!files) {
    utils.handleError("No directory found", defer);
  }

  const fileName = files.find(function (name) {
    return name.endsWith(platformConfig.trapezeFileExtension);
  });

  if (!fileName) {
    utils.handleError("No file found", defer);
  }

  const sourceFilePath = path.join(targetPath, fileName);
  let destFilePath = path.join(context.opts.plugin.dir, fileName);

  if(!utils.checkIfFolderExists(destFilePath)){
    utils.copyFromSourceToDestPath(defer, sourceFilePath, destFilePath);
  }

  if (cordovaAbove7) {
    let destPath = path.join(context.opts.projectRoot, "platforms", platform, "app");
    if (utils.checkIfFolderExists(destPath)) {
      let destFilePath = path.join(destPath, fileName);
      if(!utils.checkIfFolderExists(destFilePath)){
        utils.copyFromSourceToDestPath(defer, sourceFilePath, destFilePath);
      }
    }
  }
      
  return defer.promise;
}