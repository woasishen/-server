var fs = require('fs');
var file = "./log.cfy";
if(fs.existsSync(file)){
    fs.unlinkSync(file);
}
fs.appendFileSync(file, "[" + new Date().toLocaleString() + "]    start\n");

logcfy = function() {
    fs.appendFileSync(file, "[" + new Date().toLocaleString() + "]    ");
    for (var i = 0; i < arguments.length; i++) {
        fs.appendFileSync(file, JSON.stringify(arguments[i]));
        fs.appendFileSync(file, "\n");
    }
}