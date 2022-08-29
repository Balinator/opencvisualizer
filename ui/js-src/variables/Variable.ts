import { IPosition2D } from "../interfaces/IPosition2D";
import { RenderLogic } from "../managers/RenderLogic";
import { AbstactVariable } from "./AbstractVariable";
import { TimeManager } from "../managers/TimeManager";
import { VariableFunctions } from "../managers/VariableFunctions";

class Variable extends AbstactVariable {
    public _notype: boolean = false;
    private _value: any;
    get value() {
        return this._value;
    }
    set value(val: any) {
        if(this._notype) {
            this._value = val;
            return;
        }
        if (val instanceof Variable) {
            this._value = VariableFunctions.downGrade(val, this.type);
        } else {
            this._value = VariableFunctions.downGrade({value: val, type: RenderLogic.getDefaultType(val)}, this.type);
        }
    }

    startTime: number;
    goToOrigin: boolean;
    origin: IPosition2D;
    destination: IPosition2D;
    position: IPosition2D;
    textColor: string = '#ffffff';

    animationUpdate: VariableAnimationUpdate = VariableAnimationUpdate.INSTANCE;
    variableDraw: VariableDraw = VariableDraw.INSTANCE;

    constructor(name: string, type: string, color: string, value?: any) {
        super(name, type, color);

        this.value = value;

        this.startTime = TimeManager.Instance.getTime();
        this.goToOrigin = true;

        this.origin = {
            x: RenderLogic.Instance.drawOptions.mX,
            y: -RenderLogic.Instance.drawOptions.radius,
        };
        this.destination = {
            x: 0,
            y: 0,
        };
        this.position = {
            x: RenderLogic.Instance.drawOptions.mX,
            y: -RenderLogic.Instance.drawOptions.radius,
        };
    }

    apply(outOfscope: boolean): void {
        if (!TimeManager.Instance.isTimeStopped) {
            this.update();
        }
        this.draw(outOfscope);
    }

    update(): void {
        this.animationUpdate.update(this);
    }

    draw(outOfscope: boolean): void {
        this.variableDraw.draw(this, outOfscope);
    }
}

export { Variable };

class VariableAnimationUpdate {
    static INSTANCE: VariableAnimationUpdate = new VariableAnimationUpdate();
    update(variable: Variable): void {
        let time: number = TimeManager.Instance.getTime() - variable.startTime;
        if (variable.goToOrigin) {
            if (time < RenderLogic.Instance.animationTime) {
                let dX: number = variable.position.x - variable.origin.x;
                let dY: number = variable.position.y - variable.origin.y;

                variable.position.x -= time * dX / RenderLogic.Instance.animationTime;
                variable.position.y -= time * dY / RenderLogic.Instance.animationTime;
            } else {
                variable.position.x = variable.origin.x;
                variable.position.y = variable.origin.y;
            }
        } else {
            if (time < RenderLogic.Instance.animationTime) {
                let dX: number = variable.position.x - variable.destination.x;
                let dY: number = variable.position.y - variable.destination.y;

                variable.position.x -= time * dX / RenderLogic.Instance.animationTime;
                variable.position.y -= time * dY / RenderLogic.Instance.animationTime;
            } else {
                variable.position.x = variable.destination.x;
                variable.position.y = variable.destination.y;
            }
        }
    }
}
class VariableDraw {
    static INSTANCE: VariableDraw = new VariableDraw();
    draw(variable: Variable, outOfscope: boolean): void {
        RenderLogic.Instance.context.beginPath();
        RenderLogic.Instance.context.arc(variable.position.x, variable.position.y, RenderLogic.Instance.drawOptions.radius, 0, 2 * Math.PI);
        RenderLogic.Instance.context.fillStyle = variable.color;
        if (outOfscope) {
            RenderLogic.Instance.context.globalAlpha = 0.5;
        } else {
            RenderLogic.Instance.context.globalAlpha = 1;
        }
        RenderLogic.Instance.context.fill();
        RenderLogic.Instance.context.fillStyle = variable.textColor;
        RenderLogic.Instance.context.textAlign = 'center';
        RenderLogic.Instance.context.font = RenderLogic.Instance.drawOptions.fontSize + 'px Arial';
        RenderLogic.Instance.context.fillText("" + variable.name, variable.position.x, variable.position.y - RenderLogic.Instance.drawOptions.fontSize / 2.0);
        let valuetext = "" + (
            !isNaN(variable.value) && !Number.isInteger(variable.value) && Number.isFinite(variable.value) ?
                variable.value?.toPrecision(4) :
                variable.value
        );
        RenderLogic.Instance.context.fillText(valuetext, variable.position.x, variable.position.y + RenderLogic.Instance.drawOptions.fontSize / 2.0);
    }
}