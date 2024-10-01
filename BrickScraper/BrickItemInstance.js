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

    this.allowDupe = true;
  }

  /*************************************************************************************************
  / toJSON is automatically called by JSON.stringify, so that it will stringify the returned object
  / instead. This allows us to remove the circular references that prevent JSON.stringify from
  / working.
  *************************************************************************************************/
  toJSON () {
    // Copy over all of the properties to a clean object
    const safeObj = {...this};

    safeObj.instanceID = this.idString;

    // Replace each reference to Items and Instances 'above' this instance with their ID strings.
    safeObj.parentInstID = this.parentInst != null ? this.parentInst.idString : null;
    safeObj.commonItemID = this.commonItem.idString;
    delete safeObj.parentInst;
    delete safeObj.commonItem;
    
    // Replace references which go 'down' into nested children, they will be found through their
    // common items.
    safeObj.childrenInstIDs = [...this.childrenInst.map(inst => inst.idString)];
    delete safeObj.childrenInst;
    
    const idx = safeObj.inventoryIdx;
    delete safeObj.inventoryIdx;

    // Convenience property for serializing and parsing this class as JSON
    safeObj.jsonType = this.constructor.name;

    
    delete safeObj.allowDupe;

    // Return the full commonItem for the first instance. Return a stub for others to save space.
    if (this.num > 0) {
      return {idString: this.commonItem.idString, instances: [safeObj], jsonType: "BrickItemStub", idx: idx};
    } else {
      
      return {...this.commonItem, instances: [safeObj], jsonType: "BrickItem", idx: idx};
    }
  }

  /*************************************************************************************************
  / toString
  *************************************************************************************************/
  toString() {
    const string = [];
    string.push(`Instance ID: ${this.idString}`);
    string.push(`Common BrickItem: ${this.commonItem.idString}`);
    string.push(`Parent BrickItemInstance: ${this.parentInst == null ? 'None' : this.parentInst.idString}`);
    string.push(`${this.childrenInst.length} Child(ren) BrickItemInstance(s)`);

    for (const [i, c] of this.childrenInst.entries()) {
      const allChildrenStrings = c.allChildrenString();
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

  /*************************************************************************************************
  / markdown functions
  *************************************************************************************************/
  toMarkdown() {
    const children = this.childrenInst.length > 0 ? this.allChildrenMarkdown() : [''];
    
    return [
      `<details>\n`,
      `<summary>Instance ${this.num}</summary>\n\n`,

      `### ${this.prettyName}\n`,
      `${this.parentInst != null ? `Found In: [${this.parentInst.prettyName}](${this.parentInst.markdownRefId})\n\n` : ''}`,

      `${this.childrenInst.length > 0 ? `<details>\n` : ''}`,
      `${this.childrenInst.length > 0 ? `<summary>${this.childrenInst.length} Sub-Item(s):</summary>\n\n` : ''}`,

      ...children,'\n',

      `${this.childrenInst.length > 0 ? `</details>\n` : ''}`,
      `</details>\n`,
    ];
  };

  /*************************************************************************************************
  / duplicate
  *************************************************************************************************/
  duplicate (parentInst, nextIdx) {
    const dupe = new BrickItemInstance (
      this.commonItem,
      { parentInst: parentInst,
        section: this.section,
        expectQty: this.expectQty,
        haveQty: this.haveQty,
        notes: `Duplicated from ${this.idString}`});

    dupe.inventoryIdx = nextIdx;
        
    return this.commonItem.push(dupe);
  }

  /*************************************************************************************************
  / Derived property getters
  *************************************************************************************************/
  get num () {
    return this.commonItem.instances.indexOf(this);
  }

  get numChildren () {
    return this.childrenInst.length;
  }

  get commonItemID () {
    return this.commonItem.itemID;
  }

  get parentInstID () {
    return this.parentInst.instanceID;
  }

  get childrenInstID () {
    return this.childrenInst.map(c => c.instanceID);
  }

  get instanceID () {
    return {...this.commonItemID, inst: this.num};
  }

  get idString () {
    return `${this.commonItemID.type}:${this.commonItemID.num}:${this.commonItemID.color}:${this.num}`.toLowerCase();;
  }

  get prettyName (){
    return `${this.commonItem.prettyName} I${this.num}`.trim();
  }
  
  get markdownRefId (){
    return `#${this.prettyName.replace(/[\s-]+/g, '-').toLowerCase()}`;
  }

  /*************************************************************************************************
  / allChildren
  *************************************************************************************************/
  allChildren_ (startDepth = 0, stopDepth = -Infinity) {
    const currentDepth = startDepth;
    const descendants = [];   

    if (currentDepth < 0 && currentDepth >= stopDepth) {
      descendants.push({depth: -currentDepth, inst: this});
    }
    
    for (const c of this.childrenInst.values()) {
      descendants.push(...c.allChildren_(startDepth-1));
    }

    return descendants;
  }

  allChildrenMarkdown (startDepth = 0, stopDepth = -Infinity) {
    return this.allChildren_(startDepth, stopDepth).map(d => 
      `${new Array((2 * (d.depth - 1)) + 1).join('  ')}- ![${d.inst.commonItem.num}](${d.inst.commonItem.imgUrl} =40x40 "${d.inst.commonItem.num}") ${d.inst.expectQty}x [${d.inst.prettyName}](${d.inst.markdownRefId})\n`
    );
  }

  allChildrenString (startDepth = 0, stopDepth = -Infinity) {
    return this.allChildren_(startDepth, stopDepth).map(d => 
      `${new Array((2 * (d.depth - 1)) + 1).join(' ')}${d.inst.idString} Qty: ${d.inst.expectQty} (${d.inst.haveQty}) Notes: ${d.inst.notes}`
    );
  }
}
