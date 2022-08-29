import { UnscopedFunction } from "./UnscopedFunction";
import { AtomicFunction } from "./AtomicFunction";
import { IStackable } from "../IStackable";
import { FunctionFunction } from "../scoped/FunctionFunction";

class CallerFunction<R> extends UnscopedFunction<R> implements IStackable<R>{
    calledFunction: FunctionFunction<R>;
    initFunctions: (IStackable<any> | AtomicFunction<any>)[];

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number,
        parentId: number | undefined, calledFunction: FunctionFunction<R>, initFunctions: (IStackable<any> | AtomicFunction<any>)[]) {
        super(id, lineFrom, columnFrom, lineTo, columnTo, "");
        this.calledFunction = calledFunction;
        this.initFunctions = initFunctions;
        this.parentId = parentId
    }
    parentId: number | undefined;
    parent: IStackable<R> | undefined;
}

export { CallerFunction }