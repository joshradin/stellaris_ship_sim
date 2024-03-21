import ShipDesignBuilder from "./ShipDesignBuilder";
import {CorvetteSchema, WeaponComponentSlot} from "./ShipSchema";
import * as util from "util";
import {WeaponComponent, weaponComponents} from "./components";

test("createSimpleCorvette", () => {
    const ship = new ShipDesignBuilder(CorvetteSchema.Schema);
    ship.core = ship.createSegment("core", "picket-ship");
    expect(ship.core.getOpenSlots("weapon")).toEqual({
        small: 2,
        "point-defense": 1
    })
    ship.core = ship.createSegment("core", "interceptor");
    expect(ship.core.getOpenSlots("weapon")).not.toEqual({
        small: 2,
        "point-defense": 1
    })
    expect(ship.core.getOpenSlots("weapon")).toEqual({
        small: 3
    })
    const comp: WeaponComponent<WeaponComponentSlot> = weaponComponents
        .find((wc) => wc.slot === "small");
    ship.core.setWeaponComponent(comp, 0);
    ship.core.setWeaponComponent(comp, 1);
    ship.core.setWeaponComponent(comp, 2);

    const built = ship.build();
    console.log(util.inspect(built, {depth: null}))

})