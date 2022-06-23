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
    layerShown() {return true},
    doReset(layer) {
        if (layer == this.layer) {
            player[this.layer].total = player[this.layer].total.add(tmp.onResetGain)
            player[this.layer].best = player[this.layer].best.max(player[this.layer].points.add(tmp.onResetGain))
        }
    },    
    onResetGain() {
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    update(delta) {
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
    layerShown() {return true},
    doReset(layer) {
        if (layer == this.layer) {
            player[this.layer].total = player[this.layer].total.add(tmp.onResetGain)
            player[this.layer].best = player[this.layer].best.max(player[this.layer].points.add(tmp.onResetGain))
        }
        if (layer == "b") {
            keep = []
            keep.push(33) 
            if (hasMilestone("b", 0)) keep.push(11, 12, 13)
            if (hasMilestone("b", 1)) keep.push(21, 22, 23)
            if (hasMilestone("b", 3)) keep.push(31, 32)
            if (hasMilestone("b", 5)) keep.push(14, 24)
            layerDataReset("a")
            player[this.layer].upgrades = keep
        }
    },    
    onResetGain() {
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    update(delta) {
        // auto gain
        if (hasMilestone("b", 2)) {
            let baseGain = tmp.a.onResetGain
            let gain = baseGain.mul(0.01)
            gain = gain.mul(delta)
            let pow = hasMilestone("b", 4) ? 2 : 1
            gain = gain.mul(player.b.milestones.length ** pow)
            gain = gain.mul(hasMilestone("b", 5) ? 2.778 : 1)
            player.a.points = player.a.points.add(gain)
        }

        // auto buyables
        to_buy = []
        if (hasMilestone("b", 4)) to_buy.push(11, 12, 13)
        for(let i = 0; i < to_buy.length; i++) {
            if (tmp.a.buyables[to_buy[i]].canAfford && getBuyableAmount("a", to_buy[i]).lt(tmp.a.buyables[to_buy[i]].purchaseLimit)) setBuyableAmount("a", to_buy[i], getBuyableAmount("a", to_buy[i]).add(1))
        }
    },
    upgrades: {
        11: {
            title: "Alpha-11",
            cost: new Decimal(1),
            description: "Boost point gain based on alpha points",
            effect() {
                let ret = new Decimal(1)
                ret = ret.mul(player.a.points.add(1).log(10).add(1))
                if (hasUpgrade("a", 12)) ret = ret.pow(upgradeEffect("a", 12))
                return ret
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
            unlocked() {return true || hasUpgrade(this.layer, this.id)}
        },
        12: {
            title: "Alpha-12",
            cost: new Decimal(5),
            description: "Boost Alpha-11 based on points",
            effect() {
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).pow(0.5))
                if (hasUpgrade("a", 13)) ret = ret.mul(upgradeEffect("a" ,13))

                let hardcap = new Decimal(2)
                if (hasUpgrade("a", 13)) hardcap = hardcap.add(1)
                hardcap = hardcap.add(buyableEffect("a", 13))
                if (hasUpgrade("b", 31)) hardcap = hardcap.add(upgradeEffect("b", 31))
                if (maxedChallenge("b", 12)) hardcap = hardcap.add(2)
                if (hasUpgrade("a", 14)) hardcap = hardcap.add(upgradeEffect("a", 14))
                if (inChallenge("b", 12)) hardcap = new Decimal(1)
                if (inChallenge("b", 13)) hardcap = new Decimal(1)

                ret = ret.min(hardcap)
                return ret
            },
            effectDisplay() {
                return "^" + format(this.effect())
            },
            unlocked() {return hasUpgrade("a", 11) || hasUpgrade(this.layer, this.id)}
        },
        13: {
            title: "Alpha-13",
            cost: new Decimal(15),
            description: "Boost Alpha-12 based on points and increase the hardcap by 1",
            effect() {
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).pow(0.3))
                return ret
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
            unlocked() {return hasUpgrade("a", 12) || hasUpgrade(this.layer, this.id)}
        },
        14: {
            title: "Alpha-14",
            cost: new Decimal("1e29"),
            description: "Boost Alpha-12 hardcap based on alpha points",
            effect() {
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).log(10).mul(2))
                return ret
            },
            effectDisplay() {
                return "+" + format(this.effect())
            },
            unlocked() {return maxedChallenge("b", 13) || hasUpgrade(this.layer, this.id)}
        },
        21: {
            title: "Alpha-21",
            cost: new Decimal(3),
            description: "Boost alpha point gain based on alpha points",
            effect() {
                let ret = new Decimal(1)
                ret = ret.mul(player.a.points.add(1).log(10).add(1).pow(0.5))
                if (hasUpgrade("a",22)) ret = ret.mul(upgradeEffect("a",22))
                return ret
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
            unlocked() {return hasUpgrade("a", 11) || hasUpgrade(this.layer, this.id)}
        },
        22: {
            title: "Alpha-22",
            cost: new Decimal(10),
            description: "Boost Alpha-21 based on points",
            effect() {
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).pow(new Decimal(0.3).add(upgradeEffect("a",23))))
                return ret
            },
            effectDisplay() {
                return format(this.effect()) + "x"
            },
            unlocked() {return hasUpgrade("a", 21) || hasUpgrade(this.layer, this.id)}
        },
        23: {
            title: "Alpha-23",
            cost: new Decimal(40),
            description: "Boost Alpha-22 based on points",
            effect() {
                let ret = new Decimal(1)
                ret = ret.mul(player.points.add(1).log(10).add(1).log(10).div(10))
                if (hasUpgrade("a", 24)) ret = ret.mul(upgradeEffect("a", 24))
                return ret
            },
            effectDisplay() {
                return "+" + format(this.effect()) + " to exp"
            },
            unlocked() {return hasUpgrade("a", 22) || hasUpgrade(this.layer, this.id)}
        },
        24: {
            title: "Alpha-24",
            cost: new Decimal("5e33"),
            description: "Boost Alpha-23 based on alpha points",
            effect() {
                let ret = new Decimal(1)
                ret = ret.mul(player.a.points.add(1).log(10).add(1).pow(0.75))
                return ret
            },
            effectDisplay() {
                return "*" + format(this.effect())
            },
            unlocked() {return hasUpgrade("a", 14) || hasUpgrade(this.layer, this.id)}
        },
        31: {
            title: "Alpha-31",
            cost: new Decimal(250),
            description: "Unlock a buyable",
            unlocked() {return hasUpgrade("a", 23) || hasUpgrade(this.layer, this.id)}
        },
        32: {
            title: "Alpha-32",
            cost: new Decimal(500),
            description: "Unlock another buyable",
            unlocked() {return getBuyableAmount("a", 11).gte(3) || hasUpgrade(this.layer, this.id)}
        },
        33: {
            title: "Alpha-33",
            cost: new Decimal(750),
            description: "Unlock another layer",
            unlocked() {return getBuyableAmount("a", 12).gte(2) || hasUpgrade(this.layer, this.id)},
            onPurchase() {player.b.unlocked = true}
        }
    },
    buyables:{
        11: {
            title: "Alpha-b11",
            effect() {
                let ret = new Decimal(1)

                let base = new Decimal(1.5)
                base = base.add(buyableEffect("a", 12))
                ret = ret.mul(base.pow(getBuyableAmount(this.layer, this.id)))

                return ret
            },
            cost() {
                let ret = new Decimal(1)
                ret = ret.mul(100)

                let l_base = new Decimal(2)
                if (hasUpgrade("b", 21)) l_base = l_base.sub(upgradeEffect("b" , 21))
                ret = ret.mul(buyableBaseSoftcap(l_base).pow(getBuyableAmount(this.layer, this.id)))

                let q_base = new Decimal(1.05)
                if (maxedChallenge("b", 11)) q_base = q_base.sub(0.01)
                ret = ret.mul(q_base.pow(getBuyableAmount(this.layer, this.id).pow(2)))

                return ret
            },
            display() {
                let ret = "" 
                ret += "Boost point gain\n"
                ret += "Amount: " + format(getBuyableAmount(this.layer, this.id))+ "\n"
                ret += "Cost: " + format(this.cost()) + " alpha points\n"
                ret += "Effect: " + format(buyableEffect(this.layer, this.id)) + "x"
                return ret
            },
            canAfford() {return player.a.points.gte(this.cost())},
            buy() {
                player.a.points = player.a.points.sub(this.cost())
                setBuyableAmount("a", 11, getBuyableAmount("a",11).add(1))
            },
            unlocked() {return hasUpgrade("a", 31) || !getBuyableAmount(this.layer, this.id).eq(0)}
        },
        12: {
            title: "Alpha-b12",
            purchaseLimit() {
                let base = new Decimal(3)
                base = base.add(new Decimal(hasUpgrade("b", 13) ? upgradeEffect("b", 13) : 0))
                if (maxedChallenge("b", 13)) base = base.mul(2)
                if (inChallenge("b", 13)) base = new Decimal(1)
                return base
            },
            effect() {
                let ret = new Decimal(0)

                let base = new Decimal(0.3)
                ret = ret.add(base.mul(getBuyableAmount(this.layer, this.id).pow(0.5)))

                return ret
            },
            cost() {
                let ret = new Decimal(1)
                ret = ret.mul(250)

                let l_base = new Decimal(1.5)
                if (hasUpgrade("b", 23)) l_base = l_base.sub(upgradeEffect("b", 21))
                ret = ret.mul(buyableBaseSoftcap(l_base).pow(getBuyableAmount(this.layer, this.id)))

                let q_base = new Decimal(1.1)
                ret = ret.mul(q_base.pow(getBuyableAmount(this.layer, this.id).pow(2)))

                return ret
            },
            display() {
                let ret = "" 
                ret += "Increase the base of Alpha-b11\n"
                ret += "Amount: " + format(getBuyableAmount(this.layer, this.id)) + "/" + format(tmp.a.buyables[12].purchaseLimit) + "\n"
                ret += "Cost: " + format(this.cost()) + " alpha points\n"
                ret += "Effect: " + " +" + format(buyableEffect(this.layer, this.id))
                return ret
            },
            canAfford() {return player.a.points.gte(this.cost())},
            buy() {
                player.a.points = player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasUpgrade("a", 32) || !getBuyableAmount(this.layer, this.id).eq(0)}
        },
        13: {
            title: "Alpha-b13",
            effect() {
                let ret = new Decimal(0)

                let base = new Decimal(0.1)
                ret = ret.add(base.mul(getBuyableAmount(this.layer, this.id)))

                return ret
            },
            cost() {
                let ret = new Decimal(1)
                ret = ret.mul(1000)

                let l_base = new Decimal(4)
                if (hasUpgrade("b", 23)) l_base = l_base.sub(upgradeEffect("b", 21))
                ret = ret.mul(buyableBaseSoftcap(l_base).pow(getBuyableAmount(this.layer, this.id)))

                let q_base = new Decimal(1.5)
                ret = ret.mul(q_base.pow(getBuyableAmount(this.layer, this.id).pow(2)))

                return ret
            },
            display() {
                let ret = "" 
                ret += "Increase the hardcap of Alpha-12\n"
                ret += "Amount: " + format(getBuyableAmount(this.layer, this.id)) + "\n"
                ret += "Cost: " + format(this.cost()) + " alpha points\n"
                ret += "Effect: " + " +" + format(buyableEffect(this.layer, this.id))
                return ret
            },
            canAfford() {return player.a.points.gte(this.cost())},
            buy() {
                player.a.points = player.a.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return hasUpgrade("b", 12) || !getBuyableAmount(this.layer, this.id).eq(0)}
        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "blank",
                "buyables",
                "blank",
                "upgrades"
            ],
            unlocked: true
        }
    },
    hotkeys: [
        {key: "a", description: "A: Reset for alpha points", onPress() {if (canReset(this.layer)) doReset(this.layer)}},
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
    onResetGain() {
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["a"],
    layerShown() {return player.b.unlocked},
    doReset(layer) {
        if (layer == this.layer) {
            player[this.layer].total = player[this.layer].total.add(tmp.onResetGain)
            player[this.layer].best = player[this.layer].best.max(player[this.layer].points.add(tmp.onResetGain))
        }
    },
    effect() {
        let pointeff = player.b.best.add(1).log(10).add(1)
        
        let poeffexp = new Decimal(3)
        if (hasUpgrade("b", 11)) poeffexp = poeffexp.add(1)
        if (maxedChallenge("b", 13)) poeffexp = poeffexp.add(2)

        pointeff = pointeff.pow(poeffexp)

        let alphaeff = player.b.best.add(1).log(10).add(1)

        let aleffexp = new Decimal(2)
        if (hasUpgrade("b", 11)) aleffexp = aleffexp.add(1)
        if (maxedChallenge("b", 13)) aleffexp = aleffexp.add(2)
        
        alphaeff = alphaeff.pow(aleffexp)

        return {
            pointeff: pointeff,
            alphaeff: alphaeff
        }
    },
    effectDescription() {
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
        3: {
            requirementDescription: "250 total beta points",
            effectDescription: "Gives the third row of alpha upgrades on reset",
            done() { return player.b.total.gte(250) }
        },
        4: {
            requirementDescription: "1000 total beta points",
            effectDescription: "Autobuys the first 3 alpha buyables automagically for free<br>and boosts Milestone 3 to per beta milestone<sup>2</sup>",
            done() { return player.b.total.gte(1000) }
        },
        5: {
            requirementDescription: "1e13 total beta points",
            effectDescription: "Keep Alpha-14 and Alpha-24 on beta reset<br> and multiply Milestone 3 effect by 2.778",
            done() { return player.b.total.gte(new Decimal("1e13")) }
        },
    },    
    upgrades: {
        11: {
            title: "Beta-11",
            cost: new Decimal(1),
            description: "Increase both beta effect exponents by 1",
            unlocked() {return player.b.total.gte(2)|| hasUpgrade(this.layer, this.id)},
        },
        12: {
            title: "Beta-12",
            cost: new Decimal(10),
            description: "Unlock another alpha buyable",
            unlocked() {return player.b.total.gte(5) && hasUpgrade("b", 11) || hasUpgrade(this.layer, this.id)},
        },
        13: {
            title: "Beta-13",
            cost: new Decimal(50),
            description: "Increase the purchase limit of Alpha-b12 by 0.5 per beta upgrade (floored)",
            effect() {
                let ret = new Decimal(0.5)
                ret = ret.mul(player.b.upgrades.length)
                ret = ret.floor()
                return ret
            },
            unlocked() {return player.b.total.gte(25) && hasUpgrade("b", 12) || hasUpgrade(this.layer, this.id)},
        },
        21: {
            title: "Beta-21",
            cost: new Decimal(75),
            description: "Reduce the linear base of Alpha-b11 by 0.2 per sqrt(beta upgrade)",
            effect() {
                let ret = new Decimal(0.2)
                if (hasUpgrade("b", 22)) ret = ret.add(0.05)

                ret = ret.mul(new Decimal(player.b.upgrades.length).pow(0.5))

                if (hasUpgrade("b", 22)) ret = ret.min(0.8)
                return ret
            },
            effectDisplay() {
                return "-" + format(this.effect()) + " to the linear base"
            },
            unlocked() {return hasUpgrade("b", 13) || hasUpgrade(this.layer, this.id)}
        },
        22: {
            title: "Beta-22",
            cost: new Decimal(100),
            description: "Boost Beta-21 to 0.25 per but hardcap it at 0.8",
            unlocked() {return hasUpgrade("b", 21) || hasUpgrade(this.layer, this.id)}
        },
        23: {
            title: "Beta-23",
            cost: new Decimal(150),
            description: "Boost Beta-21 to all alpha buyables \n(Note: base is softcapped below 1)",
            unlocked() {return hasUpgrade("b", 22) || hasUpgrade(this.layer, this.id)}
        },
        31: {
            title: "Beta-31",
            cost: new Decimal(175),
            description: "Increase the hardcap of Alpha-12 by 0.4 per beta upgrade<sup>0.75</sup>",
            effect() {
                let ret = new Decimal(0.4)
                if (hasUpgrade("b", 32)) ret = ret.add(0.35)

                let pow = 0.75
                if (hasUpgrade("b", 33)) pow = 1
                ret = ret.mul(new Decimal(player.b.upgrades.length).pow(pow))

                return ret
            },
            effectDisplay() {
                return "+" + format(this.effect()) + " to Alpha-12's hardcap"
            },
            unlocked() {return hasUpgrade("b", 23) || hasUpgrade(this.layer, this.id)}
        },
        32: {
            title: "Beta-32",
            cost: new Decimal(250),
            description: "Boost Beta-31 to 0.75 per",
            unlocked() {return hasUpgrade("b", 31) || hasUpgrade(this.layer, this.id)}
        },
        33: {
            title: "Beta-33",
            cost: new Decimal(2500),
            description: "Boost Beta-31 to per beta upgrade",
            unlocked() {return hasUpgrade("b", 32) || hasUpgrade(this.layer, this.id)}
        },
        41: {
            title: "Beta-41",
            cost: new Decimal(10000),
            description: "Unlock a challange",
            unlocked() {return hasUpgrade("b", 33) && player.b.total.gt(7500) || hasUpgrade(this.layer, this.id)}
        },
        42: {
            title: "Beta-42",
            cost: new Decimal(100000),
            description: "Unlock another challange",
            unlocked() {return maxedChallenge("b", 11) || hasUpgrade(this.layer, this.id)}
        },
        43: {
            title: "Beta-43",
            cost: new Decimal(1000000),
            description: "Unlock another challange",
            unlocked() {return maxedChallenge("b", 12) || hasUpgrade(this.layer, this.id)}
        },
    },
    challenges: {
        11: {
            name: "Beta-ch11",
            challengeDescription: "Point gain is raised to 0.5",
            goalDescription: "1e9 points",
            rewardDescription: "-0.01 to Alpha-b11's quadratic scaling base",
            canComplete() {return player.points.gte(new Decimal("1e9"))},
            unlocked() {return hasUpgrade("b", 41)}
        },
        12: {
            name: "Beta-ch12",
            challengeDescription: "Beta-ch11 but Alpha-12 is hardcapped at 1",
            goalDescription: "2e6 points",
            rewardDescription: "+2 to Alpha-12's hardcap",
            canComplete() {return player.points.gte(new Decimal("2e6"))},
            unlocked() {return hasUpgrade("b", 42)}
        },
        13: {
            name: "Beta-ch13",
            challengeDescription: "Beta-ch12 but Alpha-b12's purchase limit is 1",
            goalDescription: "2.5e5 points",
            rewardDescription: "*2 to Alpha-b12's purchase limit and +2 to both beta effect exponents",
            canComplete() {return player.points.gte(new Decimal("2.5e5"))},
            unlocked() {return hasUpgrade("b", 43)}
        },
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "blank",
                "upgrades"
            ],
            unlocked: true
        },
        "Milestones": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "blank",
                "milestones"
            ]
        },
        "Challenges": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "blank",
                "challenges"
            ],
            unlocked() {return hasUpgrade("b", 41)}
        }
    },
    hotkeys: [
        {key: "b", description: "B: Reset for beta points", onPress() {if (canReset(this.layer)) doReset(this.layer)}, unlocked() {return player.b.unlocked}},
    ]
})
/*/
addLayer("r", {
    name: "radioactivity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "r", // This appears on the layer's node. Default is the id with the first letter capitalized
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
    resource: "alpha particles", // Name of prestige currency
    baseResource: "x", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        // base
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown() {return true},
    doReset(layer) {
        if (layer == this.layer) {
            player[this.layer].total = player[this.layer].total.add(tmp.onResetGain)
            player[this.layer].best = player[this.layer].best.max(player[this.layer].points.add(tmp.onResetGain))
        }
    },    
    onResetGain() {
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    update(delta) {
        player[this.layer] += delta
    },
)
/*/