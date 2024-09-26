/*************************************************************************************************
/ Author: Daniel Hearn
/ Email: daniel.hearn@gmail.com
/ Date: 5 September 2024
/
/ Description:
/   Google Apps Script for parsing BrickLink catalog items into a hierarchical data structure along 
/   with functions to view the structure in Google Sheets
/
*************************************************************************************************/


function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .createMenu('Custom Menu')
      .addItem('Show sidebar', 'showSidebar')
      .addToUi();
}

function showSidebar() {
  var html = HtmlService.createHtmlOutput('')
      .setTitle('Item Details');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showSidebar(html);
}

/*************************************************************************************************
/ Class BrickItems
*************************************************************************************************/
function GETINVENTORY(setNum) {
  const mySet = new BrickItem({num:`${setNum}`, type:typeEnum.SET});

  mySet.scrape();

  return JSON.stringify(mySet.toArray());
}

/*************************************************************************************************
/ 
*************************************************************************************************/
function DISPLAYINVENTORY (jsonArray) {
  let parsedArray = [];
  jsonArray.forEach((row) => {
    parsedArray = parsedArray.concat(JSON.parse(row));
  })

  return parsedArray;
}

/*************************************************************************************************
/ 
*************************************************************************************************/
function tb_BrickSheetAPI () {

  const sets = ["1722-1",
                "2151-1",
                "3438-1",
                "6110-1",
                "6256-1",
                "6496-1",
                "6544-1",
                "6673-1",
                "6783-1",
                "6809-1",
                "6887-1",
                "6990-1",
                "8074-1",
                "8422-1",
                "8448-1",
                "8856-1",
                "9732-1",
                "1666-1"];

  let inventory = [];
  sets.forEach((set) => {
    Logger.log(`${set}`);
    let foo = GETINVENTORY(set);
    inventory.push(foo);
  });

  const display = DISPLAYINVENTORY(inventory);

  display.forEach((line) => {
    Logger.log(line);
  });
}

function getOrCreateFolder (parentDir, newDir) {
  let testDir = parentDir.getFoldersByName(newDir);
  return testDir.hasNext() ? testDir.next() : parentDir.createFolder(newDir);
}

function testSheetWrite () {
  let parserDataDir = getOrCreateFolder(getOrCreateFolder(getOrCreateFolder(DriveApp.getRootFolder(), "LEGO"),"BrickLink Parser"), "Data")

  const sets = ["1722-1",
                "2151-1",
                "3438-1",
                "6110-1",
                "6256-1",
                "6496-1",
                "6544-1",
                "6673-1",
                "6783-1",
                "6809-1",
                "6887-1",
                "6990-1",
                "8074-1",
                "8422-1",
                "8448-1",
                "8856-1",
                "9732-1",
                "1666-1"];

  let inventory = [];
  sets.forEach((set) => {
    Logger.log(`${set}`);
    let foo = GETINVENTORY(set);
    parserDataDir.createFile(`${set}.txt`, foo, MimeType.PLAIN_TEXT);
  });
}



