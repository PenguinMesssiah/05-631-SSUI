var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Err } from "./Err.js";
import { Check } from "./Check.js";
const actionTypeStrings = ['set_image', 'clear_image', 'none', 'print', 'print_event', 'move_image_sm', 'move_image_lg_back', 'move_image_back_reset', 'rotate_image'];
const record_arr = ["./images/Untitled.png",
    "./images/Untitled(1).png",
    "./images/Untitled(2).png",
    "./images/Untitled(3).png",
    "./images/Untitled(4).png",
    "./images/Untitled(5).png",
    "./images/Untitled(6).png",
    "./images/Untitled(7).png",
    "./images/Untitled(8).png",
    "./images/Untitled(9).png",
    "./images/Untitled(10).png",
    "./images/Untitled(11).png",
    "./images/Untitled(12).png",
    "./images/Untitled(13).png",
    "./images/Untitled(14).png",
    "./images/Untitled(15).png",
    "./images/Untitled(16).png",
    "./images/Untitled(17).png",
    "./images/Untitled(18).png",
    "./images/Untitled(19).png"
];
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
export class Action {
    constructor(actType, regionName, param) {
        this._actType = actType;
        this._onRegionName = regionName !== null && regionName !== void 0 ? regionName : "";
        this._param = param !== null && param !== void 0 ? param : "";
        this._onRegion = undefined; // will be established once we have the whole FSM
    }
    // Construct an Action from an Action_json object.  We type check all the parts here
    // since data coming from json parsing lives in javascript land and may not actually 
    // be typed at runtime as we have declared it here.
    static fromJson(jsonVal) {
        var _a, _b;
        const actType = Check.limitedString(jsonVal.act, actionTypeStrings, "none", "Action.fromJson{act:}");
        const regionname = Check.stringVal((_a = jsonVal.region) !== null && _a !== void 0 ? _a : "", "Action.fromJsonl{region:}");
        const param = Check.stringVal((_b = jsonVal.param) !== null && _b !== void 0 ? _b : "", "Action.fromJson{param:}");
        return new Action(actType, regionname, param);
    }
    get actType() { return this._actType; }
    get onRegionName() { return this._onRegionName; }
    get onRegion() { return this._onRegion; }
    get param() { return this._param; }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    // Carry out the action represented by this object.  evtType and evtReg describe
    // the event which is causing the action (for use by print_event actions).
    execute(evtType, evtReg) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (this._actType === 'none')
                return;
            // **** YOUR CODE HERE ****
            switch (this._actType) {
                case "set_image":
                    console.log("evt---\n", ">", evtType.toString(), "(", evtReg === null || evtReg === void 0 ? void 0 : evtReg.name, ")");
                    if (this._onRegion)
                        this._onRegion.imageLoc = this._param;
                    break;
                case "clear_image":
                    console.log("evt---\n", ">", evtType.toString(), "(", evtReg === null || evtReg === void 0 ? void 0 : evtReg.name, ")");
                    if (this.onRegion) {
                        this.onRegion.imageLoc = "";
                        this.onRegion.damage();
                    }
                    break;
                case "print":
                    console.log("evt---\n", ">", evtType.toString(), "(", this.param, ")");
                    break;
                case "print_event":
                    console.log("evt---\n", ">", evtType.toString(), "(", evtReg === null || evtReg === void 0 ? void 0 : evtReg.name, ")");
                    break;
                case "move_image_sm":
                    //Move Tone Arm Position
                    if (this.onRegion) {
                        this.onRegion.x = this.onRegion.x - 55;
                        this.onRegion.y = this.onRegion.y - 10;
                        this.onRegion.damage();
                    }
                    break;
                case "move_image_back_reset":
                    //Reset Tone Arm Position
                    if (this.onRegion) {
                        this.onRegion.x = 320;
                        this.onRegion.y = 0;
                        this.onRegion.damage();
                    }
                    break;
                case "rotate_image":
                    //Rotate Record 
                    let ctx = (_d = (_c = (_b = (_a = this.onRegion) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent) === null || _c === void 0 ? void 0 : _c.parent) === null || _d === void 0 ? void 0 : _d.canvasContext;
                    (_g = (_f = (_e = this.onRegion) === null || _e === void 0 ? void 0 : _e.parent) === null || _f === void 0 ? void 0 : _f.parent) === null || _g === void 0 ? void 0 : _g.x;
                    for (let i = 0; i <= 19; i += 1) {
                        setTimeout(() => {
                            if (ctx && this.onRegion) {
                                ctx.save();
                                this.onRegion.imageLoc = record_arr[i];
                                this.onRegion.damage();
                                ctx.restore();
                            }
                        }, 200 * i, i);
                    }
                    break;
            }
        });
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Attempt to find the name listed for this region in the given list of regions
    // (from the whole FSM), assiging the Region object to this._onRegion if found.
    bindRegion(regionList) {
        // **** YOUR CODE HERE ****
        //Iterate Across List & Match Object by Name
        for (let i = 0; i <= regionList.length - 1; i += 1) {
            let region_element = regionList[i];
            if (region_element.name === this._onRegionName) {
                this._onRegion = region_element;
                return;
            }
        }
        // ok to have no matching region for some actions
        if (this.actType === 'none' || this.actType === 'print' ||
            this.actType === 'print_event') {
            this._onRegion = undefined;
            return;
        }
        Err.emit(`Region '${this._onRegionName}' in action does not match any region.`);
    }
    //-------------------------------------------------------------------
    // Debugging Support
    //-------------------------------------------------------------------
    // Create a short human readable string representing this object for debugging
    debugTag() {
        return `Action(${this.actType} ${this.onRegionName} "${this.param}")`;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Create a human readable string displaying this object for debugging purposes
    debugString(indent = 0) {
        let result = "";
        const indentStr = '  '; // two spaces per indent level
        // produce the indent
        for (let i = 0; i < indent; i++)
            result += indentStr;
        // main display
        result += `${this.actType} ${this.onRegionName} "${this.param}"`;
        // possible warning about an unbound region
        if (!this.onRegion && this.actType !== 'none' &&
            this.actType !== 'print' && this.actType !== 'print_event') {
            result += " unbound";
        }
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Log a human readable string for this object to the console
    dump() {
        console.log(this.debugString());
    }
} // end class Action
//===================================================================
//# sourceMappingURL=Action.js.map