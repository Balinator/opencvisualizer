import { IGlobalFunctions } from "./IGlobalFunctions";

let globalFunctions: IGlobalFunctions = {
    functions: new Map()
}

function getFunctionElement(id: number): BaseFunction<any> {
    let ret = globalFunctions.functions.get(id);
    if (ret) {
        return ret;
    }
    throw "Function with id (" + id + ") does not exist!";
}

abstract class BaseFunction<R> {
    id: number;
    lineFrom: number;
    lineTo: number;
    columnFrom: number;
    columnTo: number;

    result: R;

    constructor(id: number, lineFrom: number, columnFrom: number, lineTo: number, columnTo: number) {
        this.id = id;
        this.lineFrom = lineFrom;
        this.columnFrom = columnFrom;
        this.lineTo = lineTo;
        this.columnTo = columnTo;
    }
}

export { BaseFunction }