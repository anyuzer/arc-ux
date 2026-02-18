import React from 'react';
import ArcUX from "./ArcUX.js";

const withArcUX = (_WrappedComponent) => {
    return function ArcUXComponent(props) {
        return <_WrappedComponent {...props} theme={ArcUX.getCurrentTheme()} ArcUX={ArcUX} />
    }
}

export default withArcUX;
