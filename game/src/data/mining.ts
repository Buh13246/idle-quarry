
import { writable, get } from 'svelte/store';
import {wallet, miningUpgradeLevels, enchantUpgradeLevels} from './player'
import formula from '../calcs/formula';
import Decimal  from 'break_infinity.js';

function single(context: any) {
    // @ts-ignore
    const {subscribe, set, update, get} = writable(context);
    return {
        subscribe,
        set(amt: any) {
            update((i: any) => {
                i = amt;
                return amt;
            })
        },
        add(amt: any) {
            update((i) => {
                return i + amt;
            })
        },
        sub(amt: any, negatable = false) {
            update((i) => {
                if (negatable) return i - amt;
                else return Math.max(i,0);
            })
        },
        multiply(amt: any) {
            update(i => {
                return i * amt;
            })
        },
        divide(amt: any) {
            update(i => {
                return i / amt;
            })
        },
    }
}
function array(context: any) {
    // @ts-ignore
    const {subscribe, set, update, get} = writable(context);
    return {
        subscribe,
        set(amt: any) {
            update((i: any) => {
                i = amt;
                return amt;
            })
        },
        add(amt: any) {
            update((i: { plus: (arg0: any) => any; }) => {
                return i + amt;
            })
        },
        sub(amt: any, negatable = false) {
            update((i) => {
                if (negatable) return i - amt;
                else return Math.max(i,0);
            })
        },
        multiply(amt: any) {
            update(i => {
                return i * amt;
            })
        },
        divide(amt: any) {
            update(i => {
                return i / amt;
            })
        },
    }
}
function object(context: any) {
    // @ts-ignore
    const {subscribe, set, update, get} = writable(context);
    return {
        subscribe,
        set(item: string | number, amt: any) {
            update((i: any) => {
                i[item] = amt;
                return i;
            })
        },
        add(item: string | number, amt: any) {
            update((i: any) => {
                i[item] += amt;
                return i;
            })
        },
        sub(item: string | number, amt: any, negatable = false) {
            update((i: any) => {
                if (negatable) i[item] -= amt;
                else i[item] = Math.max(i[item],0);
                return i;
            })
        },
        multiply(item: string | number, amt: any) {
            update((i: any) => {
                i[item] *= amt;
                return i;
            })
        },
        divide(item: string | number, amt: any) {         
            update((i: any) => {
                i[item] /= amt;
                return i;
            })
        }
    }
}


const pow = (b: number, e: number) => Math.pow(b,e);
const log = (b: number, e: number) => Math.log(e)/Math.log(b);
const floor = (n: number) => Math.floor(n);
const ceil = (n: number) => Math.ceil(n);

export const progressThreshold = object({
    gems: 200,
    key1: 2000,
    key2: 500000,
})

// edit when changing the level of the haste upgrade
export const progressPerTick = single(1);


/* NOTE:
*  The cost of a specific item must be at least 1 to be imposed on the player.
*  If an upgrade should cost additional TYPES of resources at later levels, they must be added to the cost
*  object at a value of less than 1.
*/
export const miningUpgrades = array([{
    index: 0,
    name: 'Haste',
    description: 'Increases base mining speed.',
    cost: {
        gems: 5,
    },
    ratio: 1.15,
    formula: (lv: any) => lv * 0.1 + 1,
    unlockAt: () => (get(wallet)['gems'] >= 1),
    suffix: 'x speed',
    isPercent: false,
    maxLevel: 1000,
    notes: '0.25*lv until 36, (lv-36)*0.025 until 916, sqrt(lv-916)*0.025 after'
},
{
    index: 1,
    name: 'Efficiency',
    description: 'Increases gem yield. Improved after level 100.',
    cost: {
        gems: 10,
    },
    ratio: 1.15,
    unlockAt: () => (get(wallet)['gems'] >= 3 && get(miningUpgradeLevels)[0] >= 1),
    formula: (lv: any) => lv * Math.pow(1.05, Math.max(0, lv-100)),
    isPercent: false,
    prefix: '+',
    suffix: ' gems',
    maxLevel: 1000,
    notes: '(1 + floor(level/10)) * level^0.6'
},
// i = 2
{
    index: 2,
    name: 'Fortune',
    description: 'Improves droprates for common [*] items.',
    cost: {
        gold: 15
    },
    ratio: 1.33,
    unlockAt: () => (get(wallet)['gems'] > 30 && get(wallet)['gold'] > 5),
    formula: (lv: any) => 1 + Math.pow(lv, 0.85)*0.1,
    isPercent: true,
    prefix: '+',
    maxLevel: 300,
    notes: '(1 + floor(level/10)) * level^0.6'  
},
{
    index: 3,
    name: '[*] Key Finder',
    description: 'While mining, you will occasionally find a bundle of T1 [*] keys.' 
    + '\nUpgrades increase progress gained towards this milestone.',
    cost: {
        orbs: 15,
    },
    ratio: 1.5,
    unlockAt: () => (get(wallet)['orbs'] >= 1),
    formula: (lv: any) => (1 + Math.max(0,Math.pow(lv-1, 0.6)*0.15)),
    isPercent: false,
    suffix: 'x speed',
    maxLevel: 300,
    notes: '(1 + floor(level/10)) * level^0.6' 
},
{
    index: 4,
    name: '[**] Key Finder',
    description: 'While mining, you will occasionally find a bundle of T2 [**] keys.' 
    + '\nUpgrades increase progress gained towards this milestone.',
    cost: {
        orbs: 30000,
        beacons: 200
    },
    ratio: 1.5,
    unlockAt: () => (get(wallet)['orbs'] >= 1000 && get(miningUpgradeLevels)[3] >= 1) 
                    || get(wallet)['fame'] >= 10,
    formula: (lv: any) => (1 + Math.pow(lv, 0.5)*0.15),
    isPercent: false,
    suffix: 'x speed',
    maxLevel: 300,
    notes: '' 
},
// i = 5
{
    index: 5,
    name: 'Key Mastery',
    description: 'Increases the number of keys found when a Key Finder of any rarity triggers.',
    cost: {
        orbs: 1000,
        key1: 50,
        key2: 0.25,
        key3: 0.004
    },
    ratio: 1.2,
    unlockAt: () => (get(miningUpgradeLevels)[3] > 0),
    formula: (lv: any) => (1 + lv * 0.1),
    isPercent: false,
    suffix: 'x keys',
    maxLevel: 100,
    notes: ''
},
{
    index: 6,
    name: 'Lootmaster I',
    description: 'The first level unlocks a new tier of findable drops. Additional levels increase all drop rates.',
    cost: {
        gold: 400,
    },
    ratio: 1.25,
    unlockAt: () => (get(miningUpgradeLevels)[0] > 10 && get(miningUpgradeLevels)[1] > 10),
    formula: (lv: any) => ((1 + Math.max(0, Math.pow(lv-1, 0.325))) || 1),
    isPercent: false,
    suffix: 'x droprates',
    maxLevel: 100,
    notes: ''
},
{
    index: 7,
    name: 'Shiny',
    description: 'Gold drops are significantly improved.',
    cost: {
        gems: 1000,
    },
    ratio: 1.3,
    unlockAt: () => (get(miningUpgradeLevels)[0] > 10 && get(miningUpgradeLevels)[1] > 10),
    formula: (lv: any) => (1 + lv*0.5*pow(lv, 0.11)),
    isPercent: false,
    suffix: 'x gold from drops',
    maxLevel: 300,
    notes: ''
},
// i = 8
{
    index: 8,
    name: 'Efficiency II',
    description: 'Increases gem yield again.',
    cost: {
        gems: 2500,
    },
    ratio: 1.25,
    unlockAt: () => (get(miningUpgradeLevels)[0] > 10 && get(miningUpgradeLevels)[1] > 10),
    formula: (lv: any) => (1+Math.pow(lv,1.2)*0.1),
    isPercent: true,
    prefix: '+',
    suffix: ' gems',
    maxLevel: 300,
    notes: ''
},
{
    index: 9,
    name: 'Lootmaster II',
    description: 'Unlocks a new tier of findable drops.',
    cost: {
        gems: 2e7,
        gold: 4e5
    },
    ratio: 1.25,
    unlockAt: () => (get(wallet)['fame'] > 1 && get(miningUpgradeLevels)[6] >= 0.997),
    formula: (lv: any) => (0),
    isPercent: false,
    suffix: ' (no bonus)',
    maxLevel: 1,
    notes: ''
},
// i = 10
{
    index: 10,
    name: 'Expansive',
    description: 'Significantly improves gem gains.',
    cost: {
        fame: 5
    },
    ratio: 2,
    unlockAt: () => (get(wallet)['fame'] > 0),
    formula: (lv: any) => (1 + lv*1.5),
    isPercent: true,
    prefix: '+',
    suffix: ' gem bonus',
    maxLevel: 40,
    isFame: true,
    notes: 'index 10'
},
{
    index: 11,
    name: 'Clockwork',
    description: 'Significantly improves drop amounts.',
    cost: {
        fame: 5
    },
    ratio: 2,
    unlockAt: () => (get(wallet)['fame'] > 0),
    formula: (lv: any) => (1 + lv * 0.5),
    isPercent: false,
    suffix: 'x amount from drops',
    maxLevel: 40,
    isFame: true,
    notes: ''
},
// i = 12
{
    index: 12,
    name: 'Reflectors',
    description: 'Significantly improves beacon path progress.',
    cost: {
        fame: 15
    },
    ratio: 1.6,
    unlockAt: () => (get(wallet)['fame'] > 0),
    formula: (lv: any) => (1 + lv),
    isPercent: true,
    prefix: '+',
    suffix: ' beacon progress',
    maxLevel: 40,
    isFame: true,
    notes: 'index 10'
},
{
    index: 13,
    name: 'Mythical',
    description: 'Gain a small chance to gain 1 fame per mining cycle.',
    cost: {
        fame: 100
    },
    ratio: 1.3,
    unlockAt: () => (get(wallet)['fame'] > 0),
    formula: (lv: any) => (lv == 0 ? 1 
        : 1 + lv*0.025),
    isPercent: true,
    suffix: ' chance for fame gain',
    maxLevel: 40,
    isFame: true,
    notes: ''
},
{
    index: 14,
    name: 'Lootmaster III',
    description: 'Unlocks a new tier of findable drops.',
    cost: {
        fame: 7.5e6,
        beacons: 1e6,
        sigils: 10000,
        key3: 10
    },
    ratio: 1.6,
    unlockAt: () => (get(wallet)['fame'] > 0 && get(miningUpgradeLevels)[9] > 0.003),
    formula: (lv: any) => (0),
    isPercent: true,
    suffix: ' (no bonus)',
    maxLevel: 1,
    isFame: true,
    notes: ''
},
// i = 15
{
    index: 15,
    name: 'Overload',
    description: 'Drop chances above 100% increase the amount of drops.',
    cost: {
        fame: 500,

    },
    ratio: 200,
    unlockAt: () => (get(wallet)['totalFame'] > 200),
    formula: (lv: any) => (0),
    isPercent: true,
    suffix: '  (N/A)',
    maxLevel: 1,
    isFame: true,
    notes: 'index 15'
},
{
    index: 16,
    name: 'Legendary',
    description: 'Increases fame gain on relocation.',
    cost: {
        gems: 1e7,

    },
    ratio: 1.5,
    unlockAt: () => (get(wallet)['totalFame'] > 200),
    formula: (lv: any) => (1 + (lv * 0.13)),
    isPercent: true,
    suffix: '  fame bonus',
    maxLevel: 100,
    isFame: false,
    notes: 'index 16'
},
// i = 17
{
    index: 17,
    name: 'Legendary II',
    description: 'Increases fame gain on relocation.',
    cost: {
        gold: 1e6,

    },
    ratio: 1.5,
    unlockAt: () => (get(wallet)['totalFame'] > 200),
    formula: (lv: any) => (1 + (lv * 0.13)),
    isPercent: true,
    suffix: '  fame bonus',
    maxLevel: 100,
    isFame: false,
    notes: 'index 16'
},
{
    index: 18,
    name: '[***] Key Finder',
    description: 'While mining, you will occasionally find a bundle of T3 [***] keys.' 
    + '\nUpgrades increase progress gained towards this milestone.',
    cost: {
        orbs: 1e6,
        sigils: 2500
    },
    ratio: 1.5,
    unlockAt: () => (get(wallet)['key3'] > 0),
    formula: (lv: any) => (1 + Math.max(0,Math.pow(lv-1, 0.6)*0.15)),
    isPercent: false,
    suffix: 'x speed',
    maxLevel: 100,
    notes: '(1 + floor(level/10)) * level^0.6' 
},

]);

// if true, progress bars will be solid instead of flickering
export const antiFlickerFlags = object({
    gems: false,
    key1: false,
})

// for flavor text on mining page
export const gemGainFlavorText = single(0)
export const gemProgressFlavorText = single(0)
export const gemProgressFlavorNextUpdate = single(Date.now() + 500)