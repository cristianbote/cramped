import { css } from 'goober';

function flatDeep(arr, d = 1) {
    return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
                 : arr.slice();
 }

export const concat = (...styles) =>
    flatDeep(styles, Infinity)
        .map((item, i) => {
            if (typeof item === 'object') {
                return css.call({ o: !i }, item);
            }

            return item;
        })
        .filter(Boolean)
        .join(' ')
        .trim();
