const Kit = function (anv = new Anvil()) {
    this.Node = function (name, attrs, children = []) {
        let dom = document.createElement(name);
        for (let n in attrs) {
            if (n == "textContent") {
                dom.textContent = attrs[n];
            } else {
                dom.setAttribute(n, attrs[n]);
            }
        }
        for (let child of children) {
            dom.appendChild(child);
        }
        return dom;
    }
}