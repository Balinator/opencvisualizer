import { IGlobal } from "./IGlobal";

interface IPushable {
    global: IGlobal[];
    pushLevel: number;
    variableSize: number;
}

export { IPushable };