
export namespace lMath {
    export function random(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    let lseed = 5;
    export function randomSeed(seed: number) {
        lseed = seed;
    }
    export function lrandom(min: number, max: number) {
        max = max || 1;
        min = min || 0;
        lseed = (lseed * 9301 + 49297) % 233280;
        var rnd = lseed / 233280.0;
        return min + rnd * (max - min);
    }
} 
