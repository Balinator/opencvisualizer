import { BaseFunction } from "../../../BaseFunction";
import { UnscopedFunction } from "../../../unscoped/UnscopedFunction";
import { ConditionalFunction } from "../ConditionalFunction";

abstract class LoopFunction extends ConditionalFunction {
    
    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number, 
        parentID: number | undefined, children: BaseFunction<any>[], variableSize: number, condition: UnscopedFunction<boolean> | true) {
        super(id, lineFrom, columnFrom, lineTo, columnTo, parentID, children, variableSize, condition);
    }
}

export { LoopFunction }