function buyableBaseSoftcap(base, power = 2){
    base = new Decimal(base)
    power = new Decimal(power)
    if (base.gte(1)) return base
    return base.sub(1).div(power).exp()
}