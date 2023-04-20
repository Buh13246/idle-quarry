
import { writable, get } from 'svelte/store';
import { miningUpgrades } from './mining';
import { miningUpgradeLevels, wallet } from './player';

function single(context: any) {
    // @ts-ignore
    const {subscribe, set, update} = writable(context);
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
function array(context: any) {
    // @ts-ignore
    const {subscribe, set, update} = writable(context);
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
    const {subscribe, set, update} = writable(context);
    return {
        subscribe,
        set(obj: object) {
            update((i: any) => {
                i = obj;
                return i;
            })
        },
        setItem(item: string, amt: any) {
            update((i: any) => {
                i[item.toString().toLowerCase()] = amt;
                return i;
            })
        },
        add(item: string, amt: any) {
            update((i: any) => {
                i[item.toString().toLowerCase()] += amt;
                return i;
            })
        },
        sub(item: string | number, amt: any, negatable = false) {
            update((i: any) => {
                if (negatable) i[item] -= amt;
                else i[item.toString().toLowerCase()] = Math.max(i[item],0);
                return i;
            })
        },
        multiply(item: string | number, amt: any) {
            update((i: any) => {
                i[item.toString().toLowerCase()] *= amt;
                return i;
            })
        },
        divide(item: string | number, amt: any) {         
            update((i: any) => {
                i[item.toString().toLowerCase()] /= amt;
                return i;
            })
        }
    }
}

// same as object with additional methods
function dropTable(context: any) {
    // @ts-ignore
    const {subscribe, set, update } = writable(context);
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
        },
        updateTable() {
            update((i: any) => {
                for (let [item, val] of Object.entries(i)) {
                    console.log(item, val)
                    console.log(get(miningUpgradeLevels));
                    i[item]= [
                        Math.min(1,val[0] * (get(miningUpgrades)[2]['formula'](get(miningUpgradeLevels)[2]))),
                        val[1], 
                        val[2]
                    ]
                }
                return i;
            })
        }
    }
}


export const beaconPower = single(0);

export const beaconNums = array(Array(10).fill([100,1.025]).concat(Array(10).fill([2000,1.03])).concat(Array(10).fill([10000,1.04])))

export const beaconBonuses = array(Array(30).fill(0))

// for reference
export const beaconNameText = array([
    'Beacon Power Multiplier',
    'Mining Progress Multiplier',
    '[I] Droprate Multiplier'].concat(Array(27).fill(''))
)

export const beaconFormulas = array([
    function(lv: number) {return 1 + (Math.pow(lv,0.3) * 0.01)},
    function(lv: number) {return 1 + (Math.pow(lv,0.15) * (Math.log(lv)/Math.log(2) * 0.004))},
    function(lv: number) {return (lv > 100000 ? 12.07+Math.pow(lv-100000, 0.075) : 1 + (Math.pow(lv,0.3)*0.35))}]
    .concat(Array(27).fill(function(lv: number) {return 1}))
)

export const beaconNextReqs = array(Array(10).fill(100).concat(Array(10).fill(2000)).concat(Array(10).fill(10000)))

export const beaconAmt = single(1);

export const beaconUpgrades = array([{
    name: 'Supercharged',
    description: 'Increases all beacon path progress.',
    cost: {
        beaconPower: 5000,
    },
    ratio: 1.5,
    formula: (lv: any) => (1+Math.pow(lv,0.85)*0.33),
    isPercent: true,
    prefix: '+',
    maxLevel: 300,
    notes: '0.25*lv until 36, (lv-36)*0.025 until 916, sqrt(lv-916)*0.025 after'
},])