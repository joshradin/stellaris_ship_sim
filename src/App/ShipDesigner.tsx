import {CorvetteSchema, ShipSchema} from "../lib/fleet";
import {
    CoreComponentSlot,
    createSegment, DestroyerSchema,
    ShipType,
    SlotCount,
    WeaponComponentSlot
} from "../lib/fleet/ShipSchema";
import React, {useState} from "react";
import ShipDesignBuilder, {
    CoreComponentSlots,
    Segment,
    ShipSummary,
    WeaponComponentSlots
} from "../lib/fleet/ShipDesignBuilder";
import _ from "lodash";
import {
    coreComponents,
    ICoreComponent,
    IWeaponComponent,
    WeaponComponent,
    weaponComponents
} from "../lib/fleet/components";
import ComponentMap, {
    ComponentSlotsAction,
    useComponentReducer
} from "../components/ComponentMap";

const shipSchemas: ShipSchema<ShipType>[] = [
    CorvetteSchema.Schema,
    DestroyerSchema.Schema
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
    const [coreComponentSlots, coreReducer] = useComponentReducer<CoreComponentSlot, ICoreComponent<ShipType>>();
    const [bow, setBow] = React.useState<Segment>();
    const [core, setCore] = React.useState<Segment>();
    const [stern, setStern] = React.useState<Segment>();
    const [refresh, updateState] = React.useState<{}>();
    const forceUpdate = React.useCallback(() => {
        updateState({});
    }, []);
    const [stats, setStats] = React.useState<ShipSummary>()

    React.useEffect(() => {
        const ship = new ShipDesignBuilder(schema, {
            bow, core, stern
        }, coreComponentSlots);
        setStats(ship.summary)
    }, [refresh, coreComponentSlots]);

    React.useEffect(() => {
        setBow(undefined);
        setCore(undefined);
        setStern(undefined);
        coreReducer({
            action: "set-slots",
            slots: schema.coreComponentSlots
        });
    }, [schema]);

    if (!schema) {
        return <p>Choose a ship</p>
    }


    return (
        <div>
            <h1>{schema.shipType.toUpperCase()}</h1>
            <h2>Core Components</h2>
            <ComponentMap
                componentSlots={coreComponentSlots}
                reducer={coreReducer}
                allComponents={coreComponents.filter(component => component.shipType === schema.shipType)}
                owner={"ship"}
                shipType={schema.shipType}
                defaultValue={"last"}
            />
            <div>
                {
                    schema.segmentSlots.bow && (
                        <SegmentDesigner where={"bow"} segment={bow} setSegment={setBow} schema={schema}
                                         updateDesigner={forceUpdate}/>
                    )
                }

                {
                    schema.segmentSlots.core && (
                        <SegmentDesigner where={"core"} segment={core} setSegment={setCore} schema={schema}
                                         updateDesigner={forceUpdate}/>
                    )
                }
                {
                    schema.segmentSlots.stern && (
                        <SegmentDesigner where={"stern"} segment={stern} setSegment={setStern} schema={schema}
                                         updateDesigner={forceUpdate}/>
                    )
                }
            </div>
            <br/>
            <div>
                <code style={{
                    whiteSpace: 'pre'
                }}>
                    {JSON.stringify(stats, undefined, 2)}
                </code>
                <br/>
                {new Date().toISOString()}
            </div>
        </div>
    )
}

function SegmentDesigner<T extends ShipType>(props: {
    segment: Segment,
    setSegment: (segment: Segment) => void
    where: keyof ShipSchema<T>["segmentSlots"],
    schema: ShipSchema<T>,
    updateDesigner: () => void
}) {
    const {
        where,
        schema, segment, setSegment, updateDesigner
    } = props;
    const patterns = React.useMemo(() => {
        return schema.segmentSlots[where]
    }, [where, schema]);
    const [
        weaponComponentSlots,
        weaponReducer
    ] = useComponentReducer<WeaponComponentSlot, WeaponComponent<WeaponComponentSlot>>();

    const handleSelectPattern = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event);
        setSegment(createSegment(schema, where, event.currentTarget.value));
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
        });
        updateDesigner();
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
            {segment && <ComponentMap componentSlots={weaponComponentSlots}
                                      owner={segment.name}
                                      reducer={weaponReducer}
                                      allComponents={weaponComponents}
                                      shipType={schema.shipType}
            />}
        </div>
    )
}

