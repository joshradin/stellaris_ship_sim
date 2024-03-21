import Device from "./Device";
import {CoreComponentSlot, ShipType} from "../ShipSchema";
import {Cost} from "../Resources";
import ShipModifiers from "../ShipModifiers";
import _ from "lodash";

/**
 * A core module provides some *core* functionality
 */
interface ICoreDevice<T extends CoreComponentSlot, S extends ShipType> extends Device {
    /**
     * The core component slot for this module
     */
    readonly slot: T;
    /**
     * Allowed ships for this core module
     */
    readonly ships: S[]
}

export interface Reactor<S extends ShipType> extends ICoreDevice<"reactor", S> {
    readonly cost: Record<S, Cost>;
    readonly power: Record<S, number>;

}

/**
 * FtlDrive core component
 */
export interface FtlDrive extends ICoreDevice<"ftl-drive", ShipType> {
    readonly cost: Cost;
    readonly power: number;
    readonly disengagementOpportunities: number;
    readonly hyperJump: boolean;
}

export type ComputerSystemMode =
    "swarm" |
    "torpedo" |
    "picket" |
    "line" |
    "artillery" |
    "carrier";

export const allowedShipType: { readonly [K in ComputerSystemMode]: readonly ShipType[] } = {
    artillery: [
        "frigate",
        "destroyer",
        "cruiser",
        "battleship",
        "titan"
    ],
    carrier: [
        "cruiser",
        "battleship",
        "titan",
        "juggernaut"
    ],
    line: [
        "destroyer",
        "cruiser",
        "battleship"
    ],
    picket: [
        "corvette",
        "destroyer",
        "cruiser",
    ],
    swarm: ["corvette"],
    torpedo: ["frigate", "cruiser"]
} as const;
export const defaultEffectForShip: { readonly [K in ShipType]: ComputerSystemMode } = {
    corvette: "swarm",
    frigate: "torpedo",
    destroyer: "picket",
    cruiser: "line",
    battleship: "artillery",
    titan: "artillery",
    juggernaut: "carrier"
}

export type ComputerSystemEffects = Pick<ShipModifiers, "fireRate" | "evasion" | "tracking" | "explosiveWeaponDamage" | "weaponRange" | "sublightSpeed">;

/**
 * The computer system of a ship modifies its AI and its modifiers
 */
export interface ComputerSystem extends ICoreDevice<"computer-system", ShipType> {
    readonly cost: Cost;
    readonly power: number;
    readonly mode: ComputerSystemMode
    readonly providedModifiers: ComputerSystemEffects;
    readonly configurable: boolean;
}

export interface SublightThruster<S extends ShipType> extends ICoreDevice<"thrusters", S> {
    readonly cost: Record<S, Cost>;
    readonly power: Record<S, number>;
    readonly evasion: Record<S, number>;
    readonly providedModifiers: Pick<ShipModifiers, "sublightSpeed">
}

export interface Sensors extends ICoreDevice<"sensors", ShipType> {
    readonly cost: Cost;
    readonly power: number;
    readonly tracking: number;
}

export type CoreModule<S extends ShipType> = FtlDrive | Reactor<S> | ComputerSystem | SublightThruster<S> | Sensors;
export const reactors: Reactor<ShipType>[] = [
    {
        slot: "reactor",
        name: "fission reactor",
        ships: ["corvette", "frigate", "destroyer", "cruiser", "battleship", "titan", "juggernaut"] as const,
        cost: {
            corvette: {alloy: 10},
            frigate: {alloy: 10},
            destroyer: {alloy: 20},
            cruiser: {alloy: 40},
            battleship: {alloy: 80},
            titan: {alloy: 160},
            juggernaut: {alloy: 560},
        },
        power: {
            corvette: 75,
            frigate: 75,
            destroyer: 140,
            cruiser: 280,
            battleship: 550,
            titan: 1100,
            juggernaut: 3850,
        }
    },
    {
        slot: "reactor",
        name: "fusion reactor",
        ships: ["corvette", "frigate", "destroyer", "cruiser", "battleship", "titan", "juggernaut"] as const,
        cost: {
            corvette: {alloy: 13},
            frigate: {alloy: 13},
            destroyer: {alloy: 26},
            cruiser: {alloy: 52},
            battleship: {alloy: 104},
            titan: {alloy: 208},
            juggernaut: {alloy: 730},
        },
        power: {
            corvette: 100,
            frigate: 100,
            destroyer: 180,
            cruiser: 360,
            battleship: 720,
            titan: 1450,
            juggernaut: 5000,
        }
    },
];

export const ftlDrives: readonly FtlDrive[] = [
    {
        slot: "ftl-drive",
        name: "hyper drive I",
        ships: ["corvette", "frigate", "destroyer", "cruiser", "battleship", "titan", "juggernaut"] as const,
        cost: {alloy: 5},
        power: 10,
        disengagementOpportunities: 1,
        hyperJump: true,
    },
    {
        slot: "ftl-drive",
        name: "hyper drive II",
        ships: ["corvette", "frigate", "destroyer", "cruiser", "battleship", "titan", "juggernaut"] as const,
        cost: {alloy: 10},
        power: 15,
        disengagementOpportunities: 1,
        hyperJump: true,
    },
    {
        slot: "ftl-drive",
        name: "hyper drive III",
        ships: ["corvette", "frigate", "destroyer", "cruiser", "battleship", "titan", "juggernaut"] as const,
        cost: {alloy: 15},
        power: 20,
        disengagementOpportunities: 1,
        hyperJump: true,
    },
    {
        slot: "ftl-drive",
        name: "jump drive",
        ships: ["corvette", "frigate", "destroyer", "cruiser", "battleship", "titan", "juggernaut"] as const,
        cost: {alloy: 20},
        power: 30,
        disengagementOpportunities: 1,
        hyperJump: true,
    },
    {
        slot: "ftl-drive",
        name: "psi jump drive",
        ships: ["corvette", "frigate", "destroyer", "cruiser", "battleship", "titan", "juggernaut"] as const,
        cost: {alloy: 20},
        power: 30,
        disengagementOpportunities: 2,
        hyperJump: true,
    }
]

type ComputerSystemDescriptor = {
    slot: "computer-system",
    name: string,
    cost: Cost,
    power: number,
    configurable: boolean,
    effects: Record<ComputerSystemMode, ComputerSystemEffects>
}

export const computerSystems: readonly ComputerSystemDescriptor[] = [
    {
        slot: "computer-system",
        name: "basic",
        cost: {},
        power: 5,
        configurable: false,
        effects: {
            artillery: {},
            carrier: {},
            line: {},
            picket: {},
            swarm: {},
            torpedo: {}
        }
    }
]

function createSublightThruster(name: string, costPerShipSize: number, powerPerShipSize: number, evasionPerLevel: number, sublightSpeed: number): SublightThruster<ShipType> {
    return {
        name,
        slot: "thrusters",
        ships: ["corvette", "frigate", "destroyer", "cruiser", "battleship", "titan"] as const,
        cost: {
            corvette: {alloy: costPerShipSize},
            frigate: {alloy: costPerShipSize},
            destroyer: {alloy: costPerShipSize * 2},
            cruiser: {alloy: costPerShipSize * 4},
            battleship: {alloy: costPerShipSize * 8},
            titan: {alloy: costPerShipSize * 16},
            juggernaut: {}
        },
        power: {
            corvette: powerPerShipSize,
            frigate: powerPerShipSize,
            destroyer: powerPerShipSize * 2,
            cruiser: powerPerShipSize * 4,
            battleship: powerPerShipSize * 8,
            titan: powerPerShipSize * 16,
            juggernaut: NaN
        },
        evasion: {
            corvette: evasionPerLevel * 5,
            frigate: evasionPerLevel * 5,
            destroyer: evasionPerLevel * 4,
            cruiser: evasionPerLevel * 3,
            battleship: evasionPerLevel * 2,
            titan: evasionPerLevel,
            juggernaut: NaN
        },
        providedModifiers: {
            sublightSpeed
        }
    }
}

const darkMatterThruster = createSublightThruster("dark-matter-thrusters", 12, 30, 4, 2.25);
darkMatterThruster.cost.corvette['dark-matter'] = 1;
darkMatterThruster.cost.frigate['dark-matter'] = 1;
darkMatterThruster.cost.destroyer['dark-matter'] = 2;
darkMatterThruster.cost.cruiser['dark-matter'] = 4;
darkMatterThruster.cost.battleship['dark-matter'] = 8;
darkMatterThruster.cost.titan['dark-matter'] = 16;

export const sublightThrusters: SublightThruster<ShipType>[] = [
    createSublightThruster("chemical-thrusters", 3, 10, 0, 1.0),
    createSublightThruster("ion-thrusters", 6, 15, 1, 1.25),
    createSublightThruster("plasma-thrusters", 9, 20, 2, 1.5),
    createSublightThruster("impulse-thrusters", 12, 25, 3, 1.75),
    darkMatterThruster
]

export const coreModules: readonly CoreModule<ShipType>[] = [
    ...reactors,
    ...ftlDrives,
    ...computerSystems.flatMap(descriptor => {
        const {slot, name, cost, power, configurable} = descriptor;
        return _.keys(descriptor.effects)
            .map<ComputerSystem>(effect => {
                const mode = effect as ComputerSystemMode;
                const modifiers = descriptor.effects[mode];
                const ships = allowedShipType[mode];
                return {
                    slot,
                    ships: [...ships],
                    name: `${name} (${mode})`,
                    cost,
                    power,
                    mode,
                    configurable,
                    providedModifiers: modifiers
                }
            });
    }),
    ...sublightThrusters
];
