export type Resource =
    "alloy"
    | "mineral"
    | "rare-crystal"
    | "exotic-gas"
    | "mote"
    | "energy"
    | "dark-matter"
    | "zro"
    ;

export type Cost = Partial<Record<Resource, number>>;