import { NS } from "types";

export async function main(ns: NS) {
    const [divisionName, cityName, coffeeRounds, partyRounds, partyMoney] = ns.args
    for (let c = 0; c < coffeeRounds; c++)
    {
        await ns["corporation"].buyCoffee(divisionName as string, cityName as string)
    }
    for (let p = 0; p < partyRounds; p++)
    {
        await ns["corporation"].throwParty(divisionName as string, cityName as string, partyMoney as number)
    }
}
