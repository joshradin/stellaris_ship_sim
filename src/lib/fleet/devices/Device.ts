import ShipModifiers from "../ShipModifiers";

export default interface Device {
    readonly name: string;
    readonly providedModifiers?: ShipModifiers
}