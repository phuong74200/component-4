console.log(this);

new this.Handle("Log", e => {
    console.log("success loaded Log Handle");
    console.log(e);
})