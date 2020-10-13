import { concat } from '../api/concat';
import { useState, useRef, useEffect } from 'preact/hooks';

const Picker = ({ style, children, items, onValueChange, ...props }) => {
    const [showItems, setShowItems] = useState(false);
    const outerDiv = useRef();

    const handleClick = e => {
        if (outerDiv.current.contains(e.target)) {
            // inside click
            return;
        }
        // outside click
        setShowItems(false);
    };

    useEffect(() => {
        // add when mounted
        document.addEventListener('mousedown', handleClick);
        // return function to be called when unmounted
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, []);
    const className = concat(style);
    const dropdownContent = {
        position: 'absolute',
        right: 'auto',
        left: 'auto',
        backgroundColor: '#f1f1f1',
        minWidth: '160px',
        overFlow: 'auto',
        boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
        zIndex: '1'
    };

    return (
        <div ref={outerDiv}>
            <div
                onClick={() => {
                    setShowItems(!showItems);
                }}
            >
                {children}
            </div>

            <div className={className} style={dropdownContent} {...props}>
                {showItems &&
                    items.map(item => {
                        return (
                            <a
                                onClick={() => {
                                    onValueChange(item.value);
                                    setShowItems(false);
                                }}
                                value={item.value}
                                {...props}
                            >
                                {item.label}
                            </a>
                        );
                    })}
            </div>
        </div>
    );
};

export { Picker };
