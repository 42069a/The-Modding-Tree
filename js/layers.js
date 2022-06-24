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
        let mult = new Decimal(1)

        // alpha layer
        if (hasUpgrade("a", 21)) mult = mult.mul(upgradeEffect("a", 21))

        // beta layer
        if (player.b.unlocked) mult = mult.mul(tmp.b.effect.alphaeff)
        
        // gamma layer
        if (player.g.unlocked) mult = mult.mul(tmp.g.effect.othereff)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown() {return true || player[this.layer].unlocked},
    doReset(layer) {
        if (layer == this.layer) {
            // points
            player.points = new Decimal(0)
        }
    },    
    getResetGain() {
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        let ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    automate(delta) {
        // auto buyables
        let to_buy = []
        if (hasMilestone("b", 4)) to_buy.push(11, 12, 13)
        for(let i = 0; i < to_buy.length; i++) {
            if (tmp.a.buyables[to_buy[i]].canAfford && getBuyableAmount("a", to_buy[i]).lt(tmp.a.buyables[to_buy[i]].purchaseLimit)) setBuyableAmount("a", to_buy[i], getBuyableAmount("a", to_buy[i]).add(1))
        }
    },
    passiveGeneration(){
        let gain = 0
        if (hasMilestone("b", 2)) {
            gain = 0.01
            let pow = hasMilestone("b", 4) ? 2 : 1
            gain = gain * player.b.milestones.length ** pow
            gain = gain * hasMilestone("b", 5) ? 2.778 : 1
        }
        return gain
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
        },
        34: {
            title: "Alpha-34",
            cost: new Decimal("1e40"),
            description: "Unlock another layer",
            unlocked() {return hasUpgrade("a", 24) || hasUpgrade(this.layer, this.id)},
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
                ["display-text", function(){return "You have " + format(tmp[this.layer].baseAmount) + " " + tmp[this.layer].baseResource}],
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
        resetTime: new Decimal(0),
        unlocked: false
    }},
    color: "#3F3FFF",
    requires: new Decimal(1000), // Can be a function that takes requirement increases into account
    resource: "beta points", // Name of prestige currency
    baseResource: "alpha points", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.3, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)

        // gamma layer
        if (player.g.unlocked) mult = mult.mul(tmp.g.effect.othereff)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    getResetGain() {
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        let ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    branches: ["a"],
    layerShown() {return hasUpgrade("a", 33) || player.b.unlocked},
    doReset(layer) {
        if (layer == this.layer){
            // alpha layer
            // milestones
            let keep_a_m = []

            // upgrades
            let keep_a_u = []
            if (hasUpgrade("a", 33)) keep_a_u.push(33) 
            if (hasUpgrade("a", 34)) keep_a_u.push(34) 
            if (hasMilestone("b", 0)) keep_a_u.push(11, 12, 13)
            if (hasMilestone("b", 1)) keep_a_u.push(21, 22, 23)
            if (hasMilestone("b", 3)) keep_a_u.push(31, 32)
            if (hasMilestone("b", 5)) keep_a_u.push(14, 24)
            
            // reset
            layerDataReset("a")
            player.a.milestones = keep_a_m
            player.a.upgrades = keep_a_u

            // points
            player.points = new Decimal(0)
        }
    },
    passiveGeneration(){
        let gain = 0
        return gain
    },
    automate(delta) {
        // auto buyables
        let to_buy = []
        
        for (let i = 0; i < to_buy.length; i++) {
            if (tmp.a.buyables[to_buy[i]].canAfford && getBuyableAmount("a", to_buy[i]).lt(tmp.a.buyables[to_buy[i]].purchaseLimit)) setBuyableAmount("a", to_buy[i], getBuyableAmount("a", to_buy[i]).add(1))
        }
    },
    effect() {
        let pointeff = player.b.best.add(1).log(10).add(1)
        
        let poeffexp = new Decimal(3)
        if (hasUpgrade("b", 11)) poeffexp = poeffexp.add(1)
        if (maxedChallenge("b", 13)) poeffexp = poeffexp.add(2)

        pointeff = pointeff.pow(poeffexp)

        let othereff = player.b.best.add(1).log(10).add(1)

        let otherexp = new Decimal(2)
        if (hasUpgrade("b", 11)) otherexp = otherexp.add(1)
        if (maxedChallenge("b", 13)) alphaexp = otherexp.add(2)
        
        othereff = othereff.pow(otherexp)

        return {
            pointeff: pointeff,
            alphaeff: othereff
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
            effectDescription: "Autobuys the first 3 alpha buyables automagically for free<br>and boost beta milestone 3 to per beta milestone<sup>2</sup>",
            done() { return player.b.total.gte(1000) }
        },
        5: {
            requirementDescription: "1e13 total beta points",
            effectDescription: "Gives Alpha-14 and Alpha-24 on reset<br> and boost beta milestone 3 effect by x2.778",
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
            description: "Unlock a challenge",
            unlocked() {return hasUpgrade("b", 33) && player.b.total.gt(7500) || hasUpgrade(this.layer, this.id)}
        },
        42: {
            title: "Beta-42",
            cost: new Decimal(100000),
            description: "Unlock another challenge",
            unlocked() {return maxedChallenge("b", 11) || hasUpgrade(this.layer, this.id)}
        },
        43: {
            title: "Beta-43",
            cost: new Decimal(1000000),
            description: "Unlock another challenge",
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
            rewardDescription: "x2 to Alpha-b12's purchase limit and +2 to both beta effect exponents",
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
                ["display-text", function(){return "You have " + format(tmp[this.layer].baseAmount) + " " + tmp[this.layer].baseResource}],
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

addLayer("g", {
    name: "gamma points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "γ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        total: new Decimal(0),
        best: new Decimal(0),
        points: new Decimal(0),
        resetTime: 0,
        unlocked: false,
        radioactivity: {
            points: new Decimal(0),
            sample_hp: new Decimal(0)
        },
    }},
    color: "#FF3F3F",
    requires: new Decimal("1e13"), // Can be a function that takes requirement increases into account
    resource: "gamma points", // Name of prestige currency
    baseResource: "beta points", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.1, // Prestige currency exponent
    branches: ["b"],
    gainMult() { // Calculate the multiplier for main currency from bonuses
        // base
        mult = new Decimal(1)

        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    getResetGain() {
        let base = tmp[this.layer].baseAmount.div(tmp[this.layer].requires).pow(tmp[this.layer].exponent)

        let ret = base
        ret = ret.pow(tmp[this.layer].gainExp)
        ret = ret.mul(tmp[this.layer].gainMult)
        return ret
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown() {return hasUpgrade("a", 34) || player[this.layer].unlocked},
    doReset(layer) {
        if (layer == this.layer){
            // beta layer
            // milestones
            let keep_b_m = []
            if (hasMilestone("g", 0)) keep_b_m.push(0, 1, 3)
            if (hasMilestone("g", 1)) keep_b_m.push(2)

            // upgrades
            let keep_b_u = []
            if (hasMilestone("g", 2)) keep_b_u.push(11, 12, 13, 21, 22, 23, 31, 32, 33)
            
            // reset
            layerDataReset("b")
            player.b.milestones = keep_b_m
            player.b.upgrades = keep_b_u

            // alpha layer
            // milestones
            let keep_a_m = []

            // upgrades
            let keep_a_u = []
            keep_a_u.push(33, 34)
            if (hasMilestone("g", 0)) keep_a_u.push(11, 12, 13, 21, 22, 23, 31, 32)
            
            // reset
            layerDataReset("a")
            player.a.milestones = keep_a_m
            player.a.upgrades = keep_a_u

            // points
            player.points = new Decimal(0)
        }
    },    
    automate() {
        // auto buyables
        let to_buy = []
        for (let i = 0; i < to_buy.length; i++) {
            if (tmp.a.buyables[to_buy[i]].canAfford && getBuyableAmount("a", to_buy[i]).lt(tmp.a.buyables[to_buy[i]].purchaseLimit)) setBuyableAmount("a", to_buy[i], getBuyableAmount("a", to_buy[i]).add(1))
        }
    },
    update(delta) {
        if (hasUpgrade("g", 11)) {
            let div = new Decimal(2)
            div = div.pow(new Decimal(2).ln().div(tmp.g.sampleHalfLife).mul(delta))
            player.g.radioactivity.sample_hp = player.g.radioactivity.sample_hp.div(div)
        }
    },
    passiveGeneration(){
        let gain = 0
        return gain
    },
    effect() {
        let pointeff = player.g.best.add(1).log(10).add(1)        
        let poeffexp = new Decimal(10)
        pointeff = pointeff.pow(poeffexp)

        let othereff = player.g.best.add(1).log(10).add(1)
        let otherexp = new Decimal(4)      
        othereff = othereff.pow(otherexp)

        let decayeff = player.g.radioactivity.points.add(1).log(10).add(1).log(10).div(5).add(1)
        return {
            pointeff: pointeff,
            othereff: othereff,
            decayeff: decayeff,
        }
    },
    effectDescription() {
        ret = ""
        ret += "which are multiplying point gain by " + format(tmp.g.effect.pointeff)
        ret += " and alpha and beta point gain by " + format(tmp.g.effect.othereff)
        ret += "."
        return ret
    },
    sampleHalfLife(){
        let ret = new Decimal(10)
        if (hasUpgrade("g", 21)) ret = ret.div(upgradeEffect("g", 21))
        return ret
    },
    decayGainMult(){
        let ret = new Decimal(1)
        return ret
    },
    milestones: {
        0: {
            requirementDescription: "1 total gamma points",
            effectDescription: "Gives the first 8 alpha upgrades and beta milestone 1, 2, 4 on reset",
            done() { return player.g.total.gte(1) }
        },
        1: {
            requirementDescription: "2 total gamma points",
            effectDescription: "Gives beta milestone 3 on reset",
            done() { return player.g.total.gte(2) }
        },
        2: {
            requirementDescription: "4 total gamma points",
            effectDescription: "Gives the first 9 beta upgrades on reset",
            done() { return player.g.total.gte(4) }
        },
    },
    upgrades:{
        11: {
            title: "Gamma-11",
            cost: new Decimal(1),
            description: "Unlock a new tab",
            unlocked() {return player.g.total.gte(3) || hasUpgrade(this.layer, this.id)}
        },
        21: {
            title: "Decay-11",
            price: new Decimal(3),
            currencyDisplayName: "Decay points",
            canAfford() { return player.g.radioactivity.points.gt(this.price)},
            pay() {
                player.g.radioactivity.points = player.g.radioactivity.points.sub(this.price)
            },
            description: "Unlock alpha decay",
            fullDisplay(){
                let ret = "<span><span><h3>"
                ret += this.title
                ret += "</h3><br></span><span>"
                ret += this.description
                ret += "</span><br><br>"
                ret += "Cost: 3 Decay points"
                ret += "</span>"
                return ret
            },
            effect() {
                let ret = new Decimal(1)
                
                ret = ret.mul(player.a.points.div(new Decimal("1e40")).add(1).log(10).div(10).pow(0.5).add(1))
                if (ret.gt(5)) ret = ret.pow(0.5).mul(10).sub(5)

                return ret
            },
            unlocked() {return player.g.radioactivity.points.gte(1)}
        }
    },
    buyables: {
        11: {
            cost(x) {return new Decimal(4)},
            title() {return "Sample"},
            display() {
                let ret = ""
                ret += "<br>"
                ret += "Current atom count: " + format(player.g.radioactivity.sample_hp.floor()) + "/" + format(tmp.g.buyables[11].cost)
                ret += "<br> ETA to finish: " + formatTime(player.g.radioactivity.sample_hp.log(2).mul(tmp.g.sampleHalfLife).max(0))
                if (player.g.radioactivity.sample_hp.lt(1)) ret += "<br>Finish sample and get a new one"

                return ret
            },
            canAfford() {return player.g.radioactivity.sample_hp.lt(1)},
            buy() {
                player.g.radioactivity.points = player.g.radioactivity.points.add(1)
                player.g.radioactivity.sample_hp = tmp.g.buyables[11].cost
            },

        }
    },
    tabFormat: {
        "Main": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "blank",
                ["display-text", function(){return "You have " + format(tmp[this.layer].baseAmount) + " " + tmp[this.layer].baseResource}],
                "blank",
                ["upgrades", [1]]
            ],
            unlocked: true
        },
        "Milestones": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "blank",
                ["display-text", function(){return "You have " + format(tmp[this.layer].baseAmount) + " " + tmp[this.layer].baseResource}],
                "blank",
                "milestones"
            ],
            unlocked: true
        },
        "Radioactivity": {
            content: [
                "main-display",
                ["prestige-button","",true],
                "blank",
                ["display-text", function(){return "You have " + format(tmp[this.layer].baseAmount) + " " + tmp[this.layer].baseResource}],
                "blank",
                ["microtabs","radioactivity"]
            ],
            unlocked() { return hasUpgrade("g", 11)}
        },
    },
    microtabs: {
        radioactivity: {
            Decay: {
                content: [
                    ["display-text", function() {
                        let ret = ""
                        ret += "You have " + format(player.g.radioactivity.points) + " decay points which is boosting point gain by ^" + format(tmp.g.effect.decayeff, 5)
                        ret += "<br>The current half-life of the sample is " + formatTime(tmp.g.sampleHalfLife)
                        ret += hasUpgrade("g", 21) ? "<br><br>Due to alpha decay your alpha points are reducing half life by /" + format(upgradeEffect("g", 21), 4) : ""
                        return ret
                    }],
                    ["buyables", [1]],
                    "blank",
                    ["upgrades", [2]]
                ]
            },
            Info: {
                content: [
                    ["display-text", function() {
                        let ret = ""
                        ret += "Decay samples to gain Decay points"
                        ret += "<br>Base Decay point gain is 1 per sample"
                        return ret
                    }]
                ]
            }
        }
    },
    hotkeys: [
        {key: "g", description: "G: Reset for gamma points", onPress() {if (canReset(this.layer)) doReset(this.layer)}},
    ]
})
