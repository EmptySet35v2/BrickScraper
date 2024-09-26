/*************************************************************************************************
/ Author: Daniel Hearn
/ Email: daniel.hearn@gmail.com
/ Date: 5 September 2024
/
/ Description: Various URL helpers for BrickLink
/
*************************************************************************************************/

/*************************************************************************************************
/ Creates a URL to get the inventory of an item number
/ Supported types: "part" "counterpart" "set" "minifig"
*************************************************************************************************/
function UrlFromItemID ({
    num = '',
    color = 0,
    type = BrickTypes.typeEnum.UNKNOWN,
  } = {}) {
  const baseUrl = 'https://www.bricklink.com/catalogItemInv.asp';
  // TODO: remove the viewChk option since it is not needed
  // TODO: set options programmatically
  const queryOptions = '&viewType=P&viewChk=Y&bt=0&sortBy=0&sortAsc=A&viewID=Y';

  let itemQuery = '';
  switch (type) {
    case BrickTypes.typeEnum.PART:
      itemQuery = `P=${num}`;
      break;
    case BrickTypes.typeEnum.SET:
      itemQuery = `S=${num}`;
      break;
    case BrickTypes.typeEnum.MINIFIG:
      itemQuery = `M=${num}`;
      break;
    case BrickTypes.typeEnum.GEAR:
      itemQuery = `G=${num}`;
      break;
    case BrickTypes.typeEnum.BOOK:
      itemQuery = `B=${num}`;
      break;
    default:
      // TODO: Add support for books and gear
      throw `Attempt to create a URL from unsupported item type for item number ${num}`;
  }
  return `${baseUrl}?${itemQuery}${queryOptions}`;
}

/*************************************************************************************************
/ Creates a URL to get the inventory of an item number
/ Supported types: "part" "counterpart" "set" "minifig"
*************************************************************************************************/
function ImgUrlFromItemID ({
    num = '',
    color = 0,
    type = BrickTypes.typeEnum.UNKNOWN,
  } = {}) {
  const baseUrl = '';

  let itemQuery = '';
  switch (type) {
    case BrickTypes.typeEnum.PART:
      itemQuery = `PN`;
      break;
    case BrickTypes.typeEnum.SET:
      itemQuery = `SN`;
      break;
    case BrickTypes.typeEnum.MINIFIG:
      itemQuery = `MN`;
      break;
    case BrickTypes.typeEnum.GEAR:
      itemQuery = `GN`;
      break;
    case BrickTypes.typeEnum.BOOK:
      itemQuery = `BN`;
      break;
    default:
      // TODO: Add support for books and gear
      throw `Attempt to create a URL from unsupported item type for item number ${num}`;
  }
  return `https://img.bricklink.com/ItemImage/${itemQuery}/${color}/${num}.png`;
}

/*************************************************************************************************
/ Takes an inventory url of the following forms and extracts the part and type:
/ https://www.bricklink.com/catalogItemInv.asp?P=2599sprue
/ https://www.bricklink.com/catalogItemInv.asp?S=2161-1&viewType=P&viewChk=Y&bt=0&sortBy=0&sortAsc=A&viewID=Y"
*************************************************************************************************/
function ItemInfoFromUrl (url) {
  const params = parseQuery(url);

  let itemType = BrickTypes.typeEnum.UNKNOWN;
  let itemNum = '';
  let itemColor = 0;

  if (params.has("idColor")) {
    if (!(params.get("idColor") instanceof Array) || params.get("idColor").length > 1) {
      throw "Invalid URL format"
    }
    itemColor = params.get("idColor").pop();
  }
  
  if (params.has("P")) {
    if (!(params.get("P") instanceof Array) || params.get("P").length > 1) {
      throw "Invalid URL format"
    }

    itemType = BrickTypes.typeEnum.PART;
    itemNum = params.get("P").pop();
  
  } else if (params.has("S")) {
    if (!(params.get("S") instanceof Array) || params.get("S").length > 1) {
      throw "Invalid URL format"
    }

    itemType = BrickTypes.typeEnum.SET;
    itemNum = params.get("S").pop();
  
  } else if (params.has("M")) {
    if (!(params.get("M") instanceof Array) || params.get("M").length > 1) {
      throw "Invalid URL format"
    }

    itemType = BrickTypes.typeEnum.MINIFIG;
    itemNum = params.get("M").pop();

  } else if (params.has("G")) {
    if (!(params.get("G") instanceof Array) || params.get("G").length > 1) {
      throw "Invalid URL format"
    }

    itemType = BrickTypes.typeEnum.GEAR;
    itemNum = params.get("G").pop();

  } else if (params.has("B")) {
    if (!(params.get("B") instanceof Array) || params.get("B").length > 1) {
      throw "Invalid URL format"
    }

    itemType = BrickTypes.typeEnum.BOOK;
    itemNum = params.get("B").pop();

  } else {
      throw `Failed to parse "${url}" into a valid type`;
  }



  return {type: itemType, num: itemNum, color: itemColor};
}
/*************************************************************************************************
/ Copied from https://tanaikech.github.io/2019/03/26/gastips/
/ Edited to return a map
*************************************************************************************************/
function parseQuery(url) {
  var query = url.split("?")[1];
  const m = new Map();
  if (query) {
    
    let res = query.split("&")
    .reduce(function(o, e) {
      var temp = e.split("=");
      var key = temp[0].trim();
      var value = temp[1].trim();
      value = isNaN(value) ? value : Number(value);

      if (m.has(key)) {
        m.get(key).push(value);
      } else {
        m.set(key, [value]);
      }
    }, {});
    return m;
  }
  return null;
}

/*************************************************************************************************
/
*************************************************************************************************/
function stringReplaceAt (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

/*************************************************************************************************
/
*************************************************************************************************/
function getOrCreateFolder (parentDir, newDir) {
  let testDir = parentDir.getFoldersByName(newDir);
  return testDir.hasNext() ? testDir.next() : parentDir.createFolder(newDir);
}

/*************************************************************************************************
/ TB
*************************************************************************************************/
function tb_parseQuery() {
  var url = "https://www.bricklink.com/catalogItemInv.asp?S=2161-1&viewType=P&viewChk=Y&bt=0&sortBy=0&sortAsc=A&viewID=Y";
  var res = parseQuery(url);
  Logger.log(Array.from(res));
  Logger.log(res.has("S"));
  Logger.log(res.has("P"));
  Logger.log(res.has("M"));
}