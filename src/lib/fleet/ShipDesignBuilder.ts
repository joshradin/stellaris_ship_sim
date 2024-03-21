import ShipSchema, {
    ComponentSlot, CoreComponentSlot,
    SegmentSchema,
    ShipType,
    SlotCount,
    UtilityComponentSlot,
    WeaponComponentSlot, SlotMap, createSegment
} from "./ShipSchema";
import {Cost} from "./Resources";
import _ from 'lodash'
import ShipModifiers, {foldShipModifiers, ShipModifier} from "./ShipModifiers";
import ShipDesign from "./ShipDesign";
import {Component, ICoreComponent, IUtilityComponent, IWeaponComponent} from "./components";

export type ComponentSlots<K extends ComponentSlot, V extends Component | null> = [K, V][]
export type WeaponComponentSlots = ComponentSlots<WeaponComponentSlot, IWeaponComponent<WeaponComponentSlot>>;
export type UtilityComponentSlots = ComponentSlots<UtilityComponentSlot, IUtilityComponent | null>;
export type CoreComponentSlots = ComponentSlots<CoreComponentSlot, ICoreComponent<ShipType> | null>;

/**
 * A configurable ship
 */
export default class ShipDesignBuilder<T extends ShipType> {
    stern: Segment | undefined;
    core: Segment | undefined;
    bow: Segment | undefined;
    readonly schema: ShipSchema<T>;
    readonly coreComponents: CoreComponentSlots;
    baseModifiers: ShipModifiers;

    constructor(
        schema: ShipSchema<T>,
        segments?: {
            stern?: Segment,
            core?: Segment,
            bow?: Segment
        },
        coreComponents?: CoreComponentSlots
    ) {
        this.schema = schema;
        this.coreComponents = _.map(schema.coreComponentSlots, (slot) => [slot, null]);
        if (segments) {
            this.stern = segments.stern;
            this.core = segments.core;
            this.bow = segments.bow;
        }
        if (coreComponents) {
            this.coreComponents = coreComponents;
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
        return this.coreComponents
            .map(([, comp]) => comp as Component)
            .filter((comp => comp != null))
            .concat(this.segments.flatMap((segment) => segment.components));
    }

    get summary(): Required<ShipSummary> {
        return foldShipSummary({
            hull: this.schema.baseHull,
            evasion: this.schema.baseEvasion,
            speed: this.schema.baseSpeed,
        }, ...this.components.map(c => c.getStats()))
    }

    /**
     * Gets the effective military power of this ship
     */
    get militaryPower(): number {
        const stats = this.summary;
        return (stats.dmg_per_day * (stats.hull / 2 + stats.shields + stats.armor)) ** 0.65
    }

    get modifiers(): ShipModifiers {
        return foldShipModifiers(
            this.baseModifiers,
            ..._.map(this.components, (component) => component.device.providedModifiers)
                .filter(modifier => modifier)
        )
    }

    /**
     * Sets a core component. Throws an error if slot with given index doesn't exist
     * @param component The component to insert
     */
    setCoreComponent(component: ICoreComponent<ShipType>) {
        const slot = this.coreComponents
            .find(([slot, c]) => slot === component.slot);
        if (!slot) {
            throw new Error(`No slot ${component.slot} on ship`)
        } else if (component.shipType != this.schema.shipType) {
            throw new Error(`Can not add component for ${component.shipType} on a ${this.schema.shipType}`)
        }
        slot[1] = component;
        console.log(this.coreComponents);
    }

    createSegment(slot: keyof ShipSchema<T>["segmentSlots"], segmentName: string): Segment | undefined {
        return createSegment(this.schema, slot, segmentName);
    }

    build(): ShipDesign<T> {
        return {
            shipType: this.schema.shipType,
            components: [...this.components],
        }
    }
}



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
            return Array.from({length: value}, () => [key, null] as [UtilityComponentSlot, IUtilityComponent | null])
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
    get stats(): ShipSummary {
        const components = this.components;
        return foldShipSummary(...components.map(c => c.getStats()))
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
    setUtilityComponent(component: IUtilityComponent, index: number = 0) {
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
export interface ShipSummary {
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

export function foldShipSummary(...stats: ShipSummary[]): Required<ShipSummary> {
    let output: Required<ShipSummary> = {
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



