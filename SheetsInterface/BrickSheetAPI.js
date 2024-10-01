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

/*************************************************************************************************
/ Class BrickApp
/ Description: A collection of enums and maps which facilitates managing the types and sections
/     of items found on BrickLink.com
*************************************************************************************************/
class BrickApp {};
/** Enum for convenience of accessing the various sheets required by BrickScraper **/


BrickApp.sheets = Object.freeze({
  SETUP:         "Setup BrickScraper",
  OVERVIEW:      "Inventory Overview",
  INVENTORY:     "Manage Inventory",
  ITEMS:         "_DB_ITEMS_",
  INSTANCES:     "_DB_INSTANCES_"
});

BrickApp.colors = Object.freeze({
  OUTERBORDER: "#efefef",
  INNERBORDER: "#003F5B",
  NOTEBG: "#FFF6EB",
  TEXT: "#001D29",
  CELLBORDER: "#6D4E4A",
  ORANGEACCENT: "#E2711D",
  GREENACCENT: "#6C7D47",
});

function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .createMenu('BrickScraper')
      .addItem('Show sidebar', 'showSidebar')
      .addItem('Reset Inventory', 'resetSpreadsheet')
      .addToUi();

  initSpreadsheet();
}

function addSet () {
  SpreadsheetApp.getActiveSpreadsheet().toast("addSet");
}

function addSetXml () {
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(`<input type="file" name="myInput" accept="image/*, .xml" required>`),'Import Set XML');
}

function resetSpreadsheet () {
  initSpreadsheet(true);
}

function initSpreadsheet(clearExisiting = false) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create and optionally clear the required sheets
  for (n of Object.values(BrickApp.sheets).reverse()) {
    const s = ss.getSheetByName(n);
    if (s != null) {
      if (clearExisiting) {
        ss.deleteSheet(s);
        ss.insertSheet(`${n}`,-1);
      }
    } else {
      ss.insertSheet(`${n}`,-1);
    }
  }

  // Set theme as Retro. Annoyingly, the API does not provide theme names, so look for it based on its colors.
  // This could totally break if Google adds more default themes or if the user deletes or edits the defaults.
  /*const themeList = ss.getPredefinedSpreadsheetThemes();
  const retro = themeList.findIndex(t => {
    return t.getConcreteColor(SpreadsheetApp.ThemeColorType.ACCENT1).asRgbColor().asHexString() == '#006391';
  });
  ss.setSpreadsheetTheme(themeList[retro]);*/

  ss.resetSpreadsheetTheme();

  // init setup sheet
  initSetupSheet();
}

function initSetupSheet () {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(BrickApp.sheets.SETUP);
  sheet.activate();

  // Set cell size
  sheet.setColumnWidth(1, 42);
  sheet.setColumnWidth(2, 21);
  sheet.setColumnWidth(3, 21);
  sheet.setColumnWidth(4, 600);
  sheet.setColumnWidth(5, 21);
  sheet.setColumnWidth(6, 21);
  sheet.setColumnWidth(7, 200);
  sheet.setColumnWidth(8, 300);
  sheet.setColumnWidth(9, 100);
  sheet.setColumnWidth(10, 21);
  sheet.setColumnWidths(11, 15, 250);

  sheet.setRowHeightsForced(1, 1, 42);
  sheet.setRowHeightsForced(2, 1, 21);
  sheet.setRowHeightsForced(5, 1, 21);
  sheet.setRowHeightsForced(11, 1, 21);


  // Color cells
  sheet.setHiddenGridlines(true);
  sheet.getRange("A:Z").setBackground(BrickApp.colors.OUTERBORDER);
  
  sheet.getRange("B2:B40").setBackground(BrickApp.colors.INNERBORDER);
  sheet.getRange("F5:F40").setBackground(BrickApp.colors.INNERBORDER);
  sheet.getRange("J2:J40").setBackground(BrickApp.colors.INNERBORDER);
  
  sheet.getRange("B2:J2").setBackground(BrickApp.colors.INNERBORDER);
  sheet.getRange("B5:J5").setBackground(BrickApp.colors.INNERBORDER);
  sheet.getRange("B11:F11").setBackground(BrickApp.colors.INNERBORDER);
  sheet.getRange("B40:J40").setBackground(BrickApp.colors.INNERBORDER);
  

  const introSection = sheet.getRange("C3:I4")
    .setBackground(BrickApp.colors.NOTEBG)
    .setBorder(
      true, 
      true, 
      true, 
      true, 
      false, 
      false, 
      BrickApp.colors.CELLBORDER, 
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  const introHeader = sheet.getRange("C3:I3")
    .merge()
    .setTextStyle(SpreadsheetApp.newTextStyle()
    .setBold(true)
    .setFontSize(16)
    .setForegroundColor(BrickApp.colors.TEXT).build())
    .setWrap(true)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setValue(`BrickScraper Setup`);
  
  const introText = sheet.getRange("C4:I4")
    .merge()
    .setTextStyle(SpreadsheetApp.newTextStyle()
    .setBold(false)
    .setFontSize(11)
    .setItalic(true)
    .setForegroundColor(BrickApp.colors.TEXT).build())
    .setWrap(true)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('top')
    .setValue([
      `\nBegin by adding the LEGO sets you want to inventory.`,
      `Sets can be added by number (e.g., "6990-1")`,
      `or by importing an XML file which you have`,
      `exported from you user profile on BrickLink.com\n`,

      `\nThe default behavior of BrickScraper is to scrape all`,
      `items within a set and the subitems of every item until`,
      `no more subitems can be found. To change this behavior,`,
      `use the options below.\n\n\n\n\n`].join(` `));

  const setSection = sheet.getRange("C6:E10")
    .setBorder(
      true, 
      true, 
      true, 
      true, 
      false, 
      false, 
      BrickApp.colors.CELLBORDER, 
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  const setHeader = sheet.getRange("C6:E6")
    .merge()
    .setTextStyle(SpreadsheetApp.newTextStyle()
    .setBold(true)
    .setFontSize(16)
    .setForegroundColor(BrickApp.colors.TEXT).build())
    .setWrap(true)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setValue("Add Sets");

  const setFields = sheet.getRange("C7:E10")
    .setTextStyle(SpreadsheetApp.newTextStyle()
    .setFontSize(11)
    .setForegroundColor(BrickApp.colors.TEXT).build())
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  const optsSection = sheet.getRange("C12:E39")
    .setBorder(
      true, 
      true, 
      true, 
      true, 
      false, 
      false, 
      BrickApp.colors.CELLBORDER, 
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  const optsHeader = sheet.getRange("C12:E12")
    .merge()
    .setTextStyle(SpreadsheetApp.newTextStyle()
    .setBold(true)
    .setFontSize(16)
    .setForegroundColor(BrickApp.colors.TEXT).build())
    .setWrap(true)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setValue("Scraper Options");

  const optsFields = sheet.getRange("C13:E39")
    .setTextStyle(SpreadsheetApp.newTextStyle()
    .setFontSize(11)
    .setForegroundColor(BrickApp.colors.TEXT).build())
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');

  const setTable = sheet.getRange("G6:I39")
    .setBorder(
      true, 
      true, 
      true, 
      true, 
      false, 
      false, 
      BrickApp.colors.CELLBORDER, 
      SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  const tableHeader = sheet.getRange("G6:I6")
    .merge()
    .setTextStyle(SpreadsheetApp.newTextStyle()
    .setBold(true)
    .setFontSize(16)
    .setForegroundColor(BrickApp.colors.TEXT).build())
    .setWrap(true)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setValue("Staged Sets");

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



