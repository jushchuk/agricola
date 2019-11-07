function populateTables(){
    let data = parseCSV(this.responseText);
    let games = parseDataToGames(data);
    
    let tablesContainer = document.getElementById('tables_container');
    let tablesFooter = document.getElementById('tables_footer');
    
    for (let i=0; i<games.length; i++) {
        let gameNumber = games[i][0]['Game'];
        let gamePlayers = [];
        for (let j=0; j<games[i].length; j++) {
            //determine who are the players for a particular game
            let player = games[i][j]['Player'];
            gamePlayers.push([player]);
            
            //this is to help later know who are all possible players
            if (!allPlayers.includes(player)) {
                allPlayers.push(player);
            }
        }

        //create the actual html table
        let table = createTable(games[i],'Game '+gameNumber);
        
        //push this table with some info to potentially use later
        tables.push({'Game':gameNumber, 'Players':gamePlayers, 'Table':table});

        //add table to page... potentially do this another place
        let div = wrapWithDiv(table, 'panel')
        tablesContainer.insertBefore(div, tablesFooter);
    }
}

var tables = [];
var allPlayers = [];
const dataURL = 'https://raw.githubusercontent.com/jushchuk/agricola/master/data/gric-refined.csv';
loadFile(dataURL, populateTables);

setTimeout(function(){
    console.log(tables);
    console.log(allPlayers);
}, 500);