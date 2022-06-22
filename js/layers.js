// Layer Template
/*/
addLayer("x", {
    name: "x", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "x", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        total: new Decimal(0),
        best: new Decimal(0),
        points: new Decimal(0),
        time: 0,
        unlocked: false
    }},
    color: "#FF3F3F",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "x", // Name of prestige currency
    baseResource: "x", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        // base
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    doReset(layer){
        if (layer == this.layer){
            player[this.layer].total = player[this.layer].total.add(tmp.onResetGain)
            player[this.layer].best = player[this.layer].best.max(player[this.layer].points.add(tmp.onResetGain))
        }
    },    
    onResetGain(){
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    update(delta){
        player[this.layer] += delta
    },
)
/*/
addLayer("a", {
    name: "alpha points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "α", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        total: new Decimal(0),
        best: new Decimal(0),
        points: new Decimal(0),
        unlocked: false
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
        // base
        mult = new Decimal(1)

        // alpha layer
        if (hasUpgrade("a", 21)) mult = mult.mul(upgradeEffect("a", 21))

        // beta layer
        mult = mult.mul(tmp.b.effect.alphaeff)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    doReset(layer){
        if (layer == this.layer){
            player[this.layer].total = player[this.layer].total.add(tmp.onResetGain)
            player[this.layer].best = player[this.layer].best.max(player[this.layer].points.add(tmp.onResetGain))
        }
        if (layer == "b"){
            keep = []
            keep.push(33)
            if (hasMilestone("b",0)) keep.push(11,12,13)
            if (hasMilestone("b",1)) keep.push(21,22,23)
            layerDataReset("a")
            player[this.layer].upgrades = keep
        }
    },    
    onResetGain(){
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    update(delta){
        if (hasMilestone("b", 2)) player.a.points = player.a.points.add(tmp.a.onResetGain.mul(0.01).mul(delta).mul(player.b.milestones.length))
    },
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
            unlocked(){return true || hasUpgrade(this.layer, this.id)}
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
                hardcap = hardcap.add(buyableEffect("a", 13))
                ret = ret.min(hardcap)
                return ret
            },
            effectDisplay(){
                return "^" + format(this.effect())
            },
            unlocked(){return hasUpgrade("a",11) || hasUpgrade(this.layer, this.id)}
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
            unlocked(){return hasUpgrade("a",12) || hasUpgrade(this.layer, this.id)}
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
            unlocked(){return hasUpgrade("a",11) || hasUpgrade(this.layer, this.id)}
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
            unlocked(){return hasUpgrade("a",21) || hasUpgrade(this.layer, this.id)}
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
            unlocked(){return hasUpgrade("a",22) || hasUpgrade(this.layer, this.id)}
        },
        31: {
            title: "Alpha-31",
            cost: new Decimal(250),
            description: "Unlock a buyable",
            unlocked(){return hasUpgrade("a",23) || hasUpgrade(this.layer, this.id)}
        },
        32: {
            title: "Alpha-32",
            cost: new Decimal(500),
            description: "Unlock another buyable",
            unlocked(){return getBuyableAmount("a",11).gte(3) || hasUpgrade(this.layer, this.id)}
        },
        33: {
            title: "Alpha-33",
            cost: new Decimal(750),
            description: "Unlock another layer",
            unlocked(){return getBuyableAmount("a",12).gte(2) || hasUpgrade(this.layer, this.id)},
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
            unlocked(){return hasUpgrade("a", 31) || !getBuyableAmount(this.layer, this.id).eq(0)}
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
            unlocked(){return hasUpgrade("a", 32) || !getBuyableAmount(this.layer, this.id).eq(0)}
        },
        13: {
            title: "Alpha-b13",
            effect(){
                let ret = new Decimal(0)

                let base = new Decimal(0.1)
                ret = ret.add(base.mul(getBuyableAmount(this.layer, this.id)))

                return ret
            },
            cost(){
                let ret = new Decimal(1)
                ret = ret.mul(1000)

                let l_base = new Decimal(4)
                ret = ret.mul(l_base.pow(getBuyableAmount(this.layer, this.id)))

                let q_base = new Decimal(1.5)
                ret = ret.mul(q_base.pow(getBuyableAmount(this.layer, this.id).pow(2)))

                return ret
            },
            display(){
                let ret = "" 
                ret += "Increase the hardcap of Alpha-12\n"
                ret += "Amount: " + format(getBuyableAmount(this.layer, this.id)) + "\n"
                ret += "Cost: " + format(this.cost()) + " alpha points\n"
                ret += "Effect: " + " +" + format(buyableEffect(this.layer, this.id))
                return ret
            },
            canAfford(){return player.a.points.gte(this.cost())},
            buy(){
                player.a.points = player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked(){return hasUpgrade("b", 12) || !getBuyableAmount(this.layer, this.id).eq(0)}
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "buyables",
                "upgrades"
            ],
            unlocked: true
        }
    },
    hotkeys: [
        {key: "a", description: "A: Reset for alpha points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ]
})

addLayer("b", {
    name: "beta points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "β", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        total: new Decimal(0),
        best: new Decimal(0),
        points: new Decimal(0),
        unlocked: false
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
    onResetGain(){
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["a"],
    layerShown(){return player.b.unlocked},
    doReset(layer){
        if (layer == this.layer){
            player[this.layer].total = player[this.layer].total.add(tmp.onResetGain)
            player[this.layer].best = player[this.layer].best.max(player[this.layer].points.add(tmp.onResetGain))
        }
    },
    effect(){
        let pointeff = player.b.best.add(1).log(10).add(1)
        
        let poeffexp = new Decimal(3)
        if (hasUpgrade("b",11)) poeffexp = poeffexp.add(1)

        pointeff = pointeff.pow(poeffexp)

        let alphaeff = player.b.best.add(1).log(10).add(1)

        let aleffexp = new Decimal(2)
        if (hasUpgrade("b",11)) aleffexp = aleffexp.add(1)
        
        alphaeff = alphaeff.pow(aleffexp)

        return {
            pointeff: pointeff,
            alphaeff: alphaeff
        }
    },
    effectDescription(){
        ret = ""
        ret += "which are multiplying point gain by " + format(tmp.b.effect.pointeff)
        ret += " and alpha point gain by " + format(tmp.b.effect.alphaeff)
        ret += "."
        return ret
    },
    milestones: {
        0: {
            requirementDescription: "2 total beta points",
            effectDescription: "Gives the first row of alpha upgrades on reset",
            done() { return player.b.total.gte(2) }
        },
        1: {
            requirementDescription: "3 total beta points",
            effectDescription: "Gives the second row of alpha upgrades on reset",
            done() { return player.b.total.gte(3) }
        },
        2: {
            requirementDescription: "25 total beta points",
            effectDescription: "Gain 1% of alpha point gain per second per beta milestone",
            done() { return player.b.total.gte(25) }
        },
    },    
    upgrades: {
        11: {
            title: "Beta-11",
            cost: new Decimal(1),
            description: "Increase both beta effect exponents by 1",
            unlocked(){return player.b.total.gte(2)|| hasUpgrade(this.layer, this.id)},
        },
        12: {
            title: "Beta-12",
            cost: new Decimal(10),
            description: "Unlock another alpha buyable",
            unlocked(){return player.b.total.gte(5) && hasUpgrade("b",11) || hasUpgrade(this.layer, this.id)},
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "upgrades"
            ],
            unlocked: true
        },
        "Milestones": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "milestones"
            ]
        }
    },
    hotkeys: [
        {key: "b", description: "B: Reset for beta points", onPress(){if (canReset(this.layer)) doReset(this.layer)}, unlocked(){return player.b.unlocked}},
    ]
})
