// takes a single game data and makes it a table
function createTable(gameData, captionText) {
    let ignoreProperties = ['Players','Name','Horses','Winner','Game'];

    //create table and caption
    let table = document.createElement('table');
    table.className = 'scoresheet';
    let caption = table.createCaption();
    caption.textContent = captionText;
    
    //determine row keys
    let keys = ['Name'];
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
        for(let i=0; i<5; i++) {
            cell = row.insertCell(-1);
            if(i<gameData.length) {
                cell.textContent = gameData[i][keys[k]];

                if(gameData[i]['Winner'] == 'True'){
                    cell.className = 'winner';
                }
            }
        }
    }

    //handle
    let thead = table.createTHead();
    let tbody = table.createTBody();
    return table
}

function submitFilter() {
    let playerSelect = document.getElementById('player_select');
    let validPlayers = playerSelect.selectedOptions;
    filterTables(validPlayers);
}

function filterTables(validPlayers) {
    //hide games that do not contain validPlayers
    visibleCount = 0;
    if (validPlayers.length > 0) {
        console.log(tables[0].Players);
        console.log(validPlayers[0].value);
        for (let i = 0; i < tables.length; i++) {
            let display = 'block';
            for (let j = 0; j < validPlayers.length; j++) {
                if (!tables[i].Players.includes(validPlayers[j].value)) {
                    display = 'none';
                }
            }
            g = document.getElementById('game'+tables[i].Game);
            if(display == 'block') { visibleCount++; }
            g.style.display = display;
        }
    }
    
    console.log(visibleCount);
}

function resetFilter() {
    console.log('Reseting Filter');
    
    //reset each filter option
    let playerOptions = document.getElementById("player_select").options;

    for (let i = 0; i < playerOptions.length; i++) {
      playerOptions[i].selected = false;
    }


    //now show all games
    for (let i = 1; i < tables.length + 1; i++) {
        let t = document.getElementById('game'+i);
        t.style.display = 'block';
    }

    //reset visibleCount to all
    visibleCount = tables.length;
}

function populateFilterTools() {
    let filterDiv = document.getElementById('table_filter');

    let playerSelect = document.createElement('select');
    playerSelect.id = 'player_select';
    playerSelect.multiple = true;
    for (let i=0; i<sortedPlayerCounts.length; i++) {
        let option = document.createElement('option');
        option.value = sortedPlayerCounts[i][0];
        option.text = sortedPlayerCounts[i][0];
        playerSelect.add(option);
    }

    let filterSubmit = document.createElement('button');
    filterSubmit.textContent = 'Filter';
    filterSubmit.onclick = submitFilter;

    let filterReset = document.createElement('button');
    filterReset.textContent = 'Reset';
    filterReset.onclick = resetFilter;
    
    filterDiv.append(playerSelect);
    filterDiv.append(filterSubmit);
    filterDiv.append(filterReset);

}

function populateTables() {
    window.allPlayers = [];
    let data = parseCSV(this.responseText);
    let games = parseDataToGames(data);
    
    let tablesContainer = document.getElementById('tables_container');
    //let tablesFooter = document.getElementById('tables_footer');
    
    let playerCounts = {};

    for (let i=0; i<games.length; i++) {
        let gameNumber = games[i][0]['Game'];
        let gamePlayers = [];
        for (let j=0; j<games[i].length; j++) {
            //determine who are the players for a particular game
            let player = games[i][j]['Name'];
            gamePlayers.push(player);
            
            //this is to help later know who are all possible players
            if (!allPlayers.includes(player)) {
                allPlayers.push(player);
                playerCounts[player] = 1;
            } else {
                playerCounts[player] += 1;
            }
        }

        //create the actual html table
        let table = createTable(games[i],'Game '+gameNumber);
        
        //push this table with some info to potentially use later
        tables.push({'Game':gameNumber, 'Players':gamePlayers, 'Table':table});

        //add table to page... potentially do this another place
        let div = wrapWithDiv(table, 'game'+gameNumber, 'table_div');
        tablesContainer.append(div);
    }

    //sort all possible players by their game count
    sortedPlayerCounts = [];
    for (let p in playerCounts) {
        sortedPlayerCounts.push([p,playerCounts[p]]);
    }
    sortedPlayerCounts.sort(function(a, b) {
        return b[1] - a[1];
    });

    populateFilterTools();
}

var tables = [];
var allPlayers = [];
var sortedPlayerCounts = [];
var visibleCount = 0;
const dataURL = 'https://raw.githubusercontent.com/jushchuk/agricola/master/data/gric-refined.csv';
loadFile(dataURL, populateTables);

setTimeout(function(){
    console.log('loaded (hopefully)');
    console.log(sortedPlayerCounts);
}, 500);