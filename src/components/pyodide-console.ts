/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
import { customElement, html, css, LitElement, property } from "lit-element";

import "@material/mwc-drawer";
import "@material/mwc-top-app-bar-fixed";
import "@material/mwc-icon-button";
import "@material/mwc-circular-progress-four-color";
//import * as tf from "@tensorflow/tfjs/dist/tf.js";

import "./lablup-codemirror";
import "./lablup-logmonitor";

import iodide from "../lib/iodide/api.js";
import { languagePluginLoaderFn } from "../lib/pyodide/pyodide.module";

import {
  IronFlex,
  IronFlexAlignment,
  IronFlexFactors,
  IronPositioning,
} from "../plastics/layout/iron-flex-layout-classes";
import LablupCodemirror from "./lablup-codemirror";

/**
 Pyodide Console on Backend.AI

 `pyodide-console` is a Pyodide shell on Backend.AI GUI console (web / app).

 Example:

 <pyodide-console>
 ... content ...
 </pyodide-console>

 @group Pyodide Console
 @element pyodide-console
 */

declare global {
  const languagePluginLoader: any;
  const pyodide: any;
  const BrowserFS: any;
}

@customElement("pyodide-console")
export default class PyodideConsole extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({ type: Object }) replArea;
  @property({ type: Object }) spinner;
  @property({ type: Object }) currentResultPane;
  @property({ type: Object }) drawer;
  @property({ type: String }) latestBlockHash = "";
  @property({ type: Number }) codeIndex = 1;

  constructor() {
    super();
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      IronFlexFactors,
      IronPositioning,
      css`
        textarea {
          font-family: "Ubuntu Mono";
          height: 100px;
          width: 400px;
        }
        .content-area {
          margin-left: 25px;
          margin-right: 25px;
        }

        .result {
          width: calc(100% - 110px);
          margin-left: 80px;
          padding: 10px;
          border-radius: 5px;
        }
        .error {
          background-color: #ffcdd2;
        }
        .code-index {
          height: 33px;
          width: 30px;
        }
        .code-index:before {
          content: "[";
        }
        .code-index:after {
          content: "]";
        }

        #spinner {
          position: fixed;
          right: calc(50% - 20px);
          bottom: calc(50vh - 20px);
          --mdc-circular-progress-bar-color-1: #2196f3;
          --mdc-circular-progress-bar-color-2: #e91e63;
          --mdc-circular-progress-bar-color-3: #ffc107;
          --mdc-circular-progress-bar-color-4: #03dac5;
        }

        mwc-top-app-bar-fixed {
          --mdc-theme-primary: #457c3c;
        }

        lablup-codemirror {
          font-family: "Ubuntu Mono";
          margin-top: 15px;
          margin-bottom: 10px;
          width: calc(100% - 90px);
          border: 1px solid #ccc;
        }
      `,
    ];
  }

  firstUpdated() {
    this.replArea = this.shadowRoot.querySelector("#repl-area");
    this.spinner = this.shadowRoot.querySelector("#spinner");
    this.drawer = this.shadowRoot.querySelector("#app-drawer");
    //globalThis.tf = tf;

    globalThis.iodide = iodide;
    globalThis.languagePluginUrl = "/src/lib/pyodide/";
    this.spinner.open();
    BrowserFS.configure(
      {
        fs: "LocalStorage",
      },
      async (e) => {
        console.log("Storage initialized.");
        let languagePluginLoader = languagePluginLoaderFn();
        languagePluginLoader.then(async () => {
          console.log("Module loaded.");
          let FS = pyodide._module.FS;
          let PATH = pyodide._module.PATH;
          var BFS = new BrowserFS.EmscriptenFS(FS, PATH);
          FS.createFolder(FS.root, "data", true, true);
          FS.mount(BFS, { root: "/" }, "/data");
          pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
          `);
          this.add_block();
          this.spinner.close();
        });
      }
    );
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  attributeChangedCallback(name, oldval, newval) {
    super.attributeChangedCallback(name, oldval, newval);
  }

  cleanREPL() {
    this.replArea.innerHTML = "";
    this.add_block();
  }

  add_block() {
    let block = document.createElement("div");
    block.classList.add("layout");
    block.classList.add("horizontal");
    block.classList.add("end");
    block.classList.add("flex");
    let codeBlock = document.createElement(
      "lablup-codemirror"
    ) as LablupCodemirror;
    codeBlock.mode = "python";
    codeBlock.setAttribute("blockHash", this.generateBlockId() as string);
    this.latestBlockHash = codeBlock.getAttribute("blockHash") as any;
    let button = document.createElement("mwc-icon-button");
    let resultBlock = document.createElement("div");
    this.currentResultPane = resultBlock;
    button.icon = "play_arrow";
    button.addEventListener("click", () =>
      this.execute_code_block(codeBlock, resultBlock)
    );
    let codeIndex = document.createElement("div");
    codeIndex.classList.add("code-index");
    codeIndex.innerText = this.codeIndex.toString();
    this.codeIndex = this.codeIndex + 1;
    block.appendChild(codeIndex);
    block.appendChild(button);
    block.appendChild(codeBlock);
    this.replArea.appendChild(block);
    this.replArea.appendChild(resultBlock);
  }

  async execute_code_block(codeBlock, resultBlock) {
    this.spinner.open();
    let code = codeBlock.getValue();
    console.log(code);
    resultBlock.innerHTML = "";
    if (code.startsWith("!js")) {
      let lines = code.split("\n");
      lines.splice(0, 1);
      code = lines.join("\n");
      try {
        let result = eval(code);
        if (typeof result !== "undefined") {
          let codeResultBlock = document.createElement("div");
          codeResultBlock.classList.add("result");
          codeResultBlock.classList.add("success");
          codeResultBlock.innerText = result;
          resultBlock.appendChild(codeResultBlock);
        }
        if (codeBlock.getAttribute("blockHash") === this.latestBlockHash) {
          // it is last block.
          this.add_block();
        }    
      } catch (err) {
        let errorBlock = document.createElement("div");
        errorBlock.classList.add("result");
        errorBlock.classList.add("error");
        errorBlock.textContent = err;
        resultBlock.appendChild(errorBlock);
      }
      this.spinner.close();
    } else {
      await pyodide
        .runPythonAsync(code)
        .then((result) => {
          if (typeof result !== "undefined") {
            let codeResultBlock = document.createElement("div");
            codeResultBlock.classList.add("result");
            codeResultBlock.classList.add("success");
            codeResultBlock.innerText = result;
            resultBlock.appendChild(codeResultBlock);
          }
        })
        .catch((err) => {
          let errorBlock = document.createElement("div");
          errorBlock.classList.add("result");
          errorBlock.classList.add("error");
          errorBlock.textContent = err;
          resultBlock.appendChild(errorBlock);
        });
      let resultObj = document.querySelector("#result-area") as any;
      let results = resultObj.childNodes;
      for (var i = 0; i < results.length; ++i) {
        resultBlock.appendChild(results[i]);
      }
      while (resultObj.lastElementChild) {
        //resultObj.removeChild(resultObj.lastElementChild);
      }
      let stdout = pyodide.runPython("sys.stdout.getvalue()");
      let stdoutBlock = document.createElement("div");
      stdoutBlock.classList.add("result");
      stdoutBlock.classList.add("success");
      stdoutBlock.innerText = stdout;
      resultBlock.appendChild(stdoutBlock);
      pyodide.runPython(`sys.stdout.truncate(0);sys.stdout.seek(0)`);
      this.spinner.close();
      if (codeBlock.getAttribute("blockHash") === this.latestBlockHash) {
        // it is last block.
        this.add_block();
      }
    }
  }
  moveToGitHub() {
    window.open("https://github.com/inureyes/pyodide-console", "_blank");
  }
  toggleDrawer() {
    this.drawer.open = !this.drawer.open;
  }

  generateBlockId() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  protected render() {
    // language=HTML
    return html`
      <mwc-drawer hasHeader type="dismissible" id="app-drawer">
        <span slot="title">Pyodide Console</span>
        <span slot="subtitle">Run python without installation!</span>
        <div slot="appContent" style="position:relative;">
          <mwc-top-app-bar-fixed centerTitle>
            <mwc-icon-button
              icon="menu"
              slot="navigationIcon"
              @click="${() => this.toggleDrawer()}"
            ></mwc-icon-button>
            <div slot="title">Pyodide Console</div>
            <mwc-icon-button
              icon="replay"
              slot="actionItems"
              @click="${() => this.cleanREPL()}"
            ></mwc-icon-button>
            <mwc-icon-button
              icon="code"
              slot="actionItems"
              @click="${() => this.moveToGitHub()}"
            ></mwc-icon-button>
            <div class="content-area">
              <div id="repl-area"></div>
            </div>
            <mwc-circular-progress-four-color
              id="spinner"
              indeterminate
            ></mwc-circular-progress-four-color>
            <lablup-logmonitor></lablup-logmonitor>
          </mwc-top-app-bar-fixed>
        </div>
      </mwc-drawer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pyodide-console": PyodideConsole;
  }
}
