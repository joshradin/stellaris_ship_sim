import {CorvetteSchema, ShipSchema} from "../lib/fleet";
import {
    Component,
    ComponentSlot, IWeaponComponent,
    SegmentSchema,
    ShipType,
    SlotCount,
    SlotMap,
    WeaponComponentSlot
} from "../lib/fleet/ShipSchema";
import React, {useState} from "react";
import Ship, {ComponentSlots, Segment, WeaponComponentSlots} from "../lib/fleet/Ship";
import * as util from "util";
import _ from "lodash";
import {weapons} from "../lib/fleet/Weapon";
import {weapon_components} from "../lib/fleet/components";

const shipSchemas: ShipSchema<ShipType>[] = [
    CorvetteSchema.Schema
]


export default function ShipDesigner() {
    const [schema, setSchema] = useState(shipSchemas[0]);

    return (
        <div>
            <select onChange={(selected) => {
                const value = selected.currentTarget.value;
                const foundSchema = shipSchemas.find(schema => schema.shipType === value)
                if (foundSchema) {
                    setSchema(foundSchema)
                }
            }}>
                {shipSchemas.map(schema => {
                    return <option key={schema.shipType} value={schema.shipType}>{schema.shipType}</option>
                })}
            </select>
            <SelectedShipDesigner key={schema.shipType} schema={schema}/>
        </div>

    )
}

function SelectedShipDesigner<T extends ShipType>({schema}: { schema: ShipSchema<T> }) {
    const [ship, setShip] = React.useState<Ship<T>>(new Ship(schema));
    const stats = React.useMemo(() => ship.stats, [ship, ship.core, ship.stern, ship.bow]);
    const [bow, setBow] = React.useState(ship.bow);
    const [core, setCore] = React.useState(ship.core);
    const [stern, setStern] = React.useState(ship.stern);

    React.useEffect(() => {
        ship.bow = bow;
    }, [bow]);
    React.useEffect(() => {
        ship.core = core;
    }, [core]);
    React.useEffect(() => {
        ship.stern = stern;
    }, [stern]);


    return (
        <div>
            <h1>{schema.shipType.toUpperCase()}</h1>
            <div>
                {
                    schema.segmentSlots.bow && (
                        <SegmentDesigner where={"bow"} segment={bow} setSegment={setBow} ship={ship}/>

                    )
                }

                {
                    schema.segmentSlots.core && (
                        <SegmentDesigner where={"core"} segment={core} setSegment={setCore} ship={ship}/>
                    )
                }
                {
                    schema.segmentSlots.stern && (
                        <SegmentDesigner where={"stern"} segment={stern} setSegment={setStern} ship={ship}/>
                    )
                }
            </div>
            <br/>
            <div>
                <code style={{
                    whiteSpace: 'pre'
                }}>
                    {JSON.stringify(stats, undefined, 2)}
                    {new Date().toISOString()}
                </code>

            </div>
        </div>
    )
}

type ComponentSlotsAction<K extends ComponentSlot, V> = {
    action: "clear-slots"
} | {
    action: "set-slots",
    slots: K[]
}

function componentSlotsReducer<K extends ComponentSlot, V extends Component>(slots: ComponentSlots<K, V>, action: ComponentSlotsAction<K, V>): ComponentSlots<K, V> {
    if (action.action === "set-slots") {
        return action.slots.map((k) => [k, null]);
    } else if (action.action === "clear-slots") {
        return [];
    }
}

function SegmentDesigner<T extends ShipType>(props: {
    segment: Segment,
    setSegment: (segment: Segment) => void
    where: keyof ShipSchema<T>["segmentSlots"],
    ship: Ship<T>
}) {
    const {where, ship, segment, setSegment} = props;
    const patterns = React.useMemo(() => {
        return ship.schema.segmentSlots[where]
    }, [where, ship]);
    const [weaponComponentSlots, weaponReducer] =
        React.useReducer((state: WeaponComponentSlots, action: ComponentSlotsAction<WeaponComponentSlot, IWeaponComponent<WeaponComponentSlot>>) => componentSlotsReducer(state, action), []);

    const handleSelectPattern = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event);
        setSegment(ship.createSegment(where, event.currentTarget.value));
    };

    React.useEffect(() => {
        if (!segment) return;
        const keys = _.entries(segment.getOpenSlots("weapon")).flatMap(([k, count]) => Array.from({length: count}, () => k)) as WeaponComponentSlot[];
        weaponReducer({
            action: "set-slots",
            slots: keys
        });
    }, [segment]);

    React.useEffect(() => {
        const slotIndex: SlotCount<WeaponComponentSlot> = {};
        weaponComponentSlots.forEach(([slot, component], index) => {
            if (!component) return;
            segment.setWeaponComponent(component, slotIndex[slot] || 0);
            slotIndex[slot] = (slotIndex[slot] || 0) + 1;
        })
    }, [weaponComponentSlots])

    return (
        <div>
            <h2>{where.toUpperCase()}</h2>
            <select onChange={handleSelectPattern}>
                <option value={""}>---</option>
                {
                    patterns.map(segmentPattern => {
                        return <option key={segmentPattern.name}
                                       value={segmentPattern.name}>{segmentPattern.name}</option>
                    })
                }
            </select>
            <div>
                <h3>Weapons</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Slot</th>
                        <th>Component</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        (weaponComponentSlots.map(([slot, component], index) => {
                            return (<tr key={`weapon-${index}`}>
                                <td>{slot}</td>
                                <td>
                                    <p>selected: {component?.weapon.name}</p>
                                    <ComponentSelect components={
                                        weapon_components.filter(weapon => weapon.slot === slot)
                                    } onSelect={() => {
                                    }}/>
                                </td>
                            </tr>)
                        }))
                    }
                    </tbody>

                </table>

            </div>
        </div>
    )
}

function ComponentSelect<T extends Component>(props: {
    components: T[],
    onSelect: (component: T) => void
}) {
    let {components, onSelect} = props;


    return (
        <select>
            <option></option>
            {
                components.map(component => {
                    return (<option>{component.getName()}</option>)
                })
            }
        </select>
    )
}