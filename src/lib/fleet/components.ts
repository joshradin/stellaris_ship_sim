import {IWeaponComponent, WeaponComponentSlot} from "./ShipSchema";
import Weapon, {weapons} from "./Weapon";
import {Cost} from "./Resources";
import {ShipStats} from "./Ship";

export class WeaponComponent<T extends WeaponComponentSlot> implements IWeaponComponent<T> {
    readonly slot: T;
    readonly componentKind: "weapon" = "weapon";
    readonly weapon: Weapon<T>;
    readonly baseCost: Cost;
    readonly upkeep: Cost;

    constructor(slot: T, weapon: Weapon<T>) {
        this.slot = slot;
        this.weapon = weapon;
        this.baseCost = weapon.cost[slot];
        this.upkeep = {};
    }

    get averageDamagePerHit() {
        return (this.damage.damage.high + this.damage.damage.low) / 2 * this.weapon.modifiers.accuracy;
    }

    get averageDamagePerDay(): number {
        return this.averageDamagePerHit / this.damage.coolDown
    }

    get damage() {
        return this.weapon.damage[this.slot];
    }

    getStats(): ShipStats {
        return {
            dmg_per_day: this.averageDamagePerDay
        }
    }

    getName(): string {
        return this.weapon.name;
    }
}

/**
 * All weapon components
 */
export const weapon_components = weapons.flatMap(weapon =>
    weapon.slots.map(slot => new WeaponComponent(slot, weapon)))
