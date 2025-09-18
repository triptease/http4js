import {IdGenerator} from "../../main/index.js";

export class DeterministicIdGenerator implements IdGenerator {
    private counter: number = 0;

    newId(): string {
        const counter = this.counter;
        this.counter += 1;
        return counter.toString();
    }
}
