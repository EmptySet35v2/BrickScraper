/*************************************************************************************************
/ Author: Daniel Hearn
/ Email: daniel.hearn@gmail.com
/ Date: 5 September 2024
/
/ Description: Implements a hierarchical data structure which contains a users LEGO Inventory.
/  The hierarchy is as follows:
/    BrickItems extends Array
/      BrickItem
/        BrickItemInstances extends Array <-- YOU ARE HERE
/          BrickItemInstance
/
*************************************************************************************************/


/*************************************************************************************************
/ Class BrickItemInstances
*************************************************************************************************/
class BrickItemInstances extends Array{ 

  /*************************************************************************************************
  / toString
  *************************************************************************************************/ 
  toString () {
    const string = [];

    for (const [i, b] of this.entries()) { 
      string.push(`BrickItemInstance ${i}:`);

      const elementStrings = b.toString().split('\n');
      for (const [j, s] of elementStrings.entries()) {
        if (j == elementStrings.length-1) {
          string.push(` └  ${s}`);
          break;
        }
        string.push(` │  ${s}`);
      }
    }

    return string.join('\n');
  }

  /*************************************************************************************************
  / toMarkdown
  *************************************************************************************************/ 
  toMarkdown (instance = -1) {
    const markdown = [];
    const filtInst = instance < 0 ? this.values() : [this[instance]].values();
    
    for (const inst of filtInst) {
      markdown.push(...(inst.toMarkdown()));
    }
    
    return markdown;
  };

  /*************************************************************************************************
  / pushChild
  *************************************************************************************************/ 
  pushChild (...args) {
    for (const arg of args) {if (this.indexOf(arg) >= 0) throw "Every instance pushed must be unique"}
    super.push(...args);
  }

  /*************************************************************************************************
  / push
  *************************************************************************************************/ 
  push (...args) {
    let nextIdx = args[0].inventoryIdx;
    
    for (const arg of args) {    
      if (this.indexOf(arg) >= 0) throw "Every instance pushed must be unique"

      arg.inventoryIdx = nextIdx;
      nextIdx += 1;

      // not the first instance, so we know what children this item has
      if (this.length > 0 && arg.allowDupe) {
        // Ask each child of the item's first instance to duplicate itself with the arg as the new parent
        for (const child of this[0].childrenInst) {
          nextIdx = child.duplicate(arg, nextIdx);
        }
      }

      super.push(arg);
    }

    return nextIdx;
  }
} /** End BrickItemInstances **/
