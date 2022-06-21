addLayer("a", {
    name: "alpha points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "α", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "alpha points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        mult = mult.mul(tmp.a.upgrades[21].effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "a", description: "A: Reset for alpha points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            title: "Alpha-11",
            cost: new Decimal(1),
            description: "Boost point gain based on alpha points",
            effect(){
                let ret = new Decimal(1)
                ret = ret.mul(player.a.points.add(1).log(10).add(1))
                if (hasUpgrade("a",12)) ret = ret.pow(tmp.a.upgrades[12].effect)
                return ret
            },
            effectDisplay(){
                return format(tmp.a.upgrades[11].effect) + "x"
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
                if (hasUpgrade("a",13)) ret = ret.mul(tmp.a.upgrades[13].effect)

                let hardcap = new Decimal(2)
                if (hasUpgrade("a",13)) hardcap = hardcap.add(1)
                ret = ret.min(hardcap)
                return ret
            },
            effectDisplay(){
                return "^" + format(tmp.a.upgrades[12].effect)
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
                return format(tmp.a.upgrades[13].effect) + "x"
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
                if (hasUpgrade("a",22)) ret = ret.mul(tmp.a.upgrades[22].effect)
                return ret
            },
            effectDisplay(){
                return format(tmp.a.upgrades[21].effect) + "x"
            },
            unlocked(){return hasUpgrade("a",11)}
        },
        22: {
            title: "Alpha-22",
            cost: new Decimal(10),
            description: "Boost Alpha-21 based on points",
            effect(){
                let ret = new Decimal(1)
                ret = ret.mul(player.a.points.add(1).log(10).add(1).pow(0.3))
                return ret
            },
            effectDisplay(){
                return format(tmp.a.upgrades[22].effect) + "x"
            },
            unlocked(){return hasUpgrade("a",21)}
        }
    },
})
