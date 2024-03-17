import React from "react";
import {Fleet} from "../lib/fleet";


export default function FleetView ({ fleet } : { fleet: Fleet }) {
    return (
        <div>
            {fleet.toString()}
        </div>
    )
}