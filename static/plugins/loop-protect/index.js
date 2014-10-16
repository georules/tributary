
Tributary.plugin("loop-protect", loopProtectPlugin);

function loopProtectPlugin(tributary, plugin) {
  var el;

  plugin.activate = function() {
    el = document.getElementById(plugin.elId);

    loopProtect.alias = 'protect'

    loopProtect.hit = function(line) {
      console.log("potential infinite loop killed at line " + line)
    }

    window.protect = loopProtect

    tributary.__parsers__["zloop-protect"] = function(parsed, code, filename) {
      code = loopProtect(code)
      return code
    }
  }
  
  plugin.deactivate = function() {
    el = document.getElementById(plugin.elId);
    el.innerHTML = "";
  }
  return plugin;
}
 
