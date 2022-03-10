import { EmployeeJobs, NS } from "types";
import { calculateEffectWithFactors, EmployeePositions, getMarketFactor, IndustrySettings, IProductRatingWeight, ProductRatingWeights } from "corp-lib/corp.common";

export class Product
{
    ns: NS
    name: string
    divisionName: string
    creationCity = "Aevum"
    designCost = 0
    advCost = 0
    prog = 0;
    rat = 0;
    qlt = 0;
    per = 0;
    dur = 0;
    rel = 0;
    aes = 0;
    fea = 0;
    mku = 0;

    constructor(ns: NS, name: string, divisionName: string)
    {
        this.ns = ns
        this.name = name
        this.divisionName = divisionName
    }

    get corpApi()
    {
        return this.ns.corporation
    }

    calculateRating(industry: string): void {
        const weights: IProductRatingWeight = ProductRatingWeights[industry];
        this.rat = 0;
        this.rat += weights.Quality ? this.qlt * weights.Quality : 0;
        this.rat += weights.Performance ? this.per * weights.Performance : 0;
        this.rat += weights.Durability ? this.dur * weights.Durability : 0;
        this.rat += weights.Reliability ? this.rel * weights.Reliability : 0;
        this.rat += weights.Aesthetics ? this.aes * weights.Aesthetics : 0;
        this.rat += weights.Features ? this.fea * weights.Features : 0;
    }


    async createProduct(cityName: string, designCost: number, advCost: number)
    {
        this.designCost = designCost
        this.advCost = advCost
        this.creationCity = cityName
        await this.saveToDisk()
    }

    async finishProduct()
    {
        let division = this.corpApi.getDivision(this.divisionName)
        let employeeProd = this.corpApi.getOffice(this.divisionName, this.creationCity).employeeProd
        let product = this.corpApi.getProduct(this.divisionName, this.name)
        let researchPoints = division.research
        let industrySettings = IndustrySettings[division.type]
        this.prog = product.developmentProgress

        const engrProd = employeeProd[EmployeePositions.Engineer as keyof EmployeeJobs];
        const mgmtProd = employeeProd[EmployeePositions.Management as keyof EmployeeJobs];
        const opProd = employeeProd[EmployeePositions.Operations as keyof EmployeeJobs];
        const rndProd = employeeProd[EmployeePositions.RandD as keyof EmployeeJobs]
        const busProd = employeeProd[EmployeePositions.Business as keyof EmployeeJobs]
        const total = engrProd + mgmtProd + opProd + rndProd + busProd;

        const progrMult = this.prog / 100;

        const engrRatio = employeeProd[EmployeePositions.Engineer as keyof EmployeeJobs] / total;
        const mgmtRatio = employeeProd[EmployeePositions.Management as keyof EmployeeJobs] / total;
        const rndRatio = employeeProd[EmployeePositions.RandD as keyof EmployeeJobs] / total;
        const opsRatio = employeeProd[EmployeePositions.Operations as keyof EmployeeJobs] / total;
        const busRatio = employeeProd[EmployeePositions.Business as keyof EmployeeJobs] / total;
        const designMult = 1 + Math.pow(this.designCost, 0.1) / 100;
        const balanceMult = 1.2 * engrRatio + 0.9 * mgmtRatio + 1.3 * rndRatio + 1.5 * opsRatio + busRatio;
        
        const sciMult = 1 + Math.pow(researchPoints, industrySettings.sciFac) / 800;
        const totalMult = progrMult * balanceMult * designMult * sciMult;

        this.qlt =
            totalMult *
            (0.1 * employeeProd[EmployeePositions.Engineer as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.Management as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.RandD as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.Operations as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.Business as keyof EmployeeJobs]);
        this.per =
            totalMult *
            (0.15 * employeeProd[EmployeePositions.Engineer as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.Management as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.RandD as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.Operations as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.Business as keyof EmployeeJobs]);
        this.dur =
            totalMult *
            (0.05 * employeeProd[EmployeePositions.Engineer as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.Management as keyof EmployeeJobs] +
                0.08 * employeeProd[EmployeePositions.RandD as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.Operations as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.Business as keyof EmployeeJobs]);
        this.rel =
            totalMult *
            (0.02 * employeeProd[EmployeePositions.Engineer as keyof EmployeeJobs] +
                0.08 * employeeProd[EmployeePositions.Management as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.RandD as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.Operations as keyof EmployeeJobs] +
                0.08 * employeeProd[EmployeePositions.Business as keyof EmployeeJobs]);
        this.aes =
            totalMult *
            (0.0 * employeeProd[EmployeePositions.Engineer as keyof EmployeeJobs] +
                0.08 * employeeProd[EmployeePositions.Management as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.RandD as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.Operations as keyof EmployeeJobs] +
                0.1 * employeeProd[EmployeePositions.Business as keyof EmployeeJobs]);
        this.fea =
            totalMult *
            (0.08 * employeeProd[EmployeePositions.Engineer as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.Management as keyof EmployeeJobs] +
                0.02 * employeeProd[EmployeePositions.RandD as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.Operations as keyof EmployeeJobs] +
                0.05 * employeeProd[EmployeePositions.Business as keyof EmployeeJobs]);
        this.calculateRating(division.type)
        const advMult = 1 + Math.pow(this.advCost, 0.1) / 100;
        const busmgtgRatio = Math.max(busRatio + mgmtRatio, 1 / total);
        this.mku = 100 / (advMult * Math.pow(this.qlt + 0.001, 0.65) * busmgtgRatio);
        await this.saveToDisk()
    }

    getAdvertisingFactors(awareness: number, popularity: number): [number, number, number, number] {
        let division = this.corpApi.getDivision(this.divisionName)
        const awarenessFac = Math.pow(awareness + 1, IndustrySettings[division.type].advFac);
        const popularityFac = Math.pow(popularity + 1, IndustrySettings[division.type].advFac);
        const ratioFac = awareness === 0 ? 0.01 : Math.max((popularity + 0.001) / awareness, 0.01);
        const totalFac = Math.pow(awarenessFac * popularityFac * ratioFac, 0.85);
        return [totalFac, awarenessFac, popularityFac, ratioFac];
    }

    getOptimalPrice(cityName: string)
    {
        let employeeProd = this.corpApi.getOffice(this.divisionName, cityName).employeeProd
        let division = this.corpApi.getDivision(this.divisionName)
        let product = this.corpApi.getProduct(this.divisionName, this.name)
        const businessFactor = calculateEffectWithFactors(1 + employeeProd[EmployeePositions.Business as keyof EmployeeJobs], 0.26, 10e3); //Business employee productivity
        const advertisingFactor = this.getAdvertisingFactors(division.awareness, division.popularity)[0]; //Awareness + popularity
        const marketFactor = getMarketFactor({ dmd: product.dmd, cmp: product.cmp }); //Competition + demand
        const markupLimit = this.rat / this.mku;
        const prod = product.cityData[cityName][1];
        let corpSalesMulti = 1 + (this.corpApi.getUpgradeLevel("ABC SalesBots") / 100)
        let researchSalesMulti = 1 // Missing, needs to be implemented, SOON (TM)
        
        const numerator = markupLimit;
        const sqrtNumerator = prod;
        const sqrtDenominator =
            0.5 *
            Math.pow(this.rat, 0.65) *
            marketFactor *
            corpSalesMulti *
            businessFactor *
            advertisingFactor *
            researchSalesMulti;
        const denominator = Math.sqrt(sqrtNumerator / sqrtDenominator);
        let optimalPrice;
        if (sqrtDenominator === 0 || denominator === 0) {
        if (sqrtNumerator === 0) {
            optimalPrice = 0; // No production
        } else {
            optimalPrice = product.pCost + markupLimit;
        }
        } else {
            optimalPrice = numerator / denominator + product.pCost;
        }
        return { price: optimalPrice, qty: prod }
    }

    getProductionForTargetPrice(cityName: string, targetPrice: number)
    {
        let employeeProd = this.corpApi.getOffice(this.divisionName, cityName).employeeProd
        let division = this.corpApi.getDivision(this.divisionName)
        let product = this.corpApi.getProduct(this.divisionName, this.name)
        const businessFactor = calculateEffectWithFactors(1 + employeeProd[EmployeePositions.Business as keyof EmployeeJobs], 0.26, 10e3); //Business employee productivity
        const advertisingFactor = this.getAdvertisingFactors(division.awareness, division.popularity)[0]; //Awareness + popularity
        const marketFactor = getMarketFactor({ dmd: product.dmd, cmp: product.cmp }); //Competition + demand
        const markupLimit = this.rat / this.mku;
        let corpSalesMulti = 1 + (this.corpApi.getUpgradeLevel("ABC SalesBots") / 100)
        let researchSalesMulti = 1 // Missing, needs to be implemented, SOON (TM)
        const numerator = markupLimit;
        let prod = product.cityData[cityName][1];
        let optimalPrice = 0
        let lastOptimalPrice = 0
        while (optimalPrice < targetPrice)
        {
            lastOptimalPrice = optimalPrice
            let sqrtNumerator = prod;
            const sqrtDenominator =
                0.5 *
                Math.pow(this.rat, 0.65) *
                marketFactor *
                corpSalesMulti *
                businessFactor *
                advertisingFactor *
                researchSalesMulti;
            const denominator = Math.sqrt(sqrtNumerator / sqrtDenominator);
            if (sqrtDenominator === 0 || denominator === 0) {
                if (sqrtNumerator === 0) {
                    optimalPrice = 0; // No production
                } else {
                    optimalPrice = product.pCost + markupLimit;
                }
            } else {
                optimalPrice = numerator / denominator + product.pCost;
            }
            if (optimalPrice === 0)
                break
            prod -= 0.1
            if (prod <= 1)
                break
        }
        return { qty: (prod + 0.1), price: lastOptimalPrice }
    }

    async saveToDisk()
    {
        await this.ns.write("/products/" + this.name + ".txt", JSON.stringify({
            name: this.name,
            divisionName: this.divisionName,
            creationCity: this.creationCity,
            designCost: this.designCost,
            advCost: this.advCost,
            prog: this.prog,
            rat: this.rat,
            qlt: this.qlt,
            per: this.per,
            dur: this.dur,
            rel: this.rel,
            aes: this.aes,
            fea: this.fea,
            mku: this.mku
        }), "w")
    }

    loadFromDisk()
    {
        let filename = "/products/" + this.name + ".txt"
        if (this.ns.fileExists(filename))
        {
            this.ns.tprint("Loading Product: " + this.name)
            let productData = this.ns.read(filename)
            let json = JSON.parse(productData)
            this.name = json.name
            this.divisionName = json.divisionName
            this.creationCity = json.creationCity
            this.designCost = json.designCost
            this.advCost = json.advCost
            this.prog = json.prog
            this.rat = json.rat
            this.qlt = json.qlt
            this.per = json.per
            this.dur = json.dur
            this.rel = json.rel
            this.aes = json.aes
            this.fea = json.fea
            this.mku = json.mku
        }
        else
        {
            this.ns.tprint("Product not found: " + this.name)
        }
    }



}