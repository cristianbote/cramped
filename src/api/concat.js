import { css } from 'goober';

export const concat = (...styles) =>
    styles
        .flat(Infinity)
        .map((item, i) => {
            if (typeof item === 'object') {
                return css.call({ o: !i }, item);
            }

            return item;
        })
        .filter(Boolean)
        .join(' ')
        .trim();
