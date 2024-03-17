import {Cost} from "./Resources";
import {SlotMap, WeaponComponentSlot} from "./ShipSchema";
import _ from "lodash";

export interface Damage {
    damage: { low: number, high: number },
    tracking: number,
    coolDown: number,
    range: { min: number, max: number }
}

export type EnergyWeapon = "anti-armor" | "anti-hull" | "penetrating" | "anti-shield";
export type KineticWeapon =
    "mass-driver"
    | "macro-battery"
    | "auto-cannon"
    | "kinetic-launcher"
    | "mega-cannon"
    | "saturator-artillery";
export type ExplosiveWeapon = "missile" | "torpedoes" | "swarmer-missiles";
export type StrikeCraft = "strike-craft";
export type PointDefence = "flak-gun" | "point-defense";
export type TitanicWeapon = "perdition";
export type WeaponKind = EnergyWeapon | KineticWeapon | ExplosiveWeapon | StrikeCraft | PointDefence | TitanicWeapon;

export type WeaponModifiers = {
    accuracy: number,
    hull: number,
    armor: number,
    shield: number,
};
/**
 * Weapon components are devices that can be attached to military ships and are used to attack, damage and destroy other
 * ships, specifically any ships that have been designated as valid targets.
 */
export default interface Weapon<T extends WeaponComponentSlot> extends Scaled<T> {
    name: string,
    kind: WeaponKind,
    modifiers: WeaponModifiers,
    slots: T[],
}

export type Scaled<T extends WeaponComponentSlot> = {
    cost: SlotMap<T, Cost>,
    damage: SlotMap<T, Damage>,
    power: SlotMap<T, number>,
}
type WeaponComponentDescriptor<T extends WeaponComponentSlot> = {
    name: string,
    slots: T[],
} & Scaled<T>

type WeaponKindDescriptor = {
    subKind?: string,
    modifiers: WeaponModifiers,
    weapons: WeaponComponentDescriptor<any>[]
};

type WeaponKindDescriptorMap = Record<WeaponKind, WeaponKindDescriptor[]>;

function createWeapon<T extends WeaponComponentSlot>(
    name: string,
    slots: T[],
    cost: Scaled<T>
): WeaponComponentDescriptor<T> {
    return _.merge({name, slots}, cost);
}

const weaponDescriptors: WeaponKindDescriptorMap = {
    "anti-armor": [
        {
            "subKind": "laser",
            "modifiers": {
                "accuracy": 0.9,
                "hull": 1.25,
                "armor": 1.5,
                "shield": 0.5
            },
            "weapons": [
                createWeapon("red-laser",
                    ["small", "medium", "large"] as const,
                    {
                        cost: {
                            large: {alloy: 40},
                            medium: {alloy: 20},
                            small: {alloy: 10}
                        },
                        power: undefined,
                        damage: {
                            small: {
                                damage: {
                                    low: 6,
                                    high: 16
                                },
                                tracking: 0.5,
                                coolDown: 4.25,
                                range: {
                                    min: 0,
                                    max: 40
                                }
                            },
                            medium: {
                                damage: {
                                    low: 15,
                                    high: 50
                                },
                                tracking: 0.3,
                                coolDown: 5,
                                range: {
                                    min: 0,
                                    max: 60
                                }
                            },
                            large: {
                                damage: {
                                    low: 36,
                                    high: 96
                                },
                                tracking: 0.05,
                                coolDown: 5.7,
                                range: {
                                    min: 0,
                                    max: 80
                                }
                            },

                        }
                    }
                )

            ]
        }
    ],
    "anti-hull": [],
    "penetrating": [],
    "anti-shield": [],
    "mass-driver": [],
    "macro-battery": [],
    "auto-cannon": [],
    "kinetic-launcher": [],
    "mega-cannon": [],
    "saturator-artillery": [],
    "missile": [],
    "torpedoes": [],
    "swarmer-missiles": [],
    "strike-craft": [],
    "flak-gun": [],
    "point-defense": [],
    "perdition": []
};

export const weapons: Weapon<WeaponComponentSlot>[] = [];

for (const weaponKindKey in weaponDescriptors) {
    const weaponDescriptor = weaponDescriptors[weaponKindKey as WeaponKind];
    for (const weaponKindDescriptor of weaponDescriptor) {
        const {subKind, modifiers, weapons: kindWeapons} = weaponKindDescriptor;
        for (const weaponDescriptor of kindWeapons) {
            const {name, slots, ...scaled} = weaponDescriptor as WeaponComponentDescriptor<WeaponComponentSlot>;
            const weapon: Weapon<WeaponComponentSlot> = {
                slots,
                name,
                kind: weaponKindKey as WeaponKind,
                modifiers,
                ...scaled
            }
            weapons.push(weapon);
        }
    }
}

