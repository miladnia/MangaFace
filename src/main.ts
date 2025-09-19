import App from "./App.ts";

window.onload = function () {
    const containerElement = document.getElementById("MF_APP_CONTAINER");
    containerElement && new App().run(containerElement);
};
