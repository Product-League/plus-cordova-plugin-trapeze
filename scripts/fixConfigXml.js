/**
 * 
 * Hook to fix the default namespace (when the empty prefix) to allow using trapeze on Cordova's config.xml file
 * 
 */
var fs = require('fs'), path = require('path');

module.exports = function(context) {
    var ConfigXml = path.join(context.opts.projectRoot, "config.xml");
    console.log("✅ ConfigXml: " + ConfigXml);    
    if (fs.existsSync(ConfigXml)) {
     
        fs.readFile(ConfigXml, 'utf8', function (err,data) {
        
            if (err) {
                throw new Error('🚨 Unable to read config.xml: ' + err);
            }
            
            var result = data.replace("xmlns=\"http://www.w3.org/ns/widgets\"", "xmlns:ns=\"http://www.w3.org/ns/widgets\"");

            fs.writeFile(ConfigXml, result, 'utf8', function (err) {
                if (err) {
                    throw new Error('🚨 Unable to write into config.xml: ' + err);
                } else {
                    console.log("✅ config.xml edited successfuly");
                }
            });
        });
    } else {
        throw new Error("🚨 WARNING: config.xml was not found. The build phase may not finish successfuly");
    }
  }
