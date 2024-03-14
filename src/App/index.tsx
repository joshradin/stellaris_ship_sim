import React from "react";
import Fleet from "../lib/Fleet";

const FleetView = React.lazy(() => import("../components/FleetView"));

export default function App() {
    return (<div>
        Hello fleet!
        <FleetView fleet={new Fleet()}/>
        </div> )
}