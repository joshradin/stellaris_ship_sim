import {weapons} from "./weapons";
import * as util from "util";
import {WeaponComponent} from "../components";

test("get weapons", () => {
    for (const weapon of weapons) {
        const weaponC = new WeaponComponent("small", weapon);
        expect(weaponC.averageDamagePerHit).toBeGreaterThan(0);
        expect(weaponC.averageDamagePerDay).toBeGreaterThan(0);
        console.log(weaponC.averageDamagePerHit)
        console.log(weaponC.damage.coolDown)
        console.log(weaponC.averageDamagePerDay)
    }

})