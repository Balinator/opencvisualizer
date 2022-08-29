import { Variable } from "./Variable";
import { AbstactVariable } from "./AbstractVariable";

class ArrayVariable extends AbstactVariable {
    private variables: Variable[];
    readonly size: number;

    constructor(name: string, type: string, color: string, size: number) {
        super(name, type, color);
        if (size <= 0) {
            throw "Size must be higher than zero (0)!";
        }
        this.name = name;
        this.size = size;
        this.variables = [];
        let vType = type.replace("[]", "");
        for (let i = 0; i < size; ++i) {
            this.variables[i] = new Variable(name + " " + i, vType, color);
        }
    }

    getVar(index: number): Variable {
        if (index >= 0 && index < this.size) {
            return this.variables[index];
        }
        throw "Index out of array! (" + index + ")";
    }
}

export { ArrayVariable };
