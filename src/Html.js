class Html {
    #headElements = [];
    #pathToClientBundle = '';
    #environment = 'production';

    addHeadElement(_element) {
        this.#headElements.push(_element);
    }

    setPathToClientBundle(_pathToClientBundle) {
        this.#pathToClientBundle = _pathToClientBundle;
    }

    setEnvironment(_environment) {
        this.#environment = _environment;
    }

    getString() {
        return (
`<!DOCTYPE html>
    <head>
        ${this.#headElements.join('\r\n')}
        <script>
            window.app = ${JSON.stringify({
                environment: this.#environment
            })};
        </script>
    </head>
    <body style="margin:0">
      <!-- Our app container -->
      <div id="app" style="display:flex;flex-direction: column;min-height: calc(100vh)"></div>
      
      <!-- Our isomorphic bundle -->
      <script id="appBundle" src="${this.#pathToClientBundle}"></script>
    </body>
</html>`);
    }
}

export default Html;
