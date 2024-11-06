
import { EventType } from "./EventSpec.js";
import { Region } from "./Region.js";
import { Err } from "./Err.js";
import { Check } from "./Check.js"; 

//=================================================================== 
// Class for an object representing an action to be performed when a transition 
// in an FSM is taken. This consists of 3 parts:
//  * act   : The action to be performed
//  * region: The region to act on (can be undefined for actions not using a region)
//  * param : A string valued parameter for the action (can be undefined for actions not
//            usng a parameter).
//  Actions can  can be one of:
//   - set_image    set the image of the given region (or rather where it is to be 
//                  loaded from) based on the parameter value.  The parameter can be 
//                 "" for no image (which has the same effect as clear_image).
//   - clear_image set the image of the given region to empty/none. 
//   - none        do nothing (also used to patch up things loaded from bad json)
//   - print       print the parameter value
//   - print_event print the parameter value followed by a dump of the current event 
//===================================================================

// A type for the actions we support, along with correponding strings
export type ActionType = 'set_image' |  'clear_image' | 'none' | 'print' | 'print_event' | 'move_image_sm' | 'move_image_sm_back' | 'move_image_back_reset' | 'rotate_image';
const actionTypeStrings = ['set_image',  'clear_image', 'none', 'print', 'print_event', 'move_image_sm', 'move_image_lg_back', 'move_image_back_reset', 'rotate_image'] ;
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
]

// The type we are expecting to get back from decoding json for an Action
export type Action_json = {act: ActionType, region: string, param: string};

//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

export class Action {

    public constructor ( actType : ActionType, regionName? : string, param? : string) 
    {
        this._actType = actType;
        this._onRegionName = regionName ?? "";
        this._param = param ?? "";
        this._onRegion = undefined;  // will be established once we have the whole FSM
    }

    // Construct an Action from an Action_json object.  We type check all the parts here
    // since data coming from json parsing lives in javascript land and may not actually 
    // be typed at runtime as we have declared it here.
    public static fromJson(jsonVal : Action_json) : Action {
        const actType : ActionType = Check.limitedString<ActionType>(
                    jsonVal.act, actionTypeStrings, "none", "Action.fromJson{act:}");

        const regionname = Check.stringVal(jsonVal.region??"", "Action.fromJsonl{region:}");
        const param = Check.stringVal(jsonVal.param??"", "Action.fromJson{param:}"); 
    
        return new Action(actType, regionname, param);
    }  

    //-------------------------------------------------------------------
    // Properties
    //-------------------------------------------------------------------

    // Type of action to be performed
    protected _actType : ActionType;
    public get actType() {return this._actType;}

    // The name of region our action is acting on
    protected _onRegionName : string;
    public get onRegionName() {return this._onRegionName;}

    // The actual region our action is acting on (this is established by bindRegion()
    // and could remain undefined if the region name doesn't match any actual region)
    protected _onRegion : Region | undefined;  
    public get onRegion() {return this._onRegion;}

    // The parameter string for the action (can be "")
    protected _param : string;
    public get param() {return this._param;}
    
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    

    // Carry out the action represented by this object.  evtType and evtReg describe
    // the event which is causing the action (for use by print_event actions).
    public async execute(evtType : EventType, evtReg? : Region) { 
        if (this._actType === 'none') return;
        // **** YOUR CODE HERE ****
        switch(this._actType){
            case "set_image":
                console.log("evt---\n",">",evtType.toString(),"(",evtReg?.name,")")    
                if (this._onRegion) this._onRegion.imageLoc = this._param;
                break;
            case "clear_image":
            console.log("evt---\n",">",evtType.toString(),"(",evtReg?.name,")")    
                if(this.onRegion) {
                    this.onRegion.imageLoc = "";
                    this.onRegion.damage()
                }
                break;
            case "print":
                console.log("evt---\n",">",evtType.toString(),"(",this.param,")")
                break;
            case "print_event":
                console.log("evt---\n",">",evtType.toString(),"(",evtReg?.name,")")
                break;
            case "move_image_sm":
                //Move Tone Arm Position
                if (this.onRegion) {
                    this.onRegion.x = this.onRegion.x - 55;
                    this.onRegion.y = this.onRegion.y - 10;
                    this.onRegion.damage()
                }
                break;
            case "move_image_back_reset":
                //Reset Tone Arm Position
                if (this.onRegion) {
                    this.onRegion.x = 320;
                    this.onRegion.y = 0;
                    this.onRegion.damage()
                }
                break;
            case "rotate_image": 
                //Rotate Record 
                let ctx    = this.onRegion?.parent?.parent?.parent?.canvasContext;
                this.onRegion?.parent?.parent?.x
                
                for(let i:number=0;i<=19;i+=1){
                    setTimeout(() => {
                        if(ctx && this.onRegion) {
                            ctx.save();
                            this.onRegion.imageLoc = record_arr[i];
                            this.onRegion.damage()
                            ctx.restore();
                        } 
                    }, 200*i, i);
                }
                break;
            }
    }

    private delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    
    // Attempt to find the name listed for this region in the given list of regions
    // (from the whole FSM), assiging the Region object to this._onRegion if found.
    public bindRegion(regionList : readonly Region[]) : void {
            
        // **** YOUR CODE HERE ****
        //Iterate Across List & Match Object by Name
        for(let i=0;i<=regionList.length-1;i+=1) {
            let region_element = regionList[i];

            if(region_element.name === this._onRegionName) {
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
    public debugTag() : string {
        return `Action(${this.actType} ${this.onRegionName} "${this.param}")`;
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Create a human readable string displaying this object for debugging purposes
    public debugString(indent : number = 0) : string {
        let result = "";
        const indentStr = '  ';  // two spaces per indent level

        // produce the indent
        for (let i = 0; i < indent; i++) result += indentStr;

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
    public dump() {
        console.log(this.debugString());
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .   

} // end class Action

//===================================================================
