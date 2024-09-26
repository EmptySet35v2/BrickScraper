/*************************************************************************************************
/ Author: Daniel Hearn
/ Email: daniel.hearn@gmail.com
/ Date: 5 September 2024
/
/ Description: Implements a hierarchical data structure which contains a users LEGO Inventory.
/  The hierarchy is as follows:
/    BrickItems extends Array
/      BrickItem
/        BrickItemInstances extends Array
/          BrickItemInstance <--------------- YOU ARE HERE
/
*************************************************************************************************/


/*************************************************************************************************
/ Class
*************************************************************************************************/
class BrickItemInstance {
  
  /*************************************************************************************************
  / constructor
  *************************************************************************************************/
  constructor (commonItem = new BrickItem(), instOpts = {}) {
    this.commonItem = commonItem;

    // Add references to any child instances from instOpts
    this.childrenInst = new BrickItemInstances();
    
    if (instOpts.hasOwnProperty('childrenInst')) {
      for (const childInst of instOpts.childrenInst) {
        this.childrenInst.pushChild(childInst);
      }
    }

    // Set up other instance properties
    this.parentInst = null;
    this.section = BrickTypes.sectionEnum.UNKNOWN;
    this.expectQty = 0;
    this.haveQty = 0;
    this.hidden = false;
    this.notes = '';
    
    for (const key of ['parentInst', 'section', 'expectQty', 'haveQty', 'hidden', 'notes']) {
      this[key] = instOpts.hasOwnProperty(key) ? instOpts[key] : this[key];
    }

    // Add link to this to parent's children
    if (this.parentInst != null) {
      this.parentInst.childrenInst.pushChild(this)
    }

    // Convenience property for serializing and parsing this class as JSON
    this.jsonType = this.constructor.name;
  }

  /*************************************************************************************************
  / duplicate
  *************************************************************************************************/
  duplicate (parentInst) {
    const dupe = new BrickItemInstance (
      this.commonItem,
      { parentInst: parentInst,
        section: this.section,
        expectQty: this.expectQty,
        haveQty: this.haveQty,
        notes: `Duplicated from ${this.idString}`});
    
    this.pushSibling(dupe);
  }

  /*************************************************************************************************
  / pushSibling
  *************************************************************************************************/
  pushSibling (inst) {
    this.commonItem.push(inst);
  }

  /*************************************************************************************************
  / toJSON is automatically called by JSON.stringify, so that it will stringify the returned object
  / instead. This allows us to remove the circular references that prevent JSON.stringify from
  / working.
  *************************************************************************************************/
  toJSON () {
    // Copy over all of the properties to a clean object
    const safeObj = {...this};

    // Replace each reference to Items and Instances 'above' this instance with their ID strings.
    safeObj.parentInst = this.parentInst.idString;
    safeObj.commonItem = this.commonItem.idString;
    
    // Don't replace references which go 'down' into nested children or JSON.stringify won't
    // find them.
    // safeObj.childrenInst = this.childrenInst.map(inst => inst.idString);
    
    // Convenience property for serializing and parsing this class as JSON
    safeObj.jsonType = this.constructor.name;

    return safeObj;
  }

  /*************************************************************************************************
  / num
  *************************************************************************************************/
  get num () {
    return this.commonItem.instances.indexOf(this);
  }

  /*************************************************************************************************
  / num
  *************************************************************************************************/
  get numChildren () {
    return this.childrenInst.length;
  }

  /*************************************************************************************************
  / idString
  *************************************************************************************************/
  get idString () {
    return `${this.commonItem.idString}:${this.num}`;
  }

  get prettyName (){
    return `${this.commonItem.prettyName} I${this.num}`.trim();
  }
  
  get mdRefName (){
    return `#${this.prettyName.replace(/[\s-]+/g, '-').toLowerCase()}`;
  }

  /*************************************************************************************************
  / allChildren
  *************************************************************************************************/
  allChildren (depth=-1) {
    const string = [];   

    if (depth >= 0) {
      string.push(`${new Array((2 * depth) + 1).join(' ')}${this.idString} Qty: ${this.expectQty} (${this.haveQty}) Notes: ${this.notes}`);
    }
    
    for (const c of this.childrenInst.values()) {
      string.push(...c.allChildren(depth+1));
    }

    return string;
  }

  /*************************************************************************************************
  / allChildrenMd
  *************************************************************************************************/
  allChildrenMd (depth=-1) {
    const string = [];

    if (depth >= 0) {
      string.push(`${new Array((2 * depth) + 1).join('  ')}- ![${this.commonItem.num}](${this.commonItem.imgUrl} =40x40 "${this.commonItem.num}") ${this.expectQty}x [${this.prettyName}](${this.mdRefName})\n`);
    }

    for (const c of this.childrenInst.values()) {
      string.push(...c.allChildrenMd(depth+1));
    }

    return string;
  }

  toMarkdown() {
    const children = this.childrenInst.length > 0 ? [...this.allChildrenMd()] : [''];
    
    return [
      `<details>\n`,
      `<summary>Instance ${this.num}</summary>\n\n`,

      `### ${this.prettyName}\n`,
      `${this.parentInst != null ? `Found In: [${this.parentInst.prettyName}](${this.parentInst.mdRefName})\n\n` : ''}`,

      `${this.childrenInst.length > 0 ? `<details>\n` : ''}`,
      `${this.childrenInst.length > 0 ? `<summary>${this.childrenInst.length} Sub-Item(s):</summary>\n\n` : ''}`,

      ...children,'\n',

      `${this.childrenInst.length > 0 ? `</details>\n` : ''}`,
      `</details>\n`,
    ];
  };

  /*************************************************************************************************
  / toString
  *************************************************************************************************/
  toString() {
    const string = [];
    string.push(`Instance ID: ${this.idString}`);
    string.push(`Common BrickItem: ${this.commonItem.idString}`);
    string.push(`Parent BrickItemInstance: ${this.parentInst === null ? 'None' : this.parentInst.idString}`);
    string.push(`${this.childrenInst.length} Child(ren) BrickItemInstance(s)`);

    for (const [i, c] of this.childrenInst.entries()) {
      const allChildrenStrings = c.allChildren();
      for (const [j, s] of allChildrenStrings.entries()) {
        if (i == this.childrenInst.length-1 && j == allChildrenStrings.length-1) {
          string.push(` └  ${s}`);
          break;
        }
        string.push(` │  ${s}`);
      }
    }
    
    string.push(`Found in Section: ${this.section}`);
    string.push(`Expected (Have) Quantity: ${this.expectQty} (${this.haveQty})`);
    string.push(`Hidden: ${this.hidden}`);
    string.push(`Notes: ${this.notes}`);
    
    return string.join('\n');
  }
}
