/*************************************************************************************************
/ Author: Daniel Hearn
/ Email: daniel.hearn@gmail.com
/ Date: 5 September 2024
/
/ Description: (Low-quality) testbenches for the various Brick<x> Classes
/   BrickScraper 
/    BrickItems extends Array <-------------- YOU ARE HERE
/      BrickItem
/        BrickItemInstances extends Array
/          BrickItemInstance
/
*************************************************************************************************/

/*************************************************************************************
/ tb_BrickScraper
**************************************************************************************/
function tb_BrickScraper () {
  const sets = [
    "1722-1","2151-1","2152-1","2154-1","2161-1","3438-1",
    /*"3442-1","6107-1","6110-1","6256-1","6285-1","6491-1",
    "6496-1","6544-1","6673-1","6783-1","6809-1","6815-1",
    "6834-1","6854-1","6856-1","6877-1","6887-1","6899-1",
    "6923-1","6925-1","6949-1","6979-1","6990-1","8032-1",
    "8074-1","8222-1","8225-1","8226-1","8422-1","8448-1",*/
    "8458-1","8856-1","9732-1","9747-1","9748-1","1666-1"
  ];
                    
  sets.forEach((v, i, a) => {a[i] = UrlFromItemID({num:v, type:BrickTypes.typeEnum.SET})});

  const scraper = new BrickScraper();  
  scraper.scrapeUrl(sets);

  const date = Utilities.formatDate(new Date(), "GMT-5", "yyyyMMdd_HHmmss");
  const parserDataDir = getOrCreateFolder(getOrCreateFolder(getOrCreateFolder(getOrCreateFolder(
    DriveApp.getRootFolder(), "LEGO"), "BrickLink Parser"), "Data"), date);
  
  /** JSON output */
  const json = BrickScraper.saveAsJSON(scraper);
  parserDataDir.createFile(`tb_BrickScraper_${date}.json`, json, MimeType.PLAIN_TEXT);

  /** JSON output */
  const json2 = BrickScraper.saveAsJSON(BrickScraper.loadFromJSON(json));
  parserDataDir.createFile(`tb_BrickScraper_${date}_restored.json`, json2, MimeType.PLAIN_TEXT);

  /** toString output */
  parserDataDir.createFile(`tb_BrickScraper_${date}.txt`, scraper.items.toString(), MimeType.PLAIN_TEXT);

  /** Markdown output */
  const md = scraper.toMarkdown()
  parserDataDir.createFile(`tb_BrickScraper_${date}.md`, md, MimeType.PLAIN_TEXT);
  
  /** HTML output */
  const html = RenderMarkdown(md);
  parserDataDir.createFile(`tb_BrickScraper_${date}.html`, html, MimeType.HTML);

  /** UI Sidebar */
  const htmlout = HtmlService.createHtmlOutput((html)).setTitle('Item Details');
  SpreadsheetApp.getUi().showSidebar(htmlout);
}

/*************************************************************************************************
/ tb_BrickItem
*************************************************************************************************/
function tb_BrickItem () {
  const myBrickItems = new BrickItems();
  
  const myBrickItem0 = new BrickItem({
    num:'0000-1',
    color:0,
    type:BrickTypes.typeEnum.SET,
    url:'',
    commOpts:{
      category:'Test Set',
      description:'This is a test description.',
      notes:'myBrickItem0'},
    instOpts:[
      {
        section:BrickTypes.sectionEnum.REGULAR_ITEMS,
        expectQty:1,
        haveQty:1,
        hidden:false,
        notes:'myBrickItem0 - Inst 0'
      }, {
        section:BrickTypes.sectionEnum.EXTRA_ITEMS,
        expectQty:1,
        haveQty:1,
        hidden:true,
        notes:'myBrickItem0 - Inst 1'
      }]});
  
  const myBrickItem1 = new BrickItem({
    num:'1234-1',
    color:5,
    type:BrickTypes.typeEnum.PART,
    url:'',
    commOpts:{
      category:'Test Part',
      description:'This is a test part description.',
      notes:'myBrickItem1'},
    instOpts:[
      {
        section:BrickTypes.sectionEnum.REGULAR_ITEMS,
        expectQty:3,
        haveQty:1,
        hidden:false,
        notes:`myBrickItem1 - Inst 0`,
        parentInst: myBrickItem0.instances[0]
      }, {
        section:BrickTypes.sectionEnum.EXTRA_ITEMS,
        expectQty:1,
        haveQty:1,
        hidden:true,
        notes:`myBrickItem1 - Inst 1`,
        parentInst: myBrickItem0.instances[1]
      }]});
  
  const myBrickItem2 = new BrickItem({
    num:'4567-1',
    color:3,
    type:BrickTypes.typeEnum.PART,
    url:'',
    commOpts:{
      category:'Test Part',
      description:'This is a test part description.',
      notes:'myBrickItem2'},
    instOpts:[
      {
        section:BrickTypes.sectionEnum.REGULAR_ITEMS,
        expectQty:1,
        haveQty:0,
        hidden:false,
        notes:'myBrickItem2 - Inst 0',
        parentInst: myBrickItem1.instances[0]
      }, {
        section:BrickTypes.sectionEnum.EXTRA_ITEMS,
        expectQty:1,
        haveQty:1,
        hidden:true,
        notes:'myBrickItem2 - Inst 1',
        parentInst: myBrickItem1.instances[1]
      }]});

  const myBrickItem3 = new BrickItem({
    num:'0001-1',
    color:0,
    type:BrickTypes.typeEnum.SET,
    url:'',
    commOpts:{
      category:'Test Set',
      description:'This is a test description.',
      notes:'myBrickItem3'},
    instOpts:[
      {
        section:BrickTypes.sectionEnum.REGULAR_ITEMS,
        expectQty:1,
        haveQty:1,
        hidden:false,
        notes:'myBrickItem3 - Inst 0'
      }, {
        section:BrickTypes.sectionEnum.EXTRA_ITEMS,
        expectQty:1,
        haveQty:1,
        hidden:true,
        notes:'myBrickItem3 - Inst 1'
      }]});

  const myBrickItem4 = new BrickItem({
    num:'1234-1',
    color:5,
    type:BrickTypes.typeEnum.PART,
    url:'',
    commOpts:{
      category:'Test Fart [sic]',
      description:'Should not keep this...',
      notes:'Or this.'},
    instOpts:[
      {
        section:BrickTypes.sectionEnum.REGULAR_ITEMS,
        expectQty:7,
        haveQty:6,
        hidden:false,
        notes:`myBrickItem4 - Inst 0`,
        parentInst: myBrickItem3.instances[0]
      }, {
        section:BrickTypes.sectionEnum.EXTRA_ITEMS,
        expectQty:2,
        haveQty:0,
        hidden:false,
        notes:`myBrickItem4 - Inst 1`,
        parentInst: myBrickItem3.instances[1]
      }]});

  Logger.log(myBrickItems.push(myBrickItem0));
  Logger.log(myBrickItems.push(myBrickItem1));
  Logger.log(myBrickItems.push(myBrickItem2));
  Logger.log(myBrickItems.push(myBrickItem3));
  Logger.log(myBrickItems.push(myBrickItem4));

  Logger.log(`${myBrickItems}`);
  Logger.log(`${myBrickItems.totalInstances()}`);
  Logger.log(`${myBrickItems.jsonType}`);
  Logger.log(`${myBrickItem0.instances[0].allChildren(0,100)}`)

}