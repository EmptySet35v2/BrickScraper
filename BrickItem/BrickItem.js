/*************************************************************************************************
/ Author: Daniel Hearn
/ Email: daniel.hearn@gmail.com
/ Date: 5 September 2024
/
/ Description: Implements a hierarchical data structure which contains a users LEGO Inventory.
/  The hierarchy is as follows:
/    BrickItems extends Array
/      BrickItem <--------------------------- YOU ARE HERE
/        BrickItemInstances extends Array
/          BrickItemInstance
/
*************************************************************************************************/


/*************************************************************************************************
/ Class BrickItem
*************************************************************************************************/
class BrickItem {

  /*************************************************************************************************
  / constructor
  *************************************************************************************************/  
  constructor ({num = '', color = 0, type = BrickTypes.typeEnum.UNKNOWN, url = '', commOpts = {}, instOpts = [{}]}={}) {
    // Set up common properties
    if (url != '') {
      let id = ItemInfoFromUrl(url);
      this.num = id.num;
      this.color = id.color;
      this.type = id.type;
    } else {
      this.num = num;
      this.color = color;
      this.type = type;
    }

    // Set other properties from commOpts
    this.category = [`Catalog`, `${BrickTypes.categoryTypes.get(this.type)}`];
    this.category.push(commOpts.hasOwnProperty('category') ? `${commOpts['category']}` : 'User Added Item');
    
    this.description = '';
    this.notes = '';
    this.itemUrl = '';
    for (const key of ['description', 'notes', 'itemUrl']) {
      this[key] = commOpts.hasOwnProperty(key) ? commOpts[key] : this[key];
    }
    
    // Set up instances and their properties from instOpts
    this.instances = new BrickItemInstances();
    for (const opts of instOpts) {
      opts.notes = `Automatically created from BrickItem Constructor`;
      this.push(new BrickItemInstance(this, opts));
    }
  }

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
  / returns a pretty string of the entire array via recursion
  *************************************************************************************************/
  toString() {
    const string = [];
    string.push(`Item ID: "${this.idString}"`);
    string.push(`Description: ${this.description}`);
    string.push(`Notes: ${this.notes}`);
    string.push(`Inventory URL: ${this.invUrl}`);
    string.push(`Category: ${this.category.join(' > ')}`);
    string.push(`${this.numInstances} Instance(s)`);

    const instStrings = this.instances.toString().split('\n');
    for (const [j, s] of instStrings.entries()) {
      if (j == instStrings.length-1) {
        string.push(` └  ${s}`);
        break;
      }
      string.push(` │  ${s}`);
    }
    
    return string.join('\n');
  }

  /*************************************************************************************************
  / toMarkdown
  *************************************************************************************************/
  toMarkdown (instance = -1) {
    return [
      `## ${this.prettyName}\n`,
      `*${this.category.join(' > ')}*\n\n`,

      `<img src="${this.imgUrl}" alt="Image of ${this.prettyName} from BrickLink.com" width="250"/>\n\n`,
      
      `${this.numInstances > 0 && this.instances[0].numChildren > 0 ? `[BrickLink Inventory Page](${this.invUrl})\n\n` : ''}`,

      `${this.description == '' ? '' : `Description:\n > ${this.description}\n\n`}`,

      `${this.notes == '' ? '' : `Notes:\n > ${this.notes}\n\n`}`,

      `<details>\n`,
      `<summary>${this.numInstances} Unique Instances</summary>\n\n`,

      ...(this.instances.toMarkdown(instance)),

      `</details>\n`,
    ];
  }

  /*************************************************************************************************
  / push
  *************************************************************************************************/
  push (...inst) {
    for (const i of inst) {
      i.commonItem = this;
    }
    this.instances.push(...inst);
  }

  /*************************************************************************************************
  / Derived property getters
  *************************************************************************************************/
  get idString () {
    if (this.num == '') {
      throw "Attempted to get itemID of invalid BrickItem";
    }
    return `${this.type}:${this.num}:${this.color}`.toLowerCase();
  }

  get itemID () {
    if (this.itemNum == '') {
      throw "Attempted to get itemInfo of invalid BrickItem";
    }
    return {num: this.num, color: this.color, type: this.type};
  }

  get prettyName (){
    return `${this.type} ${this.num} ${this.type == BrickTypes.typeEnum.SET ? '' : `C${this.color}`}`.trim();
  }

  get invUrl () {
    if (this.type != BrickTypes.typeEnum.UNKNOWN && this.type != BrickTypes.typeEnum.SET_LIST) {
      return UrlFromItemID(this.itemID);
    }
    else {
      return '';
    }
  }

  get imgUrl () {
    if (this.type != BrickTypes.typeEnum.UNKNOWN && this.type != BrickTypes.typeEnum.SET_LIST) {
      return ImgUrlFromItemID(this.itemID);
    }
    else {
      return '';
    }
  }

  get numInstances () {
    return this.instances.length;
  }
} /** End BrickItem **/
