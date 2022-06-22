addLayer("a", {
    name: "alpha points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "α", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        resetTime: 0
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "alpha points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    resetTime: 0,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.mul(tmp.a.upgrades[21].effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Alpha-11",
            cost: new Decimal(1),
            description: "Boost point gain based on alpha points",
            effect(){
                let ret = new Decimal(1)
                ret = ret.mul(player.a.points.add(1).log(10).add(1))
                if (hasUpgrade("a",12)) ret = ret.pow(upgradeEffect("a",12))
                return ret
            },
            effectDisplay(){
                return format(this.effect()) + "x"
            },
            unlocked(){return true}
        },
        12: {
            title: "Alpha-12",
            cost: new Decimal(5),
            description: "Boost Alpha-11 based on points",
            effect(){
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).pow(0.5))
                if (hasUpgrade("a",13)) ret = ret.mul(upgradeEffect("a",13))

                let hardcap = new Decimal(2)
                if (hasUpgrade("a",13)) hardcap = hardcap.add(1)
                ret = ret.min(hardcap)
                return ret
            },
            effectDisplay(){
                return "^" + format(this.effect())
            },
            unlocked(){return hasUpgrade("a",11)}
        },
        13: {
            title: "Alpha-13",
            cost: new Decimal(15),
            description: "Boost Alpha-12 based on points and increase the hardcap by 1",
            effect(){
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).pow(0.3))
                return ret
            },
            effectDisplay(){
                return format(this.effect()) + "x"
            },
            unlocked(){return hasUpgrade("a",12)}
        },
        21: {
            title: "Alpha-21",
            cost: new Decimal(3),
            description: "Boost alpha point gain based on alpha points",
            effect(){
                let ret = new Decimal(1)
                ret = ret.mul(player.a.points.add(1).log(10).add(1).pow(0.5))
                if (hasUpgrade("a",22)) ret = ret.mul(upgradeEffect("a",22))
                return ret
            },
            effectDisplay(){
                return format(this.effect()) + "x"
            },
            unlocked(){return hasUpgrade("a",11)}
        },
        22: {
            title: "Alpha-22",
            cost: new Decimal(10),
            description: "Boost Alpha-21 based on points",
            effect(){
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).pow(new Decimal(0.3).add(upgradeEffect("a",23))))
                return ret
            },
            effectDisplay(){
                return format(this.effect()) + "x"
            },
            unlocked(){return hasUpgrade("a",21)}
        },
        23: {
            title: "Alpha-23",
            cost: new Decimal(40),
            description: "Boost Alpha-22 based on points",
            effect(){
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).log(10).div(10))
                return ret
            },
            effectDisplay(){
                return "+" + format(this.effect()) + " to exp"
            },
            unlocked(){return hasUpgrade("a",22)}
        },
        31: {
            title: "Alpha-31",
            cost: new Decimal(250),
            description: "Unlock a buyable",
            unlocked(){return hasUpgrade("a",23)}
        },
        32: {
            title: "Alpha-32",
            cost: new Decimal(500),
            description: "Unlock another buyable",
            unlocked(){return getBuyableAmount("a",11).gte(3)}
        },
        33: {
            title: "Alpha-33",
            cost: new Decimal(750),
            description: "Unlock another layer",
            unlocked(){return getBuyableAmount("a",12).gte(2)},
            onPurchase(){player.b.unlocked = true}
        }
    },
    buyables:{
        11: {
            title: "Alpha-b11",
            effect(){
                let ret = new Decimal(1)

                let base = new Decimal(1.5)
                base = base.add(buyableEffect("a",12))
                ret = ret.mul(base.pow(getBuyableAmount(this.layer, this.id)))

                return ret
            },
            cost(){
                let ret = new Decimal(1)
                ret = ret.mul(100)

                let l_base = new Decimal(2)
                ret = ret.mul(l_base.pow(getBuyableAmount(this.layer, this.id)))

                let q_base = new Decimal(1.05)
                ret = ret.mul(q_base.pow(getBuyableAmount(this.layer, this.id).pow(2)))

                return ret
            },
            display(){
                let ret = "" 
                ret += "Boost point gain\n"
                ret += "Amount: " + format(getBuyableAmount(this.layer, this.id))+ "\n"
                ret += "Cost: " + format(this.cost()) + " alpha points\n"
                ret += "Effect: " + format(buyableEffect(this.layer, this.id)) + "x"
                return ret
            },
            canAfford(){return player.a.points.gte(this.cost())},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                setBuyableAmount("a", 11, getBuyableAmount("a",11).add(1))
            },
            unlocked(){return hasUpgrade("a",31)}
        },
        12: {
            title: "Alpha-b12",
            purchaseLimit: 3,
            effect(){
                let ret = new Decimal(0)

                let base = new Decimal(0.3)
                ret = ret.add(base.mul(getBuyableAmount(this.layer, this.id).pow(0.5)))

                return ret
            },
            cost(){
                let ret = new Decimal(1)
                ret = ret.mul(250)

                let l_base = new Decimal(1.5)
                ret = ret.mul(l_base.pow(getBuyableAmount(this.layer, this.id)))

                let q_base = new Decimal(1.1)
                ret = ret.mul(q_base.pow(getBuyableAmount(this.layer, this.id).pow(2)))

                return ret
            },
            display(){
                let ret = "" 
                ret += "Increase the base of Alpha-b11\n"
                ret += "Amount: " + format(getBuyableAmount(this.layer, this.id)) + "/3\n"
                ret += "Cost: " + format(this.cost()) + " alpha points\n"
                ret += "Effect: " + " +" + format(buyableEffect(this.layer, this.id))
                return ret
            },
            canAfford(){return player.a.points.gte(this.cost())},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked(){return hasUpgrade("a",32)}
        }
    },
    update(delta){
        tmp.a.resetTime += delta
    },
    hotkeys: [
        {key: "a", description: "A: Reset for alpha points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
})

addLayer("b", {
    name: "beta points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "β", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        resetTime: 0
    }},
    color: "#3F3FFF",
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "beta points", // Name of prestige currency
    baseResource: "alpha points", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    resetTime: 0,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["a"],
    layerShown(){return player.b.unlocked},
    effect(){
        return {
            pointeff: player.b.points.add(1).log(10).add(1).pow(3),
            alphaeff: player.b.points.add(1).log(10).add(1).pow(2)
        }
    },
    effectDescription(){
        ret = ""
        ret += "which are multiplying point gain by " + format(tmp.b.effect.pointeff)
        ret += " and alpha point gain by " + format(tmp.b.effect.alphaeff)
        ret += "."
        return ret
    },
    hotkeys: [
        {key: "b", description: "B: Reset for beta points", onPress(){if (canReset(this.layer)) doReset(this.layer)}, unlocked(){return player.b.unlocked}},
    ],
})
