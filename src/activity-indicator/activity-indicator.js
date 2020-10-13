import { h } from 'preact';
import { View } from '../core/view';

const localStyles = {
    shell: {
        display: 'flex',
        position: 'relative',
        width: '4rem',
        height: '4rem'
    },
    circle: {
        display: 'flex',
        border: '4px solid currentColor',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        borderColor: 'currentColor transparent transparent transparent',
        width: '4rem',
        height: '4rem'
    },
    center: {
        alignSelf: 'center'
    }
};

export const ActivityIndicator = ({ color, center, styles, ...props }) => (
    <View style={[localStyles.shell, color && { color }, center && localStyles.center, styles]} {...props}>
        <View style={localStyles.circle} />
    </View>
);
