//===================================================================
// Finite State Machine driven interactor v1.0a 10/2023
// by Scott Hudson, CMU HCII 
//
// This and accompanying files provides classes and types which implement a generic
// interactor whose appearance and behavior is controlled by a Finite State Machine (FSM), 
// along with a set of "regions" which determine its appearance, as well as how 
// high-level input events for it are synthized and dispatched. See the comments
// in various classes for details.
//
// Revision history
// v1.0a  Initial version                 Scott Hudson  10/23
//
//===================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FSM } from "./FSM.js";
import { Err } from "./Err.js";
import { EventSpec } from "./EventSpec.js";
//===================================================================
// Class for an interactive object controlled by a finite state machine (FSM).
// Objects of this class have a position on the screen (the location of their top-left
// corner within the HTML canvas object associated with thier parent (Root) object), 
// Along with an FSM object which specifies, and partially imlements, their behavior.
// This class is repsonsible for using the FSM object to draw all the current region 
// images within the FSM, and for dispatching events to the FSM to drive its behavior.
// Note that this object has a position, but not an explicit size, and that no clipping
// of its output is being done.  Regions within the FSM are positioned in the coordinate
// system of this object (i.e., WRT its top-left corner), and have a size that 
// establishes a bouding box for input purposes (i.e., indicateing which event positions 
// are considered "inside" or "over" the region for input purposes).  However, region 
// image displays are not not limited to that bounding box and are not clipped (except 
// by the containing HTML canvas object).  See the FSM and Root classes for more details.
//=================================================================== 
export class FSMInteractor {
    constructor(fsm = undefined, x = 0, y = 0, parent, oldLocatorListObj) {
        this._fsm = fsm;
        this._x = x;
        this._y = y;
        this._parent = parent;
        if (fsm)
            fsm.parent = this;
        this._oldLocatorPosObj = [];
    }
    get oldLocatorPosObj() { return this._oldLocatorPosObj; }
    set oldLocatorPosObj(v) {
        this._oldLocatorPosObj = v;
    }
    get x() { return this._x; }
    set x(v) {
        // **** YOUR CODE HERE ****
        if (!(this._x === v)) {
            this._x = v;
            this.damage();
        }
    }
    get y() { return this._y; }
    set y(v) {
        // **** YOUR CODE HERE ****
        if (!(this._y === v)) {
            this._y = v;
            this.damage();
        }
    }
    // Position treated as a single value
    get position() {
        return { x: this.x, y: this.y };
    }
    set position(v) {
        var _a;
        if ((v.x !== this._x) || (v.y !== this._y)) {
            this._x = v.x;
            this._y = v.y;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.damage;
        }
    }
    get parent() { return this._parent; }
    set parent(v) {
        // **** YOUR CODE HERE ****
        if (!(this._parent === v)) {
            this.damage();
            this._parent = v;
            this.damage();
        }
    }
    get fsm() { return this._fsm; }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    // Declare that something managed by this object (most typically a region image, 
    // position, or size within the underlying FSM) has changed in a way that may 
    // make the current display incorrect and in need of update.  This is normally called 
    // from the controlling FSM, in response to damage declarations from its  "child" 
    // regions, etc.  This method passes the damage notification to its hosting Root
    // object which coordinates eventual redraw by calling this object's draw() method.
    damage() {
        var _a;
        // **** YOUR CODE HERE ****
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.damage();
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Draw the display for this object using the given drawing context object.  If the
    // showDegugging parameter is passed as true, additional drawing for debugging 
    // purposes (e.g., a black frame showing the bounding box of every region) is 
    // requsted.  See Region.draw() for more details.
    draw(ctx, showDebugging = false) {
        // bail out if we don't have an FSM to work from
        if (!this.fsm)
            return;
        // **** YOUR CODE HERE ****
        this.fsm.regions.forEach((region) => {
            ctx.save();
            ctx.translate(region.x, region.y);
            region.draw(ctx);
            ctx.restore();
        });
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Perform a "pick" operation, to determine the list of regions in our controlling
    // FSM which the given point is to be considered "inside" of or "over" (i.e., that
    // the given point is within the bounding box of).  The position passed here must 
    // be in the local coordinate system of this object (i.e., the position 0,0 would 
    // be at the top-left of this object).  Note that the "pick list" returned here
    // is ordered in reverse regions drawing order (regions drawn later, appear
    // earlier in the list) so that the region drawn on top of other objects appear
    // before them in the list.
    pick(localX, localY) {
        let pickList = [];
        // if we have no FSM, there is nothing to pick
        if (!this.fsm)
            return pickList;
        // **** YOUR CODE HERE ****
        //Iterate Over Regions in FSM
        let fsm_regionList = this.fsm.regions;
        for (let i = 0; i <= fsm_regionList.length - 1; i += 1) {
            let temp_region = fsm_regionList[i];
            //Call Pick Operation on Each Region
            //Shit breaking here
            if (temp_region.pick(localX, localY)) {
                //console.log("picking ", temp_region.name)
                pickList.push(temp_region);
            }
        }
        return pickList;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // **** YOUR CODE HERE ****   
    // You will need some persistent bookkeeping for dispatchRawEvent()
    //PICK UP HERE
    // Dispatch the given "raw" event by translating it into a series of higher-level
    // events which are formulated in terms of the regions of our FSM.  "Raw" events 
    // are based on simple actions with the input device(s) -- currently just press and
    // release of the first/primary locator button, and locator moves.  "Raw" events are 
    // represented by one of those three event types along with a position (in the local
    // coordinates of this object).  
    //
    // The following higher-level events are generated as translations of a "raw" event:
    // exit <region>, enter <region>, press <region>, move_inside <region>, 
    // release <region>, and release_none.  Multiple of these high level events can be 
    // generated from one "raw" event.  For example, an underlying move event can 
    // generate exit, enter, and move_inside events for multiple regions.  The order
    // of event delivery is to first deliver all exit events, then all enter events, etc.
    // in the order listed above.  Within each event type, events associated with the 
    // last drawn region should be dispatched first (i.e., events are delivered in 
    // reverse region drawing order). Note that all generated higher-level events
    // are dispatched to the FSM (via its actOnEvent() method).
    dispatchRawEvent(what, localX, localY) {
        // if we have no FSM, there is nothing to dispatch to
        if (this.fsm === undefined)
            return;
        // **** YOUR CODE HERE ****
        let eventList = [];
        let fsm_regions = this.fsm.regions;
        //let fsm_curState = this.fsm.currentState;
        let pickedRegions = this.pick(localX, localY);
        /* starting raw actions |
            press, move, release
        */
        //Switch Case to Process What Happened
        switch (what) {
            case 'move':
                //Test for exit, enter, move_inside
                for (let i = 0; i <= pickedRegions.length - 1; i += 1) {
                    let temp_region = pickedRegions[i];
                    //Checking Bookeeping List Length, Looking for Prior Entered Regions
                    if (this.oldLocatorPosObj.length !== 0) {
                        //If Locator Not in Prior Region List | Generate enter <region>
                        if (!this.oldLocatorPosObj.includes(temp_region.name)) {
                            let enterRegionEvt = new EventSpec('enter', temp_region.name);
                            enterRegionEvt.bindRegion(fsm_regions);
                            //Book-keeping | Add Region to OldLocatorPosition List
                            this.oldLocatorPosObj.push(temp_region.name);
                            eventList.push(enterRegionEvt);
                        }
                        //If Mouse in Prior Region List | Generate move_inside <region>
                        if (this.oldLocatorPosObj.includes(temp_region.name)) {
                            let moveInsideRegionEvt = new EventSpec('move_inside', temp_region.name);
                            moveInsideRegionEvt.bindRegion(fsm_regions);
                            eventList.push(moveInsideRegionEvt);
                        }
                    }
                    else {
                        //If OldLocatorPosObj is Empty, Simply Generate a enter <region>
                        let enterRegionEvt = new EventSpec('enter', temp_region.name);
                        //console.log("binding temp_region name = ",temp_region.name)
                        enterRegionEvt.bindRegion(fsm_regions);
                        //Book-keeping | Add Region to OldLocatorPosition List
                        this.oldLocatorPosObj.push(temp_region.name);
                        eventList.push(enterRegionEvt);
                    }
                }
                //Check for All Regions NOT Picked by FSM
                let notPickedRegions = [];
                this.fsm.regions.forEach((temp_region) => {
                    if (!pickedRegions.includes(temp_region)) {
                        //console.log("added to not picked regions ", temp_region.name)
                        notPickedRegions.push(temp_region);
                    }
                });
                //If Old Region is not Picked, but in Prior Region List | Generate exit <region>
                if (this.oldLocatorPosObj.length !== 0) {
                    for (let j = 0; j <= this.oldLocatorPosObj.length - 1; j += 1) {
                        let temp_region = this.oldLocatorPosObj[j];
                        for (let i = 0; i <= notPickedRegions.length - 1; i += 1) {
                            if (notPickedRegions[i].name === temp_region) {
                                let exitRegionEvt = new EventSpec('exit', temp_region);
                                exitRegionEvt.bindRegion(fsm_regions);
                                //Book Keeping, Remove from Prior Region List
                                let index = this.oldLocatorPosObj.indexOf(temp_region, 0);
                                if (index > -1) {
                                    this.oldLocatorPosObj.splice(index, 1);
                                }
                                eventList.push(exitRegionEvt);
                            }
                        }
                    }
                }
                break;
            case 'press':
                //Test for press <region>
                for (let i = 0; i <= pickedRegions.length - 1; i += 1) {
                    let temp_region = pickedRegions[i];
                    let pressRegionEvt = new EventSpec('press', temp_region.name);
                    pressRegionEvt.bindRegion(fsm_regions);
                    eventList.push(pressRegionEvt);
                }
                break;
            case 'release':
                //Test for release <region>
                for (let i = 0; i <= pickedRegions.length - 1; i += 1) {
                    let temp_region = pickedRegions[i];
                    let releaseRegionEvt = new EventSpec('release', temp_region.name);
                    releaseRegionEvt.bindRegion(fsm_regions);
                    eventList.push(releaseRegionEvt);
                }
                break;
        }
        /* final translated actions |
            exit <region>, enter <region>, press <region>,
            move_inside <region>, release <region>, and release_none
        */
        //Act on All Generate Events
        eventList.forEach((event) => {
            if (this.fsm)
                this.fsm.actOnEvent(event.evtType, event.region);
        });
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Method to begin an asychnous load of a FSM_json object from a remotely loaded 
    // .json file.  This object is then transformed into an FSM object to control
    // this object.  This method starts the loading process and sets up follow-on 
    // (asynchonous) actions, but then immediately returns.  In the asynchronous follow-on
    // actios, if the loading fails, Err.emit() is called with an appropriate message, 
    // and this._fsm is set to undefined.  When/if loading completes, the data is 
    // unpacked into an FSM_json object which is in turn used by FSM.fromJson() to create 
    // an FSM object installed as our fsm property.  Finally we declare damage to our 
    // parent object to arrange for redraw with the newly installed FSM.
    startLoadFromJson(jsonLoc) {
        return __awaiter(this, void 0, void 0, function* () {
            // try to load the json text from the given location
            const response = yield fetch(jsonLoc);
            if (!response.ok) {
                Err.emit(`Load of FSM from "${jsonLoc}" failed`);
                this._fsm = undefined;
                return;
            }
            //  parse the json into an (alledged) FSM_json object
            const data = yield response.json();
            // validate and build an actual FSM object out of that
            this._fsm = FSM.fromJson(data, this);
            // we just changed everything, so declare damage
            this.damage();
        });
    }
} // end class FSMInteractor 
//===================================================================
//# sourceMappingURL=FSMInteractor.js.map