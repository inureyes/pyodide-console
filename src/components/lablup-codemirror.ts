/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';

import '@vanillawc/wc-codemirror/index';
import '@vanillawc/wc-codemirror/mode/python/python';
import '@vanillawc/wc-codemirror/mode/shell/shell';
//import {CodemirrorThemeMonokai} from '../lib/codemirror/theme/monokai.css';
import {CodemirrorThemeElegant} from '../lib/codemirror/theme/elegant.css';
import {CodemirrorBaseStyle} from '../lib/codemirror/base-style.css';

/**
 Lablup Codemirror

 `lablup-codemirror` is wc-codemirror editor.

 Example:

 <lablup-codemirror></lablup-codemirror>

 @group Backend.AI Console
 @element lablup-codemirror
 */

declare const window: any;


@customElement('lablup-codemirror')
export default class LablupCodemirror extends LitElement {
  public shadowRoot: any; // ShadowRoot
  public editor: any;

  @property({type: Object}) config = Object();
  @property({type: String}) mode = 'python';
  @property({type: String}) theme = 'elegant';
  @property({type: String}) src = '';

  constructor() {
    super();
    this.config = {
      // mode: this.mode,
      // theme: 'monokai',
      tabSize: 2,
      indentUnit: 2,
      cursorScrollMargin: 50,
      lineNumbers: true,
      lineWrapping: true,
      // lineNumberFormatter: (line) => (line % 5 === 0 || line === 1) ? line : '',
      matchBrackets: true,
      styleActiveLine: true,
      viewportMargin: Infinity,
      extraKeys: {},
    };
  }

  firstUpdated() {
    this._initEditor();
  }

  /**
   * Initialize codemirror editor.
   * */
  _initEditor() {
    const cm = this.shadowRoot.querySelector('#codemirror-editor');
    if (!cm.__initialized) {
      setTimeout(this._initEditor.bind(this), 100);
      return;
    }
    this.editor = cm.editor;
    Object.assign(this.editor.options, this.config);
    this.refresh();
  }

  /**
   * Refresh the editor.
   * */
  refresh() {
    globalThis.setTimeout(() => this.editor.refresh(), 100);
  }

  /**
   * Get the editor's contents.
   * */
  getValue() {
    return this.editor.getValue();
  }

  /**
   * Set the editor's contents and then refresh.
   * */
  setValue(val) {
    this.editor.setValue(val);
    this.refresh();
  }

  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      CodemirrorBaseStyle,
      CodemirrorThemeElegant,
      css`
        .CodeMirror {
          height: auto;
          font-size: 15px;
        }
      `,
    ];
  }

  render() {
    return html`
      <wc-codemirror id="codemirror-editor" mode="${this.mode}" theme="elegant"></wc-codemirror>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-codemirror": LablupCodemirror;
  }
}
