import { UnscopedFunction } from "../../unscoped/UnscopedFunction";
import { BaseFunction } from "../../BaseFunction";
import { ScopedFunction } from "../ScopedFunction";


class ConditionalFunction extends ScopedFunction<void> {
    condition: UnscopedFunction<boolean> | true; // TODO: cahnge UnrealFunction to IStackable

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, 
        parentID: number | undefined, children: BaseFunction<any>[], variableSize: number , condition: UnscopedFunction<boolean> | true) {
        super(id, lineFrom, columnFrom, lineTo, columnTo, parentID, children, variableSize);
        this.condition = condition;
    }
}

export { ConditionalFunction };