export interface IMap<T> {
    [key: string]: T;
}

export const EmployeePositions: IMap<any> = {
    Operations: "Operations",
    Engineer: "Engineer",
    Business: "Business",
    Management: "Management",
    RandD: "Research & Development",
    Training: "Training",
    Unassigned: "Unassigned",
};

interface IIndustryMap<T> {
    [key: string]: T | undefined;
    Energy: T;
    Utilities: T;
    Agriculture: T;
    Fishing: T;
    Mining: T;
    Food: T;
    Tobacco: T;
    Chemical: T;
    Pharmaceutical: T;
    Computer: T;
    Robotics: T;
    Software: T;
    Healthcare: T;
    RealEstate: T;
}

export const Industries: IIndustryMap<string> = {
    Energy: "Energy",
    Utilities: "Water Utilities",
    Agriculture: "Agriculture",
    Fishing: "Fishing",
    Mining: "Mining",
    Food: "Food",
    Tobacco: "Tobacco",
    Chemical: "Chemical",
    Pharmaceutical: "Pharmaceutical",
    Computer: "Computer Hardware",
    Robotics: "Robotics",
    Software: "Software",
    Healthcare: "Healthcare",
    RealEstate: "RealEstate",
};



interface IIndustrySetting {
    [key: string]: number;
    sciFac: number
    advFac: number
}

export const IndustrySettings: IMap<IIndustrySetting> = {
    [Industries.Energy]: { sciFac: 0.7, advFac: 0.08 },
    [Industries.Utilities]: { sciFac: 0.6, advFac: 0.08 },
    [Industries.Agriculture]: { sciFac: 0.5, advFac: 0.04 },
    [Industries.Fishing]: { sciFac: 0.35, advFac: 0.08 },
    [Industries.Mining]: { sciFac: 0.26, advFac: 0.06 },
    [Industries.Food]: { sciFac: 0.12, advFac: 0.25 },
    [Industries.Tobacco]: { sciFac: 0.75, advFac: 0.2 },
    [Industries.Chemical]: { sciFac: 0.75, advFac: 0.07 },
    [Industries.Pharmaceutical]: { sciFac: 0.8, advFac: 0.16 },
    [Industries.Computer]: { sciFac: 0.62, advFac: 0.17 },
    [Industries.Robotics]: { sciFac: 0.65, advFac: 0.18 },
    [Industries.Software]: { sciFac: 0.62, advFac: 0.16 },
    [Industries.Healthcare]: { sciFac: 0.75, advFac: 0.11 },
    [Industries.RealEstate]: { sciFac: 0.05, advFac: 0.25 }
}

export interface IProductRatingWeight {
    Aesthetics?: number;
    Durability?: number;
    Features?: number;
    Quality?: number;
    Performance?: number;
    Reliability?: number;
}

export const ProductRatingWeights: IMap<any> = {
    [Industries.Food]: {
      Quality: 0.7,
      Durability: 0.1,
      Aesthetics: 0.2,
    },
    [Industries.Tobacco]: {
      Quality: 0.4,
      Durability: 0.2,
      Reliability: 0.2,
      Aesthetics: 0.2,
    },
    [Industries.Pharmaceutical]: {
      Quality: 0.2,
      Performance: 0.2,
      Durability: 0.1,
      Reliability: 0.3,
      Features: 0.2,
    },
    [Industries.Computer]: {
      Quality: 0.15,
      Performance: 0.25,
      Durability: 0.25,
      Reliability: 0.2,
      Aesthetics: 0.05,
      Features: 0.1,
    },
    [Industries.Robotics]: {
      Quality: 0.1,
      Performance: 0.2,
      Durability: 0.2,
      Reliability: 0.2,
      Aesthetics: 0.1,
      Features: 0.2,
    },
    [Industries.Software]: {
      Quality: 0.2,
      Performance: 0.2,
      Reliability: 0.2,
      Durability: 0.2,
      Features: 0.2,
    },
    [Industries.Healthcare]: {
      Quality: 0.4,
      Performance: 0.1,
      Durability: 0.1,
      Reliability: 0.3,
      Features: 0.1,
    },
    [Industries.RealEstate]: {
      Quality: 0.2,
      Durability: 0.25,
      Reliability: 0.1,
      Aesthetics: 0.35,
      Features: 0.1,
    },
};

export function calculateEffectWithFactors(n: number, expFac: number, linearFac: number): number {
    return Math.pow(n, expFac) + n / linearFac;
}

export function getMarketFactor(mat: { dmd: number; cmp: number }): number {
    return Math.max(0.1, (mat.dmd * (100 - mat.cmp)) / 100);
}
