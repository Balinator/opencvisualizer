import { BaseFunction } from "./BaseFunction";

interface IGlobalFunctions {
    functions: Map<number, BaseFunction<any>>;
}

export { IGlobalFunctions };