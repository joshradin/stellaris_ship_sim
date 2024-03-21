import _ from "lodash";

export type ShipModifier =
    "combatDisengagementChance" |
    "crisisDamage" |
    "fireRate" |
    "weaponsDamage" |
    "sublightSpeed" |
    "evasion" |
    "tracking" |
    "engagementRange" |
    "weaponRange" |
    "explosiveWeaponDamage"
    ;

/**
 * Ship modifiers
 */
type ShipModifiers = Readonly<Partial<Record<ShipModifier, number>>>;

export default ShipModifiers;

/**
 * Folds ship modifiers into each other
 * @param modifiers the modifiers
 */
export function foldShipModifiers(...modifiers: ShipModifiers[]): ShipModifiers {
    return _.reduce(modifiers,
        (left, right) => {
            return _.mergeWith(left, right, (src, obj) => {
                return src + obj
            })
        }
    )
}