import ShipSchema, {
    Component,
    ComponentSlot,
    IWeaponComponent,
    SegmentSchema,
    ShipType,
    SlotCount,
    UtilityComponent,
    UtilityComponentSlot,
    WeaponComponentSlot
} from "./ShipSchema";
import {Cost} from "./Resources";
import _ from 'lodash'

/**
 * A configurable ship
 */
export default class Ship<T extends ShipType> {
    stern: Segment | undefined;
    core: Segment | undefined;
    bow: Segment | undefined;
    readonly schema: ShipSchema<T>;

    constructor(
        schema: ShipSchema<T>,
        segments?: {
            stern?: Segment,
            core?: Segment,
            bow?: Segment
        }
    ) {
        this.schema = schema;
        if (segments) {
            this.stern = segments.stern;
            this.core = segments.core;
            this.bow = segments.bow;
        }
    }

    get buildCost(): Cost {
        return this.schema.baseCost
    }

    get upkeep(): Cost {
        return this.schema.upkeep(this.schema.baseCost, this.components)
    }

    get sternKinds(): string[] {
        return this.schema.segmentSlots.stern?.map(seg => seg.name) || []
    }

    get coreKinds(): string[] {
        return this.schema.segmentSlots.core?.map(seg => seg.name) || []
    }

    get bowKinds(): string[] {
        return this.schema.segmentSlots.bow?.map(seg => seg.name) || []
    }


    get segments(): Segment[] {
        const emit = [];
        if (this.bow) {
            emit.push(this.bow)
        }
        if (this.core) {
            emit.push(this.core)
        }
        if (this.stern) {
            emit.push(this.stern)
        }
        return emit;
    }

    /**
     * Gets all components
     */
    get components(): Component[] {
        return this.segments.flatMap((segment) => segment.components);
    }

    get stats(): Required<ShipStats> {
        return mergeShipStats({
            hull: this.schema.baseHull,
            evasion: this.schema.baseEvasion,
            speed: this.schema.baseSpeed,
        }, ...this.components.map(c => c.getStats()))
    }

    /**
     * Gets the effective military power of this ship
     */
    get militaryPower(): number {
        const stats = this.stats;
        return (stats.dmg_per_day * (stats.hull / 2 + stats.shields + stats.armor)) ** 0.65
    }

    createSegment(slot: keyof ShipSchema<T>["segmentSlots"], segmentName: string): Segment | undefined {
        const found = this.schema.segmentSlots[slot].find(segment => segment.name === segmentName);
        return found && createSegment(found);
    }
}

function createSegment<T extends ShipType>(schema: SegmentSchema<T>): Segment {
    return new Segment(
        schema.name,
        schema.weaponSlots,
        schema.utilitySlots
    )
}

export type ComponentSlots<K extends ComponentSlot, V extends Component | null> = [K, V][]
export type WeaponComponentSlots = ComponentSlots<WeaponComponentSlot, IWeaponComponent<WeaponComponentSlot>>;
export type UtilityComponentSlots = ComponentSlots<UtilityComponentSlot, UtilityComponent | null>;

export class Segment {
    readonly name: string;
    private readonly weaponComponents: WeaponComponentSlots;
    private readonly utilityComponents: UtilityComponentSlots;

    constructor(
        name: string,
        weapons: SlotCount<WeaponComponentSlot>,
        utilities: SlotCount<UtilityComponentSlot>
    ) {
        this.name = name;
        this.weaponComponents = _.flatMap(weapons, (value, key: WeaponComponentSlot) => {
            return Array.from({length: value}, () => [key, null] as [WeaponComponentSlot, IWeaponComponent<WeaponComponentSlot> | null])
        })
        this.utilityComponents = _.flatMap(utilities, (value, key: UtilityComponentSlot) => {
            return Array.from({length: value}, () => [key, null] as [UtilityComponentSlot, UtilityComponent | null])
        })
    }

    get components(): Component[] {
        return _.map(this.weaponComponents, ([slot, component]) => component as Component)
            .concat(_.map(this.utilityComponents, ([slot, component]) => component as Component))
            .filter(c => c != null)
    }

    /**
     * Gets the stats for this segment
     */
    get stats(): ShipStats {
        const components = this.components;
        return mergeShipStats(...components.map(c => c.getStats()))
    }


    /**
     * Sets a weapon component at a given index (by default 0). Throws an error if slot with given index doesn't exist
     * @param component The component to insert
     * @param index the index
     */
    setWeaponComponent(component: IWeaponComponent<WeaponComponentSlot>, index: number = 0) {
        const slot = this.weaponComponents
            .filter(([slot, c]) => slot === component.slot)
            [index];
        slot[1] = component;
    }

    /**
     * Sets a weapon component at a given index (by default 0). Throws an error if slot with given index doesn't exist
     * @param component The component to insert
     * @param index the index
     */
    setUtilityComponent(component: UtilityComponent, index: number = 0) {
        const slot = this.utilityComponents
            .filter(([slot, c]) => slot === component.slot)
            [index];
        slot[1] = component;
    }

    getOpenSlots(kind: "weapon" | "utility"): SlotCount<ComponentSlot> {
        if (kind === "weapon") {
            return this.weaponComponents
                .reduce((accum, [slot, component]) => {
                    if (!component) {
                        accum[slot] = accum[slot] + 1 || 1
                    }
                    return accum;
                }, {} as SlotCount<WeaponComponentSlot>)
        } else if (kind === "utility") {
            return this.utilityComponents
                .reduce((accum, [slot, component]) => {
                    if (!component) {
                        accum[slot] = accum[slot] + 1 || 1
                    }
                    return accum;
                }, {} as SlotCount<UtilityComponentSlot>)
        } else {
            throw new Error("unknown kind")
        }
    }

    getUsedSlots(kind: "weapon" | "utility"): SlotCount<ComponentSlot> {
        if (kind === "weapon") {
            return this.weaponComponents
                .reduce((accum, [slot, component]) => {
                    if (component) {
                        accum[slot] = accum[slot] + 1 || 1
                    }
                    return accum;
                }, {} as SlotCount<WeaponComponentSlot>)
        } else if (kind === "utility") {
            return this.utilityComponents
                .reduce((accum, [slot, component]) => {
                    if (component) {
                        accum[slot] = accum[slot] + 1 || 1
                    }
                    return accum;
                }, {} as SlotCount<UtilityComponentSlot>)
        } else {
            throw new Error("unknown kind")
        }
    }
}

/**
 * Stats about ships, after modifiers have been applied
 */
export interface ShipStats {
    dmg_per_day?: number,
    shields?: number,
    shield_regen?: number
    hull?: number,
    hull_regen?: number,
    armor?: number,
    armour_regen?: number,
    evasion?: number,
    speed?: number,
    power?: number,
}

export function mergeShipStats(...stats: ShipStats[]): Required<ShipStats> {
    let output: Required<ShipStats> = {
        armor: 0,
        armour_regen: 0,
        dmg_per_day: 0,
        evasion: 0,
        hull: 0,
        hull_regen: 0,
        shield_regen: 0,
        shields: 0,
        speed: 0,
        power: 0
    };
    for (let shipStat of stats) {
        output = _.mergeWith(output, shipStat, function (left, right) {
            if (typeof left === 'number' && typeof right === 'number') {
                return left + right
            } else {
                return [left, right]
            }
        })
    }
    return output
}