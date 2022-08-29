import { UnscopedFunction } from "./unscoped/UnscopedFunction";
interface IOperand {
    type: string;
    value: string | number | undefined | any[] | UnscopedFunction<any>;
}


export { IOperand };