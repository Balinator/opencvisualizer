import { BaseRepresenter } from "./representer/BaseRepresenter";
import { NormalFunctionRepresenter } from "./representer/real/NormalFunctionRepresenter";

export class Program {
    mainFunction: NormalFunctionRepresenter;
    functions: NormalFunctionRepresenter[] = [];
    global: BaseRepresenter[] = [];
    globalSize: number = 0;
    lastId: number;
}
