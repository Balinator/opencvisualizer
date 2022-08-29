import { IStackable } from "../functions/IStackable";
export interface FunctionWithIndex {
    func: IStackable<any>;
    index: number;
}
