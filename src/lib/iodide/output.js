export const output = {
  element: (tagName) => {
    console.log("pyodide requested a output:", tagName);
    let outputPane = document.createElement(tagName);
    document.querySelector("#result-area").appendChild(outputPane);
    //this.currentResultPane.appendChild(outputPane);
    return outputPane;
  },
  text: (str) => {
    let outputPane = document.createElement("div");
    outputPane.innerText = str;
    document.querySelector("#result-area").appendChild(outputPane);
    return outputPane;
  },
};
export default output;
