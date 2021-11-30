function ComponentInit() {
    /*
        this.load.fromMeta("components/LogoMeta/meta.json");
        this.load.fromPack("components/LogoPack/logo.c.html");
    */
    this.load.fromPack("components/LogoPack/logo.package", true);
    this.load.fromPack("components/list.package");
}

function HandleInit() {

}

const anvil = new Anvil({
    init: {
        ComponentInit: ComponentInit, // Load all Components. This step will go first
        HandleInit: HandleInit // Load Handles component. This step will run after node rendered
    }
})
anvil.holder = anvil["[[holder]]"];

anvil.onComplete = e => {
    const kit = new Kit(anvil);
}

anvil.onResolve = e => {
    // console.log("Resolved " + e.holder.Components.i[e.holder.Components.i.length - 1].name);
}
