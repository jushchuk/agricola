// functions for loading in csv and running callback function upon success //
function xhrSuccess() { 
    this.callback.apply(this, this.arguments); 
}

function xhrError() { 
    console.error(this.statusText); 
}

function loadFile(url, callback /*, opt_arg1, opt_arg2, ... */) {
    let xhr = new XMLHttpRequest();
    xhr.callback = callback;
    xhr.arguments = Array.prototype.slice.call(arguments, 2);
    xhr.onload = xhrSuccess;
    xhr.onerror = xhrError;
    xhr.open("GET", url, true);
    xhr.send(null);
}

// functions for manipulating CSV //
function parseCSV(CSVstring) {
    arr = CSVstring.split('\n')
    console.log(arr);
    let jsonObj = [];
    let headers = arr[0].split(',');
    console.log(headers)
    for(let i = 1; i < arr.length; i++) {
        let data = arr[i].split(',');
        let obj = {};
        for(let j = 0; j < data.length; j++) {
            obj[headers[j].trim()] = data[j].trim();
        }
        jsonObj.push(obj);
    }
    return jsonObj;
}

function parseDataToGames(data) {
    let games = [];
    let game = [];
    let currentGame = data[0]['Game'];
    for (let i=0; i<data.length; i++) {
        if (currentGame == data[i]['Game']) {
            game.push(data[i]);
        } else {
            games.push(game);
            currentGame = data[i]['Game'];
            game = [data[i]];
        }
    }
    return games;
}

function createTable(gameData, captionText, tableName) {
    let ignoreProperties = ['Players','Player','Winner','Game'];

    //create table and caption
    let table = document.createElement('table');
    let caption = table.createCaption();
    caption.textContent = captionText;
    
    //determine row keys
    let keys = ['Player'];
    for (let property in gameData[0]) {
        if(!ignoreProperties.includes(property)) {
            keys.push(property);
        }
    }

    //for each row key, populate the row
    for (let k in keys) {
        let row = table.insertRow(-1);
        let cell = row.insertCell(-1);
        cell.textContent = keys[k];
        for(let i=0; i<gameData.length; i++) {
            cell = row.insertCell(-1);
            cell.textContent = gameData[i][keys[k]];
        }
    }

    //handle
    let thead = table.createTHead();
    let tbody = table.createTBody();
    return table
}