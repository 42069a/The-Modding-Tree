let modInfo = {
	name: "The Tree of greek letters",
	id: "42069",
	author: "42069",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js", "math_support.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(0), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0.5.1",
	name: "speed up",
}

let changelog = `
<h1>Changelog:</h1><br>
	<h2>Endgame: 4 decay upgrades</h2><br>
	<h3>v0.0.1</h3><br>
		- Added alpha layer.<br>
		- Added 5 upgrades.<br>
	<h3>v0.0.2</h3><br>
		- Added beta layer.<br>
		- Added 3 upgrades.<br>
		- Added 2 buyables.<br>
	<h3>v0.0.3</h3><br>
		- Added 3 milestones.<br>
		- Added 2 upgrades.<br>
		- Added 1 buyable.<br>
	<h3>v0.0.4</h3><br>
		- Added 3 milestones.<br>
		- Added 12 upgrades.<br>
		- Added 3 challenges.<br>
	<h3>v0.0.5</h3><br>
		- Added gamma layer.<br>
		- Added radioactivity.<br>
		- Added 2 upgrades.<br>
	<h3>v0.0.5.1</h3><br>
		- Did some rebalancing.<br>
		- Added 2 upgrades.<br>
`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)
	
	let gain = new Decimal(1)
	if (hasUpgrade("a", 11)) gain = gain.mul(upgradeEffect("a", 11))
	gain = gain.mul(buyableEffect("a", 11))
	if (player.a.unlocked) gain = gain.mul(tmp.a.effect.pointeff)
	if (player.b.unlocked) gain = gain.mul(tmp.b.effect.pointeff)
	if (player.g.unlocked) gain = gain.mul(tmp.g.effect.pointeff)
	
	gain = gain.pow(tmp.g.effect.decayeff)
	if (inChallenge("b", 11)) gain = gain.pow(0.5)
	if (inChallenge("b", 12)) gain = gain.pow(0.5)
	if (inChallenge("b", 13)) gain = gain.pow(0.5)

	return gain
}
// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return hasUpgrade("g", 31)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}