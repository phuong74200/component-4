/*
    <component $name="component_name">
        {{
            let x = useState("fuong");
            new Prop(anInteger, 3);
            new Prop(anObject, { foo: 1, bar: 2 });
        }}
        <render>
            {{
                script_line_1;
                script_line_2;
                script_line_3;
                script_line_4;
                return something;
            }}
            <div> {{ return textContent }} </div>
            <div style="{{ return `color: red` }}">  Code inside attribute </div>
        </render>
    <component>
*/

const Anvil = new (function () {
    /*
        c: component
        m: map
        i: index
        n: name
    */

    const Render = function (vDOM) {
        if (typeof vDOM == "string") return document.createTextNode(vDOM);
        const dom = document.createElement(vDOM.tag);
        for (let k in vDOM.attrs) {
            dom.setAttribute(k, vDOM.attrs[k]);
        }
        for (let c of vDOM.children) {
            dom.appendChild(Render(c));
        }
        return dom;
    }

    const Component = function (e) {
        const Mount = () => {

        }
        this.name = e.getAttribute(`v-name`).toUpperCase();
        this.vDOM = new vDOM(e);
    }

    const vDOM = function (e) {
        this.tag = e.tagName;
        this.children = [];
        this.target = e;
        this.attrs = {};
        // this.uuid = uuidv4();

        if (e.attributes)
            for (let a of e.attributes) {
                this.attrs[a.name] = a.value;
            }

        for (let c of e.childNodes) {
            let vNode = new vDOM(c);
            if (c.nodeType == 3 && c.data.replace(/\u00a0/g, "x").trim().length != 0) {
                this.children.push(c.data);
            } else if (c.nodeType == 1) {
                this.children.push(vNode)
            }
        }

    }

    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    let dom = new vDOM(document.getElementById("v-dom-old"));

    console.log(dom);

    console.log(Render(dom))

})();