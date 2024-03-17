import React from "react";
import Fleet from "../lib/fleet/Fleet";
import ShipDesigner from "./ShipDesigner";

const FleetView = React.lazy(() => import("../components/FleetView"));


export default function App() {
    return (<div>
        <ShipDesigner/>
    </div>)
}