import { ITemporal } from "./ITemporal";
import { ArrayVariable } from "./ArrayVariable";


class TemporalArrayVariable extends ArrayVariable implements ITemporal {
    isVisible: boolean;
}

export { TemporalArrayVariable };