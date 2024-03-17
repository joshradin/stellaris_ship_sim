import Ship, {ShipStats} from "./Ship";
import {CorvetteSchema, IWeaponComponent, WeaponComponentSlot} from "./ShipSchema";
import * as util from "util";
import {weapons} from "./Weapon";
import {weapon_components, WeaponComponent} from "./components";

test("createSimpleCorvette", () => {
    const ship = new Ship(CorvetteSchema.Schema);
    ship.core = ship.createSegment("core", "picket-ship");
    expect(ship.core.getOpenSlots("weapon")).toEqual({
        small: 2,
        "point-defence": 1
    })
    ship.core = ship.createSegment("core", "interceptor");
    expect(ship.core.getOpenSlots("weapon")).not.toEqual({
        small: 2,
        "point-defence": 1
    })
    expect(ship.core.getOpenSlots("weapon")).toEqual({
        small: 3
    })
    const comp: WeaponComponent<WeaponComponentSlot> = weapon_components
        .find((wc) => wc.slot === "small");
    ship.core.setWeaponComponent(comp, 0);
    ship.core.setWeaponComponent(comp, 1);
    ship.core.setWeaponComponent(comp, 2);
    console.log(util.inspect(ship, {showHidden: false, depth: null}));
    console.log(ship.stats);
    console.log(ship.militaryPower);
})