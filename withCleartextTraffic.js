// withCleartextTraffic.js
const { withAndroidManifest } = require("@expo/config-plugins");

function setUsesCleartextTraffic(androidManifest) {
  if (
    androidManifest.application &&
    androidManifest.application.length > 0
  ) {
    // application[0] is the main <application> tag
    androidManifest.application[0]["$"]["android:usesCleartextTraffic"] = "true";
  }
  return androidManifest;
}

module.exports = config => {
  return withAndroidManifest(config, config => {
    config.modResults = setUsesCleartextTraffic(config.modResults);
    return config;
  });
};
