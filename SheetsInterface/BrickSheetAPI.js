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
  SETUP:         "Setup",
  INVENTORY:     "Manage Inventory",
  STAGING:       "_STAGING_",
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
  SpreadsheetApp.getUi()
      .createMenu('BrickScraper')
      .addItem('Show sidebar', 'showSidebar')
      .addToUi();

  initSpreadsheet();
}

function processForm(formObject) {
  let setnum = formObject.num;
  let setqty = formObject.qty ? formObject.qty : 1;

  let stagingsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.STAGING);
  stagingsheet.appendRow([`=IMAGE("https://img.bricklink.com/ItemImage/SN/0/${setnum}.png")`, `${setnum}`, `${setqty}`, 'false']);

  if (setqty > 1) return `${setnum} (Qty: ${setqty})`;
  return `${setnum}`;
}

function addSet () {
  SpreadsheetApp.getUi()
    .showModalDialog(
      HtmlService.createHtmlOutputFromFile('SheetsInterface/html/AddSetForm').setWidth(500).setHeight(600),'Add New Set')
}

function addSetXml () {
  SpreadsheetApp.getUi()
    .showModalDialog(
      HtmlService.createHtmlOutputFromFile('SheetsInterface/html/ImportFromFileForm').setWidth(500).setHeight(600),'Import Set XML');
}

function incrPage() {
  let stagingsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.STAGING);
  let page = stagingsheet.getRange("H1");

  page.setValue(page.getValue()+1);
}

function decrPage() {
  let stagingsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.STAGING);
  let page = stagingsheet.getRange("H1");

  let curVal = page.getValue();

  if (curVal > 0) {
    page.setValue(curVal-1);
  }
}

function resetSpreadsheet () {
  initSpreadsheet(true);
}

function initSpreadsheet(clearExisiting = false) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
}

function showSidebar() {
  var html = HtmlService.createHtmlOutput('')
      .setTitle('Item Details');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showSidebar(html);
}
