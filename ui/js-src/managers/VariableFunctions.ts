import { Variable } from "../variables/Variable";
import { RenderLogic } from "./RenderLogic";
import { IAction } from "../interfaces/IAction";
import { TemporalVariable } from "../variables/TemporalVariable";
import { ArrayVariable } from "../variables/ArrayVariable";
import { TimeManager } from "./TimeManager";

class VariableFunctions {
    // MARK: Singleton stuff

    private static _instance: VariableFunctions;

    private constructor() { }

    public static get Instance() {
        return this._instance || (this._instance = new this());
    }

    // MARK: color stuff

    private colors: string[] = ["#2f027d", "#cfaae2", "#a087c8", "#7781bd", "#03ad4b", "#f65b9b", "#00d0c4", "#27e251", "#62880c", "#8db0ac", "#0707ee", "#30bd8f",
        "#7f8779", "#ccd5cb", "#1b2db7", "#7af3f1", "#821fd8", "#63635b", "#7c6d56", "#cf7e4c", "#1d309c", "#28fdf2", "#a3471a", "#1b4a54"].sort(() => Math.random() - 0.5);
    private colorIndex: number = 0;

    private getNextColor(): string {
        return this.colors[this.colorIndex++ % this.colors.length];
    }

    private auxiliaryColor: string = this.getNextColor();

    getAuxiliary(): TemporalVariable {
        return RenderLogic.Instance.memoryManager.getAuxiliary(this.auxiliaryColor);
    }

    recicleAuxiliary(tv: TemporalVariable): void {
        RenderLogic.Instance.memoryManager.recicleAuxiliary(tv);
    }

    // MARK: resolve operands
    resolveOperator(var1: Variable, var2: Variable, op: string, dest: Variable) {
        try {
            switch (op) {
                case "+": {
                    if (var1.type == var2.type) {
                        return var1.value + var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = type;
                    }
                    return n1 + n2;
                }
                case "-": {
                    if (var1.type == var2.type) {
                        return var1.value - var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = type;
                    }
                    return n1 - n2;
                }
                case "*": {
                    if (var1.type == var2.type) {
                        return var1.value * var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = type;
                    }
                    return n1 * n2;
                }
                case "/": {
                    if (var1.type == var2.type) {
                        return var1.value / var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = type;
                    }
                    return n1 / n2;
                }
                //logical
                case ">": {
                    if (var1.type == var2.type) {
                        return var1.value > var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = 'bool';
                    }
                    return n1 > n2;
                }
                case "<": {
                    if (var1.type == var2.type) {
                        return var1.value < var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = 'bool';
                    }
                    return n1 < n2;
                }
                case "==": {
                    if (var1.type == var2.type) {
                        return var1.value == var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = 'bool';
                    }
                    return n1 == n2;
                }
                case "!=": {
                    if (var1.type == var2.type) {
                        return var1.value != var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = 'bool';
                    }
                    return n1 != n2;
                }
                case "<=": {
                    if (var1.type == var2.type) {
                        return var1.value <= var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = 'bool';
                    }
                    return n1 <= n2;
                }
                case ">=": {
                    if (var1.type == var2.type) {
                        return var1.value >= var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2);
                    if (dest.type == "") {
                        dest.type = 'bool';
                    }
                    return n1 >= n2;
                }
                //needs binary
                case "%": {
                    if (var1.type == var2.type && VariableFunctions.NORMALIZATION_PRIORITY.indexOf(var1.type) <= VariableFunctions.NORMALIZATION_PRIORITY.indexOf('long')) {
                        return var1.value % var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2, 'long');
                    if (dest.type == "") {
                        dest.type = type;
                    }
                    return n1 % n2;
                }
                case "|": {
                    if (var1.type == var2.type && VariableFunctions.NORMALIZATION_PRIORITY.indexOf(var1.type) <= VariableFunctions.NORMALIZATION_PRIORITY.indexOf('long')) {
                        return var1.value | var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2, 'long');
                    if (dest.type == "") {
                        dest.type = type;
                    }
                    return n1 | n2;
                }
                case "&": {
                    if (var1.type == var2.type && VariableFunctions.NORMALIZATION_PRIORITY.indexOf(var1.type) <= VariableFunctions.NORMALIZATION_PRIORITY.indexOf('long')) {
                        return var1.value & var2.value;
                    }
                    let { n1, n2, type } = this.normalizeOperands(var1, var2, 'long');
                    if (dest.type == "") {
                        dest.type = type;
                    }
                    return n1 & n2;
                }
            }
        } finally {
            if (dest.type == "") {
                dest.type = var1.type;
            }
        }
    }
    private static NORMALIZATION_PRIORITY = [
        "char",
        "short",
        "int",
        "long",
        "float",
        "double"
    ];
    private static CHAR_SHORT = ['char'/*,'short'*/];
    normalizeOperands(var1: { type: string, value: any }, var2: { type: string, value: any }, maxelement: string = ""): { n1: any, n2: any, type: string } {
        if (VariableFunctions.CHAR_SHORT.indexOf(var1.type) > -1) {
            return this.normalizeOperands({ type: 'int', value: (var1.value as string)?.charCodeAt(0) }, var2);
        }
        if (VariableFunctions.CHAR_SHORT.indexOf(var2.type) > -1) {
            return this.normalizeOperands(var1, { type: 'int', value: (var1.value as string)?.charCodeAt(0) });
        }
        let t1 = VariableFunctions.NORMALIZATION_PRIORITY.indexOf(var1.type);
        let t2 = VariableFunctions.NORMALIZATION_PRIORITY.indexOf(var2.type);
        let max = Math.max(t1, t2);
        let floatIndex = VariableFunctions.NORMALIZATION_PRIORITY.indexOf("float");
        if (max >= floatIndex) {
            if (maxelement != "" && floatIndex > VariableFunctions.NORMALIZATION_PRIORITY.indexOf(maxelement)) {
                throw "Runtime exception"
            }
            return { n1: var1.value, n2: var2.value, type: max == floatIndex ? 'float' : 'double' }
        }
        return { n1: parseInt(var1.value), n2: parseInt(var2.value), type: 'int' };
    }

    static downGrade(variable: { type: string, value: any }, type: string): any {
        let varIndex = this.NORMALIZATION_PRIORITY.indexOf(variable.type);
        let tIndex = this.NORMALIZATION_PRIORITY.indexOf(type);
        if (varIndex <= tIndex) {
            return variable.value;
        } else {
            if (varIndex >= this.NORMALIZATION_PRIORITY.indexOf("float")) {
                return this.downGrade({ type: "int", value: parseInt(variable.value) }, type);
            }
            if (varIndex >= this.NORMALIZATION_PRIORITY.indexOf("short")) {
                return this.downGrade({ type: "char", value: String.fromCharCode(variable.value) }, type)
            }
            throw "can not downgrad no more: " + variable.value;
        }
    }

    // MARK: two operator functions

    addVars(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: any = this.resolveOperator(var1, var2, "+", dest);//var1.value + var2.value;

            this.twoOperatorFunction(dest, var1, var2, temp, "+");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    subVars(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: number = this.resolveOperator(var1, var2, "-", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "-");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    lessThan(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: boolean = this.resolveOperator(var1, var2, "<", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "<");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    greaterThan(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: boolean = this.resolveOperator(var1, var2, ">", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, ">");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    multiply(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: number = this.resolveOperator(var1, var2, "*", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "*");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    divison(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: number = this.resolveOperator(var1, var2, "/", dest);
            if (dest) { }

            this.twoOperatorFunction(dest, var1, var2, temp, "/");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    modulo(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: number = this.resolveOperator(var1, var2, "%", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "%");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    binaryOr(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: number = this.resolveOperator(var1, var2, "|", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "|");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    binaryAnd(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: number = this.resolveOperator(var1, var2, "&", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "&");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    or(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: boolean = this.resolveOperator(var1, var2, "||", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "||");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    and(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: boolean = this.resolveOperator(var1, var2, "&&", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "&&");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    equals(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: boolean = this.resolveOperator(var1, var2, "==", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "==");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    notEquals(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: boolean = this.resolveOperator(var1, var2, "!=", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "!=");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    graterOrEquals(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: boolean = this.resolveOperator(var1, var2, ">=", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, ">=");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    lessOrEquals(dest: Variable, var1: Variable, var2: Variable): void {
        if (dest && var1 && var2) {
            let temp: boolean = this.resolveOperator(var1, var2, "<=", dest);

            this.twoOperatorFunction(dest, var1, var2, temp, "<=");
        } else {
            throw "Undefined variables! (" + dest + ", " + var1 + ", " + var2 + ")";
        }
    }

    // MARK: other functions

    deffineVar(name: string, type: string, others: any[]): void {
        if (!RenderLogic.Instance.memoryManager.getVariableThisLevel(name)) {
            if (type.endsWith("[]")) {//TODO: do a separate animation for array initialization
                let size: number = others[0];
                let array: ArrayVariable = new ArrayVariable(name, type, this.getNextColor(), size);
                RenderLogic.Instance.memoryManager.addArrayVariable(name, array);
                for (let i = 0; i < size; ++i) {
                    let variable: Variable = array.getVar(i);
                    this.deffineVariableHelper(variable.name, variable);
                }
            } else {
                let variable: Variable = new Variable(name, type, this.getNextColor());
                this.deffineVariableHelper(name, variable);
            }
        } else {
            throw "This variable is already defined! (" + name + ")";
        }
    }

    private deffineVariableHelper(name: string, variable: Variable) {
        let needTime = this.getAuxiliary();
        RenderLogic.Instance.actionPool.push({
            isActionCompleted: function (): boolean {
                if (needTime.startTime + RenderLogic.Instance.animationTime <= TimeManager.Instance.getTime()) {
                    VariableFunctions.Instance.recicleAuxiliary(needTime);
                    return true;
                }
                return false;
            },
            setAction: function (): void {
                RenderLogic.Instance.memoryManager.addVariable(name, variable);
                needTime.startTime = TimeManager.Instance.getTime();
                variable.position.x = RenderLogic.Instance.drawOptions.mX;
                variable.position.y = RenderLogic.Instance.drawOptions.mY;
                variable.destination.x = RenderLogic.Instance.drawOptions.mX;
                variable.destination.y = RenderLogic.Instance.drawOptions.mY;
                variable.goToOrigin = false;
            }
        });
        RenderLogic.Instance.actionPool.push({
            isActionCompleted: function (): boolean {
                if (variable.position.x === variable.origin.x && variable.position.y === variable.origin.y) {
                    return true;
                }
                return false;
            },
            setAction: function (): void {
                variable.startTime = TimeManager.Instance.getTime();
                variable.goToOrigin = true;
            }
        });
    }

    getVarFromArray(dest: Variable, array: ArrayVariable, index: Variable): void {
        if (dest && array && index) {
            dest.value = array.getVar(index.value);
            if (index instanceof TemporalVariable) {
                this.recicleAuxiliary(index);
            }
        } else {
            throw "Undefined variables! (" + dest + ", " + array + ", " + index + ")";
        }
    }

    incrementVar(variable: Variable): void {
        if (variable) {
            let equals = this.getAuxiliary();

            RenderLogic.Instance.actionPool.push({
                isActionCompleted: function (): boolean {
                    if (variable.position.x === variable.destination.x && variable.position.y === variable.destination.y) {
                        variable.value++;
                        return true;
                    }
                    return false;
                },
                setAction: function (): void {
                    variable.destination.x = RenderLogic.Instance.drawOptions.mX;
                    variable.destination.y = RenderLogic.Instance.drawOptions.mY;
                    variable.startTime = TimeManager.Instance.getTime();
                    variable.goToOrigin = false;
                }
            });
            RenderLogic.Instance.actionPool.push({
                isActionCompleted: function (): boolean {
                    if (equals.startTime + RenderLogic.Instance.animationTime <= TimeManager.Instance.getTime()) {
                        VariableFunctions.Instance.recicleAuxiliary(equals);
                        return true;
                    }
                    return false;
                },
                setAction: function (): void {
                    equals.startTime = TimeManager.Instance.getTime();
                }
            });
            RenderLogic.Instance.actionPool.push({
                isActionCompleted: function (): boolean {
                    if (variable.position.x === variable.origin.x && variable.position.y === variable.origin.y) {
                        return true;
                    }
                    return false;
                },
                setAction: function (): void {
                    variable.position.x = RenderLogic.Instance.drawOptions.mX;
                    variable.position.y = RenderLogic.Instance.drawOptions.mY;
                    variable.startTime = TimeManager.Instance.getTime();
                    variable.goToOrigin = true;
                }
            });
        } else {
            throw "This variable is not defined! (" + variable + ")";
        }
    }

    assignArray(array: ArrayVariable, valueList: any[]) {
        if (array && valueList) {
            if (array.size === valueList.length) {
                let list = this.getAuxiliary();
                list.color = array.color;
                list.name = array.name;
                //list.value = "";

                RenderLogic.Instance.actionPool.push({
                    isActionCompleted: function (): boolean {
                        if (list.position.x === list.destination.x && list.position.y === list.destination.y) {
                            return true;
                        }
                        return false;
                    },
                    setAction: function (): void {
                        list.destination.x = RenderLogic.Instance.drawOptions.mX;
                        list.destination.y = RenderLogic.Instance.drawOptions.mY;
                        list.startTime = TimeManager.Instance.getTime();
                        list.goToOrigin = false;
                        list.origin.x = array.getVar(0).origin.x;
                        list.origin.y = array.getVar(0).origin.y;
                        list.position.x = list.origin.x;
                        list.position.y = list.origin.y;
                    }
                });
                for (let i = 0; i < array.size; ++i) {
                    let element = this.getAuxiliary();
                    element.color = array.color;
                    let real = array.getVar(i);
                    RenderLogic.Instance.actionPool.push({
                        isActionCompleted: function (): boolean {
                            if (element.position.x === element.destination.x && element.position.y === element.destination.y) {
                                real.value = element.value;
                                VariableFunctions.Instance.recicleAuxiliary(element);
                                return true;
                            }
                            return false;
                        },
                        setAction: function (): void {
                            element.type = RenderLogic.getDefaultType(valueList[i]);
                            element.value = valueList[i];
                            element.destination.x = real.position.x;
                            element.destination.y = real.position.y;
                            element.startTime = TimeManager.Instance.getTime();
                            element.goToOrigin = false;
                            element.origin.x = list.destination.x;
                            element.origin.y = list.destination.y;
                            element.position.x = element.origin.x;
                            element.position.y = element.origin.y;
                        }
                    });
                }
                RenderLogic.Instance.actionPool.push({
                    isActionCompleted: function (): boolean {
                        VariableFunctions.Instance.recicleAuxiliary(list);
                        return true;
                    },
                    setAction: function (): void {
                    }
                });
            } else {
                throw "The length of the two arrays does not match!";
            }
        } else {
            throw "This variable is not defined! (" + name + ")";
        }
    }

    assignVar(variable: Variable, value: Variable): void {
        if (variable) {
            let equals = this.getAuxiliary();

            let val: TemporalVariable;
            if (value instanceof TemporalVariable) {
                val = value;
            } else {
                val = this.getAuxiliary();
                val.type = value.type;
                val.value = value.value;
                val.origin.x = value.position.x;
                val.origin.y = value.position.y;
                val.position.x = value.position.x;
                val.position.y = value.position.y;
                val.name = value.name;
                val.color = value.color;
            }

            RenderLogic.Instance.actionPool.push({
                isActionCompleted: function (): boolean {
                    if (variable.position.x === variable.destination.x && variable.position.y === variable.destination.y) {
                        if (!(val instanceof TemporalVariable)) {
                            variable.value = val;
                        }
                        while (variable.value instanceof Variable) {
                            variable.value = variable.value.value;
                        }
                        return true;
                    }
                    return false;
                },
                setAction: function (): void {
                    variable.destination.x = RenderLogic.Instance.drawOptions.mX;
                    variable.destination.y = RenderLogic.Instance.drawOptions.mY;
                    variable.startTime = TimeManager.Instance.getTime();
                    variable.goToOrigin = false;
                }
            });
            if (val instanceof TemporalVariable) {
                RenderLogic.Instance.actionPool.push({
                    isActionCompleted: function (): boolean {
                        if (val.position.x === val.destination.x && val.position.y === val.destination.y) {
                            variable.value = val.value;
                            VariableFunctions.Instance.recicleAuxiliary(val);
                            return true;
                        }
                        return false;
                    },
                    setAction: function (): void {
                        val.destination.x = RenderLogic.Instance.drawOptions.mX;
                        val.destination.y = RenderLogic.Instance.drawOptions.mY;
                        val.startTime = TimeManager.Instance.getTime();
                        val.goToOrigin = false;
                    }
                });
            }
            RenderLogic.Instance.actionPool.push({
                isActionCompleted: function (): boolean {
                    if (equals.startTime + RenderLogic.Instance.animationTime <= TimeManager.Instance.getTime()) {
                        VariableFunctions.Instance.recicleAuxiliary(equals);
                        return true;
                    }
                    return false;
                },
                setAction: function (): void {
                    equals.startTime = TimeManager.Instance.getTime();
                }
            });
            RenderLogic.Instance.actionPool.push({
                isActionCompleted: function (): boolean {
                    if (variable.position.x === variable.origin.x && variable.position.y === variable.origin.y) {
                        return true;
                    }
                    return false;
                },
                setAction: function (): void {
                    variable.position.x = RenderLogic.Instance.drawOptions.mX;
                    variable.position.y = RenderLogic.Instance.drawOptions.mY;
                    variable.startTime = TimeManager.Instance.getTime();
                    variable.goToOrigin = true;
                }
            });
        } else {
            throw "This variable is not defined! (" + name + ")";
        }
    }

    private twoOperatorFunction(dest: Variable, var1: Variable, var2: Variable, temp: any, operatorSign: string) {
        let variable1: Variable = dest;
        let variable2: Variable = var1;
        let variable3: Variable = var2;
        let result = dest instanceof TemporalVariable ? dest : this.getAuxiliary();
        let operator: TemporalVariable = this.getAuxiliary();
        operator.name = "";
        operator._notype = true;
        operator.value = operatorSign;
        operator.color = "#00000000";
        operator.textColor = "#000000";
        RenderLogic.Instance.actionPool.push({
            isActionCompleted: function (): boolean {
                if (variable2.position.x === variable2.destination.x && variable2.position.y === variable2.destination.y &&
                    variable3.position.x === variable3.destination.x && variable3.position.y === variable3.destination.y) {
                    operator.destination.x = RenderLogic.Instance.drawOptions.mX;
                    operator.destination.y = RenderLogic.Instance.drawOptions.mY;
                    operator.position.x = RenderLogic.Instance.drawOptions.mX;
                    operator.position.y = RenderLogic.Instance.drawOptions.mY;
                    operator.goToOrigin = false;
                    operator.isVisible = true;
                    return true;
                }
                return false;
            },
            setAction: function (): void {
                let dir: number = RenderLogic.Instance.drawOptions.radius * -1.2;
                variable2.destination.x = RenderLogic.Instance.drawOptions.mX + dir;
                variable2.destination.y = RenderLogic.Instance.drawOptions.mY;
                variable2.startTime = TimeManager.Instance.getTime();
                variable2.goToOrigin = false;
                variable3.destination.x = RenderLogic.Instance.drawOptions.mX - dir;
                variable3.destination.y = RenderLogic.Instance.drawOptions.mY;
                variable3.startTime = TimeManager.Instance.getTime();
                variable3.goToOrigin = false;
            }
        });
        RenderLogic.Instance.actionPool.push({
            isActionCompleted: function (): boolean {
                if (result.position.x === result.destination.x && result.position.y === result.destination.y) {
                    return true;
                }
                return false;
            },
            setAction: function (): void {
                result.destination = {
                    x: RenderLogic.Instance.drawOptions.mX,
                    y: RenderLogic.Instance.drawOptions.mY - RenderLogic.Instance.drawOptions.radius * 2
                };
                result.position = {
                    x: RenderLogic.Instance.drawOptions.mX,
                    y: RenderLogic.Instance.drawOptions.mY
                };
                result.goToOrigin = false;
                result.startTime = TimeManager.Instance.getTime();
                result.name = "Result";
                result.value = temp;
                result.isVisible = true;
            }
        });
        RenderLogic.Instance.actionPool.push({
            isActionCompleted: function (): boolean {
                if (result.startTime + RenderLogic.Instance.animationTime <= TimeManager.Instance.getTime()) {
                    return true;
                }
                return false;
            },
            setAction: function (): void {
                result.startTime = TimeManager.Instance.getTime();
            }
        });
        RenderLogic.Instance.actionPool.push({
            isActionCompleted: function (): boolean {
                if (variable1.destination.x === variable1.position.x && variable1.destination.y === variable1.position.y) {
                    variable1.value = temp;
                    if (!(dest instanceof TemporalVariable)) {
                        VariableFunctions.Instance.recicleAuxiliary(result);
                    }
                    return true;
                }
                return false;
            },
            setAction: function (): void {
                operator.isVisible = false;
                VariableFunctions.Instance.recicleAuxiliary(operator);
                variable2.startTime = TimeManager.Instance.getTime();
                variable2.goToOrigin = true;
                variable3.startTime = TimeManager.Instance.getTime();
                variable3.goToOrigin = true;
                variable1.destination.x = RenderLogic.Instance.drawOptions.mX;
                variable1.destination.y = RenderLogic.Instance.drawOptions.mY - RenderLogic.Instance.drawOptions.radius * 2;
                variable1.startTime = TimeManager.Instance.getTime();
                variable1.goToOrigin = false;
            }
        });
        RenderLogic.Instance.actionPool.push({
            isActionCompleted: function (): boolean {
                if ((variable1.position.x === variable1.origin.x && variable1.position.y === variable1.origin.y || variable1 instanceof TemporalVariable) &&
                    variable2.position.x === variable2.origin.x && variable2.position.y === variable2.origin.y &&
                    variable3.position.x === variable3.origin.x && variable3.position.y === variable3.origin.y) {
                    return true;
                }
                return false;
            },
            setAction: function (): void {
                variable2.startTime = TimeManager.Instance.getTime();
                variable2.goToOrigin = true;
                variable3.startTime = TimeManager.Instance.getTime();
                variable3.goToOrigin = true;
                variable1.startTime = TimeManager.Instance.getTime();
                if (!(variable1 instanceof TemporalVariable)) {
                    variable1.goToOrigin = true;
                }
            }
        });
    }

    extraAction(action: IAction) {
        RenderLogic.Instance.actionPool.push(action);
    }

}

export { VariableFunctions };