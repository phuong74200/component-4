const Anvil = function (cfg) {

    /*
        c: component
        m: map
        i: index
        n: name
    */

    cfg = {
        init: {
            create: function () { },
            loaded: function () { }
        },
        ...cfg
    }

    this[`[[holder]]`] = {
        Handles: {
            i: [], // store by index (array)
            m: {}  // store by map (object)
        },
        Components: {
            i: [],
            m: {}
        },
        loadStacks: 0,
        Shared: {
            note: "this global variable is shared between Render"
        }
    }

    const h = this[`[[holder]]`];

    const Utils = {
        absPath: (base, relative) => {
            if (base.slice(-1) != "/") base += "/";
            var stack = base.split("/"),
                parts = relative.split("/");
            stack.pop();
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] == ".")
                    continue;
                if (parts[i] == "..")
                    stack.pop();
                else
                    stack.push(parts[i]);
            }
            return stack.join("/");

        },
        hashCode: str => {
            var hash = 0, i, chr;
            if (str === 0) return hash;
            for (i = 0; i < str.length; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }
    }

    this.Handle = function (name = "String", cb = () => { }) {
        if (!h.Handles.m[name]) {
            h.Handles.i.push(cb);
            h.Handles.m[name] = cb;
        } else {
            console.warn(`Handler named '${name}' has already taken`);
        }
    }

    const trigger = (name, Render = new Render, Listen = new Listen()) => {
        if (name) {
            if (h.Handles.m[name]) {
                h.Handles.m[name]({
                    Listen: Listen,
                    Render: Render,
                    Shared: h.Shared,
                    Event: Render.Event,
                    event: Render.event
                });
            } else {
                console.warn(`Handler named '${name}' not created yet!`);
            }
        }
    }

    const Component = function (node) {

        this.name = node.getAttribute("*name").toUpperCase();
        this.props = collectProps();
        this.render = node.querySelector("render").cloneNode(true);
        this.handles = {
            change: node.getAttribute("(change)"),
            update: node.getAttribute("(update)"),
            render: node.getAttribute("(render)")
        }

        function collectProps() {
            return [...node.querySelectorAll("prop")].map(prop => {
                return {
                    name: prop.getAttribute("*name"),
                    type: prop.getAttribute("*type") || "String",
                    defl: prop.textContent
                }
            })
        }

        if (node.tagName == "COMPONENT") {
            h.Components.i.push(this);
            h.Components.m[this.name] = this;
        } else {
            console.warn(`${node} is not a component! Change its tagName to component`);
        }

    }

    const Listen = function (Render = new Render()) {

        this.Render = Render;

        let cData = Render.cData;
        let node = Render.node;

        this["[[hold]]"] = {
            props: {},
            includes: []
        };

        let hold = this["[[hold]]"];

        this.props = hold.props;

        // log(cData);

        let matcher = new RegExp(/\{\{([^\}]*(?:}(?!})[^\}]*)*)}}/g);
        //   /\{\{(.*?)\}\}/g

        const update = (propName) => {
            for (let exp of hold.includes) {
                if (exp.expression.includes(propName)) {
                    let newContent = exp.expression.replace(matcher, match => {
                        let parsed = parse(match, exp.node);
                        return parsed;
                    });
                    if (newContent != exp.node.textContent) {
                        exp.node.textContent = newContent
                        trigger(cData.handles.change, Render, this);
                    };
                }
            }
            trigger(cData.handles.update, Render, this);
        };

        const typeConv = (v, type) => {
            if (type == "Number") return Number(v);
            if (type == "Int") return parseInt(v);
            if (type == "Float") return parseFloat(v);
            if (type == "Date") return Date(v);
            if (type == "Boolean") return v == "true" ? true : false;
            return String(v);
        }

        const parse = (expression) => {
            let props = cData.props.map((prop) => {
                return prop.name;
            });
            expression = expression.slice(2, expression.length - 2);
            console.log(expression)
            const f = new Function(...props, `${expression}`);
            return f.apply(
                {
                    Listen: this,
                    Render: this.Render,
                    Shared: h.Shared
                },
                Object.values(hold.props));
        };

        const getSet = e => {
            for (let p of cData.props) {
                hold.props["_" + p.name] = typeConv(node.getAttribute(p.name), p.type);
                Object.defineProperty(hold.props, p.name, {
                    get: function () {
                        return typeConv(hold.props["_" + p.name], p.type);
                    },
                    set: function (value) {
                        hold.props["_" + p.name] = typeConv(value, p.type);
                        update(p.name);
                    }
                })
                Render.clone.removeAttribute(p.name)
            }
        }

        const build = node => {
            if (node.nodeType == 3) {
                node.textContent = node.textContent.replace(matcher, match => {
                    let parsed = parse(match, node);
                    hold.includes.push({
                        node: node,
                        expression: node.textContent
                    });
                    return parsed;
                });
            } else {
                if (node.attributes) {
                    for (let attr of node.attributes) {
                        if (attr.name == "*src") {
                            node.setAttribute("src", attr.value);
                        }
                        attr.value = attr.value.replace(matcher, match => {
                            let parsed = parse(match);
                            hold.includes.push({
                                node: attr,
                                expression: attr.value
                            });
                            return parsed;
                        });
                    }
                }
            }
            for (let child of node.childNodes) {
                build(child);
            };
        }

        getSet();
        build(Render.clone);
    }

    this.onComplete = e => { };
    this.onResolve = e => { };

    let resolveLoadStack = () => {
        this.onResolve(this);
        h.loadStacks--;
        if (h.loadStacks == 0) {
            this.onComplete(this);
        }
    }

    this.load = {
        fromNode: node => {
            new Component(node)
        },
        fromFile: URL => {
            h.loadStacks++;
            return new Promise((resolve, reject) => {
                fetch(URL).then(text => text.text()).then(html => {
                    const div = document.createElement("div");
                    div.innerHTML = html;
                    for (let c of div.querySelectorAll("component")) {
                        this.load.fromNode(c);
                    }
                    resolve(div);
                    resolveLoadStack();
                    buildNode();
                })
            })
        },
        fromMeta: URL => {
            h.loadStacks++;
            return new Promise((resolve, reject) => {
                fetch(URL).then(text => text.json()).then(meta => {
                    const basePath = URL.split("/").slice(0, -1).join("/");
                    meta.path = {
                        css: Utils.absPath(basePath, meta.path.css),
                        html: Utils.absPath(basePath, meta.path.html),
                        js: Utils.absPath(basePath, meta.path.js)
                    };
                    if (!document.querySelector(`link[href="${meta.path.css}"]`)) {
                        var link = document.createElement("link");
                        link.href = meta.path.css;
                        link.type = "text/css";
                        link.rel = "stylesheet";
                        document.getElementsByTagName("head")[0].appendChild(link);
                    }
                    if (!document.querySelector(`script[src="${meta.path.js}"]`)) {
                        fetch(meta.path.js).then(text => text.text()).then(js => {
                            console.log("repeat")
                            new Function(js).apply({ Handle: this.Handle });
                            this.load.fromFile(meta.path.html);
                            resolve(meta);
                            resolveLoadStack();
                        })
                    } else {
                        this.load.fromFile(meta.path.html);
                        resolve(meta);
                        resolveLoadStack();
                    }
                })
            })
        },
        fromPack: (URL, min = false) => {
            h.loadStacks++;
            fetch(URL).then(text => text.text()).then(pack => {
                let container = document.createElement("div");
                container.innerHTML = pack;

                let resolve = pack => {
                    let component = pack.querySelector("component");
                    let js = pack.querySelector("script")?.innerHTML;
                    let css = pack.querySelector("style")?.innerHTML;

                    if (component) this.load.fromNode(component);

                    new Function(js).apply({ Handle: this.Handle, Shared: h.Shared, Anvil: Anvil });

                    function minify(css) {
                        css = css
                            .replace(/([^0-9a-zA-Z\.#])\s+/g, "$1")
                            .replace(/\s([^0-9a-zA-Z\.#]+)/g, "$1")
                            .replace(/;}/g, "}")
                            .replace(/\/\*.*?\*\//g, "");
                        return css;
                    }

                    if (css) {
                        let style = document.createElement("style");
                        style.innerHTML = min ? minify(css) : css;
                        document.querySelector("head").appendChild(style);
                    }
                }

                for (let pack of container.querySelectorAll("pack")) {
                    resolve(pack);
                }
                for (let pack of container.querySelectorAll("package")) {
                    resolve(pack);
                }

                resolveLoadStack();
                buildNode();
            })
        }
    }

    cfg.init.ComponentInit.bind(this)();
    cfg.init.HandleInit.bind(this)();

    const Render = function (node) {

        const inherit = (src, dest) => {
            for (let attr of src.attributes) {
                if (attr.nodeName == "class")
                    dest.classList.add(attr.nodeValue);
                else
                    dest.setAttribute(attr.nodeName, attr.nodeValue);
            }
            let children = dest.querySelectorAll("*")
        }

        this.node = node;
        this.cData = h.Components.m[node.tagName];
        this.clone = this.cData.render.querySelector("*").cloneNode(true);
        this.props = this.cData.props;

        if (root = this.clone.querySelector("root")) {
            root.replaceWith(...node.children);
        }
        node.replaceWith(this.clone);
        inherit(node, this.clone);
        let listen = new Listen(this);

        this.clone.Render = this;
        this.clone.Listen = listen;

        for (let c of h.Components.i) {
            while (this.clone.getElementsByTagName(c.name).length > 0) {
                new Render(this.clone.getElementsByTagName(c.name)[0])
            }
        }

        this.event = {
            events: {},
            emit: (n, ...d) => {
                this.event.events[n].cb(...d);
            }
        };

        const event = this.event;

        this.Event = function (n, cb) {
            this.name = n;
            this.cb = cb;
            this.emit = (...d) => {
                cb(...d)
            }
            event.events[n] = this;
        }

        this.clone.event = this.event;
        this.clone.emit = event.emit;

        trigger(this.cData.handles.render, this, listen);

    };

    const buildNode = () => {
        for (let c of h.Components.i) {
            while (document.getElementsByTagName(c.name).length > 0) {
                new Render(document.getElementsByTagName(c.name)[0]);
            }
        }
    }
    buildNode();

    const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                let node = mutation.addedNodes[mutation.addedNodes.length - 1];
                if (node && node.nodeType == 1 && h.Components.m[node.tagName]) {
                    new Render(node);
                }
            }
        }
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    this.Render = Render;

}