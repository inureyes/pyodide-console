/**
 @license
 Copyright (c) 2015-2019 Lablup Inc. All rights reserved.
 */
import {css, customElement, html, LitElement, property} from "lit-element";

import {IronFlex, IronFlexAlignment} from '../plastics/layout/iron-flex-layout-classes';
import LablupCodemirror from "./lablup-codemirror";

/**
 Lablup Log monitor

 `lablup-logmonitor` is a tiny log monitor

 Example:

 <lablup-logmonitor></lablup-logmonitor>

 @group Backend.AI Console
 @element lablup-logmonitor
 */

declare const window: any;

@customElement('lablup-logmonitor')
export default class LablupLogMonitor extends LitElement {
  public shadowRoot: any; // ShadowRoot
  @property({ type: Array }) logs;
  @property({ type: Object }) monitor;

  constructor() {
    super();
    this.logs = [];
  }

  firstUpdated() {
    document.addEventListener('lablup-log-add', (e)=>this.addLog(e));
    this.monitor = this.shadowRoot.querySelector('#monitor');
  }
  async addLog(e) {
    // CAUTION: NEVER USE console.log here. It leads recursive loophole.
    //this.logs = console.logs;
    //console.stdlog.apply(console, e.detail);
    this.logs.push(e.detail);
    await this.requestUpdate();
    this.monitor.scrollTop = this.monitor.scrollHeight
  }
  static get styles() {
    return [
      IronFlex,
      IronFlexAlignment,
      css`
        .monitor {
          position: fixed;
          right: 0;
          bottom: 0;
          height: 200px;
          width: 350px;
          overflow: scroll;
          font-family: "Ubuntu Mono", monospace;
          border-left: 1px solid #ccc;
          border-top: 1px solid #ccc;
          border-top-left-radius: 10px;
          background-color: rgba(255,255,255,0.7);
        }
        .item {
          border-bottom: 1px solid #ddd;
          padding-top: 3px;
          padding-left: 5px;
          font-size: 10px;
        }
      `,
    ];
  }

  render() {
    return html`
    <div id="monitor" class="monitor">
     ${this.logs.map(item=>
      html`<div class="item">${item}</div>`
     )}
    </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lablup-logmonitor": LablupCodemirror;
  }
}
