import { Variable } from "./Variable";
import { ITemporal } from "./ITemporal";

class TemporalVariable extends Variable implements ITemporal {
    isVisible: boolean = true;

    constructor(color: string) {
        super("", "", color);
    }

    draw(): void {
        if(this.isVisible) {
            super.draw(false);
        }
    }
}

export { TemporalVariable };