import Device from './Device';
import {SlotMap, WeaponComponentSlot} from "../ShipSchema";
import {Cost} from "../Resources";
import {Damage} from "./weapons";

export * from "./weapons";

export {Device};

export type SlotScaled<T extends WeaponComponentSlot> = {
    cost: SlotMap<T, Cost>,
    damage?: SlotMap<T, Damage>,
    power?: SlotMap<T, number>,
    armor?: SlotMap<T, number>,
    shield?: SlotMap<T, number>,
}
