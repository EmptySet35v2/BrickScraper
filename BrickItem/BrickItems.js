/*************************************************************************************************
/ Author: Daniel Hearn
/ Email: daniel.hearn@gmail.com
/ Date: 5 September 2024
/
/ Description: Implements a hierarchical data structure which contains a users LEGO Inventory.
/  The hierarchy is as follows:
/    BrickItems extends Array <-------------- YOU ARE HERE
/      BrickItem
/        BrickItemInstances extends Array
/          BrickItemInstance
/
*************************************************************************************************/


/*************************************************************************************************
/ Class BrickItems
*************************************************************************************************/
class BrickItems extends Array{ 

  /*************************************************************************************************
  / toJSON is automatically called by JSON.stringify, so that it will stringify the returned object
  / instead. This allows us to remove the circular references that prevent JSON.stringify from
  / working.
  *************************************************************************************************/
  toJSON () {  
    // Copy over all of the properties to a clean object
    const safeObj = {...this};

    // Convenience property for serializing and parsing this class as JSON
    safeObj.jsonType = this.constructor.name;

    return safeObj;
  }

  /*************************************************************************************************
  / toString
  *************************************************************************************************/
  toString() {
    const string = [];

    for (const [i, b] of this.entries()) { 
      string.push(`🧱 Brick Item ${i}:`);

      const elementStrings = b.toString().split('\n');
      for (const [j, s] of elementStrings.entries()) {
        if (j == elementStrings.length-1) {
          string.push(` └  ${s}`);
          break;
        }
        string.push(` │  ${s}`);
      }

      string.push('\n');
    }
    return string.join('\n');
  }

  /*************************************************************************************************
  / Markdown functions
  *************************************************************************************************/
  static toMarkdownByItems (items) {    
    const markdown = [];
    for (const item of items.values()) {
      markdown.push(...(item.toMarkdown()));
    } 
    return markdown;
  };

  static toMarkdownByType (items, type) {    
    const foundItems = items.filter((item) => item.type == type);
    const typeText = type == BrickTypes.typeEnum.GEAR ? "piece(s) of gear" : `${type}(s)`;

    return [
      `# ${type == BrickTypes.typeEnum.GEAR ? "Gear" : `${type}s`}\n`,
      `This inventory has ${foundItems.totalInstances} ${typeText.toLowerCase()}, including:\n\n`,

      ...(BrickItems.toMarkdownByItems(foundItems)),`\n`,
    ];
  };

  /*************************************************************************************************
  / Pushes one or more items onto the array. Merges instances of the new item(s) to existing 
  / item(s) if the item already is in the array.
  *************************************************************************************************/
  push (...args) {
     const retVal = [];
    for (const arg of args) {
      const index = this.findIndex((item) => {
        return item.idString == arg.idString;
      });

      if (index >= 0) { // Found in array, so ask the item to add the instance      
        this[index].push(...arg.instances);
        retVal.push(true);

      } else { // Not found in array, so add it as is
        super.push(arg);
        retVal.push(false);
      }
    }

    return retVal.every((e) => e); //If all true, return true
  }

  /*************************************************************************************************
  / Derived property getters
  *************************************************************************************************/
  get totalInstances () {
    return this.allInstances().length;
  }

  /*************************************************************************************************
  / allInstances
  *************************************************************************************************/
  allInstances () {
    let insts = [];
    
    for (const i of this) {
      insts.push(...i.instances);
    }

    return insts;
  }


} /** End BrickItems **/


/*************************************************************************************************
/ Class BrickTypes
/ Description: A collection of enums and maps which facilitates managing the types and sections
/     of items found on BrickLink.com
*************************************************************************************************/
class BrickTypes {};

/** BrickLink.com item types as defined at https://www.bricklink.com/catalogInv.asp **/
BrickTypes.typeEnum = Object.freeze({
  UNKNOWN:  "Unknown",
  SET:      "Set",
  PART:     "Part",
  MINIFIG:  "Minifig",
  BOOK:     "Book",
  GEAR:     "Gear"
});

/** BrickLink.com inventory sections as defined at https://www.bricklink.com/help.asp?helpID=1562 **/
BrickTypes.sectionEnum = Object.freeze({
  UNKNOWN:         "Unknown",
  ALL:             "All",
  NONE:            "None",
  REGULAR_ITEMS:   "Regular Items",
  EXTRA_ITEMS:     "Extra Items",
  ALTERNATE_ITEMS: "Alternate Items",
  COUNTERPARTS:    "Counterparts"
});

/** BrickLink.com inventory page columns using "&viewType=P&viewChk=Y&bt=0&sortBy=0&sortAsc=A&viewID=Y" **/
BrickTypes.inventoryColumns = new Map([
      ["INV_ID", 0],
      ["CHK", 1],
      ["IMAGE", 2],
      ["QTY", 3],
      ["ITEM_NO", 4],
      ["DESCRIPTION", 5],
      ["MID", 6]
    ]);

/** Mapping of the HTML text for each type to the type enum above */
BrickTypes.inventoryItemTypes = new Map([
      ["Sets:", BrickTypes.typeEnum.SET],
      ["Parts:", BrickTypes.typeEnum.PART],
      ["Minifigures:", BrickTypes.typeEnum.MINIFIG],
      ["Books:", BrickTypes.typeEnum.BOOK],
      ["Gear:", BrickTypes.typeEnum.GEAR]
    ]);

/** Mapping of the HTML text for each section to the section enum above */
BrickTypes.inventorySections = new Map([
      ["Regular Items:", BrickTypes.sectionEnum.REGULAR_ITEMS],
      ["Extra Items:", BrickTypes.sectionEnum.EXTRA_ITEMS],
      ["Alternate Items:", BrickTypes.sectionEnum.ALTERNATE_ITEMS],
      ["Counterparts:", BrickTypes.sectionEnum.COUNTERPARTS]
    ]);

/** Mapping of the item type enum to the item category string text */
BrickTypes.categoryTypes = new Map([
      [BrickTypes.typeEnum.SET, "Sets"],
      [BrickTypes.typeEnum.PART, "Parts"],
      [BrickTypes.typeEnum.MINIFIG, "Minifigures"],
      [BrickTypes.typeEnum.BOOK, "Books"],
      [BrickTypes.typeEnum.GEAR, "Gear"]
    ]);

/** End BrickTypes **/
