import {UtilityComponentSlot} from "./ShipSchema";
import {Device} from "./devices";

export default interface Utility<T extends UtilityComponentSlot> extends Device {
    slot: T,
}