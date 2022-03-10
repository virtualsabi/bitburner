import { IMap, Industries } from "corp-lib/corp.common";
import { Product } from "corp-lib/corp.product";
import { CorporationInfo, NS } from "types";

const baseFactionRepNeededForDonation = 500000
const baseInvestmentOffer = 4900000000000
const additionalInvestmentOfferRounds = [
    2000000000000000,
    2000000000000000000
]
const defaultGoPublicSharesCount = 0
const defaultGoPublicDividends = 0.1
const defaultOfficeExpandSize = 30
const upgradeLevelCorpFundsLimit = 100000000000
const _corpCreationPrice = 150000000000;
const _prodBoostFunds = 10000000000;

const corpTickCycleTime = 5000


enum CommodityType {
    Material,
    Product
}

enum CorporationUpgrade {
    SmartFactories = "Smart Factories",
    SmartStorage = "Smart Storage",
    DreamSense = "DreamSense",
    WilsonAnalytics = "Wilson Analytics",
    NuoptimalNootropicInjectorImplants = "Nuoptimal Nootropic Injector Implants",
    SpeechProcessorImplants = "Speech Processor Implants",
    NeuralAccelerators = "Neural Accelerators",
    FocusWires = "FocusWires",
    ABCSalesBots = "ABC SalesBots",
    ProjectInsight = "Project Insight",
}

const upgradeLevelPriceFactor: IMap<number> =
{
    [CorporationUpgrade.ABCSalesBots]: 1,
    [CorporationUpgrade.FocusWires]: 2,
    [CorporationUpgrade.NeuralAccelerators]: 1,
    [CorporationUpgrade.NuoptimalNootropicInjectorImplants]: 1,
    [CorporationUpgrade.ProjectInsight]: 1,
    [CorporationUpgrade.SmartFactories]: 1,
    [CorporationUpgrade.SmartStorage]: 5,
    [CorporationUpgrade.SpeechProcessorImplants]: 1
}

enum CityName {
    Aevum = "Aevum",
    Chongqing = "Chongqing",
    Ishima = "Ishima",
    NewTokyo = "New Tokyo",
    Sector12 = "Sector-12",
    Volhaven = "Volhaven"
}

enum CorporationUnlock {
    Export = "Export",
    SmartSupply = "Smart Supply",
    MarketResearch = "Market Research - Demand",
    MarketData = "Market Data - Competition",
    VeChain = "VeChain",
    ShadyAccounting = "Shady Accounting",
    GovernmentPartnership = "Government Partnership",
    WarehouseAPI = "Warehouse API",
    OfficeAPI = "Office API"
}

const EmployeePositions: IMap<string> = {
    Operations: "Operations",
    Engineer: "Engineer",
    Business: "Business",
    Management: "Management",
    RandD: "Research & Development",
    Training: "Training",
    Unassigned: "Unassigned",
};

interface EmployPattern {
    Operations: number,
    Engineer: number,
    Business: number,
    Management: number,
    RandD: number,
    Training: number
}

const bootstrapOfficeSetup: IMap<EmployPattern> = {
    Aevum: { Operations: 18, Engineer: 18, Business: 18, Management: 18, RandD: 18, Training: 0},
    Chongqing: { Operations: 9, Engineer: 9, Business: 9, Management: 9, RandD: 24, Training: 0},
    Ishima: { Operations: 9, Engineer: 9, Business: 9, Management: 9, RandD: 24, Training: 0},
    NewTokyo: { Operations: 9, Engineer: 9, Business: 9, Management: 9, RandD: 24, Training: 0},
    Sector12: { Operations: 9, Engineer: 9, Business: 9, Management: 9, RandD: 24, Training: 0},
    Volhaven: { Operations: 9, Engineer: 9, Business: 9, Management: 9, RandD: 24, Training: 0}
}

const bootstrapUpgradeSetup: IMap<number> = {
    SmartFactories: 5,
    SmartStorage: 30,
    DreamSense: 30,
    WilsonAnalytics: 16,
    NuoptimalNootropicInjectorImplants: 40,
    SpeechProcessorImplants: 40,
    NeuralAccelerators: 40,
    FocusWires: 5,
    ABCSalesBots: 40,
    ProjectInsight: 40
}

function isOptionSet(options: any[], option: string)
{
	if (options.indexOf(option) != -1)
		return true;
	return false;
}

function getOptionValue(options: any[], option: string, defaultValue?: string | number | boolean)
{
    if (options.indexOf(option) == -1)
        return defaultValue;
	return options[options.indexOf(option) + 1];
}

function getRepForDonationFavor(favor: number)
{
    if (favor < 1)
        return 0
    let usedRep = baseFactionRepNeededForDonation
    while (repToFavor(usedRep) < favor)
    {
        usedRep += 10000
    }
    return usedRep
}

function repToFavor(r: number): number
{
    const raw = Math.log((r + 25000) / 25500) / Math.log(1.02) + 1;
    return Math.round(raw * 10000) / 10000; // round to make things easier.
}


class CorporationManager {

    ns: NS
    adVertMax = 0
    upgradeLevelCycleCount = 0
    activeProducts = new Array<Product>()
    lastPriceCheck = 0


    constructor(ns: NS) {
        this.ns = ns
    }

    get corpApi()
    {
        return this.ns.corporation
    }

    loadAllProducts(divisionName: string)
    {
        let division = this.getDivisionByName(divisionName)
        if (division !== undefined && division?.products !== undefined)
        {
            for (let product of division.products)
            {
                let advProduct = new Product(this.ns, product, divisionName)
                advProduct.loadFromDisk()
                this.activeProducts.push(advProduct)
            }
        }        
    }

    formatNumber(val: number)
    {
        return this.ns.nFormat(val, "0,0")
    }

    getCorporationDetails(): CorporationInfo | undefined
    {
        let corpData = undefined
        try {
            corpData = this.corpApi.getCorporation()            
        } catch (error) {
            return undefined;
        }
        return corpData;
    }

    createCorporation(name: string, selfFund = true): boolean
    {
        if (this.getCorporationDetails() !== undefined)
        {
            this.ns.tprint("Corporation already exists!")
            return true;
        }
        let playerMoney = this.ns.getPlayer().money
        if (selfFund && playerMoney < _corpCreationPrice)
        {
            this.ns.tprint("Not enough monyey! " + this.formatNumber(playerMoney) + "/" + this.formatNumber(_corpCreationPrice))
            return false
        }
        this.ns.tprint("Creating corp: " + name)
        return this.corpApi.createCorporation(name, selfFund)
    }

    getCorporationFunds()
    {
        return this.corpApi.getCorporation().funds;
    }

    getDivisionByType(industryType: string)
    {
        return this.corpApi.getCorporation().divisions.find(d => d.type == industryType)
    }

    getDivisionByName(name: string)
    {
        return this.corpApi.getCorporation().divisions.find(d => d.name == name)
    }

    getCitiesByType(industryType: string)
    {
        return this.corpApi.getCorporation().divisions.find(d => d.type == industryType)?.cities
    }

    expandIndustry(divisionName: string, industryType: string): boolean
    {
        if (this.getDivisionByType(industryType) != null)
        {
            this.ns.tprint("Division of type <" + industryType + "> already exists!")
            return true
        }
        let industryCost = this.corpApi.getExpandIndustryCost(industryType);
        if (this.getCorporationFunds() < industryCost)
        {
            this.ns.tprint("Unable to expand to new industry <" + industryType + ">. Not enough corporation funds " + this.formatNumber(this.getCorporationFunds()) + "/" + this.formatNumber(industryCost))
            return false
        }
        this.corpApi.expandIndustry(industryType, divisionName);
        return true;
    }

    expandCity(city: CityName, industryType: string): boolean
    {
        let divisionCities = this.getCitiesByType(industryType);
        let division = this.getDivisionByType(industryType);
        if (division === undefined)
        {
            this.ns.tprint("Division not found. This should not happen! " + city + "/" + industryType)
            return false;
        }
        if (divisionCities !== undefined && divisionCities.find(dc => dc == city) !== undefined)
        {
            this.ns.tprint("Division already exists in this city: " + industryType + "/" + city);
            return true;
        }
        if (this.getCorporationFunds() < this.corpApi.getExpandCityCost())
        {
            this.ns.tprint("Insufficient funds: " + this.formatNumber(this.getCorporationFunds()) + "/" + this.formatNumber(this.corpApi.getExpandCityCost()))
            return false;
        }
        this.corpApi.expandCity(division.name, city)
        return true;
    }

    unlockCorporationUpgrade(upgrade: CorporationUnlock, enableLog = true): boolean
    {
        if (this.corpApi.hasUnlockUpgrade(upgrade))
        {
            if (enableLog) this.ns.tprint("UnlockUpgrade already unlocked: " + upgrade);
            return true;
        }
        if (this.getCorporationFunds() < this.corpApi.getUnlockUpgradeCost(upgrade))
        {
            if (enableLog) this.ns.tprint("Insufficient funds for Unlock of <" + upgrade + ">! " + this.formatNumber(this.getCorporationFunds()) + "/" + this.formatNumber(this.corpApi.getUnlockUpgradeCost(upgrade)))
            return false;
        }
        this.corpApi.unlockUpgrade(upgrade);
        return true;
    }

    levelCorporationUpgrade(upgrade: CorporationUpgrade, levels: number)
    {
        for (let i = 0; i < levels; i++)
            this.corpApi.levelUpgrade(upgrade)
    }

    async makeProduct(divisionName: string, city: CityName, productName: string, dInvest: number, mInvest: number, discontinueOldest: boolean, oldProduct: string | null): Promise<boolean>
    {
        let division = this.getCorporationDetails()?.divisions.find(d => d.name == divisionName)
        if (division !== undefined)
        {
            if (division.products.find(p => p == productName) !== undefined)
            {
                this.ns.tprint("Product already exists with given name: " + productName);
                return false;
            }
            if (this.getCorporationFunds() < (dInvest + mInvest))
            {
                dInvest /= 10
                mInvest /= 10
            }
            if (this.getCorporationFunds() < (dInvest + mInvest))
            {
                this.ns.tprint("Insufficient funds for product development: " + this.formatNumber(this.getCorporationFunds()) + "/" + this.formatNumber(dInvest + mInvest));
                return false;
            }
            let maxProductCount = 3;
            if (this.corpApi.hasResearched(divisionName, "uPgrade: Capacity.I"))
                maxProductCount += 1;
            if (this.corpApi.hasResearched(divisionName, "uPgrade: Capacity.II"))
                maxProductCount += 1;
            if (division.products.length >= maxProductCount && discontinueOldest && oldProduct != null)
            {
                this.discontinueProduct(divisionName, oldProduct)
            }
            this.corpApi.makeProduct(divisionName, city, productName, dInvest, mInvest)
            let advProduct = new Product(this.ns, productName, divisionName)
            await advProduct.createProduct(city, dInvest, mInvest)
            this.activeProducts.push(advProduct)
            return true;
        }
        else
        {
            this.ns.tprint("Division not found! " + divisionName);
            return false;
        }
    }

    setMarketTA2(divisionName: string, commodityName: string, ctype: CommodityType, enable: boolean)
    {
        this.setPrice(divisionName, CityName.Sector12, commodityName, ctype, "MAX", "MP*1", true)
        if (!this.corpApi.hasResearched(divisionName, "Market-TA.II"))
            return
        this.setPrice(divisionName, CityName.Sector12, commodityName, ctype, "MAX", "MP", true)
        if (ctype == CommodityType.Product)
        {
            this.corpApi.setProductMarketTA2(divisionName, commodityName, enable);
        }
        else
        {
            for (let city of Object.values(CityName))
            {
                this.corpApi.setMaterialMarketTA2(divisionName, city, commodityName, enable)
            }
        }
    }

    expandOffice(divisionName: string, cityName: CityName, targetEmplyees: number)
    {
        let office = this.corpApi.getOffice(divisionName, cityName)
        if (office.size < targetEmplyees)
        {
            this.corpApi.upgradeOfficeSize(divisionName, cityName, targetEmplyees - office.size)
        }
    }

    upgradeWarehouse(divisionName: string, cityName: CityName, targetLevel: number)
    {
        if (!this.corpApi.hasWarehouse(divisionName, cityName))
        {
            this.corpApi.purchaseWarehouse(divisionName, cityName);
        }
        let warehouse = this.corpApi.getWarehouse(divisionName, cityName)
        for (let i = warehouse.level; i < targetLevel; i++)
            this.corpApi.upgradeWarehouse(divisionName, cityName)
    }

    getRandDEmployees(divisionName: string, cityName: CityName)
    {
        let employees = this.corpApi.getOffice(divisionName, cityName).employees
        let posRandD = 0
        for (let e of employees)
        {
            let employee = this.corpApi.getEmployee(divisionName, cityName, e)
            if (employee.pos == "Research & Development")
                posRandD++;
        }
        return posRandD
    }

    async waitForHiredAmployees(divisionName: string, cityName: string)
    {
        let employees = this.corpApi.getOffice(divisionName, cityName).employees
        let allDone = true
        do
        {
            allDone = true
            for (let e of employees)
            {
                if (this.corpApi.getEmployee(divisionName, cityName, e).pos == "Unassigned")
                    allDone = false
            }
            if (!allDone)
                await this.ns.sleep(100)
        } while (!allDone)
    }

    async hireEmployees(divisionName: string, cityName: CityName, employPattern: Partial<EmployPattern>)
    {
        let employees = this.corpApi.getOffice(divisionName, cityName).employees
        for (let key in employPattern)
        {
            let existingAmount = 0;
            for (let e of employees)
            {
                let employee = this.corpApi.getEmployee(divisionName, cityName, e)
                if (employee.pos == EmployeePositions[key])
                    existingAmount++;
            }
            let amount = employPattern[key as keyof EmployPattern]
            if (amount !== undefined && amount > existingAmount)
            {
                amount -= existingAmount
                if (amount > 0) {
                    for (let i = 0; i < amount; i++)
                        this.corpApi.hireEmployee(divisionName, cityName)
                    await this.corpApi.setAutoJobAssignment(divisionName, cityName, EmployeePositions[key], amount + existingAmount)
                    await this.waitForHiredAmployees(divisionName, cityName)
                }
            }
        }
    }

    async expandOffices(divisionName: string, size: number)
    {
        for (let cycle = 0; cycle < Object.values(CityName).length; cycle++)
        {
            let employeeByCity = []
            for (let city of Object.values(CityName))
            {
                employeeByCity.push({ city: city, count: this.corpApi.getOffice(divisionName, city).employees.length })
            }
            employeeByCity.sort(function(a, b) {
                return a.count - b.count
            })
            
            let target = employeeByCity[0]
            if (this.getCorporationFunds() > this.corpApi.getOfficeSizeUpgradeCost(divisionName, target.city, size))
            {
                this.corpApi.upgradeOfficeSize(divisionName, target.city, size)
                for (let i = 0; i < size; i++)
                    this.corpApi.hireEmployee(divisionName, target.city)
                let employeesPosRandD = this.getRandDEmployees(divisionName, target.city)
                if (target.city == CityName.Aevum)
                {
                    let newAmount = employeesPosRandD + Math.floor(size / 5)
                    await this.corpApi.setAutoJobAssignment(divisionName, target.city, "Operations", newAmount)
                    await this.corpApi.setAutoJobAssignment(divisionName, target.city, "Engineer", newAmount)
                    await this.corpApi.setAutoJobAssignment(divisionName, target.city, "Business", newAmount)
                    await this.corpApi.setAutoJobAssignment(divisionName, target.city, "Management", newAmount)
                    await this.corpApi.setAutoJobAssignment(divisionName, target.city, "Research & Development", newAmount)
                }
                else
                {
                    let newAmount = employeesPosRandD + size
                    await this.corpApi.setAutoJobAssignment(divisionName, target.city, "Research & Development", newAmount)
                }
            }
            else
            {
                break
            }
        }
    }

    setPrice(divisionName: string, cityName: CityName, commodityName: string, ctype: CommodityType, amount: string, price: string, allCities = false)
    {
        if (ctype == CommodityType.Material)
        {
            if (allCities)
            {
                for (let city of Object.values(CityName))
                {
                    this.corpApi.sellMaterial(divisionName, city, commodityName, amount, price)
                }
            }
            else
            {
                this.corpApi.sellMaterial(divisionName, cityName, commodityName, amount, price)
            }
        }
        if (ctype == CommodityType.Product)
        {
            this.corpApi.sellProduct(divisionName, cityName, commodityName, amount, price, allCities)
        }
    }

    getWarehouseMinLevel(divisionName: string)
    {
        let warehouseLimits = [];
        for (let city of Object.values(CityName))
        {
            let warehouse = this.corpApi.getWarehouse(divisionName, city)
            warehouseLimits.push(warehouse.sizeUsed / warehouse.size);
        }
        return Math.min(...warehouseLimits)
    }

    async scamInvestors(divisionName: string)
    {
        let aimedInvestmentOffer = baseInvestmentOffer * this.ns.getBitNodeMultipliers().CorporationValuation
        while (this.corpApi.getHireAdVertCost(divisionName) < this.corpApi.getCorporation().funds)
        {
            this.corpApi.hireAdVert(divisionName);
        }
        for (let city of Object.values(CityName))
        {
            this.setPrice(divisionName, city, "AI Cores", CommodityType.Material, "MAX", "MP")
        }
        for (let cycle = 0; cycle < 300; cycle++)
        {
            let offer = this.corpApi.getInvestmentOffer();
            this.ns.tprint("Current investment offer: " + this.formatNumber(offer.funds) + " => aiming for: " + this.formatNumber(aimedInvestmentOffer))
            if (offer.funds > aimedInvestmentOffer)
            {
                this.corpApi.acceptInvestmentOffer();
                this.corpApi.acceptInvestmentOffer();
                return
            }
            await this.ns.sleep(250);
        }
    }

    getNextInvestmentOffer()
    {
        if (!this.corpApi.getCorporation().public)
        {
            let offer = this.corpApi.getInvestmentOffer()
            if (offer.round == 3 && offer.funds > additionalInvestmentOfferRounds[0])
                this.corpApi.acceptInvestmentOffer();
            if (offer.round == 4 && offer.funds > additionalInvestmentOfferRounds[1])
            {
                this.corpApi.acceptInvestmentOffer();
                let success = this.corpApi.goPublic(defaultGoPublicSharesCount)
                if (success) this.corpApi.issueDividends(defaultGoPublicDividends)
            }
        }
    }

    async setupInitialOffices(divisionName: string)
    {
        for (let city of Object.keys(CityName))
        {
            let setup = bootstrapOfficeSetup[city];
            this.expandOffice(divisionName, CityName[city as keyof typeof CityName], (setup.Business + setup.Engineer + setup.Management + setup.Operations + setup.RandD + setup.Training))
            await this.hireEmployees(divisionName, CityName[city as keyof typeof CityName], setup)
        }
    }

    setupInitialUpgrades()
    {
        for (let upgrade of Object.keys(bootstrapUpgradeSetup))
        {
            this.levelCorporationUpgrade(CorporationUpgrade[upgrade as keyof typeof CorporationUpgrade], bootstrapUpgradeSetup[upgrade])
        }
    }

    unlockAllCorporationUpgrades(enableLog: boolean)
    {
        for (let unlock of Object.values(CorporationUnlock))
        {
            this.unlockCorporationUpgrade(unlock, enableLog)
        }
    }

    partyHard(divisionName: string, cityName: string, coffeeRounds: number, partyRounds: number, partyMoney: number)
    {
        this.ns.run("/corp-modules/corp.partyhack.js", 1, divisionName, cityName, coffeeRounds, partyRounds, partyMoney)
    }

    upgradeLevels()
    {
        if (this.upgradeLevelCycleCount < 24)
        {
            this.upgradeLevelCycleCount++
            return
        }
        this.upgradeLevelCycleCount = 0
        while (this.getCorporationFunds() > upgradeLevelCorpFundsLimit)
        {
            let upgradeList = [];
            for (let upgrade of Object.keys(upgradeLevelPriceFactor))
            {
                let price = this.corpApi.getUpgradeLevelCost(upgrade) * upgradeLevelPriceFactor[upgrade]
                upgradeList.push({ upgrade: upgrade, price: price })
            }
            upgradeList.sort(function(a,b) {
                return a.price - b.price
            })
            if ((this.getCorporationFunds() - upgradeList[0].price) > upgradeLevelCorpFundsLimit) {
                this.corpApi.levelUpgrade(upgradeList[0].upgrade)
            }
            else
            {
                break;
            }
        }
    }

    deleteProducts()
    {
        let products = this.ns.ls("home", "/products/")
        for (let p of products)
        {
            this.ns.rm(p, "home")
        }
    }

    async bootstrapCorporation(corpName: string, divisionName: string, industry: string, selfFund = true)
    {
        this.deleteProducts()
        if (this.createCorporation(corpName, selfFund))
        {
            if (this.expandIndustry(divisionName, industry))
            {
                this.unlockCorporationUpgrade(CorporationUnlock.SmartSupply);
                for (let city of Object.values(CityName))
                {
                    this.expandCity(city, industry);
                    this.expandOffice(divisionName, city, 6)
                    this.upgradeWarehouse(divisionName, city, 4);
                    try {
                        this.corpApi.setSmartSupply(divisionName, city, true);
                    } catch (e) {
                        this.ns.tprint("ERROR: Unable to activate Smart Supply for City: " + city)
                    }
                    this.setPrice(divisionName, city, "AI Cores", CommodityType.Material, "0", "MP")
                    await this.hireEmployees(divisionName, city, { Operations: 1, Engineer: 1, Business: 1, RandD: 3 })
                }
                for (let city of Object.values(CityName))
                {
                    this.partyHard(divisionName, city, 9, 4, 2000000)
                }

                while (this.getWarehouseMinLevel(divisionName) < 0.99)
                {
                    this.ns.tprint("Warehouse FillLevel: " + this.getWarehouseMinLevel(divisionName))
                    await this.ns.sleep(5000)
                }
                await this.scamInvestors(divisionName);
                this.setMarketTA2(divisionName, "AI Cores", CommodityType.Material, true)
                this.unlockAllCorporationUpgrades(true)
                await this.setupInitialOffices(divisionName)
                this.setupInitialUpgrades()
                while (this.corpApi.getHireAdVertCost(divisionName) < this.corpApi.getCorporation().funds)
                {
                    this.corpApi.hireAdVert(divisionName);
                }
            }
        }
        this.ns.tprint("Bootstrapping done!")
    }

    getNextProductName(prefix: string, divisionName: string): string[]
    {
        let division = this.getDivisionByName(divisionName);
        let usedNums = new Array<number>()
        if (division === undefined)
            return [prefix];
        for (let prod of division.products)
        {
            let nextNum = prod.match(/\d+/)
            if (nextNum != null)
                usedNums.push(parseInt(nextNum[0], 10));
            else
                usedNums.push(0);
        }
        if (usedNums.length == 0)
            usedNums.push(0);
        return [prefix + (Math.max(...usedNums) + 1), prefix + Math.min(...usedNums)];
    }

    isRunningProductResearch(divisionName: string): boolean
    {
        let division = this.getDivisionByName(divisionName);
        if (division !== undefined)
        {
            for (let prod of division.products)
            {
                let product = this.corpApi.getProduct(divisionName, prod)
                if (product.developmentProgress < 100)
                    return true;
            }
        }
        return false;
    }

    discontinueProduct(divisionName: string, productName: string)
    {
        this.corpApi.discontinueProduct(divisionName, productName)
    }

    updatePrices(divisionName: string)
    {
        let products = this.corpApi.getDivision(divisionName).products
        for (let prod of products)
        {
            let product = this.corpApi.getProduct(divisionName, prod);
            if (product.developmentProgress < 100)
                continue;
            let costCheck = parseInt("" + product.sCost, 10)
            if (product.sCost == 0 || ((product.sCost == "MP*1" || costCheck > 0) && this.corpApi.hasResearched(divisionName, "Market-TA.II")))
            {
                this.ns.tprint("Switching to built-in TA.II: " + prod)
                this.setMarketTA2(divisionName, product.name, CommodityType.Product, true)
            }
            else if ((product.sCost == "MP*1" || (costCheck > 0 && this.lastPriceCheck % 10 == 0)) && !this.corpApi.hasResearched(divisionName, "Market-TA.II"))
            {
                let advProduct = this.activeProducts.find(p => p.name == prod)
                if (advProduct !== undefined)
                {
                    let optimalPrices = []
                    for (let city of Object.values(CityName))
                    {
                        optimalPrices.push(advProduct.getOptimalPrice(city).price)
                    }
                    let minPrice = Math.min(...optimalPrices) * 0.95
                    if (minPrice > 0)
                        this.setPrice(divisionName, CityName.Aevum, product.name, CommodityType.Product, "MAX", "" + minPrice, true)
                }
            }
        }
        this.lastPriceCheck++
        if (this.lastPriceCheck > 100)
            this.lastPriceCheck = 0
    }

    spamAdVert(divisionName: string)
    {
        if (this.adVertMax == Infinity)
            return;
        let lastAdMulti = this.corpApi.getDivision(divisionName).awareness
        let advCost = this.corpApi.getHireAdVertCost(divisionName)
        // at the moment i do not buy wilson after the initial 16. have to check some calculations if usefull or not
        let wilsonCost = Infinity //this.corpApi.getUpgradeLevelCost(CorporationUpgrade.WilsonAnalytics)

        while (Math.min(advCost, wilsonCost) < this.corpApi.getCorporation().funds && this.adVertMax != Infinity)
        {
            if (advCost < wilsonCost)
            {
                this.corpApi.hireAdVert(divisionName);
                if (this.corpApi.getDivision(divisionName).awareness <= lastAdMulti)
                {
                    this.adVertMax = Infinity;
                    return;
                }
                lastAdMulti = this.corpApi.getDivision(divisionName).awareness
            }
            else
            {
                this.corpApi.levelUpgrade(CorporationUpgrade.WilsonAnalytics)
            }
            advCost = this.corpApi.getHireAdVertCost(divisionName)
            // at the moment i do not buy wilson after the initial 16. have to check some calculations if usefull or not
            wilsonCost = Infinity //this.corpApi.getUpgradeLevelCost(CorporationUpgrade.WilsonAnalytics)
        }
    }

    unlockDivisionResearch(divisionName: string)
    {
        if (!this.corpApi.hasResearched(divisionName, "Hi-Tech R&D Laboratory") && this.corpApi.getDivision(divisionName).research > this.corpApi.getResearchCost(divisionName, "Hi-Tech R&D Laboratory"))
        {
            this.corpApi.research(divisionName, "Hi-Tech R&D Laboratory")
        }

        if (this.corpApi.hasResearched(divisionName, "Hi-Tech R&D Laboratory") && !this.corpApi.hasResearched(divisionName, "Market-TA.II"))
        {
            let researchCost = (this.corpApi.getResearchCost(divisionName, "Market-TA.I") + this.corpApi.getResearchCost(divisionName, "Market-TA.II")) * 1.5
            if (this.corpApi.getDivision(divisionName).research > researchCost)
            {
                this.corpApi.research(divisionName, "Market-TA.I")
                this.corpApi.research(divisionName, "Market-TA.II")
                this.setMarketTA2(divisionName, "AI Cores", CommodityType.Material, true)
                let products = this.corpApi.getDivision(divisionName).products
                for (let p of products)
                    this.setMarketTA2(divisionName, p, CommodityType.Product, true)
            }
        }

        try {
            let researchCost = (this.corpApi.getResearchCost(divisionName, "uPgrade: Fulcrum") + this.corpApi.getResearchCost(divisionName, "uPgrade: Capacity.I")) * 1.5
            if (!this.corpApi.hasResearched(divisionName, "uPgrade: Fulcrum") && this.corpApi.getDivision(divisionName).research > researchCost)
            {
                this.corpApi.research(divisionName, "uPgrade: Fulcrum")
                this.corpApi.research(divisionName, "uPgrade: Capacity.I")
            }
        }
        catch(e) {}

        try {
            let researchCost = this.corpApi.getResearchCost(divisionName, "uPgrade: Capacity.II") * 5
            if (this.corpApi.hasResearched(divisionName, "uPgrade: Capacity.I") && !this.corpApi.hasResearched(divisionName, "uPgrade: Capacity.II") && this.corpApi.getDivision(divisionName).research > researchCost)
            {
                this.corpApi.research(divisionName, "uPgrade: Capacity.II")
            }
        }
        catch(e) {}

        try {
            let researchCost = (this.corpApi.getResearchCost(divisionName, "Drones") + this.corpApi.getResearchCost(divisionName, "Drones - Assembly")) * 3
            if (this.corpApi.hasResearched(divisionName, "Market-TA.II") && !this.corpApi.hasResearched(divisionName, "Drones") && this.corpApi.getDivision(divisionName).research > researchCost)
            {
                this.corpApi.research(divisionName, "Drones")
                this.corpApi.research(divisionName, "Drones - Assembly")
            }
        }
        catch(e) {}

        try {
            let researchCost = this.corpApi.getResearchCost(divisionName, "Self-Correcting Assemblers") * 4
            if (this.corpApi.hasResearched(divisionName, "Market-TA.II") && !this.corpApi.hasResearched(divisionName, "Self-Correcting Assemblers") && this.corpApi.getDivision(divisionName).research > researchCost)
            {
                this.corpApi.research(divisionName, "Self-Correcting Assemblers")
            }
        }
        catch(e) {}
    }

    getAugsFromFaction(faction: string)
    {
        let augInfos = []
        let augs = this.ns.getAugmentationsFromFaction(faction)
        for (let aug of augs)
        {
            augInfos.push({ name: aug, repCost: this.ns.getAugmentationRepReq(aug), price: this.ns.getAugmentationPrice(aug) })
        }
        return augInfos
    }

    bribeFactionsForFavor()
    {
        // TODO: Need to find a non static solution
        if (this.getCorporationFunds() < 100000000000000000)
            return
        let favorRepNeeded = getRepForDonationFavor(this.ns.getFavorToDonate())
        let factions = this.ns.getPlayer().factions
        for (let faction of factions)
        {
            if (faction == "Bladeburners" || faction == "Church of the Machine God")
                continue
            if (this.ns.getFactionFavor(faction) < this.ns.getFavorToDonate() && this.ns.getFactionRep(faction) < favorRepNeeded)
            {
                let factionAugs = this.getAugsFromFaction(faction)
                factionAugs.sort(function(a, b) {
                    return b.repCost - a.repCost
                })
                let repNeeded = Math.max(favorRepNeeded, factionAugs[0].repCost)
                let bribeMoneyNeeded = (repNeeded / 1000) * 1000000000000
                if (this.getCorporationFunds() > bribeMoneyNeeded)
                {
                    this.ns.tprint("Bribing faction: " + faction)
                    this.corpApi.bribe(faction, bribeMoneyNeeded, 0)
                }
            }
        }
    }

    async finishProducts(divisionName: string)
    {
        for (let advProduct of this.activeProducts)
        {
            if (advProduct.prog == 0)
            {
                let product = this.corpApi.getProduct(divisionName, advProduct.name)
                if (product.developmentProgress > 90)
                {
                    while (this.corpApi.getProduct(divisionName, advProduct.name).developmentProgress < 100)
                    {
                        await this.ns.sleep(1000)
                    }
                    await advProduct.finishProduct()
                }
            }
        }
    }
}

export async function main(ns: NS) {
    let forceCreate = isOptionSet(ns.args, "force");
    let discontinueProds = isOptionSet(ns.args, "disco");
    let corpName = getOptionValue(ns.args, "cname", "AlterReality");
    let divName = getOptionValue(ns.args, "dname", "MacroSoft");
    let industry = getOptionValue(ns.args, "type", Industries.Software);
    let selfFund = getOptionValue(ns.args, "selffund", true);
    let pNamePrefix = getOptionValue(ns.args, "pname", "Soft");
    let runInBackground = isOptionSet(ns.args, "loop");

    let corpManager = new CorporationManager(ns);

    let corpDetails = corpManager.getCorporationDetails();

    if (corpDetails == null || forceCreate) {
        ns.tprint("Bootstrapping new corporation...")
        await corpManager.bootstrapCorporation(corpName, divName, industry, selfFund)
        corpDetails = corpManager.getCorporationDetails();
    }
    if (corpDetails === undefined)
    {
        return ns.tprint("Corporation creation failed!")
    }
    let division = corpDetails.divisions.find(d => d.name == divName);
    if (division === undefined)
    {
        return ns.tprint("Division not found! " + divName);
    }
    ns.tprint("Using corporation: " + corpDetails.name)
    
    ns.tprint("Loading products")
    corpManager.loadAllProducts(divName)
    while (runInBackground)
    {
        await corpManager.finishProducts(divName)
        if (!corpManager.isRunningProductResearch(division.name))
        {
            let nextProductInfos = corpManager.getNextProductName(pNamePrefix, divName);
            let nextProduct = nextProductInfos[0];
            let oldProduct = nextProductInfos.length > 1 ? nextProductInfos[1] : null;
            let makeProductDone = await corpManager.makeProduct(divName, CityName.Aevum, nextProduct, _prodBoostFunds, _prodBoostFunds, discontinueProds, oldProduct);
            if (makeProductDone)
            {
                ns.tprint("Started creation of product: " + nextProduct);
                corpManager.setMarketTA2(divName, nextProduct, CommodityType.Product, true);
            }
        }
        corpManager.unlockDivisionResearch(divName)
        corpManager.unlockAllCorporationUpgrades(false)
        corpManager.getNextInvestmentOffer()
        corpManager.spamAdVert(divName)
        await corpManager.expandOffices(divName, defaultOfficeExpandSize)
        corpManager.upgradeLevels()
        corpManager.updatePrices(divName)
        corpManager.bribeFactionsForFavor()
        await ns.sleep(corpTickCycleTime);
    }
}
