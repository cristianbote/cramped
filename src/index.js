import { createElement, cloneElement, Fragment } from 'react';
import { Modal } from './modal/modal';
import { Picker } from './picker/picker';
import { ActivityIndicator } from './activity-indicator/activity-indicator';
import { PanResponder } from './pan-responder/pan-responder';
import { concat } from './api/concat';
import { handleProps } from './api/handle-props';
import { View } from './core/view';

const PixelRatio = {
    getPixelSizeForLayoutSize: val => `${val / 8}rem`,
    roundToNearestPixel: val => {
        if (typeof val === 'string') {
            return val;
        }

        return `${val}px`;
    },
    get: () => 2
};

const Dimensions = {
    get(context) {
        switch (context) {
            case 'window': {
                return {
                    width: typeof window === 'undefined' ? 414 : window.innerWidth,
                    height: typeof window === 'undefined' ? 414 : window.innerHeight
                };
            }
        }
    }
};

const flattenObject = value => {
    const keys = Object.keys(value);

    return keys
        .map(key => {
            return `${key}(${value[key]})`;
        })
        .join(' ');
};

const stlyeTransformers = [
    // transforms and list
    entry => {
        for (let prop in entry) {
            const val = entry[prop];

            if (Array.isArray(val)) {
                if (prop === 'transform') {
                    entry[prop] = val.map(flattenObject).join(' ');
                } else {
                    entry[prop] = val.join(' ');
                }
            }
        }
    },

    // shadow to boxShadow
    entry => {
        let collected = null;
        for (let prop in entry) {
            if (/^(shadow|elevation)/.test(prop)) {
                collected = collected || {};
                collected[prop] = entry[prop];
                delete entry[prop];
            }
        }

        if (collected) {
            if (collected.shadowOpacity) {
                const [r, g, b] = collected.shadowColor.match(/\d+/g);
                collected.shadowColor = `rgba(${r}, ${g}, ${b}, ${collected.shadowOpacity})`;
            }

            const shadowOffset = collected.shadowOffset || {};

            const height = (shadowOffset.height || 0) + (/em$/.test(shadowOffset.height) ? '' : 'px');
            const width = (shadowOffset.width || 0) + (/em$/.test(shadowOffset.width) ? '' : 'px');
            const radius = (collected.shadowRadius || 0) + (/em$/.test(collected.shadowRadius) ? '' : 'px');

            entry.boxShadow = `${width} ${height} ${radius} ${collected.shadowColor}`;
        }
    },

    // horizontal and vertical
    entry => {
        const horizontalRule = /horizontal/i;
        const verticalRule = /vertical/i;

        for (let prop in entry) {
            if (horizontalRule.test(prop)) {
                const prefix = prop.replace(horizontalRule, '');
                entry[`${prefix}Left`] = entry[`${prefix}Right`] = entry[prop];
                delete entry[prop];
            }

            if (verticalRule.test(prop)) {
                const prefix = prop.replace(verticalRule, '');
                entry[`${prefix}Top`] = entry[`${prefix}Bottom`] = entry[prop];
                delete entry[prop];
            }
        }
    },

    // Border for web
    entry => {
        if ('borderWidth' in entry && !('borderStyle' in entry)) {
            entry.borderStyle = 'solid';
        }

        const directionalRule = /border([A-Z]+[a-z]+)Color/g;

        for (const prop in entry) {
            const match = directionalRule.exec(prop);

            if (match && !entry[`border${match[1]}Style`]) {
                entry[`border${match[1]}Style`] = 'solid';
            }
        }
    },

    // Start/end
    entry => {
        const rule = /(end|start)/i;
        for (let prop in entry) {
            const res = rule.exec(prop);
            if (rule.test(prop)) {
                entry[prop.replace(res[0], res[0] === 'Start' ? 'Left' : 'Right')] = entry[prop];
                delete entry[prop];
            }
        }
    },

    // Auto define display: flex;
    entry => {
        const rule = /^(fl|al|ju)/i;
        const hasDisplaySetToFlex = entry.display && entry.display === 'flex';

        if (!hasDisplaySetToFlex) {
            let hasFlexRelatedProperties = false;
            for (let prop in entry) {
                if (rule.test(prop)) {
                    hasFlexRelatedProperties = true;
                }
            }

            if (hasFlexRelatedProperties) {
                Object.assign(entry, {
                    display: 'flex'
                });
            }
        }
    }
];

const StyleSheet = {
    flatten(list) {
        return list.reduce((out, item) => {
            if (!item) {
                return out;
            }

            if (Array.isArray(item)) {
                return Object.assign(out, StyleSheet.flatten(item));
            }

            return Object.assign(out, item);
        }, {});
    },
    create(entries) {
        const map = {};

        for (const name in entries) {
            const entry = entries[name];

            // Gotta have transformers
            stlyeTransformers.forEach(fn => fn(entry));

            map[name] = entry;
        }

        return map;
    },
    absoluteFillObject: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1
    }
};

const Platform = {
    OS: 'web',
    select: val => (val && 'web' in val ? val.web : val.default)
};
const Primitive = ({ tag: Tag = 'span', ...props }) => {
    const spread = handleProps(props);
    return <Tag {...spread}>{props.children}</Tag>;
};

const TextInput = ({ style, onChangeText, onSubmitEditing, ...props }) => {
    const handlers = {};

    if (onSubmitEditing) {
        handlers.onKeyDown = e => {
            if (e.keyCode === 13) {
                onSubmitEditing();
            }
        };
    }

    return <input className={concat(style)} onChange={onChangeText} {...props} {...handlers} />;
};

const Passthrough = ({ children, ...props }) => {
    const spread = handleProps(props);
    return cloneElement(children, spread);
};

const btn = {
    cursor: 'pointer',
    border: 0,
    outline: 0,
    background: 'none',
    margin: 0,
    padding: 0
};

const Button = ({ children, style, ...props }) => {
    const spread = handleProps({ style: [btn].concat(style), ...props });
    return <button {...spread}>{children}</button>;
};

const Empty = () => null;

const StatusBar = Empty;
const RefreshControl = Empty;
const Linking = Empty;
const InteractionManager = Passthrough;
const KeyboardAvoidingView = Passthrough;

const styles = StyleSheet.create({
    scrollView: {
        flexDirection: 'column',
        display: 'flex',
        overflow: 'auto',
        flexShrink: 0
    },
    scrollViewHorizontal: {
        width: '100%',
        flexDirection: 'row'
    },
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
    },
    containerHorizontal: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row'
    }
});

const ScrollView = ({ style, contentContainerStyle, horizontal, children }) => {
    return (
        <View style={[styles.scrollView, style, horizontal && styles.scrollViewHorizontal]}>
            <View style={[horizontal ? styles.containerHorizontal : styles.container, contentContainerStyle]}>
                {children}
            </View>
        </View>
    );
};

const chunk = (data, len) => {
    return Array.from(
        {
            length: Math.ceil(data.length / len)
        },
        (_, i) => {
            return data.slice(i * len, i * len + len);
        }
    );
};

const renderReferenceOrFunction = Value => {
    if (typeof Value === 'function') {
        return <Value />;
    }

    return Value;
};

const RNPickerSelect = Primitive;

const FlatList = ({
    ListHeaderComponent,
    ListFooterComponent,
    ItemSeparatorComponent,
    renderItem,
    ListItemComponent,
    data,
    numColumns,
    style,
    forceScroll,
    columnWrapperStyle,
    ...props
}) => {
    const feed = numColumns && numColumns > 1 ? chunk(data, numColumns) : data || [];

    const children = feed.map((item, i) => {
        if (Array.isArray(item)) {
            return (
                <View style={[columnWrapperStyle, { display: 'flex', flexDirection: 'row' }]}>
                    {item.map((inner, j) => renderItem({ item: inner, index: i.toString() + j }))}
                </View>
            );
        }

        if (ListItemComponent) {
            return <ListItemComponent item={item} />;
        }

        return renderItem({ item, index: i });
    });

    return (
        <>
            {renderReferenceOrFunction(ListHeaderComponent)}
            <ScrollView style={[style, forceScroll && { flexShrink: 1 }]} {...props}>
                {children.map((item, i) =>
                    ItemSeparatorComponent && i !== children.length - 1
                        ? [item, <ItemSeparatorComponent key={i} />]
                        : item
                )}
            </ScrollView>
            {renderReferenceOrFunction(ListFooterComponent)}
        </>
    );
};

const SectionList = ({
    renderItem,
    renderSectionHeader,
    ItemSeparatorComponent,
    ListFooterComponent,
    sections,
    ...props
}) => {
    return (
        <ScrollView {...props}>
            {sections.map(section => {
                return (
                    <>
                        {renderSectionHeader && renderSectionHeader({ section: section })}
                        {section.data &&
                            section.data.map((item, j) => {
                                return (
                                    <>
                                        {j !== 0 ? <ItemSeparatorComponent /> : null}
                                        {renderItem({ item: item, index: j })}
                                    </>
                                );
                            })}
                    </>
                );
            })}
            <ListFooterComponent />
        </ScrollView>
    );
};

const Image = props => {
    if (props.webp) {
        return (
            <picture>
                <source srcset={props.webp} type="image/webp" />
                <img
                    className={concat(props.style)}
                    src={props.source ? props.source.uri : undefined || props.source}
                    {...props}
                />
            </picture>
        );
    }
    return (
        <img
            className={concat(props.style)}
            src={props.source ? props.source.uri : undefined || props.source}
            {...props}
        />
    );
};

const ImageBackground = Primitive;
const Text = Primitive;
const TouchableWithoutFeedback = Passthrough;
const TouchableOpacity = Button;
const TouchableNativeFeedback = Button;
const TouchableHighlight = Button;
const SafeAreaView = View;
const Alert = {
    alert: msg => alert(msg)
};

const I18nManager = {
    isRTL: false,
    forceRTL: val => {
        I18nManager.isRTL = val;
    }
};

const Switch = Primitive;
const Animated = {
    event: function() {},
    parallel: function(entries) {
        const maxDuration = entries.reduce((out, item) => {
            return Math.max(out, item.config.duration);
        }, 0);

        return {
            start(endCallback) {
                setTimeout(endCallback, maxDuration);
            }
        };
    },
    timing: function(ref, config) {
        return { ref, config };
    },
    Value: function Value(val) {
        this.interpolate = function() {
            return val;
        };
    },
    View,
    FlatList
};
const BackHandler = {};
const Keyboard = {
    dismiss: () => {}
};
const LayoutAnimation = {
    easeInEaseOut: () => {},
    // eslint-disable-next-line no-unused-vars
    configureNext: ({ duration, update }) => {}
};

const Easing = {};

export {
    Alert,
    ActivityIndicator,
    Modal,
    Picker,
    BackHandler,
    Keyboard,
    LayoutAnimation,
    Animated,
    Platform,
    Dimensions,
    StyleSheet,
    Image,
    ImageBackground,
    PixelRatio,
    View,
    KeyboardAvoidingView,
    ScrollView,
    FlatList,
    SafeAreaView,
    I18nManager,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    TouchableOpacity,
    TouchableNativeFeedback,
    Switch,
    SectionList,
    StatusBar,
    RefreshControl,
    Linking,
    InteractionManager,
    TouchableHighlight,
    Easing,
    PanResponder
};
