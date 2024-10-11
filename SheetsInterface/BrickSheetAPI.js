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
  INSTANCES:     "_DB_INSTANCES_",
  JSON:          "_RAW_JSON_"
});

function onOpen() {

}

function addSetOrXml () {
  SpreadsheetApp.getUi()
    .showModalDialog(
      HtmlService.createHtmlOutputFromFile('SheetsInterface/AddSetForm').setWidth(500).setHeight(700),'Add New Set')
}

function processAddSet(formObject) {
  let setnum = formObject.num;
  let setqty = formObject.qty ? formObject.qty : 1;

  let stagingsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.STAGING);
  let idx = stagingsheet.getLastRow();

  stagingsheet.appendRow([idx, `=IMAGE("https://img.bricklink.com/ItemImage/SN/0/${setnum}.png")`, `${setnum}`, `${setqty}`, 'false']);

  if (setqty > 1) return `${setnum} (Qty: ${setqty})`;
  return `${setnum}`;
}

function processAddXml(formObject) {
  const xmlBlob = formObject.xmlfile;
  const xml = xmlBlob.getDataAsString();

  Logger.log(xml);

  let document = XmlService.parse(xml);
  let root = document.getRootElement();

  let items = root.getChildren('ITEM');
  Logger.log(items.length)

  let stagingsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.STAGING);
  let idx = stagingsheet.getLastRow();

  const ssVals = [];
  for (item of items) {
    if (item.getChild(`ITEMTYPE`).getText() == `S`) {
      const num = item.getChild(`ITEMID`).getText();
      const qty = item.getChild(`QTY`).getText();
      ssVals.push([`${idx}`,`=IMAGE("https://img.bricklink.com/ItemImage/SN/0/${num}.png")`, `${num}`, `${qty}`, 'false']);
      idx++
    }
  }

  Logger.log(ssVals);

  LockService.getScriptLock().waitLock(60000);
  stagingsheet.getRange(stagingsheet.getLastRow() + 1, 1, ssVals.length, ssVals[0].length).setValues(ssVals);

  return ssVals.length;
}

function loadJsonFromSheet () {
  let jsonSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.JSON);

  if (jsonSheet.getLastRow() == 0) {
    return new BrickScraper();
  }
  
  const json3 = jsonSheet.getDataRange().getValues().flat(Infinity).join('\n');
  //Logger.log(json3);
  const scraper3 = BrickScraper.loadFromJSON(json3);

  Logger.log(`Restored Inventory Size = ${scraper3.items.inventorySize}`);

  return scraper3;
}

function printInventory () {
  const scraper = loadJsonFromSheet();
  let inventory = scraper.items.allInstances();

  Logger.log(inventory.length)

  sheetInv = [inventory[0].toArray(true)];
  sheetInv.push(...inventory.map(i => i.toArray()));

  Logger.log(sheetInv.length)

  let jsonSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.INSTANCES);
  LockService.getScriptLock().waitLock(60000);
  jsonSheet.clear();

  const range = jsonSheet.getRange(1, 1, sheetInv.length, sheetInv[0].length);

  range.setValues(sheetInv).setNumberFormat("@");
  range.applyRowBanding(SpreadsheetApp.BandingTheme.INDIGO, true, true);
  jsonSheet.autoResizeColumns(1, sheetInv[0].length);
  jsonSheet.autoResizeRows(1, sheetInv.length);
}

function scrape () {
  let stagingsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.STAGING);

  const values = stagingsheet.getDataRange().getValues();

  // Grab the next 5 sets to scrape and calculate their URLs
  const unscrapedSets = [];
  const unscrapedIdxs = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i][4] === false && unscrapedSets.length < 5){
      unscrapedSets.push(UrlFromItemID({num:values[i][2], type:BrickTypes.typeEnum.SET}));
      unscrapedIdxs.push(i + 1); //convert to cell row index
    }
  }
  
  const scraper = loadJsonFromSheet();

  for (row of unscrapedSets) {
    Logger.log(`Scraping ${row}`);
  }

  scraper.scrapeUrl(unscrapedSets);
  const jsonArray = scraper.saveAsJSON().split(/\r?\n/g).map(e => [e]);

  let jsonSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BrickApp.sheets.JSON);
  LockService.getScriptLock().waitLock(60000);
  jsonSheet.clear();
  jsonSheet.getRange(1, 1, jsonArray.length).setValues(jsonArray);

  for (idx of unscrapedIdxs) {
    Logger.log(idx);
    stagingsheet.getRange(idx, 5).setValue(true);
  }

  printInventory();

  Logger.log('done');
}
