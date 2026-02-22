import {ArcRouter, ArcEvents, is} from "arc-lib";
import {createRoot} from "react-dom/client";
import React from "react";
import Html from "./Html.js";
import {ThemeProvider} from "styled-components";
import App from "./FrameworkComponents/App.jsx";
import Form from "./Form.js";
import withArcUX from "./withArcUX.js";

class ArcUX {
    #routeMap = {};
    #RouteRenderer;
    #initialRoute;

    #Html;

    #handlers = {};

    #themes = {};
    #currentTheme;
    #apis = {};
    #environment = 'production';
    #rootPath = '';
    #keyVal = {};

    #forms = {};

    constructor() {
        this.#RouteRenderer = new ArcRouter(this.#routeMap);
        this.#Html = new Html;

        Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach(n => {
            if(n === "constructor") { return;  }
            this[n] = this[n].bind(this)
        });

        //Turn our Singleton into an event emitter
        ArcEvents.mixin(this);
    }

    //Forms
    getForm(_form) {
        if(!this.#forms[_form]) {
            this.#forms[_form] = new Form;
        }
        return this.#forms[_form];
    }

    deleteForm(_form) {
        delete this.#forms[_form];
    }

    //Simplest shared data state ever
    setKeyVal(_key, _value, _suppressEmit=false) {
        this.#keyVal[_key] = _value;
        if(!_suppressEmit) {
            this.emit(_key, [_value]);
        }
    }

    getKeyVal(_key) {
        return this.#keyVal[_key];
    }

    setResolverVariables(_environment, _rootPath) {
        this.#environment = _environment;
        this.#rootPath = _rootPath;

        this.#Html.setEnvironment(_environment);
        this.#Html.setPathToClientBundle(`${this.#rootPath}/assets/${this.#environment}.client.js`);
    }

    addAPI(_name, _API) {
        this.#apis[_name] = _API;
    }

    API(_name){
        return this.#apis[_name];
    }

    addTheme(_theme, _setCurrent=false) {
        this.#themes[_theme.name] = _theme;
        if(_setCurrent || !this.#currentTheme) {
            this.#currentTheme = _theme.name;
        }
    }

    getAvailableThemes() {
        return Object.keys(this.#themes);
    }

    getCurrentTheme() {
        return this.#themes[this.#currentTheme];
    }

    addHandler(_handler, _Component) {
        this.#handlers[_handler] = _Component;
    }

    getHandler(_handler) {
        return this.#handlers[_handler];
    }

    bindRoute(_route, _Component, _Shell=null) {
        this.#routeMap[`${this.#rootPath}${_route}`] = { Component: _Component, Shell: _Shell };
        this.#RouteRenderer.setMap(this.#routeMap);
    }

    renderRoute(_route) {
        const routeData = this.#RouteRenderer.travel(_route)
        this.setKeyVal('routeData', routeData);
        if (routeData.match) {
            return routeData.match;
        }

        if(this.getHandler('NotFound')){
            return this.getHandler('NotFound');
        }
    }

    resolveClient(){
        const rootTheme = this.getCurrentTheme();
        const root = createRoot(document.getElementById('app'));
        root.render(
            <ThemeProvider theme={rootTheme || {name:undefined}}>
                {rootTheme.globalStyle ? <rootTheme.globalStyle /> : null}
                {rootTheme.svgDefinitions ? <rootTheme.svgDefinitions /> : null}
                <App $initialRoute={this.#initialRoute} />
            </ThemeProvider>
        );
    }

    htmlAddToHead(_headElement){
        if(is(_headElement) === 'array'){
            _headElement.forEach(_element => this.#Html.addHeadElement(_element));
            return;
        }
        this.#Html.addHeadElement(_headElement)
    }

    htmlAddWindowVar(key, val){
        this.#Html.addWindowVariable(key, val);
    }

    loadPage(_route, _suppressEmit=false) {
        this.setKeyVal('route', `${this.#rootPath}${_route}`, _suppressEmit);
    }

    pushURI(_newURI, _replace) {
        const fullHistoryString = decodeURI(_newURI);
        if (_replace) {
            return window.history.replaceState({ code: fullHistoryString }, "", fullHistoryString);
        }
        return window.history.pushState({ code: fullHistoryString }, "", fullHistoryString);
    }

    renderModal(_Modal, _props) {
        this.emit('modal', [_Modal, _props || {}]);
    }

    closeModal() {
        this.emit('modal:close', []);
    }

    async serveHtml(_ctx, _next, _routeData) {
        try{
            _ctx.response.status = 200;
            _ctx.response.body = this.#Html.getString(_ctx.user);
        } catch (e) {
            _ctx.response.status = 500;
            _ctx.response.body = {message: e.message};
        }
    }
}

export default new ArcUX;

export {
    withArcUX
};
