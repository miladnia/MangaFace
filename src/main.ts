import App from "./App";

window.onload = function () {
    const containerElement = document.getElementById("root");
    containerElement && App.render(containerElement);
};
