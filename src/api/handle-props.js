import { css } from "goober";
import { concat } from "./concat";

export const handleProps = props => {
    const spread = {};

    // TODO(cristianbote): Maybe figure out a smarter way?
    if ('onPress' in props) {
        spread.onClickCapture = props.onPress;
        delete props.onPress;
    }

    if ('style' in props) {
        spread.className = concat(props.style);
        delete props.style;
    }

    if ('className' in props) {
        spread.className = `${props.className} ${spread.className || ''}`.trim();
    }

    // This basically means that we need to define some styling for the flex thing
    if ('flex' in props) {
        const flexClassName = css({
            flex: props.flex || 1,
            flexDirection: 'column',
            display: 'flex',
            overflow: 'hidden'
        });
        spread.className = `${spread.className || ''} ${flexClassName}`.trim();
        delete props.flex;
    }
    return Object.assign({}, props || {}, spread);
};