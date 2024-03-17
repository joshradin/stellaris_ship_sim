import {Cost, Resource} from "./Resources";
import {ShipStats} from "./Ship";
import Weapon from "./Weapon";

export type ShipType = "corvette" | "frigate" | "destroyer" | "cruiser" | "battleship" | "titan" | "juggernaut";

export default interface ShipSchema<T extends ShipType> {
    /**
     * The ship type
     */
    readonly shipType: T;
    /**
     * The possible segments of the ship
     */
    readonly segmentSlots: {
        bow?: SegmentSchema<T>[],
        core?: SegmentSchema<T>[],
        stern?: SegmentSchema<T>[],
    }
    readonly coreComponentSlots: CoreComponentSlot[];
    readonly shipSize: number;
    readonly baseCost: Cost;
    readonly baseHull: number;
    readonly baseEvasion: number;
    readonly baseSpeed: number;
    readonly baseDisengagementChance: number;
    readonly upkeep: ((base: Cost, components: IComponent<ComponentSlot>[]) => Cost);

}

export interface SegmentSchema<T extends ShipType> {
    readonly shipType: T;
    readonly name: string;
    readonly weaponSlots: SlotCount<WeaponComponentSlot>
    readonly utilitySlots: SlotCount<UtilityComponentSlot>
}

export type ComponentSlot =
    "small"
    | "medium"
    | "large"
    | "extra-large"
    | "point-defence"
    | "guided"
    | "hanger"
    | "auxiliary"
    | "core"
    | "titan"
    | "world-destroyer";

export type WeaponComponentSlot = Exclude<ComponentSlot, "auxiliary" | "core">;
export type UtilityComponentSlot = Extract<ComponentSlot, "small" | "medium" | "large" | "auxiliary">;

export type SlotMap<C extends ComponentSlot, V> = {
    [K in C]?: V
}
export type SlotCount<S extends ComponentSlot> = SlotMap<S, number>;

interface IComponent<T extends ComponentSlot> {
    readonly componentKind: "weapon" | "utility" | "core"
    readonly slot: T,
    readonly baseCost: Cost,
    readonly upkeep: Cost,

    getName(): string;

    getStats(): ShipStats;
}

export type CoreComponentSlot = "reactor" | "ftl-drive" | "computer-system" | "thrusters" | "sensors" | "aura";

export interface CoreComponent {
    readonly componentKind: "core";
    coreSlot: CoreComponentSlot
}

export interface UtilityComponent extends IComponent<UtilityComponentSlot> {
    readonly componentKind: "utility";
}

export interface IWeaponComponent<T extends WeaponComponentSlot> extends IComponent<WeaponComponentSlot> {
    readonly componentKind: "weapon";
    readonly weapon: Weapon<T>
}

export type Component = UtilityComponent | IWeaponComponent<WeaponComponentSlot>;


function basicShipUpkeep(cost: Cost, components: IComponent<ComponentSlot>[]): Cost {
    let buildCost = 0;
    const costs = [cost].concat(components.map(component => component.baseCost));
    for (let cost of costs) {
        buildCost += Object.values(cost).reduce((prev, current) => prev + current) || 0;
    }
    const upkeep: Cost = {
        "energy": buildCost * 0.01,
        "alloy": buildCost * 0.0033
    };

    for (const component of components) {
        const componentUpkeep = component.upkeep;
        for (const [key, cost] of Object.entries(componentUpkeep)) {
            if (key ! in upkeep) {
                upkeep[key as Resource] = cost
            } else {
                upkeep[key as Resource] += cost
            }
        }
    }

    return upkeep
}

export namespace CorvetteSchema {
    export const Interceptor: SegmentSchema<"corvette"> = {
        shipType: "corvette",
        name: "interceptor",
        weaponSlots: {
            small: 3,
        },
        utilitySlots: {
            small: 3,
            auxiliary: 1
        }
    }
    export const PicketShip: SegmentSchema<"corvette"> = {
        shipType: "corvette",
        name: "picket-ship",
        weaponSlots: {
            small: 2,
            "point-defence": 1
        },
        utilitySlots: {
            small: 3,
            auxiliary: 1
        }
    }

    export const Schema: ShipSchema<"corvette"> = {
        shipType: "corvette",
        baseCost: {
            "alloy": 30
        },
        baseDisengagementChance: 1.0,
        baseEvasion: .6,
        baseHull: 200,
        baseSpeed: 160,
        upkeep: basicShipUpkeep,
        segmentSlots: {
            core: [
                PicketShip,
                Interceptor
            ]
        },
        coreComponentSlots: [
            "ftl-drive",
            "reactor",
            "computer-system",
            "sensors",
            "thrusters"
        ],
        shipSize: 1,
    };
}
