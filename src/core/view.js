import { createElement } from 'react';
import { handleProps } from "../api/handle-props";

export const View = ({ children, ...props }) => {
    const spread = handleProps(props);
    return <div {...spread}>{children}</div>;
};