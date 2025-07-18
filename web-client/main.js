import App from "./src/app.js";

window.onload = function () {
    const containerElement = document.getElementById("MF_APP_CONTAINER");
    new App().run(containerElement);
};
