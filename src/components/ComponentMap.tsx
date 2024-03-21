import {ComponentSlot, ShipType} from "../lib/fleet/ShipSchema";
import React from "react";
import _ from "lodash";
import {ComponentSlots} from "../lib/fleet/ShipDesignBuilder";
import {canUseInShip, Component} from "../lib/fleet/components";

export type ComponentSlotsAction<K extends ComponentSlot, V extends Component> = {
    action: "clear-slots"
} | {
    action: "set-slots",
    slots: K[]
} | {
    action: "set-component",
    slotIdx: number,
    component: V
}

function componentSlotsReducer<K extends ComponentSlot, V extends Component>(slots: ComponentSlots<K, V>, action: ComponentSlotsAction<K, V>): ComponentSlots<K, V> {
    if (action.action === "set-slots") {
        return action.slots.map((k) => [k, null]);
    } else if (action.action === "clear-slots") {
        return [];
    } else if (action.action === "set-component") {
        slots[action.slotIdx][1] = action.component;
        return [...slots];
    }
}

export function useComponentReducer<K extends ComponentSlot, V extends Component>(init: ComponentSlots<K, V> = []):
    [ComponentSlots<K, V>, React.Dispatch<ComponentSlotsAction<K, V>>] {
    const customReducer = (v: ComponentSlots<K, V>, action: ComponentSlotsAction<K, V>) => componentSlotsReducer(v, action);
    const [slots, reducer] = React.useReducer(customReducer, init as ComponentSlots<K, V>);
    return [slots, reducer]
}

export default function ComponentMap<K extends ComponentSlot, V extends Component>(props: {
    componentSlots: ComponentSlots<K, V>,
    reducer: (action: ComponentSlotsAction<K, V>) => void,
    allComponents: readonly V[],
    owner: string,
    shipType: ShipType,
    defaultValue?: "first" | "last"
}) {
    const {
        componentSlots,
        reducer,
        allComponents,
        owner,
        shipType,
        defaultValue
    } = props;

    return <div>
        <h3>Weapons</h3>
        <table>
            <thead>
            <tr>
                <th>Slot</th>
                <th>Component</th>
                <th>Stats</th>
            </tr>
            </thead>
            <tbody>
            {
                (componentSlots.map(([slot, component], index) => {
                    return (<tr key={`${owner}-weapon-${index}`}>
                        <td>{slot}</td>
                        <td>
                            <p>selected: {component?.device.name}</p>
                            <ComponentSelect components={
                                allComponents
                                    .filter(device => device.slot === slot)
                                    .filter((component) => canUseInShip(component, shipType))
                            }
                                             onSelect={(component) => {
                                                 reducer({
                                                     action: "set-component",
                                                     slotIdx: index,
                                                     component: component
                                                 })
                                             }}
                                             defaultValue={defaultValue}
                            />
                        </td>
                    </tr>)
                }))
            }
            </tbody>

        </table>

    </div>;
}

function ComponentSelect<T extends Component>(props: {
    components: T[],
    onSelect: (component: T) => void,
    defaultValue?: "first" | "last"
}) {
    const {components, onSelect, defaultValue} = props;
    const componentMap = React.useMemo(() => {
        return _.fromPairs(components.map((component) => {
            return [component.getName(), component]
        }))
    }, [components]);
    const defaultComponent = React.useMemo(() => {
        if (defaultValue) {
            if (defaultValue === "first" && components) {
                return components[0]?.getName();
            } else {
                return components[components.length - 1]?.getName();
            }
        } else {
            return undefined;
        }
    }, [componentMap, defaultValue]);

    React.useEffect(() => {
        if (defaultComponent) {
            onSelect(componentMap[defaultComponent]);
        }
    }, [defaultComponent]);

    const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const name = event.currentTarget.value;
        let component = componentMap[name];
        onSelect(component);
    }

    return (
        <select onChange={handleSelect} defaultValue={defaultComponent}>
            {defaultComponent ? null : <option></option>}
            {
                components.map(component => {
                    return (<option>{component.getName()}</option>)
                })
            }
        </select>
    )
}