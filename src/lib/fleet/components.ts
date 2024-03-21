import {ComponentSlot, CoreComponentSlot, ShipType, UtilityComponentSlot, WeaponComponentSlot} from "./ShipSchema";
import {Device, Weapon, weapons} from "./devices";
import {Cost} from "./Resources";
import {ShipSummary} from "./ShipDesignBuilder";
import {CoreModule, coreModules, defaultEffectForShip, Reactor} from "./devices/core";

export interface IComponent<T extends ComponentSlot, V extends Device> {
    readonly componentKind: "weapon" | "utility" | "core";
    readonly slot: T,
    readonly baseCost: Cost,
    readonly upkeep: Cost,
    readonly device: V;


    getName(): string;

    getStats(): ShipSummary;
}

export interface ICoreComponent<S extends ShipType> extends IComponent<CoreComponentSlot, CoreModule<S>> {
    readonly componentKind: "core";
    readonly shipType: ShipType;
}

export interface IUtilityComponent extends IComponent<UtilityComponentSlot, Device> {
    readonly componentKind: "utility";
}

export interface IWeaponComponent<T extends WeaponComponentSlot> extends IComponent<WeaponComponentSlot, Weapon<T>> {
    readonly componentKind: "weapon";
}

export type Component = IUtilityComponent | IWeaponComponent<WeaponComponentSlot> | ICoreComponent<ShipType>;

/**
 * Determines whether this component can be used within a ship.
 * @param component
 * @param ship
 */
export function canUseInShip(component: Component, ship: ShipType): boolean {
    if (component.componentKind === "core") {
        if (component.device.ships.find((deviceShip) => deviceShip === ship) == null) {
            return false;
        } else if (component.device.slot === "computer-system") {
            if (!component.device.configurable) {
                const systemMode = component.device.mode
                return defaultEffectForShip[ship] === systemMode;
            }
        }

        return true;
    } else if (component.componentKind === "weapon" || component.componentKind === "utility") {
        /// weapons and utility components are always allowed to be used
        return true;
    }
    return false;
}

export class WeaponComponent<T extends WeaponComponentSlot> implements IWeaponComponent<T> {
    readonly slot: T;
    readonly componentKind: "weapon" = "weapon";
    readonly device: Weapon<T>;
    readonly baseCost: Cost;
    readonly upkeep: Cost;

    constructor(slot: T, weapon: Weapon<T>) {
        this.slot = slot;
        this.device = weapon;
        this.baseCost = weapon.cost[slot];
        this.upkeep = {};
    }

    get averageDamagePerHit() {
        return (this.damage.damage.high + this.damage.damage.low) / 2 * this.device.modifiers.accuracy;
    }

    get averageDamagePerDay(): number {
        return this.averageDamagePerHit / this.damage.coolDown
    }

    get damage() {
        return this.device.damage[this.slot];
    }

    getStats(): ShipSummary {
        return {
            dmg_per_day: this.averageDamagePerDay,
            power: -this.device.power[this.slot]
        }
    }

    getName(): string {
        return this.device.name;
    }
}

/**
 * All weapon components
 */
export const weaponComponents = weapons.flatMap(weapon =>
    weapon.slots.map(slot => new WeaponComponent(slot, weapon)));


export class CoreComponent<T extends CoreComponentSlot, S extends ShipType> implements ICoreComponent<S> {
    readonly componentKind: "core" = "core";
    readonly shipType: S;
    readonly slot: T;
    readonly baseCost: Cost;
    readonly device: CoreModule<S>;
    readonly upkeep: Cost;

    constructor(slot: T, shipType: S, device: CoreModule<S>) {
        this.slot = slot;
        this.shipType = shipType;
        this.device = device;
    }

    getName(): string {
        return this.device.name;
    }

    getStats(): ShipSummary {
        if (this.slot === "reactor") {
            const reactor = this.device as Reactor<S>;
            return {
                power: reactor.power[this.shipType]
            }
        }
    }
}

export function toJSON(value: Component): object {
    return {
        componentKind: value.componentKind,
        slot: value.slot,
        device: value.device.name
    }
}

export const coreComponents = coreModules.flatMap(
    component => component.ships
        .map(shipType => new CoreComponent(component.slot, shipType, component))
);