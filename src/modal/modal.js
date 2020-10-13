import { h } from 'preact';
import { css } from 'goober';

const Wrapper = css({
    position: 'fixed',
    height: '100%',
    width: '100%',
    zIndex: 1,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'hidden',
    display: 'flex'
});

const Backdrop = css({
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 0
});

export const Modal = ({ visible, children, onBackdropPress }) => {
    if (visible) {
        return (
            <div className={Wrapper}>
                <div className={Backdrop} onClickCapture={onBackdropPress} />
                {children}
            </div>
        );
    }

    return null;
};
