import React from 'react';
import withArcUX from "../withArcUX.js";
import ModalLayer from "./ModalLayer.jsx";
import { Log } from "arc-lib";

class App extends React.Component {
    #routeListener;
    #modalListener;
    #modalCloseListener;
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            target: null,
            shell: null,
            loadedRoute: props.ArcUX.getKeyVal('route'),
        }

        this.#routeListener = props.ArcUX.on('route', this.loadRoute.bind(this))
        this.#modalListener = props.ArcUX.on('modal', this.renderModal.bind(this))
        this.#modalCloseListener = props.ArcUX.on('modal:close', this.closeModal.bind(this))
    }

    async componentDidMount() {
        const initialRoute = this.props.ArcUX.getKeyVal('route');

        window.onpopstate = (_event) => {
            if (_event.state) {
                this.props.ArcUX.loadPage(_event.state.code);
            }
        };

        Log.info( `Our initial route is ${initialRoute}`);
        const match = this.props.ArcUX.renderRoute(initialRoute);
        if(match){
            this.setState({
                loading: false,
                target: match.Component,
                shell: match.Shell
            })
        }
    }

    async componentWillUnmount() {
        if(this.#routeListener){
            this.props.ArcUX.clear(this.#routeListener);
        }
    }

    render() {
        const AppLoader = this.props.ArcUX.getHandler('AppLoader');
        const Shell = this.state.shell;

        if(AppLoader && this.state.loading){
            return Shell ? <Shell><AppLoader {...this.props} /></Shell> : <AppLoader {...this.props} />;
        }

        const RoutedComponent = this.state.target;

        if(!RoutedComponent){
            Log.info("Could not render anything. No AppLoader. No route matched. No NotFound handler. Returning null.")
            return null;
        }

        const Modal = this.state.modal ? this.state.modal.modal : null;
        if(Shell){
            return (
                <React.Fragment>
                    <Shell><RoutedComponent {...this.props} /></Shell>
                    {Modal ? <ModalLayer><Modal {...this.state.modal.props} /></ModalLayer> : null}
                </React.Fragment>
            )
        }

        return (
            <React.Fragment>
                <RoutedComponent {...this.props} />
                {Modal ? <ModalLayer><Modal {...this.state.modal.props} /></ModalLayer> : null}
            </React.Fragment>
        )
    }

    loadRoute(_newRoute) {
        Log.info(`New route called:`, [_newRoute]);
        const match = this.props.ArcUX.renderRoute(_newRoute);
        if(!match){
            Log.warning(`Not found handler missing`);
            return;
        }
        const fullHistoryString = decodeURI(_newRoute);
        window.history.pushState({ code: fullHistoryString }, "", fullHistoryString);
        this.setState({
            loading: false,
            target: match.Component,
            shell: match.Shell,
            loadedRoute: _newRoute
        });
    }

    renderModal(_Modal, _props) {
        this.setState({
            modal: {
                modal: _Modal,
                props: _props ||{}
            }
        })
    }

    closeModal() {
        this.setState({
            modal: null
        });
    }
}

export default withArcUX(App);
