import { BaseFunction } from "../BaseFunction";
import { FunctionFunction } from "./FunctionFunction"

class MainFunction extends FunctionFunction<number> {

    constructor(children: BaseFunction<any>[], variableSize: number, argc?: number, argv?: string[]) {
        if ((argv && !argc) || argc) {
            throw "Must have argc and argv in the same time"
        }
        super(0, 0, 0, 0, 0, "main", undefined, children, variableSize);
    }

}

export { MainFunction }