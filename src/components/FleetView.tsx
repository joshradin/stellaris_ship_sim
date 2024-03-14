import React from "react";
import Fleet from "../lib/Fleet";

export default function FleetView ({ fleet } : { fleet: Fleet }) {
    return (
        <div>
            {fleet.toString()}
        </div>
    )
}