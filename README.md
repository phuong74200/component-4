## About The Project:

In this project I'm trying to make my own web librart that using component alike angular. Here is why:

-   I don't like jsx like syntax
-   It help me understand the way how other libraries like angular or react works

## Built With:

-   HTML/CSS
-   JavaScript

## Getting Started

Included these files into your html file:

```html
<script src="js/anvil4.js"></script>
<script src="js/script.js"></script>
```

## Usage:

Folder structure

```
.root
  ├ js
  │ ├ anvil4.js
  │ └ script.js
  ├ helloUser.package
  └ index.html
```

Create a helloUser.package file:
Package file starts with `<package>` tag:

```html
<package>
    <!--Your component goes there-->
</package>
```

Then we need a name for our component so that we can call when needed. There we using `<component>` tag. `<component>` has a attribute named `*name` to set the name of the component

```html
<component *name="MyComponent">
    <!--Your render logics goes there-->
</component>
```

And the most important thing for the component is its `parameters` which is also called `props`. With parameters we can pass value into the component. So, the component can be reusing.
For the parameters we using `<prop>` tag to decalre. `<prop>` also have `*name` attribute to set the name of the parameters. So our `<prop>` will looks like:

```html
<props *name="Username"></props>
```

Each component can have many of parameters
And the last one that you need to care about is the `<render>` tag. This tag will render what you want user to see with the passed parameters.
Within the `<render>` you can put your logic into the `{{ /* logic codes */ }}` brackets. Example:

```html
<div>
    Username is: {{Username}}
    <div></div>
</div>
```

You can access the passed parameters in your props tags through `this.props.ParameterName`
After all you code will looks like this:

```html
<package>
    <component *name="MyComponent">
        <props *name="Username"></props>
        <render>
            <div>Username is: {{Username}}<div>
        </render>
    </component>
</package>
```

The final step is load the package file into your code. Put the code below into `script.js` file

```js
function ComponentInit() {
    this.load.fromPack("./helloUser.package", true);
}

function HandleInit() {}

const anvil = new Anvil({
    init: {
        ComponentInit: ComponentInit,
        HandleInit: HandleInit,
    },
});
```

After these steps, you can now call the component inside your html file directly:
inedx.html

```html
<html>
    <body>
        <MyComponent Username="Fuong"/>
        <script src="js/anvil4.js"></script>
        <script src="js/script.js"></script>
    </body>
</html>
```
