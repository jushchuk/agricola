function populateStats(){
    data = parseCSV(this.responseText);
    console.log(data);
}

const dataURL = 'https://raw.githubusercontent.com/jushchuk/agricola/master/data/gric-refined.csv';
var data = loadFile(dataURL, populateStats);


setTimeout(function(){
    console.log(data);
}, 500);
