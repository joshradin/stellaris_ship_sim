import {SlotMap, WeaponComponentSlot} from "../ShipSchema";
import _ from "lodash";
import Device from "./Device";
import {SlotScaled} from "./index";
import weapon_components_path from "./weapon_components.csv";
import {parse} from "csv-parse/browser/esm";

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
    ignore?: {
        hull?: number,
        armor?: number,
        shield?: number,
    }
};

/**
 * Weapon components are devices that can be attached to military ships and are used to attack, damage and destroy other
 * ships, specifically any ships that have been designated as valid targets.
 */
export interface Weapon<T extends WeaponComponentSlot> extends SlotScaled<T>, Device {
    kind: WeaponKind,
    modifiers: WeaponModifiers,
    slots: T[],
}

type WeaponComponentDescriptor<T extends WeaponComponentSlot> = {
    name: string,
    slots: T[],
} & SlotScaled<T>

type WeaponKindDescriptor = {
    subKind?: string,
    modifiers: WeaponModifiers,
    weapons: WeaponComponentDescriptor<any>[]
};

type WeaponKindDescriptorMap = Record<WeaponKind, WeaponKindDescriptor[]>;

function createWeapon<T extends WeaponComponentSlot>(
    name: string,
    slots: T[],
    cost: SlotScaled<T>
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
                        power: {
                            small: 5,
                            medium: 13,
                            large: 30
                        },
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
    "point-defense": [
        {
            modifiers: {
                accuracy: 0.75,
                armor: 2,
                hull: 1,
                shield: 0.25,
                ignore: {
                    armor: 0.25
                }
            },
            weapons: [
                createWeapon("sentinel point-defense",
                    ["point-defense"] as const,
                    {
                        cost: {
                            "point-defense": {
                                alloy: 8
                            }
                        },
                        damage: {
                            "point-defense": {
                                coolDown: 0.5,
                                damage: {high: 4, low: 2},
                                range: {max: 30, min: 0},
                                tracking: .1
                            }
                        },
                        power: {
                            "point-defense": 5
                        }
                    }
                ),
                createWeapon("barrier point-defense",
                    ["point-defense"] as const,
                    {
                        cost: {
                            "point-defense": {
                                alloy: 10
                            }
                        },
                        damage: {
                            "point-defense": {
                                coolDown: 0.5,
                                damage: {high: 6, low: 3},
                                range: {max: 30, min: 0},
                                tracking: .2
                            }
                        },
                        power: {
                            "point-defense": 7
                        }
                    }
                ),
                createWeapon("guardian point-defense",
                    ["point-defense"] as const,
                    {
                        cost: {
                            "point-defense": {
                                alloy: 13
                            }
                        },
                        damage: {
                            "point-defense": {
                                coolDown: 0.5,
                                damage: {high: 8, low: 4},
                                range: {max: 30, min: 0},
                                tracking: .3
                            }
                        },
                        power: {
                            "point-defense": 10
                        }
                    }
                )
            ]
        }
    ],
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

