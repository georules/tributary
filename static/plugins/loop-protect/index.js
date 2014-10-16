//You must register your plugin with the global tributary object
//id: the id should match what's in the plugin.json
//function: the plugin function which has access to the tributary instance and
//the plugin object
Tributary.plugin("loop-protect", loopProtectPlugin);

//tributary is the main object available in inlets
//plugin has some gauranteed elements:
//{
//  elId: a UUID that will also be the element id of a div
//}
//You are expected to return a plugin object with the following methods exposed:
//{
//  activate() { //initializes the plugin },
//  deactivate() { //cleans up after the plugin (removes itself) }
//}
function loopProtectPlugin(tributary, plugin) {
  var el;

  plugin.activate = function() {
    el = document.getElementById(plugin.elId);

    tributary.__config__.set("loop-protect", true)

    loopProtect.alias = 'protect'
    tributary.__oldparser__ = tributary.__parser__

    tributary.__parser__ = function(code, filename) {
      code = loopProtect(code)
      tributary.__oldparser__(code,filename)
    }

    loopProtect.hit = function(line) {
      console.log("dat hit at " + line)
    }

    window.protect = loopProtect

    //tributary.__events__.on("pre:execute", function(){})

    tributary.__parsers__["loop-protect"] = function(parsed, code, filename) {
      code = code+";console.log('hiiii');"
      console.log(code)
      return code
    }
  }
  
  plugin.deactivate = function() {
    el = document.getElementById(plugin.elId);
    el.innerHTML = "";
  }
  return plugin;
}
 
