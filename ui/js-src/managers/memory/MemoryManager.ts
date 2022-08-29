import { Variable } from "../../variables/Variable";
import { IHashMap } from "../../interfaces/IHashMap";
import { IBoundry } from "../../interfaces/IBoundry";
import { IPair } from "../../interfaces/IPair";
import { ArrayVariable } from "../../variables/ArrayVariable";
import { AbstactVariable } from "../../variables/AbstractVariable";
import { IPushable } from "../../functions/IPushable";
import { MemorySize } from "./MemorySize";

class MemoryManager {
    boundry: IBoundry;
    private diameter: number;
    private map: Map<IPair<number>, AbstactVariable> = new Map<IPair<number>, AbstactVariable>();
    private readonly variables: IHashMap<AbstactVariable> = {
        names: [],
        map: new Map<string, AbstactVariable>()
    };
    private index: number = 0;
    readonly baseFunction: IPushable | null;
    private size: {
        ttb: number; //TopToBottom
        ltr: number; //LeftToRight
    };
    constructor(diameter: number, boundry: IBoundry, baseFunction: IPushable | null, size: MemorySize) {
        this.diameter = diameter;
        this.boundry = boundry;
        this.baseFunction = baseFunction;

        this.size = size;
    }
    applyVariables(outOfscope: boolean) {
        for (let i: number = 0; i < this.variables.names.length; ++i) {
            let variable: Variable = <Variable>this.getVariable(this.variables.names[i]);
            if (variable instanceof Variable) {
                variable.apply(outOfscope);
            }
        }
    }
    addVariable(name: string, variable: Variable): void {
        this.variables.map.set(name, variable);
        this.variables.names.push(name);
        if (this.baseFunction) {
            this.baseFunction.global[this.baseFunction.pushLevel][name] = variable;
        }
        let pair: IPair<number> = {
            a: this.index % this.size.ltr,
            b: Math.floor(this.index / this.size.ltr)
        };
        this.index++;
        this.map.set(pair, variable);
        variable.origin.x = this.boundry.left + (pair.a + 0.5) * this.diameter;
        variable.origin.y = this.boundry.top + (pair.b + 0.5) * this.diameter;
    }
    addArrayVariable(name: string, variable: ArrayVariable): void {
        this.variables.map.set(name, variable);
        this.variables.names.push(name);
        if (this.baseFunction) {
            this.baseFunction.global[this.baseFunction.pushLevel][name] = variable;
        }
    }
    getVariable(name: string): AbstactVariable | undefined {
        return this.variables.map.get(name);
    }
    getVariableStrict(name: string): AbstactVariable {
        let variable: AbstactVariable | undefined = this.variables.map.get(name);
        if (variable) {
            return variable;
        }
        throw "Variable not found! (" + name + ")";
    }
    popContext(): boolean {
        let ex = this.baseFunction;
        if (ex) {
            for (let name in ex.global[ex.pushLevel]) {
                let index: number = this.variables.names.indexOf(name);
                if (index > -1) {
                    this.variables.names.splice(index, 1);
                }
                this.variables.map.delete(name);
                this.index--;
            }
            ex.global[ex.pushLevel] = {};
            if (ex.pushLevel > 0) {
                ex.pushLevel--;
            }
            else {
                return true;
            }
        }
        return false;
    }
}

export { MemoryManager };
