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
        for (let i = 0; i < 5; i++) {
            cell = row.insertCell(-1);
            if (i < gameData.length) {
                cell.textContent = gameData[i][keys[k]];

                if (gameData[i]['Winner'] == 'True') {
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
    let validPlayers = document.getElementById('player_select').selectedOptions;
    let exactPlayersMatch = document.getElementById('exact_players_match_checkbox').checked;
    
    let thresholdType = document.getElementById('threshold_type_select').selectedOptions[0].value;
    let thresholdComparison = document.getElementById('threshold_comparison_select').selectedOptions[0].value;
    let thresholdValue = parseInt(document.getElementById('threshold_value_input').value);

    let threshold = {'type': thresholdType, 'value': thresholdValue, 'comparison': thresholdComparison};


    filterTables(validPlayers, exactPlayersMatch, threshold);
}

function filterTables(validPlayers, exactPlayersMatch, threshold) {
    //hide games that do match filter

    let visibleCount = 0;

    for (let i = 0; i < tables.length; i++) {
        
        let display = 'block';

        //filter for players
        if (validPlayers.length > 0) {
            for (let j = 0; j < validPlayers.length; j++) {
                if (!tables[i].Players.includes(validPlayers[j].value)) {
                    display = 'none';
                }
                if (exactPlayersMatch && tables[i].Players.length != validPlayers.length) {
                    display = 'none';
                }
            }
        }
        
        //filter for threshold
        
        let gameStats = produceGameStats(tables[i].GameData);
        
        if (!meetsThreshold(gameStats, threshold)) {
            display = 'none';
        }


        let gameTable = document.getElementById('game'+tables[i].Game);
        if (display == 'block') { visibleCount++; }
        gameTable.style.display = display;
    }

    if (visibleCount == tables.length) {
        document.getElementById('table_count_span').textContent = 'Showing all ' + visibleCount + ' tables';
    } else {
        document.getElementById('table_count_span').textContent = 'Showing ' + visibleCount + ' tables';
    }
    
}

function produceGameStats(gameData) {
    let playerCount = gameData.length;
    let sum = 0;
    let max = 0;
    let min = Infinity;
    for (let j = 0; j < playerCount; j++) {
        let score = parseInt(gameData[j]['Total']);
        sum += score;
        if (max < score) {
            max = score;
        }
        if (min > score) {
            min = score;
        }
    }

    let average = sum / playerCount;
    return {'average': average, 'max': max, 'margin': max-min};
}

function meetsThreshold(gameStats, threshold) {
    if (isNaN(threshold.value)) {
        return true;
    }
    let gameValue;
    switch (threshold.type) {
        case 'Winner\'s':
            gameValue = gameStats.max;
            break;
        case 'Average':
            gameValue = gameStats.average;
            break;
        case 'Margin':
            gameValue = gameStats.margin;
            break;
    }

    let result;
    switch (threshold.comparison) {
        case '>':
            result = (gameValue > threshold.value);
            break;
        case '<':
            result = (gameValue < threshold.value);
            break;
        case '=':
            result = (Math.round(gameValue) == threshold.value);
            break;
    }

    return result;
}

function resetFilter() {
    //reset each filter option
    let playerOptions = document.getElementById("player_select").options;
    
    for (let i = 0; i < playerOptions.length; i++) {
      playerOptions[i].selected = false;
    }

    //reset checkbox
    document.getElementById('exact_players_match_checkbox').checked = false;

    //reset threshold
    document.getElementById('threshold_type_select').selectedIndex = 0;
    document.getElementById('threshold_comparison_select').selectedIndex = 0;
    document.getElementById('threshold_value_input').value = '';

    //now show all games
    for (let i = 1; i < tables.length + 1; i++) {
        let t = document.getElementById('game'+i);
        t.style.display = 'block';
    }

    //reset table count 
    document.getElementById('table_count_span').textContent = 'Showing all ' + tables.length + ' tables';
}

function populateFilterTools() {
    let filterDiv = document.getElementById('table_filter');
    
    //player filter

    let playerSelect = document.createElement('select');
    playerSelect.id = 'player_select';
    playerSelect.multiple = true;
    for (let i=0; i<sortedPlayerCounts.length; i++) {
        let option = document.createElement('option');
        option.value = sortedPlayerCounts[i][0];
        option.text = sortedPlayerCounts[i][0];
        playerSelect.add(option);
    }

    let exactPlayersMatchCheckbox = document.createElement('input');
    exactPlayersMatchCheckbox.id = 'exact_players_match_checkbox';
    exactPlayersMatchCheckbox.type = 'checkbox';
    let exactPlayersMatchCheckboxLabel = document.createElement('label');
    exactPlayersMatchCheckboxLabel.textContent = 'Exact Players Match';
    exactPlayersMatchCheckboxLabel.htmlFor = 'exact_players_match_checkbox'
    
    // threshold filter
    let thresholdTypeSelect = document.createElement('select');
    thresholdTypeSelect.id = 'threshold_type_select';

    for (let i=0; i<thresholdTypes.length; i++) {
        let option = document.createElement('option');
        option.value = thresholdTypes[i];
        option.text = thresholdTypes[i];
        thresholdTypeSelect.add(option);
    }

    let thresholdComparisonSelect = document.createElement('select');
    thresholdComparisonSelect.id = 'threshold_comparison_select';

    for (let i=0; i<thresholdComparisons.length; i++) {
        let option = document.createElement('option');
        option.value = thresholdComparisons[i];
        option.text = thresholdComparisons[i];
        thresholdComparisonSelect.add(option);
    }

    let thresholdValueInput = document.createElement('input');
    thresholdValueInput.id = 'threshold_value_input';
    thresholdValueInput.className = 'score_input';
    thresholdValueInput.type = 'number';
    thresholdValueInput.min = '0';
    thresholdValueInput.placeholder = 'Score';
    //thresholdValueInput.pattern = '[0-9]+';

    //buttons

    let filterSubmit = document.createElement('button');
    filterSubmit.textContent = 'Filter';
    filterSubmit.onclick = submitFilter;

    let filterReset = document.createElement('button');
    filterReset.textContent = 'Reset';
    filterReset.onclick = resetFilter;

    //count span

    let filterTableCount = document.createElement('span');
    filterTableCount.id = 'table_count_span';
    filterTableCount.textContent = 'Showing all ' + tables.length + ' tables';
    
    //append it all

    filterDiv.append(playerSelect);
    filterDiv.append(exactPlayersMatchCheckboxLabel);
    filterDiv.append(exactPlayersMatchCheckbox);
    filterDiv.append(thresholdTypeSelect);
    filterDiv.append(thresholdComparisonSelect);
    filterDiv.append(thresholdValueInput);
    filterDiv.append(filterSubmit);
    filterDiv.append(filterReset);
    filterDiv.append(filterTableCount);

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
        tables.push({'Game':gameNumber, 'Players':gamePlayers, 'Table':table, 'GameData':games[i]});

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

const thresholdTypes = ['Winner\'s', 'Average', 'Margin'];
const thresholdComparisons = ['>', '<', '='];
const dataURL = 'https://raw.githubusercontent.com/jushchuk/agricola/master/data/gric-refined.csv';
loadFile(dataURL, populateTables);

setTimeout(function(){
    console.log('data loaded (hopefully)');
}, 500);