import {Cost, Resource} from "./Resources";
import {Segment} from "./ShipDesignBuilder";
import {IComponent} from "./components";

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
    readonly upkeep: ((base: Cost, components: IComponent<ComponentSlot, any>[]) => Cost);

}

export function createSegment<T extends ShipType>(schema: ShipSchema<T>, slot: keyof ShipSchema<T>["segmentSlots"], segmentName: string): Segment | undefined {
    const found = schema.segmentSlots[slot].find(segment => segment.name === segmentName);
    return found && new Segment(
        found.name,
        found.weaponSlots,
        found.utilitySlots
    )
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
    | "point-defense"
    | "guided"
    | "hanger"
    | "auxiliary"
    | "titan"
    | "reactor"
    | "ftl-drive"
    | "computer-system"
    | "thrusters"
    | "sensors"
    | "aura"
    | "world-destroyer";

export type CoreComponentSlot = Extract<ComponentSlot, "reactor"
    | "ftl-drive"
    | "computer-system"
    | "thrusters"
    | "sensors"
    | "aura">;
export type WeaponComponentSlot = Extract<ComponentSlot, "small" | "medium" | "large" | "extra-large"
    | "point-defense"
    | "guided"
    | "hanger"
    | "auxiliary"
    | "titan" | "world-destroyer">;
export type UtilityComponentSlot = Extract<ComponentSlot, "small" | "medium" | "large" | "auxiliary">;


export type SlotMap<C extends ComponentSlot, V> = {
    [K in C]?: V
}
export type SlotCount<S extends ComponentSlot> = SlotMap<S, number>;


function basicShipUpkeep(cost: Cost, components: IComponent<ComponentSlot, any>[]): Cost {
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
            "point-defense": 1
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

export namespace DestroyerSchema {
    export namespace Bow {
        export const Artillery: SegmentSchema<"destroyer"> = {
            shipType: "destroyer",
            name: "artillery",
            weaponSlots: {
                large: 1
            },
            utilitySlots: {
                small: 6,
            }
        }
        export const GunShip: SegmentSchema<"destroyer"> = {
            shipType: "destroyer",
            name: "gunship",
            weaponSlots: {
                small: 2,
                medium: 1
            },
            utilitySlots: {
                small: 6,
            }
        }
        export const PicketShip: SegmentSchema<"destroyer"> = {
            shipType: "destroyer",
            name: "picket-ship",
            weaponSlots: {
                small: 2,
                "point-defense": 1
            },
            utilitySlots: {
                small: 6
            }
        }
    }
    export namespace Stern {
        export const Gunship: SegmentSchema<"destroyer"> = {
            shipType: "destroyer",
            name: "gunship",
            weaponSlots: {
                medium: 1
            },
            utilitySlots: {
                auxiliary: 1,
            }
        }

        export const Interceptor: SegmentSchema<"destroyer"> = {
            shipType: "destroyer",
            name: "interceptor",
            weaponSlots: {
                small: 2
            },
            utilitySlots: {
                auxiliary: 2,
            }
        }

        export const PicketShip: SegmentSchema<"destroyer"> = {
            shipType: "destroyer",
            name: "picket-ship",
            weaponSlots: {
                "point-defense": 2
            },
            utilitySlots: {
                auxiliary: 1,
            }
        }
    }
    export const Schema: ShipSchema<"destroyer"> = {
        shipType: "destroyer",
        baseCost: {
            "alloy": 60
        },
        baseDisengagementChance: 1.5,
        baseEvasion: .2,
        baseHull: 600,
        baseSpeed: 120,
        upkeep: basicShipUpkeep,
        segmentSlots: {
            bow: [
                Bow.Artillery,
                Bow.GunShip,
                Bow.PicketShip
            ],
            stern: [
                Stern.Gunship,
                Stern.Interceptor,
                Stern.PicketShip
            ]
        },
        coreComponentSlots: [
            "ftl-drive",
            "reactor",
            "computer-system",
            "sensors",
            "thrusters"
        ],
        shipSize: 2,
    }
}
