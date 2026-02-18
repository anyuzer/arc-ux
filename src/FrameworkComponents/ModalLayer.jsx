import React, { Fragment } from 'react';
import withArcUX from "../withArcUX.js";

class ModalLayer extends React.Component {
    render() {
        return (
            <div style={{
                position: 'fixed',
                zIndex: 800,
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
                display: "flex",
                alignContent: "stretch"
            }}>
                <div
                    onClick={() => { this.props.ArcUX.emit('modal:close', []); }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                        backgroundColor: 'black',
                        cursor: 'pointer',
                        opacity: 0.7
                    }}
                />
                {this.props.children}
            </div>
        );
    }
}

export default withArcUX(ModalLayer);
