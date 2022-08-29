import { Variable } from "../../variables/Variable";
import { IBoundry } from "../../interfaces/IBoundry";
import { IPair } from "../../interfaces/IPair";
import { ArrayVariable } from "../../variables/ArrayVariable";
import { AbstactVariable } from "../../variables/AbstractVariable";
import { TemporalVariable } from "../../variables/TemporalVariable";
import { IPushable } from "../../functions/IPushable";
import { MemoryManager } from "./MemoryManager";
import { MemorySize } from "./MemorySize"
import { CallerFunction } from "../../functions/unscoped/CallerFunction";
import { RenderLogic } from "../RenderLogic";

class MasterMemoryManager {
    private boundry: IBoundry;

    private globalMemoryManager: MemoryManager;
    private memoryManagers: MemoryManager[] = [];

    private diameter: number;

    private _auxiliaryObjects: TemporalVariable[] = [];

    static globalSize: number = 16;

    get auxiliaryObjects(): TemporalVariable[] {
        return this._auxiliaryObjects;
    }

    readonly actionAreaMidle: IPair<number>;

    private colors: string[] = ["#2f027d", "#cfaae2", "#a087c8", "#7781bd", "#03ad4b", "#f65b9b", "#00d0c4", "#27e251", "#62880c", "#8db0ac", "#0707ee", "#30bd8f",
        "#7f8779", "#ccd5cb", "#1b2db7", "#7af3f1", "#821fd8", "#63635b", "#7c6d56", "#cf7e4c", "#1d309c", "#28fdf2", "#a3471a", "#1b4a54"].sort(() => Math.random() - 0.5);

    constructor(radius: number, boundry: IBoundry, globalSize: number) {
        this.diameter = radius * 2;
        this.boundry = boundry;

        let ltr: number = Math.floor((this.boundry.right - this.boundry.left) / this.diameter);
        let size: MemorySize = {
            ttb: Math.ceil(globalSize / ltr),
            ltr: ltr
        };
        let globalBoundry: IBoundry = {
            top: this.boundry.top,
            bottom: size.ttb * this.diameter,
            right: this.boundry.right,
            left: this.boundry.left
        }

        this.globalMemoryManager = new MemoryManager(this.diameter, globalBoundry, null, size)
    }

    applyVariables() {
        //console.log("New Frame")
        this.drawScope(this.globalMemoryManager, 0, false);
        this.globalMemoryManager.applyVariables(false);
        let outOfscope: boolean = false;
        for (let i: number = this.memoryManagers.length - 1; i >= 0; --i) {
            this.drawScope(this.memoryManagers[i], i + 1, outOfscope);

            this.memoryManagers[i].applyVariables(outOfscope);
            if(this.memoryManagers[i].baseFunction instanceof CallerFunction) {
                outOfscope = true;
            }
        }
    }

    private drawScope(memoryManager: MemoryManager, i: number, outOfscope: boolean) {
        //console.log(memoryManager, i, outOfscope)
        RenderLogic.Instance.context.beginPath();
        RenderLogic.Instance.context.rect(memoryManager.boundry.left, memoryManager.boundry.top, 
            memoryManager.boundry.right - memoryManager.boundry.left, memoryManager.boundry.bottom - memoryManager.boundry.top);
        RenderLogic.Instance.context.fillStyle = this.colors[i];
        if (outOfscope) {
            RenderLogic.Instance.context.globalAlpha = 0.5;
        } else {
            RenderLogic.Instance.context.globalAlpha = 0.8;
        }
        RenderLogic.Instance.context.fill();
    }

    pushContext(func: IPushable): void {
        let mm = this.memoryManagers[this.memoryManagers.length - 1];
        if (mm && func === mm.baseFunction) {
            func.pushLevel++;
        } else {
            let ltr: number = Math.floor((this.boundry.right - this.boundry.left) / this.diameter);
            let size = {
                ttb: Math.ceil((func instanceof CallerFunction ? func.calledFunction : func).variableSize / ltr),
                ltr: ltr
            };
            let prevBottom = (this.memoryManagers.length > 0 ? this.memoryManagers[this.memoryManagers.length - 1] : this.globalMemoryManager).boundry.bottom;
            let boundry: IBoundry = {
                top: prevBottom,
                bottom: prevBottom + size.ttb * this.diameter,
                right: this.boundry.right,
                left: this.boundry.left
            }

            this.memoryManagers.push(new MemoryManager(this.diameter, boundry, func, size));
        }
    }

    popContext() {
        if (this.memoryManagers[this.memoryManagers.length - 1].popContext()) {
            this.memoryManagers.pop();
        }
    }

    addVariable(name: string, variable: Variable): void {
        let mm: MemoryManager;
        if (this.memoryManagers.length > 0) {
            mm = this.memoryManagers[this.memoryManagers.length - 1];
        } else {
            mm = this.globalMemoryManager;
        }
        mm.addVariable(name, variable);
    }

    addArrayVariable(name: string, variable: ArrayVariable): void {
        let mm: MemoryManager;
        if (this.memoryManagers.length > 0) {
            mm = this.memoryManagers[this.memoryManagers.length - 1];
        } else {
            mm = this.globalMemoryManager;
        }
        mm.addArrayVariable(name, variable);
    }

    getVariable(name: string): AbstactVariable | undefined {
        if (this.memoryManagers.length > 0) {
            let ret;
            let init = this.memoryManagers.length - (name.endsWith(":old") ?  1 : 2);
            name = name.replace(":old", "");
            for (let i: number = init; i >= 0; --i) {
                let mm = this.memoryManagers[i];
                ret = mm.getVariable(name);
                if (ret) {
                    return ret;
                }
                if (mm.baseFunction instanceof CallerFunction) {
                    break;
                }
            }
        }
        return this.globalMemoryManager.getVariable(name);
    }

    getVariableThisLevel(name: string): AbstactVariable | undefined {
        if (this.memoryManagers.length > 0) {
            return this.memoryManagers[this.memoryManagers.length - 1].getVariable(name);
        }
        return this.globalMemoryManager.getVariable(name);
    }

    getVariableStrict(name: string): AbstactVariable {
        if (this.memoryManagers.length > 0) {
            let ret;
            let init = this.memoryManagers.length - (name.endsWith(":old") ?  2 : 1);
            name = name.replace(":old", "");
            for (let i: number = init; i >= 0; --i) {
                let mm = this.memoryManagers[i];
                ret = mm.getVariable(name);
                if (ret) {
                    return ret;
                }
                if (mm.baseFunction instanceof CallerFunction) {
                    break;
                }
            }
        }
        return this.globalMemoryManager.getVariableStrict(name);
    }

    getAuxiliary(color: string): TemporalVariable {
        let ao: TemporalVariable;
        ao = new TemporalVariable(color);
        this._auxiliaryObjects.push(ao);
        return ao;
    }

    recicleAuxiliary(ao: TemporalVariable): void {
        ao.isVisible = false;
        this._auxiliaryObjects.splice(this._auxiliaryObjects.indexOf(ao), 1);
    }
}

export { MasterMemoryManager };