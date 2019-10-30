function xhrSuccess() { 
    this.callback.apply(this, this.arguments); 
}

function xhrError() { 
    console.error(this.statusText); 
}

function loadFile(url, callback /*, opt_arg1, opt_arg2, ... */) {
    var xhr = new XMLHttpRequest();
    xhr.callback = callback;
    xhr.arguments = Array.prototype.slice.call(arguments, 2);
    xhr.onload = xhrSuccess;
    xhr.onerror = xhrError;
    xhr.open("GET", url, true);
    xhr.send(null);
}

function parseCSV(CSVstring) {
    arr = CSVstring.split('\n')
    console.log(arr);
    var jsonObj = [];
    var headers = arr[0].split(',');
    console.log(headers)
    for(var i = 1; i < arr.length; i++) {
        var data = arr[i].split(',');
        var obj = {};
        for(var j = 0; j < data.length; j++) {
            obj[headers[j].trim()] = data[j].trim();
        }
        jsonObj.push(obj);
    }
    return jsonObj;
}