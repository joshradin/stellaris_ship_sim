import {ShipType} from "./ShipSchema";
import {Component, toJSON as componentToJSON} from "./components";

export default interface ShipDesign<T extends ShipType> {
    readonly shipType: T,
    readonly components: Component[]
}

export function toJSON(value: ShipDesign<ShipType>): object {
    return {
        shipType: value.shipType,
        components: value.components
            .map(component => componentToJSON(component))
    }
}