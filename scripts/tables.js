//primary data
var tables = [];
var games = [];

//helper var
var allPlayers = [];
var sortedPlayerCounts = [];

const thresholdTypes = ['Winner\'s', 'Average', 'Margin'];
const thresholdComparisons = ['>', '<', '='];
const dataURL = 'https://raw.githubusercontent.com/jushchuk/agricola/master/data/gric-refined.csv';

loadFile(dataURL, populateTablesPage);

setTimeout(function(){
    console.log('data loaded (hopefully)');
}, 500);

//main functions instantiating variables and html
function populateTablesPage() {
    let data = parseCSV(this.responseText);
    games = parseDataToGames(data);

    let playerCounts = {};

    for (let i = 0; i < games.length; i++) {
        let gameNumber = games[i][0]['Game'];
        let gamePlayers = [];
        for (let j = 0; j < games[i].length; j++) {
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
        tables.push({'game':gameNumber, 'players':gamePlayers, 'table':table, 'gameData':games[i]});
    }

    //sort all possible players by their game count
    sortedPlayerCounts = [];
    for (let p in playerCounts) {
        sortedPlayerCounts.push([p, playerCounts[p]]);
    }
    sortedPlayerCounts.sort(function(a, b) {
        return b[1] - a[1];
    });

    populateFilterTools();

    displayFilteredGames(games);
}

function populateFilterTools() {
    let filterDiv = document.getElementById('table_filter');
    
    //player filter
    let playerSelect = document.createElement('select');
    playerSelect.id = 'player_select';
    playerSelect.multiple = true;
    for (let i = 0; i < sortedPlayerCounts.length; i++) {
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

    for (let i = 0; i < thresholdTypes.length; i++) {
        let option = document.createElement('option');
        option.value = thresholdTypes[i];
        option.text = thresholdTypes[i];
        thresholdTypeSelect.add(option);
    }

    let thresholdComparisonSelect = document.createElement('select');
    thresholdComparisonSelect.id = 'threshold_comparison_select';

    for (let i = 0; i < thresholdComparisons.length; i++) {
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

    //winner filter
    let winnerSelect = document.createElement('select');
    winnerSelect.id = 'winner_select';
    let winnerOptions = [['Any',0]].concat(sortedPlayerCounts);
    for (let i = 0; i < winnerOptions.length; i++) {
        option = document.createElement('option');
        option.value = winnerOptions[i][0];
        option.text = winnerOptions[i][0];
        winnerSelect.add(option);
    }
    let winnerSelectLabel = document.createElement('label');
    winnerSelectLabel.textContent = 'Winner';
    winnerSelectLabel.htmlFor = 'winner_select'

    //submit/reset buttons
    let filterSubmit = document.createElement('button');
    filterSubmit.textContent = 'Filter';
    filterSubmit.onclick = submitFilter;

    let filterReset = document.createElement('button');
    filterReset.textContent = 'Reset';
    filterReset.onclick = resetFilter;

    //count span
    let filterTableCount = document.createElement('span');
    filterTableCount.id = 'table_count_span';
    filterTableCount.textContent = 'Showing all ' + games.length + ' tables';
    
    //append it all
    filterDiv.append(playerSelect);
    filterDiv.append(exactPlayersMatchCheckboxLabel);
    filterDiv.append(exactPlayersMatchCheckbox);
    filterDiv.append(thresholdTypeSelect);
    filterDiv.append(thresholdComparisonSelect);
    filterDiv.append(thresholdValueInput);
    filterDiv.append(winnerSelectLabel);
    filterDiv.append(winnerSelect);
    filterDiv.append(filterSubmit);
    filterDiv.append(filterReset);
    filterDiv.append(filterTableCount);

}

function displayFilteredGames(visibleGames, sorting) {
    if (sorting == null) {
        sorting = {'type':'default','order':'ascending'};
    }

    let tablesContainer = document.getElementById('tables_container');
    tablesContainer.innerHTML = '';
    
    for (let i = 0; i < visibleGames.length; i++) {
        let gameNumber = parseInt(visibleGames[i][0]['Game']);
        
        let table = tables[gameNumber-1].table;
        
        let div = wrapWithDiv(table, 'game'+gameNumber, 'table_div');
        tablesContainer.append(div);    
    }

    let visibleCount = visibleGames.length;
    if (visibleCount == games.length) {
        document.getElementById('table_count_span').textContent = 'Showing all ' + visibleCount + ' tables';
    } else {
        document.getElementById('table_count_span').textContent = 'Showing ' + visibleCount + ' tables';
    }

}

//main functions for page behavior
function submitFilter() {
    let validPlayers = document.getElementById('player_select').selectedOptions;
    let exactPlayersMatch = document.getElementById('exact_players_match_checkbox').checked;
    
    let thresholdType = document.getElementById('threshold_type_select').selectedOptions[0].value;
    let thresholdComparison = document.getElementById('threshold_comparison_select').selectedOptions[0].value;
    let thresholdValue = parseInt(document.getElementById('threshold_value_input').value);
    let threshold = {'type': thresholdType, 'value': thresholdValue, 'comparison': thresholdComparison};

    let winner = document.getElementById('winner_select').selectedOptions[0].value;

    let filteredGames = filterGames(validPlayers, exactPlayersMatch, threshold, winner);
    
    let sorting = {};
    //sorting happens here
    

    displayFilteredGames(filteredGames, sorting);
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

    //reset winner
    document.getElementById('winner_select').selectedIndex = 0;


    //display all games
    displayFilteredGames(games);

    //reset table count 
    document.getElementById('table_count_span').textContent = 'Showing all ' + games.length + ' tables';
}

function filterGames(validPlayers, exactPlayersMatch, threshold, winner) {
    let filteredGames = [];
    for (let i = 0; i < tables.length; i++) {
        let game = tables[i].gameData;
        let shouldKeep = true;

        //filter for players
        if (validPlayers.length > 0) {
            for (let j = 0; j < validPlayers.length; j++) {
                let gamePlayerInValidPlayers = tables[i].players.includes(validPlayers[j].value);
                let passesExact = (!exactPlayersMatch || tables[i].players.length == validPlayers.length);
                if (!gamePlayerInValidPlayers || !passesExact) {
                    shouldKeep = false;
                }
            }
        }
        
        //filter for winner
        if (winner != 'Any') {
            if (tables[i].players.includes(winner)) {
                for (let j = 0; j < game.length; j++) {
                    if (game[j]['Name'] == winner && game[j]['Winner'] != 'True') {
                        shouldKeep = false;
                    }
                }
            } else {
                shouldKeep = false;
            }
        }

        //filter for threshold
        if (!meetsThreshold(produceGameStats(game), threshold)) {
            shouldKeep = false;
        }

        if (shouldKeep) {
            filteredGames.push(game);
        }
    }

    return filteredGames;
}

//helper functions
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

    return table
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
    return {'average': average, 'max': max, 'margin': max - min};
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