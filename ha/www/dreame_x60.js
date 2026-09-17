// dreame_x60 – Heidi-Karte v2.0.0-alpha.29 (gebaut aus dreame_x60/card, nicht von Hand ändern)

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e4, o5) {
    if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e4;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e4 = void 0 !== s4 && 1 === s4.length;
      e4 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e4) => {
  const o5 = 1 === t4.length ? t4[0] : e4.reduce((e5, s4, o6) => e5 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o6 + 1], t4[0]);
  return new n(o5, t4, s);
};
var S = (s4, o5) => {
  if (e) s4.adoptedStyleSheets = o5.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e4 of o5) {
    const o6 = document.createElement("style"), n4 = t.litNonce;
    void 0 !== n4 && o6.setAttribute("nonce", n4), o6.textContent = e4.cssText, s4.appendChild(o6);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e4 = "";
  for (const s4 of t5.cssRules) e4 += s4.cssText;
  return r(e4);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ??= []).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e4, set: r4 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e4, set(s5) {
      const h3 = e4?.call(this);
      r4?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e4 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e4) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e4 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e4 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e4) : this.setAttribute(e4, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e4 = i5._$Eh.get(t4);
    if (void 0 !== e4 && this._$Em !== e4) {
      const t5 = i5.getPropertyOptions(e4), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e4;
      const r4 = h3.fromAttribute(s4, t5.type);
      this[e4] = r4 ?? this._$Ej?.get(e4) ?? r4, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e4 = false, h3) {
    if (void 0 !== t4) {
      const r4 = this.constructor;
      if (false === e4 && (h3 = this[t4]), i5 ??= r4.getPropertyOptions(t4), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r4._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e4, wrapped: h3 }, r4) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t4) && (this._$Ej.set(t4, r4 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r4) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e4 && this._$Em !== t4 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e4 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e4 || this.C(s5, void 0, i5, e4);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq &&= this._$Eq.forEach((t5) => this._$ET(t5, this[t5])), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e4 = [];
  let n4, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e4.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e4];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e4) {
    let r4;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e4), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r4.nodeType) {
        if (r4.hasAttributes()) for (const t5 of r4.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r4.getAttribute(t5).split(o3), e5 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e5[2], strings: s4, ctor: "." === e5[1] ? I : "?" === e5[1] ? L : "@" === e5[1] ? z : H }), r4.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t5));
        if (y2.test(r4.tagName)) {
          const t5 = r4.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r4.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r4.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r4.append(t5[i6], c3());
          }
        }
      } else if (8 === r4.nodeType) if (r4.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r4.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e4) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e4 ? s4._$Co?.[e4] : s4._$Cl;
  const o5 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t4), h3._$AT(t4, s4, e4)), void 0 !== e4 ? (s4._$Co ??= [])[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e4)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e4 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e4;
    let h3 = P.nextNode(), o5 = 0, n4 = 0, r4 = s4[0];
    for (; void 0 !== r4; ) {
      if (o5 === r4.index) {
        let i6;
        2 === r4.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r4.type ? i6 = new r4.ctor(h3, r4.name, r4.strings, this, t4) : 6 === r4.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r4 = s4[++n4];
      }
      o5 !== r4?.index && (h3 = P.nextNode(), o5++);
    }
    return P.currentNode = l2, e4;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e4) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e4, this._$Cv = e4?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e4 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e4) this._$AH.p(i5);
    else {
      const t5 = new R(e4, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e4 = 0;
    for (const h3 of t4) e4 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e4], s4._$AI(h3), e4++;
    e4 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i5.length = e4);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e4, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e4) {
    const h3 = this.strings;
    let o5 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o5 = !a2(t4) || t4 !== this._$AH && t4 !== E, o5 && (this._$AH = t4);
    else {
      const e5 = t4;
      let n4, r4;
      for (t4 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r4 = M(this, e5[s4 + n4], i5, n4), r4 === E && (r4 = this._$AH[n4]), o5 ||= !a2(r4) || r4 !== this._$AH[n4], r4 === A ? t4 = A : t4 !== A && (t4 += (r4 ?? "") + h3[n4 + 1]), this._$AH[n4] = r4;
    }
    o5 && !e4 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e4, h3) {
    super(t4, i5, s4, e4, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e4 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e4);
    e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t4, i5, s4) => {
  const e4 = s4?.renderBefore ?? i5;
  let h3 = e4._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e4._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t4 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t4.firstChild, t4;
  }
  update(t4) {
    const r4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r4, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// src/ha/device.ts
var DREAME_PLATFORM = "dreame_vacuum";
var DREAME_ATTRS = ["segment_cleaning", "cleaning_sequence"];
var current = null;
var generation = 0;
var devicePrefix = () => current?.prefix ?? "";
var deviceName = () => current?.name ?? "";
var device = () => current;
function apply(next) {
  if ((current?.vac ?? null) !== (next?.vac ?? null) || current?.name !== next?.name) generation++;
  current = next;
  return next;
}
var isVacuumId = (id) => id.startsWith("vacuum.") && id.split(".").length === 2;
function cleanName(raw) {
  const words = String(raw ?? "").trim().split(/\s+/).filter(Boolean);
  const out = [];
  for (const w2 of words) if (out[out.length - 1] !== w2) out.push(w2);
  return out.join(" ");
}
function fromStates(states, vacId) {
  const e4 = states[vacId];
  if (!e4 || !isVacuumId(vacId)) return null;
  const prefix = vacId.slice("vacuum.".length);
  const name = cleanName(e4.attributes.friendly_name) || prefix;
  return { prefix, vac: vacId, name };
}
function discoverFromStates(states, override) {
  if (override && states[override]) return apply(fromStates(states, override));
  for (const id of Object.keys(states).sort()) {
    const e4 = states[id];
    if (e4 && isVacuumId(id) && DREAME_ATTRS.some((a3) => a3 in e4.attributes)) return apply(fromStates(states, id));
  }
  return apply(null);
}
function discoverDevice(hass, override) {
  const states = hass.states ?? {};
  let info = null;
  if (override && states[override]) info = fromStates(states, override);
  if (!info && hass.entities) {
    const reg = Object.values(hass.entities).find((e4) => e4 && e4.platform === DREAME_PLATFORM && isVacuumId(e4.entity_id));
    if (reg) {
      info = fromStates(states, reg.entity_id) ?? { prefix: reg.entity_id.slice("vacuum.".length), vac: reg.entity_id, name: reg.entity_id.slice("vacuum.".length) };
      const dev = reg.device_id ? hass.devices?.[reg.device_id] : void 0;
      const devName = (dev?.name_by_user ?? dev?.name ?? "").trim();
      if (devName) info = { ...info, name: devName };
    }
  }
  if (!info) return discoverFromStates(states);
  return apply(info);
}

// src/ha/contract.ts
var PLAN_NUMBERS = [1, 2, 3, 4];
var PACKAGE_PREFIX = "heidi";
var ROBOT_FEATURES = {
  vac: ["vacuum", ""],
  map: ["camera", "map"],
  selectedMap: ["select", "selected_map"],
  // Kartenwahl (4.3), nur wenn verfügbar
  mapData: ["camera", "map_data"],
  // Datenkarte (4.3b, Heidi-Karte): Valetudo-Kartenpaket im PNG-Chunk
  status: ["sensor", "status"],
  error: ["sensor", "error"],
  taskStatus: ["sensor", "task_status"],
  battery: ["sensor", "battery_level"],
  currentRoom: ["sensor", "current_room"],
  cleanedArea: ["sensor", "cleaned_area"],
  cleaningTime: ["sensor", "cleaning_time"],
  cleaningHistory: ["sensor", "cleaning_history"],
  cleaningCount: ["sensor", "cleaning_count"],
  totalCleanedArea: ["sensor", "total_cleaned_area"],
  totalCleaningTime: ["sensor", "total_cleaning_time"],
  firstCleaningDate: ["sensor", "first_cleaning_date"],
  mainBrushLeft: ["sensor", "main_brush_left"],
  sideBrushLeft: ["sensor", "side_brush_left"],
  filterLeft: ["sensor", "filter_left"],
  sensorDirtyLeft: ["sensor", "sensor_dirty_left"],
  wheelDirtyLeft: ["sensor", "wheel_dirty_left"],
  dustBagStatus: ["sensor", "dust_bag_status"],
  cleanWaterTankStatus: ["sensor", "clean_water_tank_status"],
  dirtyWaterTankStatus: ["sensor", "dirty_water_tank_status"],
  detergentStatus: ["sensor", "detergent_status"],
  lowWaterWarning: ["sensor", "low_water_warning"],
  autoEmptyStatus: ["sensor", "auto_empty_status"],
  selfWashBaseStatus: ["sensor", "self_wash_base_status"],
  resetMainBrush: ["button", "reset_main_brush"],
  resetSideBrush: ["button", "reset_side_brush"],
  resetFilter: ["button", "reset_filter"],
  resetSensor: ["button", "reset_sensor"],
  resetWheel: ["button", "reset_wheel"],
  startAutoEmpty: ["button", "start_auto_empty"],
  selfClean: ["button", "self_clean"],
  manualDrying: ["button", "manual_drying"],
  baseStationCleaning: ["button", "base_station_cleaning"],
  customizedCleaning: ["switch", "customized_cleaning"],
  cleaningMode: ["select", "cleaning_mode"],
  // globale Selects (Optionslisten für das Geräteprofil)
  suctionLevel: ["select", "suction_level"],
  mopPadHumidity: ["select", "mop_pad_humidity"],
  cleaningRoute: ["select", "cleaning_route"],
  carpetCleaning: ["select", "carpet_cleaning"],
  waterTemperature: ["select", "water_temperature"],
  dryingTime: ["select", "drying_time"],
  autoEmptyMode: ["select", "auto_empty_mode"],
  selfCleanFrequency: ["select", "self_clean_frequency"],
  cleangenius: ["select", "cleangenius"],
  mapRotation: ["select", "map_rotation"],
  selfCleanArea: ["number", "self_clean_area"],
  volume: ["number", "volume"],
  dndStart: ["time", "dnd_start"],
  dndEnd: ["time", "dnd_end"]
};
function robotEntity(domain, feature) {
  const p3 = devicePrefix();
  return `${domain}.${p3}${feature ? "_" + feature : ""}`;
}
var PACKAGE_ENTITIES = {
  heutePlan: "sensor.heidi_heutiger_plan",
  autoStatus: "sensor.heidi_automatik_status",
  phase: "sensor.heidi_phase",
  prognose: "sensor.heidi_prognose",
  lern: "sensor.heidi_lernwerte",
  jemand: "binary_sensor.heidi_jemand_zu_hause",
  arbeitszeit: "binary_sensor.heidi_arbeitszeit",
  nichtStoeren: "binary_sensor.heidi_nicht_storen",
  // ö → o in der ID (HA), nicht „stoeren“
  automatik: "input_boolean.heidi_automatik",
  dark: "input_boolean.heidi_dark_mode",
  planerBereich: "input_boolean.heidi_planer_bereich",
  prognoseAktiv: "input_boolean.heidi_prognose_aktiv",
  abweichungHeute: "input_boolean.heidi_abweichung_heute",
  ninaZaehlt: "input_boolean.heidi_nina_zaehlt",
  progHerbert: "input_boolean.heidi_prog_herbert",
  progNicole: "input_boolean.heidi_prog_nicole",
  progNina: "input_boolean.heidi_prog_nina",
  autoLauf: "input_boolean.heidi_auto_lauf",
  autoLetzterPlan: "input_text.heidi_auto_letzter_plan",
  raumSnapshot: "input_text.heidi_raum_snapshot",
  laufReihenfolge: "input_text.heidi_lauf_reihenfolge",
  letzteAutoReinigung: "input_datetime.heidi_letzte_auto_reinigung",
  arbeitszeitStart: "input_datetime.heidi_arbeitszeit_start",
  arbeitszeitEnde: "input_datetime.heidi_arbeitszeit_ende",
  rueckkehr: "input_datetime.heidi_rueckkehr",
  karte: "input_select.heidi_kartendarstellung",
  raumnamen: "input_select.heidi_raumnamen",
  beiHeimkehr: "input_select.heidi_bei_heimkehr",
  schnellMinuten: "input_number.heidi_schnell_minuten",
  minAkku: "input_number.heidi_min_akku",
  prognoseIntervall: "input_number.heidi_prognose_intervall",
  prognoseAufloesung: "input_number.heidi_prognose_aufloesung",
  prognoseWochen: "input_number.heidi_prognose_wochen",
  prognoseHalbwert: "input_number.heidi_prognose_halbwert",
  prognoseMindesttage: "input_number.heidi_prognose_mindesttage",
  chairs: "input_boolean.stuehle_am_boden"
  // Stühle am Boden (eigener Helfer ohne Präfix)
};
var ENTITIES = Object.defineProperties(
  { ...PACKAGE_ENTITIES },
  Object.fromEntries(Object.keys(ROBOT_FEATURES).map((k2) => [k2, { get: () => robotEntity(ROBOT_FEATURES[k2][0], ROBOT_FEATURES[k2][1]), enumerable: true }]))
);
var PERSONS = [
  { id: "person.herbert_schrotter", key: "herbert", name: "Herbert", letter: "H" },
  { id: "person.nicole_2", key: "nicole", name: "Nicole", letter: "N" },
  { id: "person.nina_2", key: "nina", name: "Nina", letter: "N", optional: ENTITIES.ninaZaehlt }
];
var PLAN_TEXT_FIELDS = ["name", "raeume", "tage", "personen", "raumwerte"];
var PLAN_SELECT_FIELDS = ["modus", "saugstufe", "wasser", "route", "wiederholungen", "homeoffice", "ho_saug", "ho_wdh", "sp_saug", "sp_wdh"];
var PLAN_BOOL_FIELDS = ["aktiv", "schnell"];
var PLAN_TIME_FIELDS = ["zeit"];
function planEntity(n4, feld) {
  const domain = PLAN_TEXT_FIELDS.includes(feld) ? "input_text" : PLAN_SELECT_FIELDS.includes(feld) ? "input_select" : PLAN_BOOL_FIELDS.includes(feld) ? "input_boolean" : "input_datetime";
  return `${domain}.${PACKAGE_PREFIX}_plan${n4}_${feld}`;
}
var ROOM_SELECT_FIELDS = ["cleaning_mode", "suction_level", "cleaning_times", "mop_pad_humidity", "cleaning_route"];
function roomEntity(id, feld) {
  return robotEntity("select", `room_${id}_${feld}`);
}
var ROOM_VALUE_CODES = {
  RV: {
    modus: { S: "Saugen", B: "Saugen + Wischen", W: "Nur Wischen" },
    saug: { L: "Leise", S: "Standard", K: "Stark", T: "Turbo" },
    wasser: { W: "Wenig", M: "Mittel", V: "Viel" },
    route: { S: "Standard", I: "Intensiv", T: "Tief" }
  },
  RV_HA: {
    modus: { sweeping: "Saugen", sweeping_and_mopping: "Saugen + Wischen", mopping: "Nur Wischen" },
    saug: { quiet: "Leise", standard: "Standard", strong: "Stark", turbo: "Turbo" },
    wasser: { slightly_dry: "Wenig", moist: "Mittel", wet: "Viel" },
    route: { standard: "Standard", intensive: "Intensiv", deep: "Tief" }
  },
  RV_ENT: { modus: "cleaning_mode", saug: "suction_level", wasser: "mop_pad_humidity", route: "cleaning_route", wdh: "cleaning_times" },
  RV_KEYS: ["modus", "saug", "wasser", "route", "wdh"]
};
var SERVICES = {
  vacuum: { domain: "vacuum", services: ["start", "pause", "stop", "return_to_base", "locate"] },
  cleanSegment: { domain: "dreame_vacuum", service: "vacuum_clean_segment" },
  // { entity_id, segments, repeats?, suction_level? }
  setRestrictedZone: { domain: "dreame_vacuum", service: "vacuum_set_restricted_zone" },
  // { entity_id, zones, no_mops, walls? } – ersetzt alle
  planStarten: { domain: "script", service: "heidi_plan_starten" },
  // { plan: 1..4, variante: normal|schnell|leise }
  appSzene: { domain: "script", service: "heidi_app_szene" },
  // { shortcut_id }
  prognoseReset: { domain: "shell_command", service: "heidi_prognose_reset" },
  press: { domain: "button", service: "press" },
  selectOption: { domain: "select", service: "select_option" },
  inputSelectOption: { domain: "input_select", service: "select_option" },
  inputText: { domain: "input_text", service: "set_value" },
  inputNumber: { domain: "input_number", service: "set_value" },
  inputDatetime: { domain: "input_datetime", service: "set_datetime" },
  number: { domain: "number", service: "set_value" },
  time: { domain: "time", service: "set_value" },
  inputBoolean: { domain: "input_boolean", services: ["turn_on", "turn_off", "toggle"] }
};
function historyPath(startIso, endIso) {
  return `history/period/${startIso}?filter_entity_id=${ENTITIES.phase},${ENTITIES.vac}&end_time=${encodeURIComponent(endIso)}&minimal_response&no_attributes`;
}
function robotIds(roomIds = []) {
  const ids = Object.keys(ROBOT_FEATURES).map((k2) => ENTITIES[k2]);
  for (const r4 of roomIds) for (const f3 of ROOM_SELECT_FIELDS) ids.push(roomEntity(r4, f3));
  return ids;
}
function allContractIds(roomIds = []) {
  const ids = [...Object.values(ENTITIES), ...PERSONS.map((p3) => p3.id)];
  for (const n4 of PLAN_NUMBERS) for (const f3 of [...PLAN_TEXT_FIELDS, ...PLAN_SELECT_FIELDS, ...PLAN_BOOL_FIELDS, ...PLAN_TIME_FIELDS]) ids.push(planEntity(n4, f3));
  for (const r4 of roomIds) for (const f3 of ROOM_SELECT_FIELDS) ids.push(roomEntity(r4, f3));
  return [...new Set(ids)];
}

// src/ha/memo-selector.ts
var sameStateAndUpdated = (a3, b3) => {
  if (a3 === b3) return true;
  if (!a3 || !b3) return false;
  return a3.state === b3.state && a3.last_updated === b3.last_updated;
};
function stateAndAttributes(attrs) {
  return (a3, b3) => {
    if (a3 === b3) return true;
    if (!a3 || !b3) return false;
    if (a3.state !== b3.state) return false;
    for (const k2 of attrs) if (!sameValue(a3.attributes[k2], b3.attributes[k2])) return false;
    return true;
  };
}
function sameValue(x2, y3) {
  if (x2 === y3) return true;
  if (Array.isArray(x2) && Array.isArray(y3)) return x2.length === y3.length && x2.every((v2, i5) => sameValue(v2, y3[i5]));
  if (x2 && y3 && typeof x2 === "object" && typeof y3 === "object") {
    const kx = Object.keys(x2), ky = Object.keys(y3);
    return kx.length === ky.length && kx.every((k2) => sameValue(x2[k2], y3[k2]));
  }
  return false;
}
function memoizeSelector(ids, fn, compare = {}) {
  const list = (states) => typeof ids === "function" ? ids(states) : ids;
  const cmpMap = () => typeof compare === "function" ? compare() : compare;
  let prev = null;
  let prevKey = "";
  let result;
  const sel = (states) => {
    const cur = list(states);
    const key = cur.join("|");
    if (prev !== null && key === prevKey) {
      const cm = cmpMap();
      let same = true;
      for (const id of cur) {
        const cmp = cm[id] ?? sameStateAndUpdated;
        if (!cmp(prev[id], states[id])) {
          same = false;
          break;
        }
      }
      if (same) return result;
    }
    result = fn(states);
    prev = states;
    prevKey = key;
    return result;
  };
  Object.defineProperty(sel, "ids", { get: () => list(prev ?? {}) });
  sel.reset = () => {
    prev = null;
    prevKey = "";
  };
  return sel;
}

// src/i18n/de.ts
var de = {
  // ── Allgemein ──
  "common.robot": "Roboter",
  "common.dash": "\u2013",
  "common.ok": "OK",
  "common.cancel": "Abbrechen",
  "common.back": "Zur\xFCck",
  "common.close": "Schlie\xDFen",
  "common.open": "\xD6ffnen",
  "common.start": "Starten",
  "common.on": "an",
  "common.off": "aus",
  "common.active": "aktiv",
  "common.inactive": "inaktiv",
  "common.none": "keine",
  "common.present": "vorhanden",
  "common.missing": "fehlt",
  "unit.min": "min",
  "unit.m2": "m\xB2",
  // ── Navigation (dx-nav, config NAV) ──
  "nav.start": "\xDCbersicht",
  "nav.reinigen": "Karte",
  "nav.rooms": "R\xE4ume",
  "nav.planer": "Planer",
  "nav.protokoll": "Verlauf",
  "nav.prognose": "Prognose",
  "nav.einstellungen": "Einstellungen",
  "nav.brandSub": "Dein Saugroboter",
  "nav.model": "Dreame X60 Ultra",
  "nav.sidebar": "Seitenleiste",
  "nav.tabbar": "Tab-Leiste",
  // ── Seiten (pages.ts) ──
  "page.start.sub": "\xDCbersicht",
  "page.reinigen.title": "Karte",
  "page.reinigen.sub": "R\xE4ume, Zone oder Punkt reinigen \xB7 Hinfahren \xB7 Sperrzonen",
  "page.planer.title": "Planer",
  "page.planer.sub": "Vier Eintr\xE4ge \xB7 Automatik entscheidet voll, schnell oder warten",
  "page.protokoll.title": "Verlauf",
  "page.protokoll.sub": "Reinigungsprotokoll der App \xB7 Zeitleiste je Lauf \xB7 Lernwerte",
  "page.prognose.title": "Prognose",
  "page.prognose.sub": "Lernende Anwesenheit \xB7 Grundlage f\xFCr Start, Schnellprogramm und R\xFCckkehr",
  "page.einstellungen.title": "Einstellungen",
  "page.einstellungen.sub": "Darstellung, Funktionen, Prognose, Roboter, Diagnose",
  // Platzhalter je Unterseite: welche Bausteine hier laut Bauplan Abschnitt 7 entstehen (verschwinden mit den Modulen)
  "page.parts.reinigen": "dx-map-card full (4.3)|App-Szenen|St\xFChle am Boden|R\xE4ume (Roboter-Werte) \u2192 dx-rooms-dialog (4.6)",
  "page.parts.planer": "dx-planer (4.4)|dx-planer-editor + dx-clock-picker (4.5)|Automatik-Regeln|dx-estimate-dialog (4.8)",
  "page.parts.protokoll": "dx-history (4.7)|Lernwerte-Tabelle",
  "page.parts.prognose": "dx-prognose-view (4.10)",
  "page.parts.einstellungen": "dx-settings-panel (4.11)|dx-robot-settings (4.7)|Diagnose|Version",
  // ── Flächen der Bento-Übersicht (pages.ts START_SLOTS) ──
  "slot.map": "Live-Karte",
  "slot.automatik": "Automatik",
  "slot.auftrag": "Aktueller Auftrag",
  "slot.heute": "Heute",
  "slot.planer": "Planer",
  "slot.consumables": "Verschlei\xDF",
  "slot.station": "Station",
  "slot.stats": "Statistik",
  "slot.quickstart": "Schnellstart \u2013 R\xE4ume ausw\xE4hlen",
  "slot.history": "Letzte L\xE4ufe",
  // ── Kopfzeile (Shell) ──
  "topbar.back": "\xDCbersicht",
  "topbar.morning": "Guten Morgen",
  "topbar.day": "Guten Tag",
  "topbar.evening": "Guten Abend",
  "topbar.away": "{name} ist unterwegs",
  "topbar.inStation": "{name} ist in der Station",
  "topbar.home": "Zu Hause",
  "topbar.nobody": "Niemand zu Hause",
  "topbar.present": "{names} anwesend",
  "topbar.allAway": "alle unterwegs",
  "topbar.dnd": "Nicht st\xF6ren",
  "topbar.inDialog": "Im Dialog: {hint}",
  // ── Roboter-Panel (dx-hero) ──
  "hero.status": "Status",
  "hero.station": "Station",
  "hero.washing": "Mopp-W\xE4sche",
  "hero.drying": "trocknet",
  "hero.docked": "angedockt",
  "hero.charging": "l\xE4dt",
  "hero.away": "unterwegs",
  "hero.battery": "Akku",
  "hero.mode": "Modus",
  "hero.modeTitle": "Reinigungsmodus",
  "hero.suction": "Saugstufe",
  "hero.suctionTitle": "Saugleistung",
  "hero.water": "Wasser",
  "hero.waterTitle": "Wassermenge",
  "hero.roomsTitle": "R\xE4ume einstellen",
  // ── Auftrag-Kachel (dx-auftrag) ──
  "auftrag.title": "Aktueller Auftrag",
  "auftrag.rooms": "R\xE4ume",
  "auftrag.noRooms": "R\xE4ume \u2013",
  "auftrag.first": "Erster Raum",
  "auftrag.next": "N\xE4chster Raum",
  "auftrag.last": "Letzter Raum",
  // ── Schnellstart (dx-quickstart) ──
  "quickstart.title": "Schnellstart \u2013 R\xE4ume ausw\xE4hlen",
  "quickstart.multi": "Mehrfachauswahl",
  "quickstart.selected": "{n} gew\xE4hlt",
  "quickstart.all": "Alles",
  "quickstart.hint": "R\xE4ume antippen, dann \u201Ereinigen\u201C \u2013 {name} f\xE4hrt mit den Roboter-Werten je Raum.",
  "quickstart.robotFallback": "der Roboter",
  // ── Raumauswahl (shared/rooms, Karte, Schnellstart) ──
  "rooms.whole": "Ganze Wohnung",
  "rooms.one": "{n} Raum",
  "rooms.many": "{n} R\xE4ume",
  "rooms.confirm": "Jetzt reinigen: {list}?",
  "rooms.run": "{sel} reinigen",
  "rooms.clear": "Auswahl aufheben",
  "rooms.started": "Gestartet: {what}",
  "rooms.failed": "Start fehlgeschlagen: {error}",
  // ── Karte (dx-map-card, dx-heidi-map, map-config) ──
  "map.title": "Karte",
  "map.live": "Live-Karte",
  "map.rooms": "R\xE4ume",
  "map.zones": "Sperrzonen",
  "map.history": "Reinigungsverlauf",
  "map.toMap": "Zur Karte",
  "map.open": "Karte \xF6ffnen",
  "map.tapHint": "antippen f\xFCr R\xE4ume, Zone, Punkt, Sperrzonen",
  "map.capAway": "unterwegs",
  "map.capRest": "noch {rest}",
  "map.capStation": "{name} in der Station",
  "map.capLast": "letzter Lauf {time}",
  "map.goto": "Hinfahren",
  "map.all": "Alles",
  "map.allConfirm": "Ganze Wohnung reinigen?",
  "map.allStarted": "ganze Wohnung",
  "map.hintHeidi": "R\xE4ume in der Karte oder \xFCber die Kacheln antippen, dann \u201Ereinigen\u201C",
  "map.hintPlain": "R\xE4ume antippen, dann \u201Ereinigen\u201C",
  "map.loadError": "Karte konnte nicht geladen werden: {error}",
  "map.helpersMissing": "loadCardHelpers fehlt",
  "map.alt": "Karte",
  "map.noMapData": "Datenkarte fehlt \u2013 {entity} in der Dreame-Integration aktivieren",
  "map.loading": "Kartenpaket wird geladen \u2026",
  "map.noCalib": "Keine Kalibrierpunkte \u2013 R\xE4ume k\xF6nnen nicht eingezeichnet werden",
  "mapmode.raeume": "R\xE4ume",
  "mapmode.raeume.hint": "Auswahl per Kachel oder Tipp in die Raumfl\xE4che",
  "mapmode.zone": "Zone",
  "mapmode.zone.hint": "Rechteck auf der Karte aufziehen (bis zu 5), dann \u25B6 in der Karte",
  "mapmode.punkt": "Punkt",
  "mapmode.punkt.hint": "Punkt auf der Karte antippen, dann \u25B6 in der Karte",
  "mapmode.goto": "Hinfahren",
  "mapmode.goto.hint": "Punkt auf der Karte antippen \u2192 der Roboter f\xE4hrt hin und wartet",
  // ── Dialog (dx-dialog, Shell-Overlay) ──
  "dialog.overlay": "Overlay \u201E{kind}\u201C",
  "dialog.placeholder": "Platzhalter \u2013 der Inhalt dieses Dialogs entsteht mit seinem Baustein in Phase 4.",
  // ── Einrichtungsprüfung (domain/setup, dx-setup) ──
  "setup.title": "Einrichtung",
  "setup.problem": "Problem",
  "setup.problems": "Probleme",
  "setup.hint": "Hinweis",
  "setup.hints": "Hinweise",
  "setup.there": "Dort: {hint}",
  "setup.robot.label": "Roboter",
  "setup.robot.ok": "Roboter erkannt: {name}",
  "setup.robot.error": "Kein Dreame-Roboter gefunden \u2013 Integration einrichten oder \u201Erobot:\u201C in der Kartenkonfiguration setzen",
  "setup.package.label": "Paket",
  "setup.package.ok": "Paket vollst\xE4ndig",
  "setup.package.error": "{n} Helfer des Pakets fehlen \u2013 Paket heidi.yaml und Automationen pr\xFCfen",
  "setup.entities.label": "Roboter-Entit\xE4ten",
  "setup.entities.ok": "Roboter-Entit\xE4ten vollst\xE4ndig",
  "setup.entities.warn": "{n} Entit\xE4ten des Roboters fehlen oder sind deaktiviert",
  "setup.mapdata.label": "Datenkarte",
  "setup.mapdata.ok": "Datenkarte aktiv",
  "setup.mapdata.warn": "Datenkarte nicht aktiviert \u2013 R\xE4ume in der Heidi-Karte fehlen (Entit\xE4t \u201ECurrent Map Data\u201C in der Dreame-Integration einschalten)",
  "setup.customized.label": "Angepasste Reinigung",
  "setup.customized.ok": "Angepasste Reinigung an",
  "setup.customized.warn": "Angepasste Reinigung ist aus \u2013 Raumwerte je Raum wirken nicht",
  "setup.roomtypes.label": "Raumtypen",
  "setup.roomtypes.ok": "Raumtypen passen",
  "setup.roomtypes.warn": "{rooms}: benutzerdefiniert, obwohl die App den Standardtyp kennt \u2013 f\xFCr die Sprachsteuerung in der App \u201ERaum umbenennen\u201C den Typ w\xE4hlen",
  "setup.areas.label": "R\xE4ume \u2194 Bereiche",
  "setup.areas.ok": "Alle R\xE4ume einem HA-Bereich zugeordnet",
  "setup.areas.one": "Ein Raum ist",
  "setup.areas.many": "{n} R\xE4ume sind",
  "setup.areas.error": "{who} keinem HA-Bereich zugeordnet: {rooms}",
  "setup.areas.hint": "Reinigung \u2192 Nach Bereich \u2192 Konfigurieren",
  "setup.repairs.label": "Reparaturen",
  "setup.repairs.ok": "Keine offenen Reparaturen",
  "setup.repairs.one": "Reparatur",
  "setup.repairs.many": "Reparaturen",
  "setup.repairs.error": "{n} offene {what} in HA ({list})",
  // ── Seite Reinigen (Shell) ──
  "reinigen.scenes": "Dreame-App-Szenen",
  "reinigen.app": "App",
  "reinigen.sceneConfirm": "\u201E{name}\u201C starten?",
  "reinigen.chairs": "St\xFChle am Boden",
  "reinigen.chairsSub": "Setzt eine Sperrzone um den Esstisch",
  "reinigen.roomsTitle": "R\xE4ume (Roboter-Werte)",
  "reinigen.roomsHint": "Modus, Saugstufe, Wasser, Route und Wiederholungen je Raum, wie in der Dreame-App. \xC4nderungen gelten sofort.",
  "reinigen.roomsOpen": "R\xE4ume einstellen \u2026",
  "scene.32.name": "Eingang reinigen",
  "scene.32.sub": "Flur \xB7 Saugen + Wischen \xB7 2\xD7",
  "scene.33.name": "Bad Saugen/Wischen",
  "scene.33.sub": "Bad \xB7 1\xD7",
  "scene.34.name": "Wischen nach dem Saugen",
  "scene.34.sub": "Ganze Wohnung \xB7 nur Wischen",
  // ── Platzhalter-Vorschauen der Shell (verschwinden mit den Modulen) ──
  "preview.entities": "{n} Entit\xE4ten verbunden",
  "preview.noStates": "keine Zustandsdaten",
  "preview.map": "Kartendarstellung: {karte} \xB7 Kalibrierung: {calib}",
  "preview.calibPoints": "{n} Punkte",
  "preview.automatik": "Automatik: {status}",
  "preview.today": "Heutiger Eintrag: {name}",
  "preview.prognose": "Freies Fenster {window} \xB7 R\xFCckkehr {back}",
  "preview.prognoseOff": "Prognose aus",
  "preview.stats": "{runs} L\xE4ufe \xB7 {area} m\xB2 \xB7 {time} min",
  "preview.rooms": "R\xE4ume: {list}",
  "preview.noRooms": "keine (Karte fehlt)",
  "preview.entries": "{n} Eintr\xE4ge",
  "preview.stale": " \xB7 letzter Stand",
  "preview.placeholder": "Platzhalter \u2013 entsteht in Aufgabe {task}.",
  "preview.mapPage": "Kartendarstellung: {karte} \xB7 St\xFChle am Boden: {chairs} \xB7 Kalibrierung: {calib}",
  "preview.plan": "{n} {name} \xB7 {state} \xB7 {rooms} R\xE4ume \xB7 {time}",
  "preview.learn": "Lernwerte: {state}",
  "preview.history": "{entries} Eintr\xE4ge \xB7 {runs} L\xE4ufe \xB7 {area} m\xB2 \xB7 {time} min{stale}",
  "preview.prognosePage": "{state} \xB7 {days} Tage \xB7 frei {window} \xB7 R\xFCckkehr {back}",
  "preview.settings": "Karte {karte} \xB7 Diagnose: {missing} fehlend, {unavailable} unavailable von {total}",
  "preview.robot": "Roboter: {list} \xB7 DND {start}\u2013{end}",
  "preview.pageTitle": "Seite \u201E{page}\u201C",
  "preview.parts": "Hier entstehen",
  "preview.views": "Sichten (Vorschau aus den Selektoren)",
  "preview.mockup": "Platzhalter aus Aufgabe 3.3 \u2013 Optik nach Mockup",
  // ── Karte in HA (customCards, Konfiguration) ──
  "card.name": "Heidi (dreame_x60)",
  "card.description": "Heidi-Karte v2 \u2013 \xDCbersicht und Unterseiten des Saugroboters",
  "card.noConfig": "dreame-x60-panel: Konfiguration fehlt",
  // ── Status des Roboters (sensor.<gerät>_status, vacuum-Zustand) – wie v1 STATUS_DE ──
  "status.sleeping": "schl\xE4ft",
  "status.charging": "l\xE4dt",
  "status.cleaning": "reinigt",
  "status.sweeping": "saugt",
  "status.mopping": "wischt",
  "status.sweeping_and_mopping": "saugt und wischt",
  "status.returning": "f\xE4hrt zur Station",
  "status.paused": "pausiert",
  "status.idle": "bereit",
  "status.docked": "angedockt",
  "status.washing": "Mopp-W\xE4sche",
  "status.drying": "trocknet",
  "status.auto_emptying": "saugt ab",
  "status.error": "Fehler",
  "status.charging_completed": "voll geladen",
  "status.segment_cleaning": "reinigt R\xE4ume",
  "status.zone_cleaning": "reinigt Zone",
  "status.spot_cleaning": "reinigt Punkt",
  "status.cruising": "f\xE4hrt",
  // ── Auftragsart (sensor.<gerät>_task_status) – wie v1 TASK ──
  "task.room_cleaning": "Reinigt R\xE4ume",
  "task.zone_cleaning": "Reinigt Zone",
  "task.spot_cleaning": "Reinigt Punkt",
  "task.cleaning": "Reinigt",
  "task.cruising": "F\xE4hrt",
  "task.mapping": "Erstellt Karte",
  "task.fast_mapping": "Erstellt Karte",
  "task.default": "Reinigt",
  // ── Kopf (domain/status) ──
  "head.error": "Fehler",
  "head.paused": "Pausiert",
  "head.returning": "F\xE4hrt zur Station",
  "button.pause": "Pause",
  "button.stop": "Stopp",
  "button.station": "Station",
  "button.resume": "Weiter",
  "button.start": "Start",
  "button.locate": "Orten",
  // ── Beschriftungen (domain/labels) ──
  "label.daily": "T\xE4glich",
  "label.manual": "Manuell",
  "label.weekdays": "Mo\u2013Fr",
  "label.weekend": "Sa + So",
  "label.allRooms": "Alle",
  "label.noRooms": "keine R\xE4ume",
  "label.min": "{n} min",
  "label.hmin": "{h} h {m} min",
  "label.lessMin": "< 1 min",
  "label.today": "heute",
  "day.0": "Mo",
  "day.1": "Di",
  "day.2": "Mi",
  "day.3": "Do",
  "day.4": "Fr",
  "day.5": "Sa",
  "day.6": "So",
  // ── Dauer & Akku (domain/estimate) ──
  "estimate.washBefore": "W\xE4scht Mopp vor dem Start",
  "estimate.washBetween": "W\xE4scht Mopp zwischendurch",
  "estimate.charge": "L\xE4dt {from} % \u2192 {to} %",
  "estimate.home": "F\xE4hrt zur Station",
  "estimate.sourcePrognose": "Prognose",
  "estimate.sourceUsual": "\xFCbliche R\xFCckkehr {time}",
  // ── Streifen (domain/strip) ──
  "strip.startpoint": "F\xE4hrt zum Startpunkt",
  "strip.to": "zu {rooms}",
  "strip.through": "F\xE4hrt durch {room}",
  "strip.now": "Jetzt: {room}",
  "strip.then": "danach {rooms}",
  "strip.lastRoom": "letzter Raum",
  // ── Optionen des Roboters über die v1-Zuordnung hinaus (ha/profile) ──
  "option.mopping_after_sweeping": "Wischen nach Saugen",
  "option.quick": "Schnell",
  "option.off": "Aus",
  "option.on": "An",
  // ── Raumnamen der Integration → deutsch (v1 ROOMS_DE) ──
  "room.Bathroom": "Bad",
  "room.Primary Bedroom": "Schlafzimmer",
  "room.WC": "WC",
  "room.Corridor": "Flur",
  "room.Study": "B\xFCro",
  "room.Kitchen": "K\xFCche",
  "room.Living Room": "Wohnzimmer",
  "room.fallback": "Raum {n}",
  // ── Raumtypen der Dreame-App (domain/rooms ROOM_TYPES, type 1..15) ──
  "roomtype.1": "Wohnzimmer",
  "roomtype.2": "Schlafzimmer",
  "roomtype.3": "Arbeitszimmer",
  "roomtype.4": "K\xFCche",
  "roomtype.5": "Esszimmer",
  "roomtype.6": "Bad",
  "roomtype.7": "Balkon",
  "roomtype.8": "Flur",
  "roomtype.9": "Allzweckraum",
  "roomtype.10": "Garderobe",
  "roomtype.11": "Salon",
  "roomtype.12": "B\xFCro",
  "roomtype.13": "Fitnessbereich",
  "roomtype.14": "Freizeitbereich",
  "roomtype.15": "Nebenzimmer",
  // ── Einstellungen (ha/selectors readSettings) ──
  "settings.automatik": "Automatik",
  "settings.planer": "Planer anzeigen",
  "settings.prognose": "Prognose",
  "settings.prognoseSub": "Lernende Anwesenheit, eigene Seite",
  "settings.nina": "Nina z\xE4hlt f\xFCr Anwesenheit",
  "settings.interval": "Protokoll-Intervall",
  "settings.intervalSub": "Wie oft die Anwesenheit gespeichert wird",
  "settings.resolution": "Aufl\xF6sung",
  "settings.resolutionSub": "Rasterbreite der Heatmap und Prognose",
  "settings.weeks": "Lernzeitraum",
  "settings.weeksSub": "\xC4ltere Daten werden verworfen",
  "settings.halflife": "Gewichtung",
  "settings.halflifeSub": "Halbwertszeit \u2013 so alt z\xE4hlt ein Tag nur noch halb",
  "settings.minDays": "Aktiv ab",
  "settings.minDaysSub": "Erst dann nutzt die Automatik die Prognose",
  "settings.unitMin": " min",
  "settings.unitWeeks": " Wochen",
  "settings.unitDays": " Tage",
  "settings.unitDaysFrom": " Tagen",
  "settings.original": "Original",
  "settings.german": "Deutsch",
  // ── Prognose-Schalter (readPrognose) ──
  "prognose.deviation": "Abweichung heute",
  "prognose.deviationSub": "Urlaub, Feiertag",
  "prognose.include": "{name} einbeziehen",
  "prognose.gpsWlan": "GPS + WLAN",
  "prognose.wlan": "WLAN",
  // ── Station (readStation) ──
  "station.bag": "Beutel",
  "station.fresh": "Frisch",
  "station.dirty": "Abwasser",
  "station.detergent": "Mittel",
  "station.ok": "OK",
  "station.check": "Pr\xFCfen",
  "station.empty": "Leer",
  "station.missing": "Fehlt",
  "station.full": "Voll",
  "station.autoEmpty": "Absaugen",
  "station.mop": "Mopp",
  "station.dry": "Trocknen",
  "station.clean": "Station",
  "station.cleanConfirm": "Reinigung der Station starten?",
  // ── Verschleiß (readConsumables) ──
  "consumable.mainBrush": "Hauptb\xFCrste",
  "consumable.sideBrush": "Seitenb\xFCrste",
  "consumable.filter": "Filter",
  "consumable.sensor": "Sensoren",
  "consumable.wheel": "R\xE4der",
  // ── Roboter-Einstellungen (readRobotSettings) ──
  "robotsettings.carpet": "Teppich",
  "robotsettings.waterTemp": "Wassertemperatur",
  "robotsettings.drying": "Trocknung",
  "robotsettings.autoEmpty": "Absaugen",
  "robotsettings.selfClean": "Mopp-W\xE4sche",
  "robotsettings.cleangenius": "CleanGenius",
  "robotsettings.selfCleanArea": "Mopp-W\xE4sche nach",
  "robotsettings.volume": "Lautst\xE4rke",
  "robotsettings.unitM2": " m\xB2",
  "robotsettings.unitPct": " %",
  // ── Diagnose, Automatik ──
  "diag.robot": "Roboter ({name})",
  "diag.robotUnknown": "nicht erkannt",
  "diag.package": "Paket (Helfer, Sensoren)",
  "automatik.never": "noch nie",
  // ── Hinweise und Fehler des Roboters (sensor.<gerät>_error): Kurztext (höchstens zwei Wörter) im Chip ──
  // Quelle: docs/dreame_x60/ENTITAETEN.md „Warnungen und Fehler“ (Integration dreame-vacuum 2.0.0b25); dazu die
  // v1-Schlüssel, die es dort nicht gibt (brush_stuck …), damit die v1-Vektoren gleich bleiben.
  "error.drop": "R\xE4der frei",
  "error.cliff": "Absturzsensor",
  "error.bumper": "Sto\xDFsensor klemmt",
  "error.gesture": "Steht schr\xE4g",
  "error.bumper_repeat": "Sto\xDFsensor klemmt",
  "error.drop_repeat": "R\xE4der frei",
  "error.optical_flow": "Sensorfehler",
  "error.no_box": "Staubbox fehlt",
  "error.no_tank_box": "Tank fehlt",
  "error.water_box_empty": "Wassertank leer",
  "error.box_full": "Filter verstopft",
  "error.brush": "Hauptb\xFCrste verwickelt",
  "error.side_brush": "Seitenb\xFCrste verwickelt",
  "error.fan": "Filter verstopft",
  "error.left_wheel_motor": "Rad blockiert",
  "error.right_wheel_motor": "Rad blockiert",
  "error.turn_suffocate": "Steckt fest",
  "error.forward_suffocate": "Steckt fest",
  "error.charger_get": "Station fehlt",
  "error.battery_low": "Akku schwach",
  "error.charge_fault": "Ladefehler",
  "error.battery_percentage": "Akkufehler",
  "error.heart": "Interner Fehler",
  "error.camera_occlusion": "Sensor verdeckt",
  "error.move": "Sensorfehler",
  "error.flow_shielding": "Sensor verdeckt",
  "error.infrared_shielding": "Sensor verdeckt",
  "error.charge_no_electric": "Station stromlos",
  "error.battery_fault": "Akkutemperatur",
  "error.fan_speed_error": "L\xFCfterfehler",
  "error.left_wheell_speed": "Rad blockiert",
  "error.right_wheell_speed": "Rad blockiert",
  "error.bmi055_acce": "Sensorfehler",
  "error.bmi055_gyro": "Gyroskopfehler",
  "error.xv7001": "Gyroskopfehler",
  "error.left_magnet": "Magnetsensor",
  "error.right_magnet": "Magnetsensor",
  "error.flow_error": "Sensorfehler",
  "error.infrared_fault": "Infrarotfehler",
  "error.camera_fault": "Kamerafehler",
  "error.strong_magnet": "Magnetfeld",
  "error.water_pump": "Wasserpumpe",
  "error.rtc": "Uhrfehler",
  "error.auto_key_trig": "Interner Fehler",
  "error.p3v3": "Interner Fehler",
  "error.camera_idle": "Interner Fehler",
  "error.blocked": "Weg blockiert",
  "error.lds_error": "Laserfehler",
  "error.lds_bumper": "Laserturm klemmt",
  "error.filter_blocked": "Filter verstopft",
  "error.edge": "Kantensensor",
  "error.carpet": "Teppich erkannt",
  "error.laser": "Sensor gest\xF6rt",
  "error.ultrasonic": "Ultraschallsensor",
  "error.no_go_zone": "In Sperrzone",
  "error.route": "Ziel unerreichbar",
  "error.restricted": "In Sperrzone",
  "error.remove_mop": "Mopp abnehmen",
  "error.mop_removed": "Mopp abgefallen",
  "error.mop_pad_stop_rotate": "Mopp blockiert",
  "error.mop_install_failed": "Mopp anbringen",
  "error.low_battery_turn_off": "Akku leer",
  "error.dirty_tank_not_installed": "Abwassertank fehlt",
  "error.robot_in_hidden_room": "Bereich ausgeblendet",
  "error.lds_failed_to_lift": "Laserturm klemmt",
  "error.robot_stuck": "Steckt fest",
  "error.slippery_floor": "Rutschiger Boden",
  "error.unknown": "Unbekannte Meldung",
  "error.check_mop_install": "Mopp pr\xFCfen",
  "error.dirty_water_tank_full": "Abwasser voll",
  "error.retractable_leg_stuck": "Beine verwickelt",
  "error.internal_error": "Interner Fehler",
  "error.robot_stuck_on_tables": "Steckt fest",
  "error.robot_stuck_on_passage": "Steckt fest",
  "error.robot_stuck_on_threshold": "Steckt fest",
  "error.robot_stuck_on_low_lying_area": "Steckt fest",
  "error.robot_stuck_on_ramp": "Rampe erkannt",
  "error.robot_stuck_on_obstacle": "Hindernis",
  "error.robot_stuck_on_pet": "Person/Tier",
  "error.robot_stuck_on_slippery_surface": "Rutscht",
  "error.robot_stuck_on_carpet": "Steckt fest",
  "error.bin_full": "Staubbeutel voll",
  "error.bin_open": "Station offen",
  "error.water_tank": "Frischwassertank fehlt",
  "error.dirty_water_tank": "Abwasser voll",
  "error.water_tank_dry": "Frischwasser leer",
  "error.dirty_water_tank_blocked": "Abwassertank verstopft",
  "error.dirty_water_tank_pump": "Abwasserpumpe",
  "error.mop_pad": "Waschbrett fehlt",
  "error.wet_mop_pad": "Waschbrett reinigen",
  "error.clean_mop_pad": "Mopp reinigen",
  "error.clean_tank_level": "Frischwasser knapp",
  "error.station_disconnected": "Station getrennt",
  "error.dirty_tank_level": "Abwasser voll",
  "error.washboard_level": "Waschbrett reinigen",
  "error.no_mop_in_station": "Mopp fehlt",
  "error.dust_bag_full": "Staubbeutel voll",
  "error.self_test_failed": "Selbsttest fehlgeschlagen",
  "error.washboard_not_working": "Waschbrett defekt",
  "error.drainage_failed": "Abpumpen gest\xF6rt",
  "error.mop_not_detected": "Mopp fehlt",
  "error.mop_holder_error": "Mopphalter falsch",
  "error.dock_error": "Stationsfehler",
  "error.wash_failed": "W\xE4sche fehlgeschlagen",
  "error.robot_stuck_on_curtain": "Steckt fest",
  "error.edge_mop_stop_rotate": "Kantenmopp blockiert",
  "error.edge_mop_detached": "Kantenmopp abgefallen",
  "error.chassis_lift_malfunction": "Fahrwerk defekt",
  "error.mop_cover_error": "Moppabdeckung",
  "error.roller_mop_error": "Rollenmopp gest\xF6rt",
  "error.robotic_arm_stopped": "Arm gestoppt",
  "error.onboard_water_tank_empty": "Wassertank leer",
  "error.onboard_dirty_water_tank_full": "Abwasserbox voll",
  "error.mop_not_installed": "Mopp fehlt",
  "error.fluffing_roller_error": "Rolle gest\xF6rt",
  "error.blocked_by_obstacle": "Hindernis",
  "error.return_to_charge_failed": "R\xFCckkehr fehlgeschlagen",
  "error.drainage_outlet_filter": "Abwasserfilter verstopft",
  "error.main_wheels_error": "Radfehler",
  // v1-Schlüssel ohne Gegenstück in dieser Integrationsversion (Vektoren)
  "error.clean_water_tank_empty": "Frischwasser leer",
  "error.dust_box_missing": "Staubbox fehlt",
  "error.wheels_stuck": "Rad blockiert",
  "error.brush_stuck": "B\xFCrste blockiert",
  "error.low_battery": "Akku leer",
  "error.detergent_empty": "Reinigungsmittel leer",
  "error.water_tank_missing": "Wassertank fehlt",
  "error.clean_water_tank_missing": "Frischwassertank fehlt",
  "error.dirty_water_tank_missing": "Abwassertank fehlt",
  // ── Langtext je Zustandswert (Tooltip / Detail, PD-015) – Bedeutung aus ENTITAETEN.md ──
  "errorLong.drop": "R\xE4der h\xE4ngen in der Luft \u2013 Roboter neu aufsetzen und neu starten.",
  "errorLong.cliff": "Absturzsensor gest\xF6rt \u2013 Sensor abwischen und nicht direkt an der Treppe starten.",
  "errorLong.bumper": "Sto\xDFsensor klemmt \u2013 reinigen und vorsichtig antippen.",
  "errorLong.gesture": "Roboter steht schr\xE4g \u2013 auf eine ebene Fl\xE4che setzen und neu starten.",
  "errorLong.bumper_repeat": "Sto\xDFsensor klemmt wiederholt \u2013 reinigen und vorsichtig antippen.",
  "errorLong.drop_repeat": "R\xE4der h\xE4ngen wiederholt in der Luft \u2013 Roboter neu aufsetzen.",
  "errorLong.optical_flow": "Optischer Flusssensor gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.no_box": "Staubbox nicht eingesetzt \u2013 Staubbox und Filter einsetzen.",
  "errorLong.no_tank_box": "Wassertank nicht eingesetzt \u2013 Tank einsetzen.",
  "errorLong.water_box_empty": "Wassertank leer \u2013 bitte auff\xFCllen.",
  "errorLong.box_full": "Filter feucht oder verstopft \u2013 pr\xFCfen, ob der Filter trocken ist oder gereinigt werden muss.",
  "errorLong.brush": "Hauptb\xFCrste verwickelt \u2013 B\xFCrste herausnehmen, Borsten und Lager reinigen.",
  "errorLong.side_brush": "Seitenb\xFCrste verwickelt \u2013 abnehmen und reinigen.",
  "errorLong.fan": "Filter feucht oder verstopft \u2013 pr\xFCfen, ob der Filter trocken ist oder gereinigt werden muss.",
  "errorLong.left_wheel_motor": "Roboter steckt fest oder das linke Rad ist blockiert \u2013 R\xE4der pr\xFCfen und an neuer Stelle starten.",
  "errorLong.right_wheel_motor": "Roboter steckt fest oder das rechte Rad ist blockiert \u2013 R\xE4der pr\xFCfen und an neuer Stelle starten.",
  "errorLong.turn_suffocate": "Roboter steckt fest und kann nicht drehen \u2013 Umgebung freir\xE4umen.",
  "errorLong.forward_suffocate": "Roboter steckt fest und kann nicht vorw\xE4rts \u2013 Umgebung freir\xE4umen.",
  "errorLong.charger_get": "Station nicht gefunden \u2013 pr\xFCfen, ob das Stromkabel richtig steckt.",
  "errorLong.battery_low": "Akku schwach \u2013 bitte laden.",
  "errorLong.charge_fault": "Ladefehler \u2013 Ladekontakte von Roboter und Station mit einem trockenen Tuch abwischen.",
  "errorLong.battery_percentage": "Fehler beim Akkustand.",
  "errorLong.heart": "Interner Fehler \u2013 Roboter neu starten.",
  "errorLong.camera_occlusion": "Sensor der Bildpositionierung verdeckt \u2013 bitte reinigen.",
  "errorLong.move": "Bewegungssensor gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.flow_shielding": "Optischer Sensor verdeckt \u2013 abwischen und neu starten.",
  "errorLong.infrared_shielding": "Infrarotsensor verdeckt \u2013 Roboter neu starten.",
  "errorLong.charge_no_electric": "Ladestation ohne Strom \u2013 pr\xFCfen, ob das Stromkabel richtig steckt.",
  "errorLong.battery_fault": "Akkutemperatur au\xDFerhalb des Bereichs \u2013 warten, bis sie wieder normal ist.",
  "errorLong.fan_speed_error": "L\xFCfterdrehzahl-Sensor gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.left_wheell_speed": "Linkes Rad blockiert \u2013 R\xE4der pr\xFCfen und an neuer Stelle starten.",
  "errorLong.right_wheell_speed": "Rechtes Rad blockiert \u2013 R\xE4der pr\xFCfen und an neuer Stelle starten.",
  "errorLong.bmi055_acce": "Beschleunigungssensor gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.bmi055_gyro": "Gyroskop gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.xv7001": "Gyroskop gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.left_magnet": "Magnetsensor links gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.right_magnet": "Magnetsensor rechts gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.flow_error": "Flusssensor gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.infrared_fault": "Infrarot gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.camera_fault": "Kamera gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.strong_magnet": "Starkes Magnetfeld erkannt \u2013 nicht direkt an der virtuellen Wand starten.",
  "errorLong.water_pump": "Wasserpumpe gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.rtc": "Uhr (RTC) gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.auto_key_trig": "Interner Fehler \u2013 Roboter neu starten.",
  "errorLong.p3v3": "Interner Fehler \u2013 Roboter neu starten.",
  "errorLong.camera_idle": "Interner Fehler \u2013 Roboter neu starten.",
  "errorLong.blocked": "Reinigungsweg blockiert oder Roboter steckt fest \u2013 T\xFCren \xF6ffnen, Hindernisse oder Sperrzone im Weg r\xE4umen.",
  "errorLong.lds_error": "Laser-Abstandssensor gest\xF6rt \u2013 auf Fremdk\xF6rper pr\xFCfen.",
  "errorLong.lds_bumper": "Sto\xDFsensor des Laserturms klemmt \u2013 pr\xFCfen.",
  "errorLong.filter_blocked": "Filter feucht oder verstopft \u2013 pr\xFCfen, ob der Filter trocken ist oder gereinigt werden muss.",
  "errorLong.edge": "Kantensensor gest\xF6rt \u2013 pr\xFCfen und reinigen.",
  "errorLong.carpet": "Teppich beim Wischen erkannt \u2013 Roboter an eine andere Stelle setzen und neu starten.",
  "errorLong.laser": "3D-Hindernissensor gest\xF6rt \u2013 Sensor reinigen.",
  "errorLong.ultrasonic": "Ultraschallsensor gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.no_go_zone": "Sperrzone oder virtuelle Wand erkannt \u2013 Roboter aus dem Bereich setzen und neu starten.",
  "errorLong.route": "Zielbereich nicht erreichbar \u2013 T\xFCren \xF6ffnen, Hindernisse r\xE4umen oder Sperrzone im Weg l\xF6schen.",
  "errorLong.restricted": "Roboter steht in einer Sperrzone \u2013 aus dem Bereich setzen.",
  "errorLong.remove_mop": "Wischen fertig \u2013 Mopp abnehmen und reinigen.",
  "errorLong.mop_removed": "Mopp-Pad w\xE4hrend der Reinigung abgefallen \u2013 vor dem Weiterfahren anbringen.",
  "errorLong.mop_pad_stop_rotate": "Mopp-Pad dreht sich nicht \u2013 bitte pr\xFCfen.",
  "errorLong.mop_install_failed": "Mopp-Pad automatisch anbringen fehlgeschlagen \u2013 von Hand anbringen.",
  "errorLong.low_battery_turn_off": "Akku leer \u2013 Roboter schaltet gleich ab.",
  "errorLong.dirty_tank_not_installed": "Schmutzwassertank im Roboter fehlt \u2013 richtig einsetzen und Lauf starten.",
  "errorLong.robot_in_hidden_room": "Roboter steht in einem ausgeblendeten Bereich \u2013 an passende Stelle setzen und neu versuchen.",
  "errorLong.lds_failed_to_lift": "Laserturm l\xE4sst sich nicht anheben \u2013 Umgebung freir\xE4umen und Roboter in einen offenen Bereich setzen.",
  "errorLong.robot_stuck": "Roboter steckt fest oder kann sich nicht positionieren \u2013 in einen offenen Bereich setzen und fortsetzen.",
  "errorLong.slippery_floor": "Rutschiger Boden \u2013 Roboter kommt nicht \xFCber das Hindernis; warten oder Wasser um den Roboter aufwischen.",
  "errorLong.unknown": "Unbekannte Meldung des Roboters.",
  "errorLong.check_mop_install": "Mopp-Halterung pr\xFCfen \u2013 ist der Mopp richtig eingesetzt?",
  "errorLong.dirty_water_tank_full": "Schmutzwassertank im Roboter zu voll oder verschmutzt \u2013 leeren und reinigen.",
  "errorLong.retractable_leg_stuck": "Ausfahrbare Beine verwickelt \u2013 pr\xFCfen.",
  "errorLong.internal_error": "Interner Fehler \u2013 Roboter neu starten.",
  "errorLong.robot_stuck_on_tables": "Steckt zwischen Tischen und St\xFChlen fest \u2013 in einen offenen Bereich setzen und neu starten.",
  "errorLong.robot_stuck_on_passage": "Steckt in einem engen Durchgang fest \u2013 in einen offenen Bereich setzen; Durchgang als Sperrzone eintragen.",
  "errorLong.robot_stuck_on_threshold": "Steckt an einer Stufe oder Schwelle fest \u2013 in einen offenen Bereich setzen; Schwelle als Sperrzone eintragen.",
  "errorLong.robot_stuck_on_low_lying_area": "Steckt unter einem niedrigen M\xF6bel fest \u2013 in einen offenen Bereich setzen; Bereich als Sperrzone eintragen.",
  "errorLong.robot_stuck_on_ramp": "Absturzgef\xE4hrdete Rampe auf dem Weg erkannt \u2013 passierbare Schwellen einstellen, wenn keine Rampe da ist.",
  "errorLong.robot_stuck_on_obstacle": "Hindernis auf dem Weg \u2013 r\xE4umen und Lauf neu starten.",
  "errorLong.robot_stuck_on_pet": "Person oder Haustier auf dem Weg \u2013 beim Neustart den Weg freihalten.",
  "errorLong.robot_stuck_on_slippery_surface": "Steckt fest wegen Rutschens \u2013 Hauptreifen reinigen.",
  "errorLong.robot_stuck_on_carpet": "Rutscht auf dem Teppich \u2013 vom Teppich setzen und neu starten; Teppich als Sperrzone eintragen.",
  "errorLong.bin_full": "Staubbeutel voll oder Luftkanal verstopft \u2013 pr\xFCfen.",
  "errorLong.bin_open": "Deckel der Absaugstation offen oder Staubbeutel fehlt \u2013 pr\xFCfen.",
  "errorLong.water_tank": "Frischwassertank nicht eingesetzt \u2013 einsetzen.",
  "errorLong.dirty_water_tank": "Schmutzwassertank voll oder nicht eingesetzt \u2013 pr\xFCfen.",
  "errorLong.water_tank_dry": "Zu wenig Wasser im Frischwassertank \u2013 nachf\xFCllen, sonst f\xE4hrt der Roboter nicht zur Mopp-W\xE4sche.",
  "errorLong.dirty_water_tank_blocked": "Schmutzwassertank verstopft \u2013 Roboter neu starten.",
  "errorLong.dirty_water_tank_pump": "Pumpe des Schmutzwassertanks gest\xF6rt \u2013 Roboter neu starten.",
  "errorLong.mop_pad": "Waschbrett nicht richtig eingesetzt \u2013 Roboter kann nicht zur Waschstation; Waschbrett und Verschl\xFCsse pr\xFCfen.",
  "errorLong.wet_mop_pad": "Wasserstand im Waschbrett abnormal \u2013 Waschbrett rechtzeitig reinigen, sonst droht Verstopfung.",
  "errorLong.clean_mop_pad": "Reinigung fertig \u2013 Waschbrett des Mopps rechtzeitig reinigen, sonst Flecken und Geruch.",
  "errorLong.clean_tank_level": "Frischwassertank bald leer \u2013 pr\xFCfen und nachf\xFCllen.",
  "errorLong.station_disconnected": "Station ohne Strom \u2013 Stromversorgung und Netzstecker der Station pr\xFCfen.",
  "errorLong.dirty_tank_level": "Schmutzwassertank zu voll \u2013 pr\xFCfen und leeren.",
  "errorLong.washboard_level": "Wasserstand im Waschbrett zu hoch \u2013 Schmutzwassertank und Waschbrett reinigen.",
  "errorLong.no_mop_in_station": "Mopp nicht in der Station \u2013 in die Station legen oder am Roboter anbringen.",
  "errorLong.dust_bag_full": "Staubbeutel pr\xFCfen und wechseln. Absaug\xF6ffnungen von Staubbox und Station regelm\xE4\xDFig reinigen.",
  "errorLong.self_test_failed": "Selbsttest fehlgeschlagen \u2013 kein Wasser im Frischwassertank des Wassermoduls.",
  "errorLong.washboard_not_working": "Waschbrett arbeitet nicht \u2013 auf Verwicklung pr\xFCfen und reinigen.",
  "errorLong.drainage_failed": "Abpumpen des Schmutzwassers gest\xF6rt \u2013 Kundendienst kontaktieren.",
  "errorLong.mop_not_detected": "Mopp nicht erkannt \u2013 anbringen und Lauf fortsetzen.",
  "errorLong.mop_holder_error": "Mopp-Halter in der Station falsch \u2013 Anzahl und Lage pr\xFCfen.",
  "errorLong.dock_error": "Stationsfehler \u2013 Klappe ganz schlie\xDFen und Mopps richtig einlegen.",
  "errorLong.wash_failed": "Mopp-W\xE4sche fehlgeschlagen \u2013 Station pr\xFCfen, Mopp von Hand anbringen.",
  "errorLong.robot_stuck_on_curtain": "Steckt im Vorhang fest \u2013 Roboter wegsetzen und neu starten; Bereich als Sperrzone eintragen.",
  "errorLong.edge_mop_stop_rotate": "Kanten-Mopp dreht sich nicht \u2013 pr\xFCfen, ob der Roboter auf Teppich steht.",
  "errorLong.edge_mop_detached": "Kanten-Mopp abgefallen \u2013 vor dem Weiterfahren anbringen.",
  "errorLong.chassis_lift_malfunction": "Fahrwerkshub defekt \u2013 Lauf neu starten; bleibt es, Kundendienst kontaktieren.",
  "errorLong.mop_cover_error": "Mopp-Abdeckung gest\xF6rt \u2013 Rollen-Mopp und Abdeckung reinigen, Roboter flach hinstellen und fortsetzen.",
  "errorLong.roller_mop_error": "Rollen-Mopp gest\xF6rt \u2013 Rollen-Mopp und Abdeckung reinigen, Roboter flach hinstellen und fortsetzen.",
  "errorLong.robotic_arm_stopped": "Roboterarm gestoppt \u2013 Stationsknopf und Arm-Knopf gedr\xFCckt halten, um zur\xFCckzusetzen.",
  "errorLong.onboard_water_tank_empty": "Wassertank im Roboter leer \u2013 bitte nachf\xFCllen.",
  "errorLong.onboard_dirty_water_tank_full": "Schmutzwasserbox im Roboter voll \u2013 herausnehmen und leeren, oder zur Mopp-W\xE4sche in die Station.",
  "errorLong.mop_not_installed": "Mopp nicht eingesetzt \u2013 vor dem Start pr\xFCfen, ob der Rollen-Mopp richtig sitzt.",
  "errorLong.fluffing_roller_error": "Aufplusterrolle gest\xF6rt \u2013 Roboter umdrehen, Rolle entriegeln und reinigen.",
  "errorLong.blocked_by_obstacle": "Von einem Hindernis blockiert \u2013 vor dem Roboter r\xE4umen.",
  "errorLong.return_to_charge_failed": "R\xFCckkehr zur Station fehlgeschlagen \u2013 Rampe und Stromversorgung der Station pr\xFCfen.",
  "errorLong.drainage_outlet_filter": "Abwasserfilter des Roboters verstopft \u2013 reinigen, damit das Wasser flie\xDFt.",
  "errorLong.main_wheels_error": "Hauptrad-Fehler \u2013 Reinigung pausiert; am Roboter oder in der App fortsetzen.",
  "errorLong.clean_water_tank_empty": "Frischwassertank leer \u2013 nachf\xFCllen.",
  "errorLong.dust_box_missing": "Staubbox nicht eingesetzt.",
  "errorLong.wheels_stuck": "Rad blockiert \u2013 R\xE4der pr\xFCfen.",
  "errorLong.brush_stuck": "B\xFCrste blockiert \u2013 B\xFCrste pr\xFCfen und reinigen.",
  "errorLong.low_battery": "Akku leer \u2013 bitte laden.",
  "errorLong.detergent_empty": "Reinigungsmittel leer \u2013 nachf\xFCllen.",
  "errorLong.water_tank_missing": "Wassertank nicht eingesetzt.",
  "errorLong.clean_water_tank_missing": "Frischwassertank nicht eingesetzt.",
  "errorLong.dirty_water_tank_missing": "Abwassertank nicht eingesetzt."
};

// src/i18n/t.ts
var TABLE = de;
function fill(raw, params) {
  return params ? raw.replace(/\{(\w+)\}/g, (m2, k2) => k2 in params ? String(params[k2]) : m2) : raw;
}
function t3(key, params) {
  return fill(TABLE[key] ?? key, params);
}
function tx(key, params) {
  return fill(TABLE[key] ?? key, params);
}
function lookup(prefix, value) {
  return TABLE[`${prefix}.${value}`];
}

// src/domain/rooms.ts
var ROOM_TYPE_EN = [
  [1, "Living Room", "mdi:sofa-outline"],
  [2, "Primary Bedroom", "mdi:bed-king-outline"],
  [3, "Study", "mdi:bookshelf"],
  [4, "Kitchen", "mdi:chef-hat"],
  [5, "Dining Hall", "mdi:silverware-fork-knife"],
  [6, "Bathroom", "mdi:shower"],
  [7, "Balcony", "mdi:balcony"],
  [8, "Corridor", "mdi:foot-print"],
  [9, "Utility Room", "mdi:archive-outline"],
  [10, "Closet", "mdi:hanger"],
  [11, "Meeting Room", "mdi:presentation"],
  [12, "Office", "mdi:monitor"],
  [13, "Fitness Area", "mdi:dumbbell"],
  [14, "Recreation Area", "mdi:gamepad-variant-outline"],
  [15, "Secondary Bedroom", "mdi:bed-single-outline"]
];
var ROOM_TYPES = Object.fromEntries(
  ROOM_TYPE_EN.map(([id, en, icon]) => [id, { name: tx(`roomtype.${id}`), en, icon }])
);
var ICON_BY_KEYWORD = [
  [/\b(wc|toilet|gäste-?wc|gaeste-?wc)\b/i, "mdi:toilet"],
  [/bad|bath|dusche|shower/i, "mdi:shower"],
  [/küche|kueche|kitchen|kochen/i, "mdi:chef-hat"],
  [/schlaf|bed|nacht/i, "mdi:bed-king-outline"],
  [/kinder|child|kid|baby|nursery/i, "mdi:teddy-bear"],
  [/wohn|living|lounge|stube/i, "mdi:sofa-outline"],
  [/büro|buero|office|study|arbeit|work/i, "mdi:desk"],
  [/ess|dining|speise/i, "mdi:silverware-fork-knife"],
  [/flur|gang|diele|corridor|hall|vorraum|vorzimmer|entry|entrance/i, "mdi:foot-print"],
  [/balkon|terrasse|balcony|terrace|patio/i, "mdi:balcony"],
  [/abstell|storage|utility|lager|kammer|speis/i, "mdi:wardrobe-outline"],
  [/wasch|laundry|hauswirtschaft/i, "mdi:washing-machine"],
  [/garage|carport/i, "mdi:garage"],
  [/fitness|sport|gym/i, "mdi:dumbbell"],
  [/spiel|play|hobby|game/i, "mdi:gamepad-variant-outline"]
];
var GENERIC_ICONS = /* @__PURE__ */ new Set(["mdi:home-outline", "mdi:home", ""]);
function roomIcon(name, fallback) {
  for (const [re, icon] of ICON_BY_KEYWORD) if (re.test(name)) return icon;
  return fallback && !GENERIC_ICONS.has(fallback) ? fallback : "mdi:floor-plan";
}
function shortName(name) {
  const n4 = name.trim();
  const num2 = /^(.*\S)\s+(\d+)$/.exec(n4);
  if (num2) return `${shortName(num2[1])} ${num2[2]}`;
  const m2 = /^(.+?)zimmer$/i.exec(n4);
  if (m2 && m2[1].length <= 7) return `${m2[1]}z.`;
  if (n4.length <= 7) return n4;
  return `${n4.slice(0, 6).trimEnd()}.`;
}
function roomsFromMap(rooms, deutsch = false, namesDe = {}) {
  if (!rooms || typeof rooms !== "object") return [];
  const translate = typeof namesDe === "function" ? namesDe : (raw) => namesDe[raw];
  const out = [];
  for (const [key, r4] of Object.entries(rooms)) {
    if (!r4 || typeof r4 !== "object") continue;
    const id = typeof r4.room_id === "number" ? r4.room_id : parseInt(key, 10);
    if (!Number.isInteger(id) || id <= 0) continue;
    if (String(r4.visibility ?? "").toLowerCase() === "hidden") continue;
    const typed = typeof r4.type === "number" && r4.type > 0 ? ROOM_TYPES[r4.type] : void 0;
    let name, icon;
    if (typed) {
      const suffix = /\s(\d+)$/.exec(String(r4.name ?? ""))?.[1];
      name = (deutsch ? typed.name : typed.en) + (suffix ? ` ${suffix}` : "");
      icon = typed.icon;
    } else {
      const raw = String(r4.custom_name ?? r4.name ?? "").trim() || t3("room.fallback", { n: id });
      name = deutsch ? translate(raw) ?? raw : raw;
      icon = roomIcon(name, r4.icon);
    }
    out.push({ id, name, short: shortName(name), icon, order: typeof r4.order === "number" ? r4.order : id, typed: !!typed });
  }
  return out.sort((a3, b3) => a3.order - b3.order || a3.id - b3.id);
}
var roomById = (rooms, id) => rooms.find((r4) => r4.id === id);

// src/ha/profile.ts
var humanize = (v2) => v2.replace(/_/g, " ").replace(/^\w/, (c4) => c4.toUpperCase());
function optionLabel(key, value) {
  if (key === "wdh") return value.replace(/x$/i, "");
  const table = ROOM_VALUE_CODES.RV_HA[key];
  return table[value] ?? lookup("option", value) ?? humanize(value);
}
var optionsOf = (s4, id, key) => {
  const e4 = s4[id];
  const list = Array.isArray(e4?.attributes.options) ? e4.attributes.options.map(String) : [];
  return list.map((value) => ({ value, label: optionLabel(key, value) }));
};
var mapRoomsOnly = (a3, b3) => sameValue(a3?.attributes?.rooms, b3?.attributes?.rooms);
var existsOnly = (a3, b3) => !!a3 === !!b3;
var FEATURE_IDS = () => Object.keys(ROBOT_FEATURES).map((k2) => ENTITIES[k2]);
var optionsOnly = (a3, b3) => a3 === b3 || !!a3 && !!b3 && sameValue(a3.attributes.options, b3.attributes.options);
var GLOBAL = { modus: "cleaningMode", saug: "suctionLevel", wasser: "mopPadHumidity", route: "cleaningRoute" };
var { RV_ENT } = ROOM_VALUE_CODES;
function roomsFromSelects(s4) {
  const p3 = devicePrefix();
  if (!p3) return [];
  const re = new RegExp(`^select\\.${p3}_room_(\\d+)_cleaning_mode$`);
  const out = [];
  for (const id of Object.keys(s4)) {
    const m2 = re.exec(id);
    if (!m2) continue;
    const n4 = parseInt(m2[1], 10);
    const fn = cleanName(s4[id]?.attributes.friendly_name);
    const name = fn.replace(new RegExp(`^${deviceName().replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\s*`, "i"), "").replace(/cleaning mode/i, "").trim() || t3("room.fallback", { n: n4 });
    out.push({ id: n4, name, short: shortName(name), icon: roomIcon(name), order: n4, typed: false });
  }
  return out.sort((a3, b3) => a3.order - b3.order || a3.id - b3.id);
}
var fallbackSelectIds = (s4) => {
  const p3 = devicePrefix();
  if (!p3) return [];
  const re = new RegExp(`^select\\.${p3}_room_\\d+_cleaning_mode$`);
  return Object.keys(s4).filter((id) => re.test(id));
};
function roomsOf(s4) {
  const deutsch = s4[ENTITIES.raumnamen]?.state === "Deutsch";
  const fromMap = roomsFromMap(s4[ENTITIES.map]?.attributes.rooms, deutsch, (raw) => lookup("room", raw));
  return fromMap.length ? fromMap : roomsFromSelects(s4);
}
function profileIds(s4) {
  const first = roomsOf(s4)[0]?.id;
  const opt = Object.values(GLOBAL).map((k2) => ENTITIES[k2]);
  const fb = s4[ENTITIES.map]?.attributes.rooms ? [] : fallbackSelectIds(s4);
  return [.../* @__PURE__ */ new Set([ENTITIES.map, ENTITIES.raumnamen, ...opt, ...FEATURE_IDS(), ...fb, ...first === void 0 ? [] : [roomEntity(first, RV_ENT.wdh), ...Object.keys(GLOBAL).map((k2) => roomEntity(first, RV_ENT[k2]))]])];
}
var readProfile = memoizeSelector(
  profileIds,
  (s4) => {
    const rooms = roomsOf(s4);
    const first = rooms[0]?.id ?? null;
    const opt = (key) => {
      const global = optionsOf(s4, ENTITIES[GLOBAL[key]], key);
      if (global.length || first === null) return global;
      return optionsOf(s4, roomEntity(first, RV_ENT[key]), key);
    };
    const options = {
      modus: opt("modus"),
      saug: opt("saug"),
      wasser: opt("wasser"),
      route: opt("route"),
      wdh: first === null ? [] : optionsOf(s4, roomEntity(first, RV_ENT.wdh), "wdh")
    };
    return { rooms, roomIds: rooms.map((r4) => r4.id), options, has: (key) => !!s4[ENTITIES[key]] };
  },
  () => ({ ...Object.fromEntries(FEATURE_IDS().map((id) => [id, existsOnly])), [ENTITIES.map]: mapRoomsOnly, ...Object.fromEntries(Object.values(GLOBAL).map((k2) => [ENTITIES[k2], optionsOnly])) })
);

// src/domain/raumwerte.ts
var { RV } = ROOM_VALUE_CODES;
function lookup2(table, code) {
  return code !== void 0 && Object.prototype.hasOwnProperty.call(table, code) ? table[code] : void 0;
}
function inverse(table) {
  return Object.fromEntries(Object.entries(table).map(([k2, v2]) => [v2, k2]));
}
var INV = { modus: inverse(RV.modus), saug: inverse(RV.saug), wasser: inverse(RV.wasser), route: inverse(RV.route) };
function parseRaum(s4) {
  const out = {};
  String(s4 ?? "").split(";").forEach((part) => {
    const [id, rest] = part.split(":");
    if (!id || !rest) return;
    const f3 = rest.split("/");
    const n4 = parseInt(id, 10);
    if (!(n4 >= 1)) return;
    out[n4] = {
      modus: lookup2(RV.modus, f3[0]) ?? "Saugen",
      saug: lookup2(RV.saug, f3[1]) ?? "Standard",
      wasser: lookup2(RV.wasser, f3[2]) ?? null,
      route: lookup2(RV.route, f3[3]) ?? null,
      wdh: /^[123]$/.test(f3[4] ?? "") ? f3[4] : "1"
    };
  });
  return out;
}
function encodeRaum(o5) {
  return Object.keys(o5).map((n4) => parseInt(n4, 10)).sort((a3, b3) => a3 - b3).map((n4) => {
    const v2 = o5[n4] ?? {};
    const code = (k2) => {
      const val = v2[k2];
      return val != null && INV[k2][val] || "-";
    };
    return `${n4}:${code("modus")}/${code("saug")}/${v2.modus === "Saugen" ? "-" : code("wasser")}/${v2.modus === "Nur Wischen" ? code("route") : "-"}/${v2.wdh || "1"}`;
  }).join(";");
}

// src/ha/api.ts
var INTERVAL_STEPS = [5, 10, 15, 20, 30, 60];
var roundInterval = (v2) => INTERVAL_STEPS.reduce((a3, b3) => Math.abs(b3 - v2) < Math.abs(a3 - v2) ? b3 : a3, INTERVAL_STEPS[0]);
var inverse2 = (t4) => Object.fromEntries(Object.entries(t4).map(([k2, v2]) => [v2, k2]));
var RV_HA_INV = { modus: inverse2(ROOM_VALUE_CODES.RV_HA.modus), saug: inverse2(ROOM_VALUE_CODES.RV_HA.saug), wasser: inverse2(ROOM_VALUE_CODES.RV_HA.wasser), route: inverse2(ROOM_VALUE_CODES.RV_HA.route) };
var DxApi = class {
  constructor(getHass) {
    this.getHass = getHass;
  }
  hass() {
    const h3 = this.getHass();
    if (!h3) throw new Error("Keine Verbindung zu Home Assistant");
    return h3;
  }
  /** Ein Dienstaufruf. */
  async call(domain, service, data) {
    return this.hass().callService(domain, service, data);
  }
  /** Mehrere Aufrufe parallel; liefert die fehlgeschlagenen Kennungen. */
  async many(calls) {
    const results = await Promise.allSettled(calls.map((c4) => c4.run()));
    const fehlgeschlagen = results.flatMap((r4, i5) => r4.status === "rejected" ? [calls[i5].key] : []);
    return { ok: fehlgeschlagen.length === 0, fehlgeschlagen };
  }
  // ───────── Roboter ─────────
  vacuum(service) {
    return this.call(SERVICES.vacuum.domain, service, { entity_id: ENTITIES.vac });
  }
  press(entityId) {
    return this.call(SERVICES.press.domain, SERVICES.press.service, { entity_id: entityId });
  }
  cleanSegments(segments) {
    return this.call(SERVICES.cleanSegment.domain, SERVICES.cleanSegment.service, { entity_id: ENTITIES.vac, segments });
  }
  /**
   * Räume in der gewählten Reihenfolge reinigen (Karte/Schnellstart, 4.3b): merkt die Reihenfolge wie das Planer-Skript
   * in input_text.heidi_lauf_reihenfolge (Kopf-Streifen, Auftrag-Kachel) und ruft dann vacuum_clean_segment auf.
   */
  async startRooms(segments) {
    await this.call(SERVICES.inputText.domain, SERVICES.inputText.service, { entity_id: ENTITIES.laufReihenfolge, value: segments.join(",") });
    return this.cleanSegments(segments);
  }
  /** Raumwert am Roboter sofort setzen; `'all'` = alle Räume des Profils parallel. Wdh als „2x“, sonst HA-Option aus RV_HA. */
  setRoomValue(room, key, value) {
    const ids = room === "all" ? readProfile(this.hass().states).roomIds : [room];
    const option = key === "wdh" ? `${value}x` : RV_HA_INV[key][value] ?? value;
    const field = ROOM_VALUE_CODES.RV_ENT[key];
    return this.many(ids.map((id) => ({ key: roomEntity(id, field), run: () => this.call(SERVICES.selectOption.domain, SERVICES.selectOption.service, { entity_id: roomEntity(id, field), option }) })));
  }
  /** Sperrzonen: ersetzt alle Einträge der gesendeten Listen (ein Aufruf). */
  async setZones(z2) {
    const data = { entity_id: ENTITIES.vac, zones: z2.zones, no_mops: z2.no_mops };
    if (z2.walls) data.walls = z2.walls;
    return this.many([{ key: SERVICES.setRestrictedZone.service, run: () => this.call(SERVICES.setRestrictedZone.domain, SERVICES.setRestrictedZone.service, data) }]);
  }
  // ───────── Planer ─────────
  /** Eintrag starten; verweigert (ohne Aufruf), wenn der Eintrag inaktiv ist. */
  async runPlan(n4, variante = "normal") {
    const aktiv = this.hass().states[planEntity(n4, "aktiv")]?.state === "on";
    if (!aktiv) return { ok: false, fehlgeschlagen: [], grund: "inaktiv" };
    await this.call(SERVICES.planStarten.domain, SERVICES.planStarten.service, { plan: n4, variante });
    return { ok: true, fehlgeschlagen: [] };
  }
  runScene(shortcutId) {
    return this.call(SERVICES.appSzene.domain, SERVICES.appSzene.service, { shortcut_id: shortcutId });
  }
  /** Eintrag speichern: 18 Aufrufe in v1-Reihenfolge, Teilfehler benannt. Prüft Name und mindestens einen Raum. */
  async savePlan(n4, d3) {
    const name = d3.name.trim();
    if (!name) return { ok: false, fehlgeschlagen: [], grund: "name" };
    if (!d3.raeume.length) return { ok: false, fehlgeschlagen: [], grund: "raeume" };
    const calls = [];
    const txt2 = (k2, value) => {
      const id = planEntity(n4, k2);
      calls.push({ key: id, run: () => this.call(SERVICES.inputText.domain, SERVICES.inputText.service, { entity_id: id, value }) });
    };
    const sel = (k2, option) => {
      const id = planEntity(n4, k2);
      calls.push({ key: id, run: () => this.call(SERVICES.inputSelectOption.domain, SERVICES.inputSelectOption.service, { entity_id: id, option }) });
    };
    const bool = (k2, v2) => {
      const id = planEntity(n4, k2);
      calls.push({ key: id, run: () => this.call(SERVICES.inputBoolean.domain, v2 ? "turn_on" : "turn_off", { entity_id: id }) });
    };
    const raum = {};
    for (const [id, v2] of Object.entries(d3.raum)) if (d3.raeume.includes(parseInt(id, 10))) raum[id] = v2;
    txt2("name", name);
    txt2("raeume", d3.raeume.join(","));
    txt2("tage", d3.tage.map((b3) => b3 ? "1" : "0").join(""));
    txt2("personen", d3.personen.join(","));
    txt2("raumwerte", encodeRaum(raum));
    sel("modus", d3.modus);
    sel("saugstufe", d3.saug);
    sel("wasser", d3.wasser);
    sel("route", d3.route);
    sel("wiederholungen", d3.wdh);
    sel("homeoffice", d3.ho);
    sel("ho_saug", d3.hoSaug);
    sel("ho_wdh", d3.hoWdh);
    sel("sp_saug", d3.spSaug);
    sel("sp_wdh", d3.spWdh);
    bool("aktiv", d3.aktiv);
    bool("schnell", d3.schnell);
    const zeitId = planEntity(n4, "zeit");
    calls.push({ key: zeitId, run: () => this.call(SERVICES.inputDatetime.domain, SERVICES.inputDatetime.service, { entity_id: zeitId, time: `${d3.zeit}:00` }) });
    return this.many(calls);
  }
  // ───────── Helfer und Einstellungen ─────────
  toggle(entityId) {
    return this.call(SERVICES.inputBoolean.domain, "toggle", { entity_id: entityId });
  }
  /** Ein-/Ausschalten ausdrücklich (Dark-Mode-Segment: turn_on/turn_off statt toggle). */
  setBoolean(entityId, on2) {
    return this.call(SERVICES.inputBoolean.domain, on2 ? "turn_on" : "turn_off", { entity_id: entityId });
  }
  /** select.* und input_select.*: Domäne aus der ID. */
  selectOption(entityId, option) {
    return this.call(entityId.split(".")[0], "select_option", { entity_id: entityId, option });
  }
  /** number.* und input_number.*: Domäne aus der ID; Prognose-Intervall wird auf 5/10/15/20/30/60 gerundet. Liefert den gesetzten Wert. */
  async setNumber(entityId, value) {
    const v2 = entityId === ENTITIES.prognoseIntervall ? roundInterval(value) : value;
    await this.call(entityId.split(".")[0], "set_value", { entity_id: entityId, value: v2 });
    return v2;
  }
  /** time.* → time.set_value, input_datetime.* → input_datetime.set_datetime; Zeit „HH:MM“ → „HH:MM:00“. */
  setTime(entityId, hhmm) {
    if (!hhmm) return Promise.resolve();
    const time = `${hhmm.slice(0, 5)}:00`;
    return entityId.startsWith("time.") ? this.call(SERVICES.time.domain, SERVICES.time.service, { entity_id: entityId, time }) : this.call(SERVICES.inputDatetime.domain, SERVICES.inputDatetime.service, { entity_id: entityId, time });
  }
  prognoseReset() {
    return this.call(SERVICES.prognoseReset.domain, SERVICES.prognoseReset.service, {});
  }
  // ───────── Lesen über die REST-API ─────────
  /** Historie der Phase (Paket) und des Roboters im Fenster (Sekunden). */
  history(startSec, endSec) {
    const h3 = this.hass();
    if (!h3.callApi) return Promise.resolve([]);
    return h3.callApi("GET", historyPath(new Date(startSec * 1e3).toISOString(), new Date(endSec * 1e3).toISOString()));
  }
};

// src/domain/setup.ts
var ok = (key, icon, label) => ({ key, icon, label, level: "ok", text: label });
function setupChecks(i5) {
  const out = [];
  out.push(i5.robot ? ok("robot", "mdi:robot-vacuum", t3("setup.robot.ok", { name: i5.robot.name })) : { key: "robot", icon: "mdi:robot-vacuum", label: t3("setup.robot.label"), level: "error", text: t3("setup.robot.error"), action: { kind: "ha-path", path: "/config/integrations" } });
  out.push(i5.missingPackage.length ? { key: "package", icon: "mdi:package-variant", label: t3("setup.package.label"), level: "error", text: t3("setup.package.error", { n: i5.missingPackage.length }), action: { kind: "page", page: "einstellungen" } } : ok("package", "mdi:package-variant", t3("setup.package.ok")));
  if (i5.robot) out.push(i5.missingRobot.length ? { key: "entities", icon: "mdi:format-list-checks", label: t3("setup.entities.label"), level: "warn", text: t3("setup.entities.warn", { n: i5.missingRobot.length }), action: { kind: "page", page: "einstellungen" } } : ok("entities", "mdi:format-list-checks", t3("setup.entities.ok")));
  if (i5.robot) out.push(i5.hasMapData ? ok("mapdata", "mdi:map-check", t3("setup.mapdata.ok")) : { key: "mapdata", icon: "mdi:map-check", label: t3("setup.mapdata.label"), level: "warn", text: t3("setup.mapdata.warn"), action: { kind: "ha-path", path: "/config/integrations/integration/dreame_vacuum" } });
  if (i5.robot && i5.customizedCleaning !== null) {
    const off = i5.customizedCleaning === "off" && !i5.running;
    out.push(off ? { key: "customized", icon: "mdi:tune-variant", label: t3("setup.customized.label"), level: "warn", text: t3("setup.customized.warn"), action: { kind: "more-info", entity: i5.ids.customizedCleaning } } : ok("customized", "mdi:tune-variant", t3("setup.customized.ok")));
  }
  if (i5.robot && i5.rooms.length) {
    const known2 = new Set(Object.values(ROOM_TYPES).flatMap((r4) => [r4.name.toLowerCase(), r4.en.toLowerCase()]));
    const custom = i5.rooms.filter((r4) => !r4.typed && known2.has(r4.name.trim().toLowerCase()));
    out.push(custom.length ? { key: "roomtypes", icon: "mdi:tag-outline", label: t3("setup.roomtypes.label"), level: "warn", text: t3("setup.roomtypes.warn", { rooms: custom.map((r4) => r4.name).join(", ") }), action: { kind: "more-info", entity: i5.ids.roomName(custom[0].id) } } : ok("roomtypes", "mdi:tag-outline", t3("setup.roomtypes.ok")));
  }
  if (i5.robot && i5.mapping) {
    const open = i5.mapping.segments.filter((s4) => !i5.mapping.assigned.has(s4.id));
    out.push(open.length ? { key: "areas", icon: "mdi:home-map-marker", label: t3("setup.areas.label"), level: "error", text: t3("setup.areas.error", { who: open.length === 1 ? t3("setup.areas.one") : t3("setup.areas.many", { n: open.length }), rooms: open.map((s4) => s4.name).join(", ") }), action: { kind: "vacuum-areas", entity: i5.robot.vac, hint: t3("setup.areas.hint") } } : ok("areas", "mdi:home-map-marker", t3("setup.areas.ok")));
  }
  if (i5.repairs) {
    const mine = i5.repairs.filter((r4) => r4.domain === "dreame_vacuum" || r4.translation_key === "segments_changed" || r4.domain === "vacuum");
    out.push(mine.length ? { key: "repairs", icon: "mdi:wrench-outline", label: t3("setup.repairs.label"), level: "error", text: t3("setup.repairs.error", { n: mine.length, what: mine.length === 1 ? t3("setup.repairs.one") : t3("setup.repairs.many"), list: mine.map((r4) => r4.translation_key ?? r4.issue_id).join(", ") }), action: { kind: "ha-path", path: "/config/repairs" } } : ok("repairs", "mdi:wrench-outline", t3("setup.repairs.ok")));
  }
  return out;
}
var setupProblems = (checks) => checks.filter((c4) => c4.level !== "ok");

// src/shared/navigate.ts
var DASHBOARD_PATH = "/dreame-x60";
var pagePath = (page) => `${DASHBOARD_PATH}/${page}`;
function navigate(page, replace = false) {
  const path = pagePath(page);
  if (replace) history.replaceState(null, "", path);
  else history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace } }));
}
function navigateHa(path) {
  history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
}

// src/shared/overlay.ts
var EVENTS = {
  openOverlay: "dx-open-overlay",
  close: "dx-close",
  back: "dx-back",
  confirm: "dx-confirm",
  toast: "dx-toast",
  navigate: "dx-navigate"
};
function emit(target, name, detail) {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}
function askConfirm(target, text, onOk, opts2 = {}) {
  emit(target, EVENTS.openOverlay, { kind: "confirm", text, onOk, ...opts2 });
}
function moreInfo(target, entityId) {
  emit(target, "hass-more-info", { entityId });
}

// src/shared/ha-deep.ts
var MAPPING_TAG = "ha-more-info-view-vacuum-segment-mapping";
var AREAS_TAG = "ha-more-info-view-vacuum-clean-areas";
var AREAS_HEADER_TAG = "ha-more-info-view-vacuum-clean-areas-header-action";
function deepFind(root, selector, limit = 4e3) {
  if (!root) return null;
  const queue = [root];
  const own = root.shadowRoot;
  if (own) queue.push(own);
  let seen = 0;
  while (queue.length && seen < limit) {
    const node = queue.shift();
    const hit = node.querySelector(selector);
    if (hit) return hit;
    for (const el of node.querySelectorAll("*")) {
      seen++;
      if (el.shadowRoot) queue.push(el.shadowRoot);
    }
  }
  return null;
}
var sleep = (ms) => new Promise((r4) => setTimeout(r4, ms));
async function waitFor(probe, timeoutMs) {
  const end = Date.now() + timeoutMs;
  for (; ; ) {
    const v2 = probe();
    if (v2) return v2;
    if (Date.now() >= end) return null;
    await sleep(100);
  }
}
var haRoot = () => document.querySelector("home-assistant")?.shadowRoot ?? null;
var findDialog = () => haRoot()?.querySelector("ha-more-info-dialog") ?? null;
async function openVacuumSegmentMapping(target, entityId) {
  moreInfo(target, entityId);
  if (!haRoot()) return "fallback";
  const dialog = await waitFor(findDialog, 3e3);
  if (!dialog) return "fallback";
  const showMapping = () => {
    dialog.dispatchEvent(new CustomEvent("show-child-view", { detail: { viewTag: MAPPING_TAG, viewTitle: "Zuordnung von Staubsauger-Abschnitten zu Bereichen", viewParams: { entityId } }, bubbles: true, composed: true }));
  };
  if (customElements.get(MAPPING_TAG)) {
    showMapping();
    return "direct";
  }
  const areasBtn = await waitFor(() => deepFind(dialog.shadowRoot, "more-info-vacuum") ? deepFind(dialog.shadowRoot, "button.clean-areas-button") : null, 3e3);
  if (!areasBtn) return "fallback";
  areasBtn.click();
  const view = await waitFor(() => customElements.get(AREAS_TAG) ? deepFind(dialog.shadowRoot, AREAS_TAG) : null, 4e3);
  if (!view) return "fallback";
  await sleep(150);
  const open = view._openSegmentMapping;
  if (typeof open === "function") open.call(view);
  else {
    const header = deepFind(dialog.shadowRoot, AREAS_HEADER_TAG);
    const gear = header ? deepFind(header, "ha-icon-button, button") : null;
    if (!gear) return "fallback";
    gear.click();
  }
  const ok2 = await waitFor(() => customElements.get(MAPPING_TAG) && deepFind(dialog.shadowRoot, MAPPING_TAG) ? true : null, 4e3);
  return ok2 ? "clicked" : "fallback";
}

// src/ha/setup-loader.ts
var TTL_MS = 5 * 60 * 1e3;
var cache = /* @__PURE__ */ new Map();
async function fetchSetup(hass, vac) {
  if (!hass.callWS) return { mapping: null, repairs: null, at: Date.now() };
  const safe = async (msg) => {
    try {
      return await hass.callWS(msg);
    } catch {
      return null;
    }
  };
  const [entry, segs, issues] = await Promise.all([
    safe({ type: "config/entity_registry/get", entity_id: vac }),
    safe({ type: "vacuum/get_segments", entity_id: vac }),
    safe({ type: "repairs/list_issues" })
  ]);
  let mapping = null;
  if (segs?.segments) {
    const assigned = /* @__PURE__ */ new Set();
    for (const list of Object.values(entry?.options?.vacuum?.area_mapping ?? {})) for (const id of list) assigned.add(id);
    mapping = { segments: segs.segments.map((s4) => ({ id: s4.id, name: s4.name })), assigned };
  }
  return { mapping, repairs: issues?.issues ?? null, at: Date.now() };
}
function loadSetupData(hass, vac, force = false) {
  const c4 = cache.get(vac);
  if (c4 && !force && Date.now() - c4.at < TTL_MS) return c4.promise;
  const promise = fetchSetup(hass, vac);
  cache.set(vac, { promise, at: Date.now() });
  return promise;
}

// src/domain/status.ts
var EMPTY = ["unknown", "unavailable", ""];
var cap = (s4) => s4.replace(/^./, (c4) => c4.toUpperCase());
var B2 = (service, icon, label, primary = false) => ({ service, icon, label, primary });
var statusText = (status) => lookup("status", status) ?? status.replace(/_/g, " ");
var errorText = (code) => lookup("error", code) ?? code.replace(/_/g, " ");
function heroButtons(vac) {
  switch (vac) {
    case "cleaning":
      return [B2("pause", "mdi:pause", t3("button.pause"), true), B2("stop", "mdi:stop", t3("button.stop")), B2("return_to_base", "mdi:home-import-outline", t3("button.station"))];
    case "paused":
      return [B2("start", "mdi:play", t3("button.resume"), true), B2("stop", "mdi:stop", t3("button.stop")), B2("return_to_base", "mdi:home-import-outline", t3("button.station"))];
    case "returning":
      return [B2("pause", "mdi:pause", t3("button.pause"), true), B2("stop", "mdi:stop", t3("button.stop")), B2("locate", "mdi:map-marker", t3("button.locate"))];
    case "docked":
      return [B2("start", "mdi:play", t3("button.start"), true), B2("locate", "mdi:map-marker", t3("button.locate"))];
    default:
      return [B2("start", "mdi:play", t3("button.start"), true), B2("return_to_base", "mdi:home-import-outline", t3("button.station")), B2("locate", "mdi:map-marker", t3("button.locate"))];
  }
}
function heroModel(i5) {
  const phaseOk = !EMPTY.includes(i5.phase);
  const statusTxt = phaseOk ? i5.phase : cap(statusText(i5.status));
  const auto = i5.autoLauf ? i5.autoLetzterPlan : "";
  const job = auto && !EMPTY.includes(auto) ? auto : lookup("task", i5.task) ?? t3("task.default");
  let big = statusTxt, sub = "";
  if (i5.vac === "error") big = t3("head.error");
  else if (i5.vac === "paused") {
    big = t3("head.paused");
    sub = job;
  } else if (i5.vac === "returning") {
    big = t3("head.returning");
    sub = phaseOk && i5.phase !== big ? i5.phase : "";
  } else if (i5.vac === "cleaning") {
    big = job;
    sub = phaseOk ? i5.phase : "";
  }
  if (sub === big) sub = "";
  const dot = i5.vac === "cleaning" ? "accent" : i5.vac === "returning" ? "warning" : i5.vac === "error" ? "danger" : "positive";
  const errorChip = i5.error !== "no_error" && i5.error !== "unavailable" ? { text: errorText(i5.error), level: i5.hasError ? "danger" : "warning" } : null;
  const roomChip = i5.room !== t3("common.dash") && i5.vac === "cleaning" && !phaseOk ? i5.room : null;
  const dnd = `${(i5.dndStart || "").slice(0, 5)}\u2013${(i5.dndEnd || "").slice(0, 5)}`;
  return { big, sub, dot, buttons: heroButtons(i5.vac), errorChip, roomChip, dnd, phaseOk };
}

// src/domain/labels.ts
var LOCALE = "de-AT";
var DASH = t3("common.dash");
function fmtDate(iso, now = /* @__PURE__ */ new Date()) {
  const d3 = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d3.getTime())) return DASH;
  const same = d3.toDateString() === now.toDateString();
  return (same ? t3("label.today") : d3.toLocaleDateString(LOCALE, { day: "2-digit", month: "2-digit" })) + " " + d3.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
}
function roomName(raw, deutsch) {
  if (!raw || ["unknown", "unavailable"].includes(raw)) return DASH;
  return deutsch ? lookup("room", raw) ?? raw : raw;
}

// src/ha/selectors.ts
var EMPTY2 = ["unknown", "unavailable"];
var E2 = ENTITIES;
var ent = (s4, id) => s4[id];
var st = (s4, id) => ent(s4, id)?.state ?? "unavailable";
var txt = (s4, id) => {
  const v2 = st(s4, id);
  return EMPTY2.includes(v2) ? "" : v2;
};
var on = (s4, id) => st(s4, id) === "on";
var num = (s4, id, d3 = 0) => {
  const v2 = parseFloat(st(s4, id));
  return isNaN(v2) ? d3 : v2;
};
var attr = (s4, id, a3) => ent(s4, id)?.attributes?.[a3];
var opts = (s4, id, fallback = []) => {
  const o5 = attr(s4, id, "options");
  return Array.isArray(o5) ? o5.map(String) : [...fallback];
};
var available = (s4, id) => {
  const e4 = ent(s4, id);
  return !!e4 && !EMPTY2.includes(e4.state);
};
var VAC_ATTRS = ["has_error", "current_segment", "active_segments", "cleaning_sequence", "cleaned_area", "charging", "docked", "mop_pad", "paused", "washing", "drying", "returning_to_wash", "mapping", "cruising"];
var ROBOT_IDS = () => [E2.vac, E2.status, E2.error, E2.taskStatus, E2.battery, E2.currentRoom, E2.cleanedArea, E2.cleaningTime, E2.phase, E2.autoLauf, E2.autoLetzterPlan, E2.laufReihenfolge, E2.dndStart, E2.dndEnd, E2.raumnamen, E2.ninaZaehlt, ...PERSONS.map((p3) => p3.id)];
var intList = (v2) => Array.isArray(v2) ? v2.map((x2) => parseInt(String(x2), 10)).filter((x2) => !isNaN(x2)) : [];
var readRobot = memoizeSelector(ROBOT_IDS, (s4) => {
  const vac = st(s4, E2.vac);
  const deutsch = st(s4, E2.raumnamen) === "Deutsch";
  const seg = parseInt(String(attr(s4, E2.vac, "current_segment") ?? ""), 10);
  const persons = PERSONS.map((p3) => {
    const e4 = ent(s4, p3.id);
    return { key: p3.key, id: p3.id, name: p3.name, home: e4?.state === "home", counts: !("optional" in p3) || on(s4, p3.optional), known: !!e4 };
  });
  const hero = heroModel({
    vac,
    status: st(s4, E2.status),
    error: st(s4, E2.error),
    hasError: !!attr(s4, E2.vac, "has_error"),
    task: st(s4, E2.taskStatus),
    phase: st(s4, E2.phase),
    autoLauf: on(s4, E2.autoLauf),
    autoLetzterPlan: st(s4, E2.autoLetzterPlan),
    dndStart: st(s4, E2.dndStart),
    dndEnd: st(s4, E2.dndEnd),
    room: roomName(st(s4, E2.currentRoom), deutsch)
  });
  return {
    vac,
    running: ["cleaning", "paused", "returning"].includes(vac),
    hasError: !!attr(s4, E2.vac, "has_error"),
    battery: num(s4, E2.battery, 0),
    currentSegment: isNaN(seg) ? null : seg,
    activeSegments: intList(attr(s4, E2.vac, "active_segments")),
    cleaningSequence: intList(attr(s4, E2.vac, "cleaning_sequence")),
    cleanedArea: parseFloat(String(attr(s4, E2.vac, "cleaned_area") ?? "")) || 0,
    cleaningTime: num(s4, E2.cleaningTime, 0),
    charging: !!attr(s4, E2.vac, "charging"),
    docked: !!attr(s4, E2.vac, "docked"),
    washing: !!attr(s4, E2.vac, "washing"),
    drying: !!attr(s4, E2.vac, "drying"),
    phase: st(s4, E2.phase),
    status: st(s4, E2.status),
    task: st(s4, E2.taskStatus),
    error: st(s4, E2.error),
    autoLauf: on(s4, E2.autoLauf),
    autoLetzterPlan: txt(s4, E2.autoLetzterPlan),
    laufReihenfolge: txt(s4, E2.laufReihenfolge).split(",").map((x2) => parseInt(x2, 10)).filter((x2) => !isNaN(x2)),
    room: roomName(st(s4, E2.currentRoom), deutsch),
    deutsch,
    persons,
    hero,
    moreInfo: { vac: E2.vac, battery: E2.battery, error: E2.error }
  };
}, () => ({ [E2.vac]: stateAndAttributes(VAC_ATTRS) }));
var PLAN_FIELDS = ["name", "raeume", "tage", "personen", "raumwerte", "modus", "saugstufe", "wasser", "route", "wiederholungen", "homeoffice", "ho_saug", "ho_wdh", "sp_saug", "sp_wdh", "aktiv", "schnell", "zeit"];
var planIds = (n4) => PLAN_FIELDS.map((f3) => planEntity(n4, f3));
function makeReadPlan(n4) {
  const id = (f3) => planEntity(n4, f3);
  return memoizeSelector(() => planIds(n4), (s4) => {
    const sel = (f3) => st(s4, id(f3));
    const tx2 = (f3) => txt(s4, id(f3));
    const mask = tx2("tage").padEnd(7, "0").slice(0, 7);
    return {
      n: n4,
      name: tx2("name"),
      aktiv: on(s4, id("aktiv")),
      raeume: [...new Set(tx2("raeume").split(",").map((x2) => parseInt(x2, 10)).filter((x2) => x2 >= 1 && x2 <= 7))],
      modus: sel("modus"),
      saug: sel("saugstufe"),
      wasser: sel("wasser"),
      route: sel("route"),
      wdh: sel("wiederholungen"),
      tage: [...mask].map((c4) => c4 === "1"),
      zeit: (txt(s4, id("zeit")) || "09:30").slice(0, 5),
      personen: tx2("personen").split(",").map((x2) => x2.trim()).filter(Boolean),
      ho: sel("homeoffice"),
      hoSaug: sel("ho_saug"),
      hoWdh: sel("ho_wdh"),
      schnell: on(s4, id("schnell")),
      spSaug: sel("sp_saug"),
      spWdh: sel("sp_wdh"),
      raum: parseRaum(tx2("raumwerte")),
      entities: Object.fromEntries(PLAN_FIELDS.map((f3) => [f3, id(f3)]))
    };
  });
}
var PLAN_SELECTORS = { 1: makeReadPlan(1), 2: makeReadPlan(2), 3: makeReadPlan(3), 4: makeReadPlan(4) };
var readPlans = memoizeSelector(() => [...PLAN_NUMBERS.flatMap(planIds), E2.heutePlan, E2.planerBereich], (s4) => {
  const slot = parseInt(st(s4, E2.heutePlan), 10);
  const heute = PLAN_NUMBERS.includes(slot) ? slot : null;
  const stoerer = attr(s4, E2.heutePlan, "stoerer");
  return {
    plans: PLAN_NUMBERS.map((n4) => PLAN_SELECTORS[n4](s4)),
    heute,
    heuteName: String(attr(s4, E2.heutePlan, "name") ?? ""),
    heuteZeit: String(attr(s4, E2.heutePlan, "zeit") ?? ""),
    heuteErledigt: attr(s4, E2.heutePlan, "erledigt") === true,
    stoerer: Array.isArray(stoerer) ? stoerer.map(String) : [],
    planerBereich: on(s4, E2.planerBereich)
  };
});
var { RV_HA, RV_ENT: RV_ENT2 } = ROOM_VALUE_CODES;
var roomSelectIds = (id) => ROOM_SELECT_FIELDS.map((f3) => roomEntity(id, f3));
var MAP_CODES = {
  modus: { 0: "sweeping", 1: "mopping", 2: "sweeping_and_mopping", 3: "mopping_after_sweeping" },
  saug: { 0: "quiet", 1: "standard", 2: "strong", 3: "turbo" },
  wasser: { 1: "slightly_dry", 2: "moist", 3: "wet" },
  route: { 1: "standard", 2: "intensive", 3: "deep" }
};
var mapRoomsOnly2 = (a3, b3) => sameValue(a3?.attributes?.rooms, b3?.attributes?.rooms);
function roomValuesFromMap(s4, id) {
  const rooms = attr(s4, E2.map, "rooms");
  const r4 = rooms && typeof rooms === "object" ? rooms[String(id)] : void 0;
  if (!r4 || typeof r4 !== "object") return null;
  const code = (k2, field) => {
    const v2 = r4[field];
    return typeof v2 === "number" ? MAP_CODES[k2][v2] ?? null : null;
  };
  const m2 = code("modus", "cleaning_mode");
  if (m2 === null) return null;
  const saugRaw = code("saug", "suction_level"), wasserRaw = code("wasser", "water_volume"), routeRaw = code("route", "cleaning_route");
  const times = r4.cleaning_times;
  return {
    modus: RV_HA.modus[m2] ?? m2,
    saug: saugRaw && RV_HA.saug[saugRaw] || "\u2013",
    wasser: wasserRaw ? RV_HA.wasser[wasserRaw] ?? wasserRaw : null,
    route: routeRaw ? RV_HA.route[routeRaw] ?? routeRaw : null,
    wdh: typeof times === "number" && times >= 1 && times <= 3 ? String(times) : "1"
  };
}
function roomValuesOf(s4, id) {
  const g2 = (k2) => {
    const v2 = st(s4, roomEntity(id, RV_ENT2[k2]));
    return EMPTY2.includes(v2) ? null : v2;
  };
  const m2 = g2("modus");
  if (m2 === null) return roomValuesFromMap(s4, id);
  const saugRaw = g2("saug"), wasserRaw = g2("wasser"), routeRaw = g2("route");
  return {
    modus: RV_HA.modus[m2] ?? m2,
    saug: saugRaw && RV_HA.saug[saugRaw] || "\u2013",
    wasser: wasserRaw ? RV_HA.wasser[wasserRaw] ?? wasserRaw : null,
    route: routeRaw ? RV_HA.route[routeRaw] ?? routeRaw : null,
    wdh: (g2("wdh") ?? "1x").replace("x", "")
  };
}
var ROOM_SELECTORS = /* @__PURE__ */ new Map();
var readRoomValues = (id) => {
  let sel = ROOM_SELECTORS.get(id);
  if (!sel) {
    sel = memoizeSelector(() => [...roomSelectIds(id), E2.map], (s4) => roomValuesOf(s4, id), () => ({ [E2.map]: mapRoomsOnly2 }));
    ROOM_SELECTORS.set(id, sel);
  }
  return sel;
};
var readAllRoomValues = memoizeSelector((s4) => [...profileIds(s4), ...readProfile(s4).roomIds.flatMap(roomSelectIds), E2.customizedCleaning], (s4) => {
  const ids = readProfile(s4).roomIds;
  const rooms = Object.fromEntries(ids.map((id) => [id, readRoomValues(id)(s4)]));
  const vonKarte = ids.filter((id) => rooms[id] !== null && EMPTY2.includes(st(s4, roomEntity(id, RV_ENT2.modus))));
  return { rooms, customized: on(s4, E2.customizedCleaning), anyUnavailable: ids.some((id) => rooms[id] === null), vonKarte };
}, () => ({ [E2.map]: mapRoomsOnly2 }));
var readLearn = memoizeSelector(() => [E2.lern], (s4) => {
  const e4 = ent(s4, E2.lern);
  return e4 && !EMPTY2.includes(e4.state) && e4.attributes?.raten ? e4.attributes : null;
});
var histCache = {};
var histOk = (e4) => !!e4 && !EMPTY2.includes(e4.state) && Object.values(e4.attributes ?? {}).some((v2) => v2 && typeof v2 === "object" && "timestamp" in v2);
var readHistory = memoizeSelector(() => [E2.cleaningHistory, E2.cleaningCount, E2.totalCleanedArea, E2.totalCleaningTime], (s4) => {
  const live = ent(s4, E2.cleaningHistory);
  const ok2 = histOk(live);
  if (ok2 && live) histCache = live.attributes;
  const a3 = ok2 && live ? live.attributes : histCache;
  const entries = Object.entries(a3).filter(([, v2]) => v2 && typeof v2 === "object" && "timestamp" in v2).map(([, v2]) => v2).sort((x2, y3) => Number(y3.timestamp) - Number(x2.timestamp)).slice(0, 30).map((v2) => ({ key: String(Math.floor(Number(v2.timestamp))), ts: Math.floor(Number(v2.timestamp)), area: parseInt(String(v2.cleaned_area ?? "").replace(/[^0-9]/g, ""), 10) || 0, min: parseInt(String(v2.cleaning_time ?? "").replace(/[^0-9]/g, ""), 10) || 0, raw: v2 }));
  return { entries, count: num(s4, E2.cleaningCount, 0), totalArea: num(s4, E2.totalCleanedArea, 0), totalTime: num(s4, E2.totalCleaningTime, 0), stale: !ok2 };
});
var readPrognose = memoizeSelector(() => [E2.prognose, E2.prognoseAktiv, E2.abweichungHeute, E2.progHerbert, E2.progNicole, E2.progNina, E2.prognoseWochen, E2.prognoseMindesttage], (s4) => {
  const p3 = ent(s4, E2.prognose);
  const a3 = p3?.attributes ?? {};
  const str = (k2, d3 = "") => a3[k2] === void 0 || a3[k2] === null ? d3 : String(a3[k2]);
  return {
    aktiv: on(s4, E2.prognoseAktiv),
    known: !!p3,
    state: p3?.state ?? "\u2013",
    tage: parseInt(str("tage", "0"), 10) || 0,
    sicherheit: parseInt(str("sicherheit", "0"), 10) || 0,
    freiesFenster: str("freies_fenster", "\u2013"),
    rueckkehr: str("rueckkehr", "\u2013"),
    rueckkehrWer: str("rueckkehr_wer", ""),
    rueckkehrMin: parseInt(str("rueckkehr_min", "0"), 10) || 0,
    homeoffice: str("homeoffice", "\u2013"),
    empfehlung: str("empfehlung", "\u2013"),
    aktualisiert: str("aktualisiert", "\u2013"),
    aufloesung: str("aufloesung", "30"),
    wochen: num(s4, E2.prognoseWochen, 8),
    mindesttage: num(s4, E2.prognoseMindesttage, 14),
    schalter: [
      { id: E2.abweichungHeute, label: t3("prognose.deviation"), sub: t3("prognose.deviationSub"), on: on(s4, E2.abweichungHeute) },
      { id: E2.progHerbert, label: t3("prognose.include", { name: PERSONS[0].name }), sub: t3("prognose.gpsWlan"), on: on(s4, E2.progHerbert) },
      { id: E2.progNicole, label: t3("prognose.include", { name: PERSONS[1].name }), sub: t3("prognose.wlan"), on: on(s4, E2.progNicole) },
      { id: E2.progNina, label: t3("prognose.include", { name: PERSONS[2].name }), sub: t3("prognose.wlan"), on: on(s4, E2.progNina) }
    ]
  };
});
var readAutomatik = memoizeSelector(() => [E2.automatik, E2.autoStatus, E2.arbeitszeitStart, E2.arbeitszeitEnde, E2.rueckkehr, E2.schnellMinuten, E2.minAkku, E2.beiHeimkehr, E2.autoLetzterPlan, E2.letzteAutoReinigung], (s4) => {
  const rest = attr(s4, E2.autoStatus, "rest_min");
  const letzte = st(s4, E2.letzteAutoReinigung);
  return {
    on: on(s4, E2.automatik),
    status: txt(s4, E2.autoStatus),
    detail: String(attr(s4, E2.autoStatus, "detail") ?? ""),
    restMin: typeof rest === "number" ? rest : rest !== void 0 && !isNaN(parseInt(String(rest), 10)) ? parseInt(String(rest), 10) : null,
    restQuelle: String(attr(s4, E2.autoStatus, "rest_quelle") ?? ""),
    arbeitszeitStart: txt(s4, E2.arbeitszeitStart).slice(0, 5),
    arbeitszeitEnde: txt(s4, E2.arbeitszeitEnde).slice(0, 5),
    rueckkehr: txt(s4, E2.rueckkehr).slice(0, 5),
    schnellMinuten: num(s4, E2.schnellMinuten, 90),
    minAkku: num(s4, E2.minAkku, 30),
    beiHeimkehr: txt(s4, E2.beiHeimkehr),
    beiHeimkehrOptions: opts(s4, E2.beiHeimkehr),
    letzterPlan: txt(s4, E2.autoLetzterPlan) || t3("common.dash"),
    letzteAutoReinigung: !letzte || EMPTY2.includes(letzte) || letzte.startsWith("2000") ? t3("automatik.never") : letzte
  };
});
var CONSUMABLES = () => [
  [t3("consumable.mainBrush"), E2.mainBrushLeft, E2.resetMainBrush],
  [t3("consumable.sideBrush"), E2.sideBrushLeft, E2.resetSideBrush],
  [t3("consumable.filter"), E2.filterLeft, E2.resetFilter],
  [t3("consumable.sensor"), E2.sensorDirtyLeft, E2.resetSensor],
  [t3("consumable.wheel"), E2.wheelDirtyLeft, E2.resetWheel]
];
var readConsumables = memoizeSelector(() => CONSUMABLES().flatMap(([, s4, b3]) => [s4, b3]), (s4) => CONSUMABLES().map(([name, sensor, reset]) => {
  const pct = num(s4, sensor, 0);
  return { name, pct, level: pct <= 10 ? "danger" : pct <= 25 ? "warning" : "ok", resetEntity: reset, known: available(s4, sensor) };
}));
var readStation = memoizeSelector(() => [E2.dustBagStatus, E2.cleanWaterTankStatus, E2.dirtyWaterTankStatus, E2.detergentStatus, E2.lowWaterWarning, E2.startAutoEmpty, E2.selfClean, E2.manualDrying, E2.baseStationCleaning], (s4) => {
  const inst = (id) => st(s4, id) === "installed";
  const lowWater = st(s4, E2.lowWaterWarning) !== "no_warning";
  const tiles = [
    { key: "beutel", label: t3("station.bag"), value: inst(E2.dustBagStatus) ? t3("station.ok") : t3("station.check"), warn: !inst(E2.dustBagStatus) },
    { key: "frisch", label: t3("station.fresh"), value: lowWater ? t3("station.empty") : inst(E2.cleanWaterTankStatus) ? t3("station.ok") : t3("station.missing"), warn: lowWater || !inst(E2.cleanWaterTankStatus) },
    { key: "abwasser", label: t3("station.dirty"), value: inst(E2.dirtyWaterTankStatus) ? t3("station.ok") : t3("station.full"), warn: !inst(E2.dirtyWaterTankStatus) },
    { key: "mittel", label: t3("station.detergent"), value: inst(E2.detergentStatus) ? t3("station.ok") : t3("station.empty"), warn: !inst(E2.detergentStatus) }
  ];
  return {
    tiles,
    ok: tiles.every((x2) => !x2.warn),
    buttons: [
      { entity: E2.startAutoEmpty, label: t3("station.autoEmpty"), confirm: null },
      { entity: E2.selfClean, label: t3("station.mop"), confirm: null },
      { entity: E2.manualDrying, label: t3("station.dry"), confirm: null },
      { entity: E2.baseStationCleaning, label: t3("station.clean"), confirm: t3("station.cleanConfirm") }
    ]
  };
});
var rng = (s4, id, label, unit, sub, dMin, dMax, dStep) => {
  const a3 = ent(s4, id)?.attributes ?? {};
  const n4 = (v2, d3) => typeof v2 === "number" ? v2 : d3;
  return { id, label, sub, unit, value: num(s4, id, n4(a3.min, dMin)), min: n4(a3.min, dMin), max: n4(a3.max, dMax), step: n4(a3.step, dStep) };
};
var ROT_DEFAULT = ["0", "90", "180", "270"];
var readSettings = memoizeSelector(() => [E2.dark, E2.karte, E2.mapRotation, E2.raumnamen, E2.automatik, E2.planerBereich, E2.prognoseAktiv, E2.ninaZaehlt, E2.prognoseIntervall, E2.prognoseAufloesung, E2.prognoseWochen, E2.prognoseHalbwert, E2.prognoseMindesttage], (s4) => {
  const rotOpts = opts(s4, E2.mapRotation, ROT_DEFAULT);
  return {
    dark: st(s4, E2.dark) !== "off",
    darkId: E2.dark,
    karte: { id: E2.karte, value: st(s4, E2.karte), options: opts(s4, E2.karte), labels: opts(s4, E2.karte) },
    rotation: { id: E2.mapRotation, value: st(s4, E2.mapRotation), options: rotOpts, labels: rotOpts.map((x2) => x2 + "\xB0") },
    raumnamen: { id: E2.raumnamen, value: st(s4, E2.raumnamen), options: opts(s4, E2.raumnamen, ["Original", "Deutsch"]), labels: opts(s4, E2.raumnamen, ["Original", "Deutsch"]) },
    schalter: [
      { id: E2.automatik, label: t3("settings.automatik"), sub: "", on: on(s4, E2.automatik) },
      { id: E2.planerBereich, label: t3("settings.planer"), sub: "", on: on(s4, E2.planerBereich) },
      { id: E2.prognoseAktiv, label: t3("settings.prognose"), sub: t3("settings.prognoseSub"), on: on(s4, E2.prognoseAktiv) },
      { id: E2.ninaZaehlt, label: t3("settings.nina"), sub: "", on: on(s4, E2.ninaZaehlt) }
    ],
    prognose: [
      rng(s4, E2.prognoseIntervall, t3("settings.interval"), t3("settings.unitMin"), t3("settings.intervalSub"), 5, 60, 5),
      rng(s4, E2.prognoseAufloesung, t3("settings.resolution"), t3("settings.unitMin"), t3("settings.resolutionSub"), 15, 60, 15),
      rng(s4, E2.prognoseWochen, t3("settings.weeks"), t3("settings.unitWeeks"), t3("settings.weeksSub"), 2, 12, 1),
      rng(s4, E2.prognoseHalbwert, t3("settings.halflife"), t3("settings.unitDays"), t3("settings.halflifeSub"), 7, 60, 1),
      rng(s4, E2.prognoseMindesttage, t3("settings.minDays"), t3("settings.unitDaysFrom"), t3("settings.minDaysSub"), 3, 28, 1)
    ],
    version: ""
  };
});
var readRobotSettings = memoizeSelector(() => [E2.carpetCleaning, E2.waterTemperature, E2.dryingTime, E2.autoEmptyMode, E2.selfCleanFrequency, E2.cleangenius, E2.selfCleanArea, E2.volume, E2.dndStart, E2.dndEnd], (s4) => {
  const sel = (id, label) => ({ id, label, value: st(s4, id), options: opts(s4, id) });
  return {
    selects: [sel(E2.carpetCleaning, t3("robotsettings.carpet")), sel(E2.waterTemperature, t3("robotsettings.waterTemp")), sel(E2.dryingTime, t3("robotsettings.drying")), sel(E2.autoEmptyMode, t3("robotsettings.autoEmpty")), sel(E2.selfCleanFrequency, t3("robotsettings.selfClean")), sel(E2.cleangenius, t3("robotsettings.cleangenius"))],
    numbers: [rng(s4, E2.selfCleanArea, t3("robotsettings.selfCleanArea"), t3("robotsettings.unitM2"), "", 0, 100, 1), rng(s4, E2.volume, t3("robotsettings.volume"), t3("robotsettings.unitPct"), "", 0, 100, 1)],
    dndStart: txt(s4, E2.dndStart).slice(0, 5),
    dndEnd: txt(s4, E2.dndEnd).slice(0, 5),
    dndStartId: E2.dndStart,
    dndEndId: E2.dndEnd
  };
});
var coord = (v2) => typeof v2 === "number" && isFinite(v2) ? v2 : null;
function roomShapes(s4, order) {
  const rooms = attr(s4, E2.map, "rooms");
  if (!rooms || typeof rooms !== "object") return [];
  const out = [];
  for (const r4 of order) {
    const m2 = rooms[String(r4.id)];
    if (!m2 || m2.visibility === "Hidden") continue;
    const x0 = coord(m2.x0), y0 = coord(m2.y0), x1 = coord(m2.x1), y1 = coord(m2.y1);
    if (x0 === null || y0 === null || x1 === null || y1 === null) continue;
    const cx = coord(m2.x) ?? (x0 + x1) / 2, cy = coord(m2.y) ?? (y0 + y1) / 2;
    out.push({ id: r4.id, name: String(m2.custom_name ?? m2.name ?? r4.name), short: r4.short, icon: r4.icon, x: cx, y: cy, outline: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] });
  }
  return out;
}
var readMap = memoizeSelector((s4) => [...profileIds(s4), E2.karte, E2.chairs, E2.selectedMap, E2.mapData], (s4) => {
  const sm = ent(s4, E2.selectedMap);
  const roomOrder = readProfile(s4).rooms;
  const mdEnt = ent(s4, E2.mapData);
  const mdPic = String(attr(s4, E2.mapData, "entity_picture") ?? "");
  return {
    mapData: mdEnt && !EMPTY2.includes(mdEnt.state) && mdPic ? { picture: mdPic, version: mdEnt.state, mapKey: String(attr(s4, E2.mapData, "saved_map_id") ?? attr(s4, E2.mapData, "map_id") ?? "0") } : null,
    entityPicture: String(attr(s4, E2.map, "entity_picture") ?? ""),
    calibrationPoints: attr(s4, E2.map, "calibration_points") ?? null,
    noGoAreas: attr(s4, E2.map, "no_go_areas") ?? null,
    noMoppingAreas: attr(s4, E2.map, "no_mopping_areas") ?? null,
    virtualWalls: attr(s4, E2.map, "virtual_walls") ?? null,
    rooms: attr(s4, E2.map, "rooms") ?? null,
    karte: st(s4, E2.karte),
    chairs: on(s4, E2.chairs),
    chairsId: E2.chairs,
    roomOrder,
    roomShapes: roomShapes(s4, roomOrder),
    selectedMap: sm && !EMPTY2.includes(sm.state) ? { id: E2.selectedMap, value: sm.state, options: opts(s4, E2.selectedMap) } : null
  };
}, () => ({ [E2.map]: stateAndAttributes(["entity_picture", "calibration_points", "no_go_areas", "no_mopping_areas", "virtual_walls", "rooms"]), [E2.mapData]: stateAndAttributes(["entity_picture", "saved_map_id", "map_id"]) }));
var readDiagnostics = memoizeSelector((s4) => [...profileIds(s4), ...allContractIds(readProfile(s4).roomIds)], (s4) => {
  const roomIds = readProfile(s4).roomIds;
  const ids = allContractIds(roomIds);
  const group = (name, list) => ({ name, total: list.length, missing: list.filter((id) => !s4[id]), unavailable: list.filter((id) => s4[id] && EMPTY2.includes(s4[id].state)) });
  const robotSet = new Set(robotIds(roomIds));
  const robot = group(t3("diag.robot", { name: deviceName() || t3("diag.robotUnknown") }), ids.filter((id) => robotSet.has(id)));
  const paket = group(t3("diag.package"), ids.filter((id) => !robotSet.has(id)));
  return { total: ids.length, missing: [...robot.missing, ...paket.missing], unavailable: [...robot.unavailable, ...paket.unavailable], groups: [robot, paket] };
});
var ALL_SELECTORS = {
  readProfile,
  readRobot,
  readPlans,
  readAllRoomValues,
  readLearn,
  readHistory,
  readPrognose,
  readAutomatik,
  readConsumables,
  readStation,
  readSettings,
  readRobotSettings,
  readMap,
  readDiagnostics,
  ...Object.fromEntries(PLAN_NUMBERS.map((n4) => [`readPlan(${n4})`, PLAN_SELECTORS[n4]]))
};

// src/pages.ts
var PAGES = ["start", "reinigen", "planer", "protokoll", "prognose", "einstellungen"];
var PAGE_TITLE = {
  start: { title: "", sub: t3("page.start.sub") },
  reinigen: { title: t3("page.reinigen.title"), sub: t3("page.reinigen.sub") },
  planer: { title: t3("page.planer.title"), sub: t3("page.planer.sub") },
  protokoll: { title: t3("page.protokoll.title"), sub: t3("page.protokoll.sub") },
  prognose: { title: t3("page.prognose.title"), sub: t3("page.prognose.sub") },
  einstellungen: { title: t3("page.einstellungen.title"), sub: t3("page.einstellungen.sub") }
};
var PAGE_PARTS = Object.fromEntries(
  PAGES.filter((p3) => p3 !== "start").map((p3) => [p3, tx(`page.parts.${p3}`).split("|")])
);
var START_SLOTS = [
  { slot: "hero", title: "", span: "span3", part: "dx-hero", task: "4.1" },
  { slot: "map", title: t3("slot.map"), span: "span6", part: "dx-map-card compact", task: "4.3" },
  { slot: "automatik", title: t3("slot.automatik"), span: "", part: "dx-automatik", task: "4.9" },
  { slot: "auftrag", title: t3("slot.auftrag"), span: "", part: "dx-auftrag", task: "4.1" },
  { slot: "heute", title: t3("slot.heute"), span: "", part: "dx-heute", task: "4.10" },
  { slot: "planer", title: t3("slot.planer"), span: "span3", part: "dx-planer compact", task: "4.4" },
  { slot: "consumables", title: t3("slot.consumables"), span: "span3", part: "dx-consumables", task: "4.9" },
  { slot: "station", title: t3("slot.station"), span: "span3", part: "dx-station", task: "4.9" },
  { slot: "stats", title: t3("slot.stats"), span: "span3", part: "dx-stats", task: "4.7" },
  { slot: "quickstart", title: t3("slot.quickstart"), span: "span7", part: "dx-quickstart", task: "4.3" },
  { slot: "history", title: t3("slot.history"), span: "span5", part: "dx-history compact", task: "4.7" }
];
var startSlot = (slot) => START_SLOTS.find((s4) => s4.slot === slot);
function toPage(value) {
  return PAGES.includes(String(value)) ? value : "start";
}

// src/styles/tokens.ts
var tokens = i`
  :host {
    /* Flächen: Seite → Bento-Fläche → interaktive Fläche → aktiv */
    --dx-bg: #0b1015;
    --dx-bg-elevated: #10171e;
    --dx-surface: #111a22;
    --dx-surface-raised: #16212a;
    --dx-surface-active: #1c2a36;

    --dx-text: #e7edf3;
    --dx-text-muted: #8a97a6;
    --dx-text-faint: #5d6b7a;

    /* Farben mit Bedeutung (Abschnitt 3): Grün = aktiv/OK, Blau = Auswahl/Interaktion, Amber = Hinweis, Rot = Fehler */
    --dx-accent: #58b7f6;
    --dx-accent-soft: rgba(88, 183, 246, 0.14);
    --dx-positive: #39d98a;
    --dx-positive-soft: rgba(57, 217, 138, 0.14);
    --dx-warning: #f2b544;
    --dx-warning-soft: rgba(242, 181, 68, 0.14);
    --dx-danger: #ef5b5b;
    --dx-danger-soft: rgba(239, 91, 91, 0.14);
    --dx-on-positive: #062014;
    --dx-on-accent: #041623;

    --dx-border: rgba(255, 255, 255, 0.08);
    --dx-border-strong: rgba(255, 255, 255, 0.14);

    --dx-radius-sm: 8px;
    --dx-radius-md: 10px;
    --dx-radius-lg: 14px;
    --dx-radius-xl: 18px;

    --dx-space-1: 4px;
    --dx-space-2: 8px;
    --dx-space-3: 12px;
    --dx-space-4: 16px;
    --dx-space-5: 24px;

    --dx-shadow-float: 0 12px 32px rgba(0, 0, 0, 0.45);
    --dx-dur: 160ms;
    --dx-ease: cubic-bezier(0.2, 0.7, 0.2, 1);
    --dx-touch: 44px;

    --dx-font: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  /* Hell (vorbereitet, Abschnitt 28): dieselben Rollen, andere Werte. Wird gesetzt, wenn input_boolean.heidi_dark_mode aus ist. */
  :host(.light) {
    --dx-bg: #eef1f4;
    --dx-bg-elevated: #f6f8fa;
    --dx-surface: #ffffff;
    --dx-surface-raised: #f1f4f7;
    --dx-surface-active: #e3e9ef;
    --dx-text: #10171e;
    --dx-text-muted: #55636f;
    --dx-text-faint: #8a97a6;
    --dx-accent: #1f7fc4;
    --dx-accent-soft: rgba(31, 127, 196, 0.12);
    --dx-positive: #1d9a5f;
    --dx-positive-soft: rgba(29, 154, 95, 0.12);
    --dx-warning: #b7791f;
    --dx-warning-soft: rgba(183, 121, 31, 0.12);
    --dx-danger: #c8403f;
    --dx-danger-soft: rgba(200, 64, 63, 0.12);
    --dx-on-positive: #ffffff;
    --dx-on-accent: #ffffff;
    --dx-border: rgba(0, 0, 0, 0.08);
    --dx-border-strong: rgba(0, 0, 0, 0.16);
    --dx-shadow-float: 0 12px 32px rgba(0, 0, 0, 0.18);
  }
`;

// src/styles/base.ts
var base = i`
  :host {
    display: block;
    background: var(--dx-bg);
    color: var(--dx-text);
    font-family: var(--dx-font);
    font-size: 14px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    min-height: 100%;
    box-sizing: border-box;
  }
  /* Container „app“ = die Karte; Overlay und Toast liegen außerhalb (position: fixed bleibt am Viewport) */
  .root {
    container-type: inline-size;
    container-name: app;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
  h1,
  h2,
  h3 {
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  button {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid var(--dx-accent);
    outline-offset: 2px;
  }
  ha-icon {
    --mdc-icon-size: 20px;
    width: 20px;
    height: 20px;
    display: inline-flex;
    flex: none;
  }

  /* Gerüst: Seitenleiste | Inhalt; schmal: Inhalt / Tab-Leiste */
  .app {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    grid-template-areas: 'side content';
    min-height: calc(100vh - var(--header-height, 56px));
  }
  .content {
    grid-area: content;
    padding: var(--dx-space-5);
    display: grid;
    gap: var(--dx-space-4);
    align-content: start;
    container-type: inline-size;
    container-name: content;
    min-width: 0;
  }

  /* Kopfzeile */
  .topbar {
    display: flex;
    align-items: center;
    gap: var(--dx-space-4);
    flex-wrap: wrap;
  }
  .topbar h1 {
    font-size: 28px;
  }
  .topbar .sub {
    color: var(--dx-text-muted);
    font-size: 14px;
    margin-top: 2px;
  }
  .topbar .back {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 40px;
    padding: 0 10px 0 6px;
    border-radius: var(--dx-radius-md);
    color: var(--dx-text-muted);
    font-weight: 500;
  }
  .topbar .back:hover {
    background: var(--dx-surface);
    color: var(--dx-text);
  }
  .topbar .meta {
    margin-left: auto;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .meta .mi {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-left: 1px solid var(--dx-border);
  }
  .meta .mi:first-child {
    border-left: 0;
  }
  /* Einrichtungsprüfung (PD-014): nur die Symbole mit Befund zwischen Titel und Uhr; rot pulsiert; Klick springt zur Stelle */
  .topbar .setupicons { display: flex; align-items: center; gap: 8px; padding-right: 6px; } /* rechtsbündig, direkt links neben der Uhr */
  .topbar .si { width: 36px; height: 36px; border-radius: 50%; display: inline-grid; place-items: center; border: 1px solid transparent; cursor: pointer; padding: 0; }
  .topbar .si ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
  .topbar .si.warn { background: color-mix(in srgb, var(--dx-warning) 22%, transparent); color: var(--dx-warning); border-color: var(--dx-warning); }
  .topbar .si.error { background: color-mix(in srgb, var(--dx-danger) 24%, transparent); color: var(--dx-danger); border-color: var(--dx-danger); animation: dx-setup-pulse 1.6s ease-in-out infinite; }
  .topbar .si:hover { filter: brightness(1.2); }
  @keyframes dx-setup-pulse {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--dx-danger) 55%, transparent); }
    50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--dx-danger) 0%, transparent); }
  }
  @media (prefers-reduced-motion: reduce) { .topbar .si.error { animation: none; } }
  .meta .mi ha-icon {
    color: var(--dx-text-muted);
  }
  .meta .mi b {
    display: block;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .meta .mi small {
    color: var(--dx-text-muted);
    font-size: 11px;
  }
  .meta .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--dx-text-faint);
    display: inline-block;
    margin-left: 6px;
  }
  .meta .dot.on {
    background: var(--dx-positive);
  }

  /* Bento-Flächen */
  .bento {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: var(--dx-space-4);
    grid-auto-rows: min-content;
  }
  .b {
    background: var(--dx-surface);
    border: 1px solid var(--dx-border);
    border-radius: var(--dx-radius-lg);
    padding: var(--dx-space-4);
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--dx-space-3);
  }
  .b > .hd {
    display: flex;
    align-items: center;
    gap: var(--dx-space-2);
    min-height: 24px;
  }
  .b > .hd h2 {
    font-size: 15px;
  }
  .b > .hd .r {
    margin-left: auto;
    font-size: 12px;
    color: var(--dx-text-muted);
  }
  .stack {
    display: grid;
    gap: var(--dx-space-4);
    align-content: start;
    min-width: 0;
  }
  .lbl {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dx-text-muted);
    font-weight: 600;
  }
  .hint {
    font-size: 12px;
    color: var(--dx-text-muted);
    line-height: 1.45;
  }
  .span3 { grid-column: span 3; }
  .span4 { grid-column: span 4; }
  .span5 { grid-column: span 5; }
  .span6 { grid-column: span 6; }
  .span7 { grid-column: span 7; }
  .span8 { grid-column: span 8; }
  .span9 { grid-column: span 9; }
  .span12 { grid-column: span 12; }

  /* Navigationsform (Container app = die Karte) */
  @container app (max-width: 1180px) {
    .app { grid-template-columns: 72px minmax(0, 1fr); }
    .content { padding: 20px; }
    .topbar h1 { font-size: 24px; }
  }
  @container app (max-width: 760px) {
    /* Inhalt wächst mit (1fr = minmax(auto, 1fr)), Tab-Leiste ganz unten und beim Scrollen am Viewport-Rand (sticky) */
    .app { grid-template-columns: minmax(0, 1fr); grid-template-rows: 1fr auto; grid-template-areas: 'content' 'tab'; }
    .content { padding: 16px 16px 24px; }
    .topbar h1 { font-size: 22px; }
    /* Handy: Uhr/Zuhause/Nicht stören ausblenden, die Symbole der Einrichtungsprüfung bleiben (rechts neben dem Titel) */
    .topbar .meta .mi { display: none; }
    .topbar .meta { gap: 0; }
  }

  /* Bento-Spalten (Container content = Inhaltsbereich) */
  @container content (max-width: 1099px) {
    .bento { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .span3, .span4, .span5 { grid-column: span 3; }
    .span6, .span7, .span8, .span9 { grid-column: span 6; }
    /* Tablet: Roboter-Panel und rechte Spalte nebeneinander, Karte darunter in voller Breite */
    [data-slot='hero'] { order: -2; }
    .rightstack { order: -1; }
  }
  @container content (max-width: 640px) {
    .bento { grid-template-columns: minmax(0, 1fr); gap: var(--dx-space-3); }
    .span3, .span4, .span5, .span6, .span7, .span8, .span9, .span12 { grid-column: span 1; }
  }
`;

// src/styles/shell.ts
var shell = i`
  :host { position: relative; }
  .list { margin: 0; padding-left: 18px; }
  .preview li { color: var(--dx-text); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: var(--dx-touch); padding: 0 16px;
    border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-weight: 600; font-size: 14px; color: var(--dx-text);
  }
  .btn:hover { background: var(--dx-surface-active); }
  .btn.primary { background: var(--dx-positive); color: var(--dx-on-positive); border-color: transparent; }
  .toast {
    position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 60;
    background: var(--dx-surface-active); border: 1px solid var(--dx-border-strong); color: var(--dx-text);
    padding: 10px 16px; border-radius: var(--dx-radius-md); font-size: 13px; font-weight: 500; box-shadow: var(--dx-shadow-float);
    max-width: min(90vw, 520px); text-align: center; pointer-events: none; animation: fade var(--dx-dur) var(--dx-ease) both;
  }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
`;

// src/version.ts
var VERSION = "2.0.0-alpha.29";

// src/config.ts
var NAV = [
  { key: "start", label: t3("nav.start"), icon: "mdi:home-outline", page: "start", tab: true },
  { key: "reinigen", label: t3("nav.reinigen"), icon: "mdi:map-outline", page: "reinigen", tab: true },
  { key: "rooms", label: t3("nav.rooms"), icon: "mdi:view-grid-outline", overlay: "rooms", tab: false },
  { key: "planer", label: t3("nav.planer"), icon: "mdi:calendar-outline", page: "planer", tab: true },
  { key: "protokoll", label: t3("nav.protokoll"), icon: "mdi:format-list-bulleted", page: "protokoll", tab: true },
  { key: "prognose", label: t3("nav.prognose"), icon: "mdi:chart-line", page: "prognose", onlyWhen: "prognose", tab: true },
  { key: "einstellungen", label: t3("nav.einstellungen"), icon: "mdi:cog-outline", page: "einstellungen", tab: true }
];
var APP_SCENES = [
  { id: 32, name: t3("scene.32.name"), sub: t3("scene.32.sub"), icon: "mdi:door-open" },
  { id: 33, name: t3("scene.33.name"), sub: t3("scene.33.sub"), icon: "mdi:shower" },
  { id: 34, name: t3("scene.34.name"), sub: t3("scene.34.sub"), icon: "mdi:water" }
];

// src/shared/robot-svg.ts
var robotSvg = w`<svg viewBox="0 0 200 200" class="robotpic" aria-hidden="true">
  <defs><radialGradient id="rg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#2a3a48"/><stop offset=".7" stop-color="#131c25"/><stop offset="1" stop-color="#0c1219"/></radialGradient></defs>
  <ellipse cx="100" cy="176" rx="72" ry="9" fill="rgba(0,0,0,.45)"/>
  <circle cx="100" cy="100" r="84" fill="url(#rg)" stroke="#33465a" stroke-width="1.5"/>
  <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
  <path d="M40 130a66 66 0 0 0 120 0" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/>
  <circle cx="100" cy="82" r="20" fill="#0d141b" stroke="#3a4f63" stroke-width="1.5"/><circle cx="100" cy="82" r="8" fill="#1a2733" stroke="#58b7f6" stroke-width="1.2"/>
  <rect x="86" y="118" width="28" height="6" rx="3" fill="#1c2a36"/><circle cx="100" cy="150" r="3" fill="#39d98a"/>
  <path d="M60 46a56 56 0 0 1 80 0" fill="none" stroke="rgba(88,183,246,.35)" stroke-width="2" stroke-linecap="round"/></svg>`;

// src/components/dx-nav.ts
var NAV_ELEMENT = "dx-nav";
var TAB_MAX = 6;
var DxNav = class extends i4 {
  static {
    // Keine eigenen Tokens: die --dx-*-Variablen kommen von der Shell (auch :host(.light)).
    this.styles = [i`
    :host { display: contents; font-family: var(--dx-font); font-size: 14px; color: var(--dx-text); }
    button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    button:focus-visible { outline: 2px solid var(--dx-accent); outline-offset: 2px; }
    ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; display: inline-flex; flex: none; }

    /* Seitenleiste: Fläche füllt die Spalte, der Inhalt klebt unter HAs Kopfzeile */
    .side { grid-area: side; border-right: 1px solid var(--dx-border); background: var(--dx-bg-elevated); min-width: 0; }
    .inner { position: sticky; top: var(--header-height, 56px); box-sizing: border-box; min-height: calc(100vh - var(--header-height, 56px));
      display: flex; flex-direction: column; gap: var(--dx-space-5); padding: var(--dx-space-5) var(--dx-space-3); }
    .brand { display: flex; align-items: center; gap: 12px; padding: 0 8px; }
    .brand .logo { width: 36px; height: 36px; border-radius: 50%; border: 3px solid var(--dx-accent); border-right-color: transparent; transform: rotate(-30deg); flex: none; }
    .brand .t { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
    .brand .s { font-size: 12px; color: var(--dx-text-muted); }
    .navlist { display: grid; gap: 4px; }
    .navlist button { display: flex; align-items: center; gap: 12px; height: var(--dx-touch); padding: 0 12px; border-radius: var(--dx-radius-md); border: 1px solid transparent;
      color: var(--dx-text-muted); font-size: 14px; font-weight: 500; text-align: left; white-space: nowrap; transition: background var(--dx-dur) var(--dx-ease), color var(--dx-dur); }
    .navlist button:hover { background: var(--dx-surface); color: var(--dx-text); }
    .navlist button[aria-current] { background: var(--dx-surface-active); color: var(--dx-text); border-color: rgba(88, 183, 246, 0.35); box-shadow: inset 3px 0 0 var(--dx-accent); }
    .foot { margin-top: auto; display: grid; justify-items: center; gap: 8px; color: var(--dx-text-muted); font-size: 12px; text-align: center; padding-bottom: 8px; }
    .foot .robotpic { width: 120px; height: 120px; }
    .foot .version { color: var(--dx-text-faint); font-size: 11px; font-variant-numeric: tabular-nums; }

    /* Tab-Leiste: nur schmal */
    .tabbar { display: none; }

    @container app (max-width: 1180px) {
      .inner { padding: 20px 10px; }
      .brand { justify-content: center; padding: 0; }
      .brand .t, .brand .s, .navlist button > span, .foot .robotpic, .foot .m, .foot .version { display: none; }
      .navlist button { justify-content: center; padding: 0; width: 52px; margin: 0 auto; }
      .navlist button[aria-current] { box-shadow: none; }
    }
    @container app (max-width: 760px) {
      .side { display: none; }
      .tabbar { grid-area: tab; display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); position: sticky; bottom: 0; z-index: 20;
        background: color-mix(in srgb, var(--dx-bg-elevated) 92%, transparent); backdrop-filter: blur(10px); border-top: 1px solid var(--dx-border);
        padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); }
      .tabbar button { display: grid; justify-items: center; align-content: center; gap: 3px; height: 50px; border-radius: var(--dx-radius-sm); color: var(--dx-text-muted); font-size: 10px; font-weight: 500; }
      .tabbar button[aria-current] { color: var(--dx-accent); background: var(--dx-accent-soft); }
    }
    @media (hover: none) { .navlist button:hover { background: transparent; } }
  `];
  }
  static {
    this.properties = {
      page: { type: String },
      prognoseAktiv: { type: Boolean, attribute: "prognose-aktiv" },
      version: { type: String }
    };
  }
  constructor() {
    super();
    this.page = "start";
    this.prognoseAktiv = false;
    this.version = "";
  }
  /** Sichtbare Einträge: Prognose nur bei aktiver Prognose. */
  get entries() {
    return NAV.filter((e4) => e4.onlyWhen !== "prognose" || this.prognoseAktiv);
  }
  pick(e4) {
    if (e4.overlay === "rooms") emit(this, EVENTS.openOverlay, { kind: "rooms", mode: "robot" });
    else if (e4.page) emit(this, EVENTS.navigate, { page: e4.page });
  }
  item(e4) {
    const on2 = e4.page !== void 0 && e4.page === this.page;
    return b2`<button data-nav=${e4.key} aria-current=${on2 ? "page" : A} title=${e4.label} aria-label=${e4.label} @click=${() => this.pick(e4)}>
      <ha-icon icon=${e4.icon}></ha-icon><span>${e4.label}</span></button>`;
  }
  render() {
    const es = this.entries;
    return b2`
      <nav class="side" aria-label=${t3("nav.sidebar")}>
        <div class="inner">
          <div class="brand"><span class="logo"></span><div><div class="t">${deviceName() || t3("common.robot")}</div><div class="s">${t3("nav.brandSub")}</div></div></div>
          <div class="navlist">${es.map((e4) => this.item(e4))}</div>
          <div class="foot">${robotSvg}<div class="m">${t3("nav.model")}</div><div class="version">dreame_x60 v${this.version}</div></div>
        </div>
      </nav>
      <nav class="tabbar" aria-label=${t3("nav.tabbar")}>${es.filter((e4) => e4.tab).slice(0, TAB_MAX).map((e4) => this.item(e4))}</nav>`;
  }
};
if (!customElements.get(NAV_ELEMENT)) customElements.define(NAV_ELEMENT, DxNav);

// src/domain/strip.ts
function runOrder(r4) {
  const active = r4.activeSegments;
  const memo = r4.laufReihenfolge.filter((x2) => active.includes(x2));
  const order = memo.length === active.length ? memo : r4.cleaningSequence.filter((id) => active.includes(id));
  const idx = r4.currentSegment === null ? -1 : order.indexOf(r4.currentSegment);
  return { order, idx, rest: idx >= 0 ? order.slice(idx + 1) : order };
}
var shortOf = (rooms, id) => roomById(rooms, id)?.short;
var FAN_ICON = { Leise: "mdi:fan-speed-1", Standard: "mdi:fan-speed-2", Stark: "mdi:fan-speed-3", Turbo: "mdi:fan" };
var modusIcons = (modus) => modus === "Saugen" ? ["mdi:broom"] : modus === "Nur Wischen" ? ["mdi:water"] : ["mdi:broom", "mdi:water"];
function roomValueChips(v2) {
  const chips = [{ icons: modusIcons(v2.modus), text: v2.modus }, { icons: [FAN_ICON[v2.saug] ?? "mdi:fan"], text: v2.saug }];
  if (v2.modus !== "Saugen" && v2.wasser) chips.push({ icons: ["mdi:water-percent"], text: v2.wasser });
  if (v2.modus === "Nur Wischen" && v2.route) chips.push({ icons: ["mdi:routes"], text: v2.route });
  chips.push({ icons: ["mdi:repeat"], text: `${v2.wdh}\xD7` });
  return chips;
}
function stripModel(r4, roomValues, rooms) {
  if (!["cleaning", "paused"].includes(r4.vac)) return null;
  const seg = r4.currentSegment;
  const room = seg === null ? void 0 : roomById(rooms, seg);
  const v2 = room ? roomValues(room.id) : null;
  if (!room || !v2) return null;
  const { order, rest } = runOrder(r4);
  const restTxt = rest.map((id) => shortOf(rooms, id)).filter(Boolean).join(" \u2192 ");
  const first = order.length ? shortOf(rooms, order[0]) : void 0;
  if (r4.vac === "cleaning" && r4.cleanedArea === 0) {
    return { kind: "startpunkt", roomId: room.id, icon: "mdi:map-marker-path", head: t3("strip.startpoint"), right: first ? t3("strip.to", { rooms: first }) : "", chips: [] };
  }
  if (r4.activeSegments.length && !r4.activeSegments.includes(room.id)) {
    return { kind: "durchfahrt", roomId: room.id, icon: room.icon, head: t3("strip.through", { room: room.short }), right: restTxt ? t3("strip.to", { rooms: restTxt }) : "", chips: [] };
  }
  return { kind: "jetzt", roomId: room.id, icon: room.icon, head: t3("strip.now", { room: room.short }), right: restTxt ? t3("strip.then", { rooms: restTxt }) : t3("strip.lastRoom"), chips: roomValueChips(v2) };
}

// src/styles/controls.ts
var controls = i`
  :host { font-family: var(--dx-font); font-size: 14px; line-height: 1.4; color: var(--dx-text); }
  *, *::before, *::after { box-sizing: border-box; }
  h2, h3, p { margin: 0; }
  h2, h3 { font-weight: 600; letter-spacing: -0.01em; }
  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  button:focus-visible { outline: 2px solid var(--dx-accent); outline-offset: 2px; }
  ha-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; display: inline-flex; flex: none; }

  .hd { display: flex; align-items: center; gap: var(--dx-space-2); min-height: 24px; }
  .hd h2 { font-size: 15px; display: flex; align-items: center; gap: 8px; }
  .hd .r { margin-left: auto; font-size: 12px; color: var(--dx-text-muted); display: inline-flex; align-items: center; gap: 4px; }
  .lbl { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dx-text-muted); font-weight: 600; }
  .hint { font-size: 12px; color: var(--dx-text-muted); line-height: 1.45; }

  /* Status-Punkt */
  .st { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
  .st i { width: 8px; height: 8px; border-radius: 50%; background: var(--dx-text-muted); flex: none; }
  .st.good i { background: var(--dx-positive); } .st.acc i { background: var(--dx-accent); } .st.warn i { background: var(--dx-warning); } .st.bad i { background: var(--dx-danger); }
  .st.good { color: var(--dx-positive); } .st.warn { color: var(--dx-warning); } .st.bad { color: var(--dx-danger); }
  .st.pill { padding: 4px 10px; border-radius: 999px; font-size: 12px; background: var(--dx-surface-raised); border: 1px solid var(--dx-border); white-space: nowrap; }

  /* Werte */
  .kv { display: flex; align-items: baseline; gap: 10px; }
  .kv .v { font-size: 32px; font-weight: 600; letter-spacing: -0.02em; line-height: 1; font-variant-numeric: tabular-nums; }
  .kv .u { font-size: 14px; color: var(--dx-text-muted); }

  /* Chips */
  .chip { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border-radius: 999px; background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-size: 12px; font-weight: 500; color: var(--dx-text); white-space: nowrap; }
  .chip ha-icon { --mdc-icon-size: 14px; width: 14px; height: 14px; color: var(--dx-text-muted); }
  .chip.on { border-color: rgba(57, 217, 138, 0.45); background: var(--dx-positive-soft); } .chip.on ha-icon { color: var(--dx-positive); }
  .chip.acc { border-color: rgba(88, 183, 246, 0.5); background: var(--dx-accent-soft); } .chip.acc ha-icon { color: var(--dx-accent); }
  .chip.warn { border-color: rgba(242, 181, 68, 0.5); background: var(--dx-warning-soft); color: var(--dx-warning); } .chip.warn ha-icon { color: var(--dx-warning); }
  .chip.bad { border-color: rgba(239, 91, 91, 0.5); background: var(--dx-danger-soft); color: var(--dx-danger); } .chip.bad ha-icon { color: var(--dx-danger); }
  .chip.k { height: 26px; font-size: 11px; padding: 0 8px; }
  .chip.dim { opacity: 0.55; }
  button.chip:hover { background: var(--dx-surface-active); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }

  /* Knöpfe */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: var(--dx-touch); padding: 0 16px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-weight: 600; font-size: 14px; color: var(--dx-text); transition: background var(--dx-dur), border-color var(--dx-dur), transform 80ms; white-space: nowrap; }
  .btn:hover { background: var(--dx-surface-active); } .btn:active { transform: scale(0.985); }
  .btn.primary { background: var(--dx-positive); color: var(--dx-on-positive); border-color: transparent; } .btn.primary:hover { filter: brightness(1.06); }
  .btn.primary ha-icon { color: var(--dx-on-positive); }
  .btn.danger { color: var(--dx-danger); border-color: rgba(239, 91, 91, 0.35); }
  .btn.on { border-color: var(--dx-accent); background: var(--dx-accent-soft); color: var(--dx-text); }
  .btn.sm { height: 36px; padding: 0 12px; font-size: 13px; }
  .btn.icon { width: var(--dx-touch); padding: 0; }

  /* Hinweiszeile (Streifen) */
  .note { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-size: 13px; text-align: left; width: 100%; }
  .note > ha-icon { color: var(--dx-positive); margin-top: 1px; }
  .note b { display: block; } .note small { color: var(--dx-text-muted); font-size: 12px; }
  button.note:hover { background: var(--dx-surface-active); }

  /* Balken und Zeilen */
  .bar { height: 6px; border-radius: 999px; background: var(--dx-surface-active); overflow: hidden; }
  .bar i { display: block; height: 100%; border-radius: inherit; background: var(--dx-positive); width: calc(var(--p) * 1%); transition: width 400ms var(--dx-ease); }
  .bar.warn i { background: var(--dx-warning); } .bar.bad i { background: var(--dx-danger); } .bar.acc i { background: var(--dx-accent); }
  .meter { display: grid; grid-template-columns: minmax(84px, auto) 1fr 44px; align-items: center; gap: 10px; min-height: 32px; font-size: 13px; }
  .meter .n { color: var(--dx-text-muted); } .meter .p { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
  .row { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 6px 0; border-top: 1px solid var(--dx-border); }
  .row:first-child { border-top: 0; }
  .row .t { font-size: 14px; font-weight: 500; } .row .s { font-size: 12px; color: var(--dx-text-muted); margin-top: 1px; }
  .row > div:first-child { flex: 1; min-width: 0; }
  .tag { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; padding: 3px 8px; border-radius: 6px; background: var(--dx-surface-active); color: var(--dx-text-muted); white-space: nowrap; }
  .tag.acc { color: var(--dx-accent); background: var(--dx-accent-soft); }

  /* Listenzeilen mit Symbol (Szenen, Planer), Schalter, kleine Symbolknöpfe */
  .plan { display: grid; }
  .pr { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 12px; min-height: 60px; padding: 8px 0; border-top: 1px solid var(--dx-border); }
  .pr:first-child { border-top: 0; }
  .pr .ic { width: 36px; height: 36px; border-radius: var(--dx-radius-sm); background: var(--dx-surface-raised); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); border: 1px solid var(--dx-border); }
  .pr .n { font-weight: 600; font-size: 14px; } .pr .s { font-size: 12px; color: var(--dx-text-muted); margin-top: 2px; }
  .pr .acts { display: flex; gap: 6px; }
  .crow { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); }
  .crow .ic { width: 38px; height: 38px; border-radius: var(--dx-radius-sm); background: var(--dx-surface-active); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); }
  .crow .ic.on { color: var(--dx-positive); background: var(--dx-positive-soft); }
  .crow .t { font-weight: 600; font-size: 14px; } .crow .s { font-size: 12px; color: var(--dx-text-muted); margin-top: 1px; }
  .sw { width: 44px; height: 26px; border-radius: 999px; background: var(--dx-surface-active); border: 1px solid var(--dx-border-strong); position: relative; flex: none; transition: background var(--dx-dur), border-color var(--dx-dur); }
  .sw::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--dx-text-muted); transition: transform var(--dx-dur) var(--dx-ease), background var(--dx-dur); }
  .sw.on { background: var(--dx-positive-soft); border-color: rgba(57, 217, 138, 0.5); } .sw.on::after { transform: translateX(18px); background: var(--dx-positive); }
  .ib { width: 40px; height: 40px; border-radius: var(--dx-radius-sm); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); border: 1px solid var(--dx-border); background: var(--dx-surface-raised); }
  .ib:hover { color: var(--dx-text); background: var(--dx-surface-active); } .ib.go { color: var(--dx-positive); }

  @media (hover: none) { .btn:hover, button.chip:hover, button.note:hover { background: var(--dx-surface-raised); } }
`;

// src/components/dx-hero.ts
var HERO_ELEMENT = "dx-hero";
var BATT_BAD_PCT = 20;
var BATT_WARN_PCT = 30;
var DOT_CLASS = { accent: "acc", warning: "warn", danger: "bad", positive: "good" };
var DxHero = class extends i4 {
  static {
    this.styles = [controls, i`
    :host { display: flex; flex-direction: column; gap: var(--dx-space-3); min-width: 0; }
    .robot { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: start; }
    .name { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
    .st.big { margin-top: 6px; text-align: left; }
    .sub { margin-top: 2px; }
    .station { text-align: right; font-size: 13px; }
    .robotpic { grid-column: 1; width: 100%; height: auto; max-width: 230px; aspect-ratio: 1; justify-self: center; }
    .batt { grid-column: 2; grid-row: 2; align-self: center; display: grid; gap: 4px; justify-items: start; text-align: left; }
    .battbar { width: 18px; height: 34px; border: 2px solid var(--dx-text-muted); border-radius: 4px; position: relative; padding: 2px; margin-top: 4px; }
    .battbar::before { content: ''; position: absolute; top: -5px; left: 5px; width: 6px; height: 3px; border-radius: 1px; background: var(--dx-text-muted); }
    .battbar i { display: block; position: absolute; left: 2px; right: 2px; bottom: 2px; background: var(--dx-positive); border-radius: 2px; height: calc(var(--p) * 1%); }
    .battbar.warn i { background: var(--dx-warning); } .battbar.bad i { background: var(--dx-danger); }
    .battrow { display: flex; align-items: center; gap: 6px; }
    .battrow .bolt { --mdc-icon-size: 16px; width: 16px; height: 16px; color: var(--dx-positive); margin-top: 4px; }
    .params { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .param { background: var(--dx-surface-raised); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); padding: 10px; display: grid; gap: 2px; min-height: 44px; text-align: left; }
    .param:hover { background: var(--dx-surface-active); }
    .param b { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .param span { font-size: 11px; color: var(--dx-text-muted); }
    .param ha-icon { --mdc-icon-size: 16px; width: 16px; height: 16px; color: var(--dx-text-muted); margin-bottom: 2px; }
    .ctl { display: flex; gap: 8px; }
    .ctl .btn { flex: 1 1 0; min-width: 0; padding: 0 8px; } /* alle Knöpfe gleich breit (Herbert, 15.09.) */
    .strip small { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 2px; }
    .strip .chip { gap: 4px; }
    .strip > ha-icon:last-child { margin-left: auto; color: var(--dx-text-muted); align-self: center; }
    @container content (max-width: 640px) { .robotpic { max-width: 170px; } }
  `];
  }
  static {
    this.properties = { robot: { attribute: false }, rooms: { attribute: false }, roomOrder: { attribute: false }, api: { attribute: false } };
  }
  openRooms() {
    emit(this, EVENTS.openOverlay, { kind: "rooms", mode: "robot" });
  }
  /** Streifen aus Roboterzustand und Raumwerten (reine Funktion, billig). */
  get strip() {
    const r4 = this.robot, rooms = this.rooms;
    return r4 && rooms ? stripModel(r4, (id) => rooms.rooms[id] ?? null, this.roomOrder ?? []) : null;
  }
  /** Drei Werte: im Lauf die des aktuellen Raums, sonst der gemeinsame Wert aller Räume („–“ bei Abweichung oder unavailable). */
  params(strip) {
    const rooms = this.rooms;
    const dash = t3("common.dash");
    const cur = strip && rooms ? rooms.rooms[strip.roomId] : null;
    if (cur) return [cur.modus, cur.saug, cur.modus !== "Saugen" && cur.wasser ? cur.wasser : dash];
    const vals = rooms ? Object.values(rooms.rooms).filter((v2) => v2 !== null) : [];
    const common = (pick) => {
      if (!vals.length) return dash;
      const first = pick(vals[0]);
      return first !== null && vals.every((v2) => pick(v2) === first) ? first : dash;
    };
    return [common((v2) => v2.modus), common((v2) => v2.saug), common((v2) => v2.modus !== "Saugen" && v2.wasser ? v2.wasser : null)];
  }
  /** Stationszeile aus den Attributen docked/washing/drying/charging – nicht aus dem Hauptzustand (der bleibt bei der Mopp-Wäsche „cleaning“). */
  stationText(r4) {
    if (r4.docked) return [r4.washing ? t3("hero.washing") : r4.drying ? t3("hero.drying") : t3("hero.docked"), r4.charging ? t3("hero.charging") : null].filter(Boolean).join(" \xB7 ");
    if (r4.running) return t3("hero.away");
    return statusText(r4.vac);
  }
  render() {
    const r4 = this.robot;
    if (!r4) return b2``;
    const h3 = r4.hero;
    const strip = this.strip;
    const [modus, saug, wasser] = this.params(strip);
    const battCls = r4.battery <= BATT_BAD_PCT ? "bad" : r4.battery <= BATT_WARN_PCT ? "warn" : "";
    return b2`
      <div class="robot">
        <div>
          <div class="name">${deviceName() || t3("common.robot")}</div>
          <button class="st big ${DOT_CLASS[h3.dot]}" title=${t3("hero.status")} @click=${() => moreInfo(this, r4.moreInfo.vac)}><i></i><span class="bigtext">${h3.big}</span></button>
          ${h3.sub ? b2`<div class="hint sub">${h3.sub}</div>` : A}
        </div>
        <div class="station"><div class="lbl">${t3("hero.station")}</div><div>${this.stationText(r4)}</div></div>
        ${robotSvg}
        <button class="batt" title=${t3("hero.battery")} @click=${() => moreInfo(this, r4.moreInfo.battery)}>
          <div class="kv"><span class="v">${r4.battery}<span class="u"> %</span></span></div><div class="lbl">${t3("hero.battery")}</div>
          <div class="battrow"><div class="battbar ${battCls}" style="--p:${r4.battery}"><i></i></div>${r4.charging ? b2`<ha-icon class="bolt" icon="mdi:flash" title=${t3("hero.charging")}></ha-icon>` : A}</div>
        </button>
      </div>
      ${h3.roomChip || h3.errorChip ? b2`<div class="chips">${h3.roomChip ? b2`<span class="chip on"><ha-icon icon="mdi:floor-plan"></ha-icon>${h3.roomChip}</span>` : A}${h3.errorChip ? b2`<button class="chip ${h3.errorChip.level === "danger" ? "bad" : "warn"}" @click=${() => moreInfo(this, r4.moreInfo.error)}><ha-icon icon=${h3.errorChip.level === "danger" ? "mdi:alert" : "mdi:information-outline"}></ha-icon>${h3.errorChip.text}</button>` : A}</div>` : A}
      <div class="params">
        <button class="param" title=${t3("hero.modeTitle")} @click=${this.openRooms}><ha-icon icon="mdi:broom"></ha-icon><b>${modus}</b><span>${t3("hero.mode")}</span></button>
        <button class="param" title=${t3("hero.suctionTitle")} @click=${this.openRooms}><ha-icon icon="mdi:fan"></ha-icon><b>${saug}</b><span>${t3("hero.suction")}</span></button>
        <button class="param" title=${t3("hero.waterTitle")} @click=${this.openRooms}><ha-icon icon="mdi:water"></ha-icon><b>${wasser}</b><span>${t3("hero.water")}</span></button>
      </div>
      <div class="ctl">${h3.buttons.map((b3) => b2`<button class="btn ${b3.primary ? "primary" : ""}" data-svc=${b3.service} @click=${() => this.api?.vacuum(b3.service)}><ha-icon icon=${b3.icon}></ha-icon>${b3.label}</button>`)}</div>
      ${strip ? b2`<button class="note strip" title=${t3("hero.roomsTitle")} @click=${this.openRooms}><ha-icon icon=${strip.icon}></ha-icon><div><b>${strip.head}</b> <small>${strip.right}${strip.chips.length ? b2` · ` : A}${strip.chips.map((c4) => b2`<span class="chip k">${c4.icons.map((i5) => b2`<ha-icon icon=${i5}></ha-icon>`)}${c4.text}</span>`)}</small></div><ha-icon icon="mdi:chevron-right"></ha-icon></button>` : A}
    `;
  }
};
if (!customElements.get(HERO_ELEMENT)) customElements.define(HERO_ELEMENT, DxHero);

// src/components/dx-auftrag.ts
var AUFTRAG_ELEMENT = "dx-auftrag";
var DOT_CLASS2 = { accent: "acc", warning: "warn", danger: "bad", positive: "good" };
var DxAuftrag = class extends i4 {
  static {
    this.styles = [controls, i`
    :host { display: flex; flex-direction: column; gap: var(--dx-space-3); min-width: 0; }
    .route { text-transform: none; letter-spacing: 0; font-size: 13px; }
    .route b { color: var(--dx-text); }
    .kv { margin-top: 6px; }
    .meter.two { grid-template-columns: 1fr auto; margin-bottom: 6px; }
    .row.next { border-top: 1px solid var(--dx-border); }
  `];
  }
  static {
    this.properties = { robot: { attribute: false }, rooms: { attribute: false }, roomOrder: { attribute: false } };
  }
  render() {
    const r4 = this.robot;
    if (!r4 || !["cleaning", "paused"].includes(r4.vac) || r4.docked) return b2``;
    const { order, idx, rest } = runOrder(r4);
    const total = order.length;
    const startpunkt = r4.vac === "cleaning" && r4.cleanedArea === 0;
    const cur = startpunkt ? -1 : idx;
    const done = startpunkt || idx < 0 ? 0 : idx;
    const pct = total ? Math.round(done / total * 100) : 0;
    const nextId = startpunkt ? order[0] : rest[0];
    const rl = this.roomOrder ?? [];
    const next = nextId !== void 0 ? roomById(rl, nextId) : void 0;
    const nextVals = next && this.rooms ? this.rooms.rooms[next.id] : null;
    const short = (id) => roomById(rl, id)?.short ?? String(id);
    const dash = t3("common.dash");
    return b2`
      <div class="hd"><h2>${t3("auftrag.title")}</h2><span class="st pill ${DOT_CLASS2[r4.hero.dot]}"><i></i>${r4.hero.big}</span></div>
      <div>
        <div class="lbl route">${total ? order.map((id, i5) => b2`${i5 ? " \u2192 " : ""}${i5 === cur ? b2`<b>${short(id)}</b>` : short(id)}`) : r4.room !== dash ? b2`<b>${r4.room}</b>` : t3("auftrag.noRooms")}</div>
        <div class="kv"><span class="v">${r4.cleaningTime}<span class="u"> ${t3("unit.min")}</span></span><span class="u">· ${r4.cleanedArea} ${t3("unit.m2")}</span></div>
      </div>
      ${total ? b2`<div><div class="meter two"><span class="n">${t3("auftrag.rooms")}</span><span class="p">${done} / ${total}</span></div><div class="bar" style="--p:${pct}"><i></i></div></div>` : A}
      ${next ? b2`<div class="row next"><div><div class="s">${startpunkt ? t3("auftrag.first") : t3("auftrag.next")}</div><div class="t">${next.short}</div></div>${nextVals ? b2`<span class="tag">${nextVals.modus}</span>` : A}</div>` : total ? b2`<div class="row next"><div><div class="s">${t3("auftrag.last")}</div><div class="t">${cur >= 0 ? short(order[cur]) : dash}</div></div></div>` : A}
    `;
  }
};
if (!customElements.get(AUFTRAG_ELEMENT)) customElements.define(AUFTRAG_ELEMENT, DxAuftrag);

// src/components/dx-dialog.ts
var DIALOG_ELEMENT = "dx-dialog";
var FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function deepActive() {
  let a3 = document.activeElement;
  while (a3?.shadowRoot?.activeElement) a3 = a3.shadowRoot.activeElement;
  return a3;
}
var DxDialog = class extends i4 {
  constructor() {
    super();
    this._prevFocus = null;
    this._onKey = (e4) => {
      if (e4.key === "Escape") {
        e4.stopPropagation();
        this.close();
        return;
      }
      if (e4.key === "Tab") this.trapTab(e4);
    };
    this.variant = "modal";
    this.heading = "";
    this.sub = "";
    this.text = "";
    this.subText = "";
    this.okLabel = t3("common.ok");
    this.cancelLabel = t3("common.cancel");
    this.danger = false;
    this.wide = false;
    this.back = false;
    this._hasFoot = false;
  }
  static {
    this.styles = [controls, i`
    :host { position: fixed; inset: 0; z-index: 30; display: block; container-type: inline-size; container-name: dialog; }
    .scrim { position: absolute; inset: 0; background: rgba(3, 6, 9, 0.62); animation: fade var(--dx-dur) both; }
    .dlg {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: min(640px, calc(100% - 32px)); max-height: calc(100% - 32px); overflow: auto;
      background: var(--dx-bg-elevated); border: 1px solid var(--dx-border-strong); border-radius: var(--dx-radius-xl);
      padding: 18px 20px 20px; box-shadow: var(--dx-shadow-float); display: grid; gap: 14px; align-content: start; animation: fade var(--dx-dur) var(--dx-ease) both;
      outline: none;
    }
    .dlg.wide { width: min(900px, calc(100% - 32px)); }
    .dlg > h2 { font-size: 18px; display: flex; align-items: center; gap: 8px; position: sticky; top: -18px; background: var(--dx-bg-elevated); padding: 4px 0; z-index: 1; margin: 0; }
    .dlg > h2 .m { color: var(--dx-text-muted); font-weight: 500; font-size: 14px; }
    .dlg > h2 .close { margin-left: auto; }
    .iconbtn { width: 40px; height: 40px; border-radius: var(--dx-radius-md); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); border: 1px solid transparent; flex: none; }
    .iconbtn:hover { background: var(--dx-surface-raised); color: var(--dx-text); }
    .body { display: grid; gap: 14px; min-width: 0; }
    .foot { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
    .foot.empty { display: none; }
    .alert {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(360px, calc(100% - 48px));
      background: var(--dx-bg-elevated); border: 1px solid var(--dx-border-strong); border-radius: var(--dx-radius-lg); box-shadow: var(--dx-shadow-float); overflow: hidden; animation: fade var(--dx-dur) var(--dx-ease) both;
      outline: none;
    }
    .alert .m { padding: 20px 18px 16px; font-weight: 600; font-size: 15px; text-align: center; }
    .alert .m small { display: block; font-weight: 400; color: var(--dx-text-muted); font-size: 13px; margin-top: 6px; }
    .alert .b { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--dx-border); }
    .alert .b button { height: 48px; font-weight: 600; color: var(--dx-text-muted); border-radius: 0; }
    .alert .b button:hover { background: var(--dx-surface-raised); }
    .alert .b button + button { border-left: 1px solid var(--dx-border); color: var(--dx-accent); }
    .alert .b button.danger { color: var(--dx-danger); }
    /* Sheet: erzwungen (variant="sheet") oder automatisch unter 640 px */
    .dlg.sheet, .alert.sheet { top: auto; bottom: 0; left: 0; transform: none; width: 100%; max-height: 92%; border-radius: var(--dx-radius-xl) var(--dx-radius-xl) 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom)); animation: up 220ms var(--dx-ease) both; }
    .dlg.sheet::before { content: ''; width: 38px; height: 4px; border-radius: 2px; background: var(--dx-border-strong); margin: -6px auto 0; }
    .alert.sheet { bottom: 16px; left: 16px; right: 16px; width: auto; border-radius: var(--dx-radius-lg); padding-bottom: 0; }
    @container dialog (max-width: 640px) {
      .dlg { top: auto; bottom: 0; left: 0; transform: none; width: 100%; max-height: 92%; border-radius: var(--dx-radius-xl) var(--dx-radius-xl) 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom)); animation: up 220ms var(--dx-ease) both; }
      .dlg::before { content: ''; width: 38px; height: 4px; border-radius: 2px; background: var(--dx-border-strong); margin: -6px auto 0; }
      .alert { top: auto; bottom: 16px; left: 16px; right: 16px; transform: none; width: auto; }
    }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes up { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
  `];
  }
  static {
    this.properties = {
      variant: { type: String },
      heading: { type: String },
      sub: { type: String },
      text: { type: String },
      subText: { type: String, attribute: "sub-text" },
      okLabel: { type: String, attribute: "ok-label" },
      cancelLabel: { type: String, attribute: "cancel-label" },
      danger: { type: Boolean },
      wide: { type: Boolean },
      back: { type: Boolean },
      _hasFoot: { state: true }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this._prevFocus = deepActive();
    this._hasFoot = !!this.querySelector('[slot="foot"]');
    this.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback() {
    this.removeEventListener("keydown", this._onKey);
    const p3 = this._prevFocus;
    if (p3 && typeof p3.focus === "function" && p3.isConnected) p3.focus();
    super.disconnectedCallback();
  }
  firstUpdated() {
    const first = this.focusables().find((el) => !el.classList.contains("close") && !el.classList.contains("backbtn")) ?? this.focusables()[0];
    (first ?? this.renderRoot.querySelector("[role]"))?.focus();
  }
  /** Bedienbare Elemente in Dokumentreihenfolge: Kopfzeile (Shadow), eingeschobener Inhalt (Light DOM), Bestätigungsknöpfe. */
  focusables() {
    const root = this.renderRoot;
    const head = [...root.querySelectorAll("h2 " + FOCUSABLE.replace(/, /g, ", h2 "))];
    const body = [...this.querySelectorAll(FOCUSABLE)];
    const alert = [...root.querySelectorAll(".alert " + FOCUSABLE.replace(/, /g, ", .alert "))];
    return [...head, ...body, ...alert].filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
  }
  trapTab(e4) {
    const els = this.focusables();
    if (!els.length) {
      e4.preventDefault();
      return;
    }
    const cur = deepActive();
    const idx = els.findIndex((el) => el === cur);
    let next = e4.shiftKey ? idx - 1 : idx + 1;
    if (idx === -1) next = e4.shiftKey ? els.length - 1 : 0;
    if (next < 0) next = els.length - 1;
    if (next >= els.length) next = 0;
    e4.preventDefault();
    els[next].focus();
  }
  close() {
    emit(this, EVENTS.close);
  }
  confirm() {
    emit(this, EVENTS.confirm);
  }
  goBack() {
    emit(this, EVENTS.back);
  }
  onFootSlot(e4) {
    this._hasFoot = e4.target.assignedElements().length > 0;
  }
  render() {
    const sheet = this.variant === "sheet" ? "sheet" : "";
    if (this.variant === "confirm") {
      return b2`<div class="scrim" @click=${this.close}></div>
        <div class="alert ${sheet}" role="alertdialog" aria-modal="true" aria-label=${this.text} tabindex="-1">
          <div class="m">${this.text}${this.subText ? b2`<small>${this.subText}</small>` : A}</div>
          <div class="b"><button class="cancel" @click=${this.close}>${this.cancelLabel}</button><button class="ok ${this.danger ? "danger" : ""}" @click=${this.confirm}>${this.okLabel}</button></div>
        </div>`;
    }
    return b2`<div class="scrim" @click=${this.close}></div>
      <div class="dlg ${this.wide ? "wide" : ""} ${sheet}" role="dialog" aria-modal="true" aria-labelledby="h" tabindex="-1">
        <h2 id="h">${this.back ? b2`<button class="iconbtn backbtn" aria-label=${t3("common.back")} @click=${this.goBack}><ha-icon icon="mdi:chevron-left"></ha-icon></button>` : A}<span class="t">${this.heading}</span>${this.sub ? b2`<span class="m">${this.sub}</span>` : A}<button class="iconbtn close" aria-label=${t3("common.close")} @click=${this.close}><ha-icon icon="mdi:close"></ha-icon></button></h2>
        <div class="body"><slot></slot></div>
        <div class="foot ${this._hasFoot ? "" : "empty"}"><slot name="foot" @slotchange=${this.onFootSlot}></slot></div>
      </div>`;
  }
};
if (!customElements.get(DIALOG_ELEMENT)) customElements.define(DIALOG_ELEMENT, DxDialog);

// src/ha/map-config.ts
var MAP_MODES = {
  raeume: { label: t3("mapmode.raeume"), hint: t3("mapmode.raeume.hint") },
  zone: { label: t3("mapmode.zone"), hint: t3("mapmode.zone.hint") },
  punkt: { label: t3("mapmode.punkt"), hint: t3("mapmode.punkt.hint") },
  goto: { label: t3("mapmode.goto"), hint: t3("mapmode.goto.hint") }
};
function modeEntry(mode, rooms) {
  switch (mode) {
    case "raeume":
      return {
        template: "vacuum_clean_segment",
        name: MAP_MODES.raeume.label,
        icon: "mdi:floor-plan",
        predefined_selections: rooms.map((r4) => ({ id: r4.id, outline: r4.outline, label: { text: r4.name, x: r4.x, y: r4.y, offset_y: 35 }, icon: { name: r4.icon, x: r4.x, y: r4.y } }))
      };
    case "zone":
      return { template: "vacuum_clean_zone", name: MAP_MODES.zone.label, icon: "mdi:select-drag", max_selections: 5 };
    case "punkt":
      return { template: "vacuum_clean_point", name: MAP_MODES.punkt.label, icon: "mdi:map-marker-radius" };
    case "goto":
      return { template: "vacuum_goto", name: MAP_MODES.goto.label, icon: "mdi:map-marker" };
  }
}
var hasModes = (kind) => kind === "Xiaomi-Karte";
var isHeidiKarte = (kind) => kind === "Heidi-Karte";
function buildMapConfig(kind, dark, mode, rooms) {
  if (kind === "Dreame-App") return { type: "custom:dreame-vacuum-map-card", entity: ENTITIES.vac, title: deviceName(), theme: dark ? "dark" : "light", language: "de", default_mode: "room" };
  if (kind === "Xiaomi-Karte") {
    return {
      type: "custom:xiaomi-vacuum-map-card",
      entity: ENTITIES.vac,
      vacuum_platform: "Tasshack/dreame-vacuum",
      language: "de",
      map_source: { camera: ENTITIES.map },
      calibration_source: { camera: true },
      map_locked: true,
      two_finger_pan: true,
      title: "",
      tiles: [],
      icons: [],
      map_modes: [modeEntry(mode, rooms)]
    };
  }
  return pictureConfig();
}
function pictureConfig() {
  return { type: "picture-entity", entity: ENTITIES.map, camera_image: ENTITIES.map, show_name: false, show_state: false };
}

// src/domain/calibration.ts
var det3 = (m2) => m2[0][0] * (m2[1][1] * m2[2][2] - m2[1][2] * m2[2][1]) - m2[0][1] * (m2[1][0] * m2[2][2] - m2[1][2] * m2[2][0]) + m2[0][2] * (m2[1][0] * m2[2][1] - m2[1][1] * m2[2][0]);
function calibration(points) {
  if (!points || points.length < 3) return null;
  const [p0, p1, p22] = points;
  const A2 = [[p0.map.x, p0.map.y, 1], [p1.map.x, p1.map.y, 1], [p22.map.x, p22.map.y, 1]];
  const d3 = det3(A2);
  if (!d3) return null;
  const solve = (b3) => [0, 1, 2].map((i5) => det3(A2.map((row, r4) => row.map((v2, c4) => c4 === i5 ? b3[r4] : v2))) / d3);
  const vx = solve([p0.vacuum.x, p1.vacuum.x, p22.vacuum.x]);
  const vy = solve([p0.vacuum.y, p1.vacuum.y, p22.vacuum.y]);
  const toVac = (mx, my) => [vx[0] * mx + vx[1] * my + vx[2], vy[0] * mx + vy[1] * my + vy[2]];
  const dd = vx[0] * vy[1] - vx[1] * vy[0];
  const toMap = (x2, y3) => {
    const rx = x2 - vx[2], ry = y3 - vy[2];
    return [(rx * vy[1] - ry * vx[1]) / dd, (ry * vx[0] - rx * vy[0]) / dd];
  };
  return { toVac, toMap };
}

// src/domain/mapdata.ts
function parseValetudo(text) {
  const j = JSON.parse(text);
  if (!j || !j.size || !j.pixelSize || !Array.isArray(j.layers)) throw new Error("kein Valetudo-Kartenpaket");
  const md = { size: { x: j.size.x, y: j.size.y }, pixelSize: j.pixelSize, rotation: j.metaData?.rotation ?? 0, segments: [], robot: null, charger: null, paths: [], partial: false };
  for (const l3 of j.layers) {
    if (l3.type !== "segment") continue;
    const id = parseInt(String(l3.metaData?.segmentId ?? ""), 10);
    if (isNaN(id)) continue;
    const runs = [];
    if (l3.compressedPixels?.length) for (let i5 = 0; i5 + 2 < l3.compressedPixels.length; i5 += 3) runs.push([l3.compressedPixels[i5], l3.compressedPixels[i5 + 1], l3.compressedPixels[i5 + 2]]);
    else if (l3.pixels?.length) for (let i5 = 0; i5 + 1 < l3.pixels.length; i5 += 2) runs.push([l3.pixels[i5], l3.pixels[i5 + 1], 1]);
    const count = runs.reduce((n4, r4) => n4 + r4[2], 0);
    const xs = runs.flatMap((r4) => [r4[0], r4[0] + r4[2] - 1]), ys = runs.map((r4) => r4[1]);
    const bbox = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    const d3 = l3.dimensions;
    md.segments.push({ id, name: String(l3.metaData?.name ?? `Raum ${id}`), runs, pixelCount: d3?.pixelCount ?? count, mid: { x: d3?.x.mid ?? (bbox.x0 + bbox.x1) / 2, y: d3?.y.mid ?? (bbox.y0 + bbox.y1) / 2 }, centroid: anchorOf(runs, bbox), bbox, active: l3.metaData?.active === true });
  }
  md.partial = md.segments.some((s4) => s4.active);
  const cm = (v2) => v2;
  for (const e4 of j.entities ?? []) {
    if (e4.type === "robot_position" && e4.points.length >= 2) md.robot = { ...cmToVac(md, cm(e4.points[0]), cm(e4.points[1])), angle: e4.metaData?.angle };
    else if (e4.type === "charger_location" && e4.points.length >= 2) md.charger = { ...cmToVac(md, cm(e4.points[0]), cm(e4.points[1])), angle: e4.metaData?.angle };
    else if (e4.type === "path") {
      const pts = [];
      for (let i5 = 0; i5 + 1 < e4.points.length; i5 += 2) {
        const v2 = cmToVac(md, e4.points[i5], e4.points[i5 + 1]);
        pts.push([v2.x, v2.y]);
      }
      md.paths.push(pts);
    }
  }
  return md;
}
function cmToVac(md, cx, cy) {
  return { x: (cx - md.size.x / 2) * 10, y: (md.size.y / 2 - cy) * 10 };
}
function pxToVac(md, px, py) {
  return cmToVac(md, (px + 0.5) * md.pixelSize, (py + 0.5) * md.pixelSize);
}
function mergeSegments(md, known2) {
  if (!md.partial || !known2?.length) return md;
  const own = new Map(md.segments.map((s4) => [s4.id, s4]));
  const segments = known2.map((k2) => own.get(k2.id) ?? k2);
  for (const s4 of md.segments) if (!known2.some((k2) => k2.id === s4.id)) segments.push(s4);
  return { ...md, segments };
}
function anchorOf(runs, bbox) {
  const count = runs.reduce((n4, r5) => n4 + r5[2], 0);
  if (!count) return { x: (bbox.x0 + bbox.x1) / 2, y: (bbox.y0 + bbox.y1) / 2 };
  const cx = runs.reduce((a3, r5) => a3 + r5[2] * (r5[0] + (r5[2] - 1) / 2), 0) / count, cy = runs.reduce((a3, r5) => a3 + r5[2] * r5[1], 0) / count;
  const rx = Math.round(cx), ry = Math.round(cy);
  if (runs.some((r5) => r5[1] === ry && rx >= r5[0] && rx < r5[0] + r5[2])) return { x: cx, y: cy };
  let best = null, bestD = Infinity;
  for (const r5 of runs) {
    const dy = Math.abs(r5[1] - cy), covers = rx >= r5[0] && rx < r5[0] + r5[2];
    const d3 = dy * 1e3 + (covers ? 0 : 500 - Math.min(r5[2], 499));
    if (d3 < bestD) {
      bestD = d3;
      best = r5;
    }
  }
  const r4 = best;
  return { x: r4[0] + (r4[2] - 1) / 2, y: r4[1] };
}
function segmentOutline(md, seg, toTarget) {
  const K = 1 << 16;
  const inSeg = /* @__PURE__ */ new Set();
  for (const [x2, y3, n4] of seg.runs) for (let i5 = 0; i5 < n4; i5++) inSeg.add(x2 + i5 + y3 * K);
  const has = (x2, y3) => inSeg.has(x2 + y3 * K);
  const edges = /* @__PURE__ */ new Map();
  const add = (fx, fy, tx2, ty) => {
    const k2 = fx + fy * K;
    const l3 = edges.get(k2);
    if (l3) l3.push(tx2 + ty * K);
    else edges.set(k2, [tx2 + ty * K]);
  };
  for (const [x0, y3, n4] of seg.runs) for (let x2 = x0; x2 < x0 + n4; x2++) {
    if (!has(x2, y3 - 1)) add(x2, y3, x2 + 1, y3);
    if (!has(x2 + 1, y3)) add(x2 + 1, y3, x2 + 1, y3 + 1);
    if (!has(x2, y3 + 1)) add(x2 + 1, y3 + 1, x2, y3 + 1);
    if (!has(x2 - 1, y3)) add(x2, y3 + 1, x2, y3);
  }
  const ps = md.pixelSize;
  const pt = (k2) => {
    const v2 = cmToVac(md, k2 % K * ps, Math.floor(k2 / K) * ps);
    return toTarget(v2.x, v2.y);
  };
  const parts = [];
  while (edges.size) {
    const start = edges.keys().next().value;
    const loop = [start];
    let cur = start;
    for (let guard = 0; guard < 2e5; guard++) {
      const outs = edges.get(cur);
      if (!outs || !outs.length) break;
      const next = outs.shift();
      if (!outs.length) edges.delete(cur);
      if (next === start) break;
      loop.push(next);
      cur = next;
    }
    if (loop.length < 3) continue;
    const keep = [];
    for (let i5 = 0; i5 < loop.length; i5++) {
      const a3 = loop[(i5 + loop.length - 1) % loop.length], b3 = loop[i5], c4 = loop[(i5 + 1) % loop.length];
      const ax = a3 % K, ay = Math.floor(a3 / K), bx = b3 % K, by = Math.floor(b3 / K), cx = c4 % K, cy = Math.floor(c4 / K);
      if ((bx - ax) * (cy - by) - (by - ay) * (cx - bx) !== 0) keep.push(b3);
    }
    parts.push("M" + keep.map((k2) => {
      const [u3, v2] = pt(k2);
      return `${u3.toFixed(1)} ${v2.toFixed(1)}`;
    }).join("L") + "Z");
  }
  return parts.join("");
}

// src/domain/png-text.ts
var SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
async function inflate(data) {
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  void writer.write(data);
  void writer.close();
  const out = new Uint8Array(await new Response(ds.readable).arrayBuffer());
  return out;
}
async function pngText(buf, key) {
  const b3 = new Uint8Array(buf);
  if (b3.length < 8 || SIGNATURE.some((v2, i5) => b3[i5] !== v2)) return null;
  const view = new DataView(buf);
  const dec = new TextDecoder("latin1");
  let p3 = 8;
  while (p3 + 8 <= b3.length) {
    const len = view.getUint32(p3);
    const type = dec.decode(b3.subarray(p3 + 4, p3 + 8));
    const data = b3.subarray(p3 + 8, p3 + 8 + len);
    if (type === "tEXt" || type === "zTXt" || type === "iTXt") {
      const nul = data.indexOf(0);
      if (nul > 0 && dec.decode(data.subarray(0, nul)) === key) {
        if (type === "tEXt") return dec.decode(data.subarray(nul + 1));
        if (type === "zTXt") return new TextDecoder("utf-8").decode(await inflate(data.subarray(nul + 2)));
        const compressed = data[nul + 1] === 1;
        let q = data.indexOf(0, nul + 3) + 1;
        q = data.indexOf(0, q) + 1;
        const body = data.subarray(q);
        return new TextDecoder("utf-8").decode(compressed ? await inflate(body) : body);
      }
    }
    if (type === "IEND") break;
    p3 += 12 + len;
  }
  return null;
}

// src/ha/mapdata-loader.ts
var cache2 = /* @__PURE__ */ new Map();
var known = /* @__PURE__ */ new Map();
var STORAGE_PREFIX = "dreame_x60.mapdata.";
function loadKnown(mapKey) {
  const m2 = known.get(mapKey);
  if (m2) return m2;
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_PREFIX + mapKey);
    if (!raw) return null;
    const segs = JSON.parse(raw);
    if (!Array.isArray(segs) || !segs.length) return null;
    known.set(mapKey, segs);
    return segs;
  } catch {
    return null;
  }
}
function storeKnown(mapKey, segs) {
  known.set(mapKey, segs);
  try {
    globalThis.localStorage?.setItem(STORAGE_PREFIX + mapKey, JSON.stringify(segs));
  } catch {
  }
}
function loadMapData(pictureUrl, version, mapKey = "0") {
  const key = `${version}|${pictureUrl.split("?")[0]}`;
  let p3 = cache2.get(key);
  if (!p3) {
    p3 = fetch(pictureUrl, { cache: "no-store" }).then(async (r4) => {
      if (!r4.ok) throw new Error(`HTTP ${r4.status}`);
      const text = await pngText(await r4.arrayBuffer(), "ValetudoMap");
      if (!text) return null;
      const md = parseValetudo(text);
      if (!md.partial) {
        if (md.segments.length) storeKnown(mapKey, md.segments);
        return md;
      }
      return mergeSegments(md, loadKnown(mapKey));
    }).catch((e4) => {
      console.warn("dreame_x60: Kartenpaket nicht ladbar", e4);
      cache2.delete(key);
      return null;
    });
    cache2.set(key, p3);
    if (cache2.size > 4) {
      const first = cache2.keys().next().value;
      if (first !== void 0 && first !== key) cache2.delete(first);
    }
  }
  return p3;
}

// src/components/dx-heidi-map.ts
var HEIDI_MAP_ELEMENT = "dx-heidi-map";
var ROOM_TAP_EVENT = "dx-room-tap";
var DxHeidiMap = class extends i4 {
  constructor() {
    super();
    this._loadedVersion = "";
    this._pathCache = null;
    this.selected = /* @__PURE__ */ new Set();
    this._md = null;
    this._size = null;
  }
  static {
    this.styles = i`
    :host { display: block; }
    .wrap { position: relative; width: 100%; line-height: 0; }
    img { display: block; width: 100%; height: auto; }
    svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .room { fill: transparent; stroke: transparent; stroke-width: 2.5; stroke-linejoin: round; fill-rule: evenodd; cursor: pointer; transition: fill var(--dx-dur), stroke var(--dx-dur); }
    .room:hover { fill: rgba(255, 255, 255, 0.1); }
    .room.sel { fill: rgba(255, 255, 255, 0.24); stroke: var(--dx-accent); }
    .room.cur { stroke: var(--dx-positive); }
    .room.cur.sel { stroke: var(--dx-accent); }
    /* Nummern-Chip als HTML über dem Bild: feste Bildschirmgröße unabhängig vom Kartenmaßstab, leicht nach rechts oben
       versetzt, damit er nicht auf der Raumbeschriftung des Kartenbilds sitzt */
    .badge { position: absolute; width: 24px; height: 24px; margin: -12px 0 0 -12px; transform: translate(18px, -18px); border-radius: 50%; background: var(--dx-accent); color: var(--dx-on-accent); font: 700 13px/24px var(--dx-font); text-align: center; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45), 0 0 0 2px rgba(255, 255, 255, 0.85); pointer-events: none; }
    .hint { position: absolute; left: 10px; top: 10px; font: 12px var(--dx-font); color: var(--dx-text-muted); background: rgba(12, 18, 30, 0.72); padding: 4px 8px; border-radius: 6px; line-height: 1.3; }
  `;
  }
  static {
    this.properties = { map: { attribute: false }, robot: { attribute: false }, selected: { attribute: false }, _md: { state: true }, _size: { state: true } };
  }
  willUpdate(changed) {
    if (changed.has("map")) {
      const src = this.map?.mapData;
      if (src && src.version !== this._loadedVersion) {
        this._loadedVersion = src.version;
        void loadMapData(src.picture, src.version, src.mapKey).then((md) => {
          if (this._loadedVersion === src.version) this._md = md;
        });
      }
    }
  }
  onImgLoad(e4) {
    const img = e4.target;
    if (img.naturalWidth && img.naturalHeight) this._size = { w: img.naturalWidth, h: img.naturalHeight };
  }
  /** Raum-Umrisse in Bildpixeln; neu nur bei neuem Kartenpaket oder neuer Kalibrierung. */
  paths(md, calib) {
    const key = `${this._loadedVersion}|${JSON.stringify(this.map?.calibrationPoints ?? null)}`;
    if (this._pathCache?.key === key) return this._pathCache.paths;
    const order = this.map?.roomOrder ?? [];
    const paths = [];
    for (const r4 of order) {
      const seg = md.segments.find((s4) => s4.id === r4.id);
      if (!seg) continue;
      const c4 = pxToVac(md, seg.centroid.x, seg.centroid.y);
      const [cx, cy] = calib.toMap(c4.x, c4.y);
      paths.push({ id: r4.id, name: seg.name, short: r4.short, d: segmentOutline(md, seg, (x2, y3) => calib.toMap(x2, y3)), cx, cy });
    }
    this._pathCache = { key, paths };
    return paths;
  }
  tap(id) {
    emit(this, ROOM_TAP_EVENT, { id });
  }
  render() {
    const m2 = this.map;
    const calib = calibration(m2?.calibrationPoints ?? null);
    const md = this._md, size = this._size;
    const cur = this.robot && (this.robot.vac === "cleaning" || this.robot.vac === "paused") ? this.robot.currentSegment : null;
    const ready = !!(md && size && calib);
    const order = [...this.selected];
    const paths = ready ? this.paths(md, calib) : [];
    return b2`
      <div class="wrap">
        <img src=${m2?.entityPicture ?? ""} alt=${t3("map.alt")} @load=${this.onImgLoad}>
        ${ready ? w`<svg viewBox="0 0 ${size.w} ${size.h}" preserveAspectRatio="none">
          ${paths.map((p3) => w`<path class="room ${this.selected.has(p3.id) ? "sel" : ""} ${cur === p3.id ? "cur" : ""}" data-room=${p3.id} d=${p3.d} @click=${() => this.tap(p3.id)}><title>${p3.name}</title></path>`)}
        </svg>` : A}
        ${paths.filter((p3) => this.selected.has(p3.id)).map((p3) => b2`<span class="badge" data-room=${p3.id} style="left:${(p3.cx / size.w * 100).toFixed(2)}%;top:${(p3.cy / size.h * 100).toFixed(2)}%">${order.indexOf(p3.id) + 1}</span>`)}
        ${!m2?.mapData ? b2`<div class="hint">${t3("map.noMapData", { entity: ENTITIES.mapData })}</div>` : !md && this._loadedVersion ? b2`<div class="hint">${t3("map.loading")}</div>` : A}
        ${m2?.mapData && !calib ? b2`<div class="hint">${t3("map.noCalib")}</div>` : A}
      </div>`;
  }
};
if (!customElements.get(HEIDI_MAP_ELEMENT)) customElements.define(HEIDI_MAP_ELEMENT, DxHeidiMap);

// src/shared/caches.ts
var mapElements = /* @__PURE__ */ new Map();

// src/shared/rooms.ts
function toggleRoom(sel, id) {
  const next = new Set(sel);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
function toggleAll(sel, order) {
  return sel.size === order.length ? /* @__PURE__ */ new Set() : new Set(order.map((r4) => r4.id));
}
function selectedRooms(sel, order) {
  const out = [];
  for (const id of sel) {
    const r4 = order.find((x2) => x2.id === id);
    if (r4) out.push(r4);
  }
  return out;
}
function selectionLabel(sel, order) {
  const n4 = sel.size;
  if (n4 && n4 === order.length) return t3("rooms.whole");
  return n4 === 1 ? t3("rooms.one", { n: n4 }) : t3("rooms.many", { n: n4 });
}
function confirmText(sel, order) {
  return t3("rooms.confirm", { list: selectedRooms(sel, order).map((r4) => r4.short).join(", ") });
}
function segmentsOf(sel, order) {
  return selectedRooms(sel, order).map((r4) => r4.id);
}

// src/components/dx-map-card.ts
var MAP_ELEMENT = "dx-map-card";
var DxMapCard = class extends i4 {
  constructor() {
    super();
    this._pending = null;
    this.variant = "full";
    this.dark = true;
    this._mode = "raeume";
    this._sel = /* @__PURE__ */ new Set();
    this._error = null;
  }
  static {
    this.styles = [controls, i`
    :host { display: flex; flex-direction: column; gap: var(--dx-space-3); min-width: 0; }
    .tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--dx-border); overflow-x: auto; }
    .tabs button { height: 40px; padding: 0 12px; color: var(--dx-text-muted); font-weight: 500; font-size: 13px; border-bottom: 2px solid transparent; margin-bottom: -1px; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
    .tabs button.on { color: var(--dx-text); border-bottom-color: var(--dx-accent); }
    .tabs button ha-icon { --mdc-icon-size: 16px; width: 16px; height: 16px; }
    .seg2 { display: inline-flex; background: var(--dx-bg); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); padding: 3px; gap: 2px; max-width: 100%; flex-wrap: wrap; }
    .seg2 button { height: 34px; padding: 0 12px; border-radius: 7px; font-size: 13px; font-weight: 500; color: var(--dx-text-muted); white-space: nowrap; }
    .seg2 button.on { background: var(--dx-surface-active); color: var(--dx-text); box-shadow: inset 0 0 0 1px rgba(88, 183, 246, 0.5); }
    .hd .seg2 { margin-left: auto; }
    .map { position: relative; background: var(--dx-bg); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); overflow: hidden; flex: 1;
      background-image: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px); background-size: 24px 24px; }
    .map.tap { cursor: pointer; }
    .slot { min-height: 220px; display: block;
      /* Heidi-Glas: die eingebettete Karte liest diese Variablen durch ihr Shadow DOM (dreame_x60/mockups/karte.html) */
      --ha-card-background: transparent; --card-background-color: transparent; --ha-card-border-width: 0; --ha-card-border-radius: 0; --ha-card-box-shadow: none;
      --primary-text-color: var(--dx-text); --secondary-text-color: var(--dx-text-muted); --primary-color: var(--dx-accent); --slider-color: var(--dx-accent);
      --map-card-primary-color: var(--dx-accent); --map-card-primary-text-color: var(--dx-on-accent); --map-card-big-radius: 16px; --map-card-small-radius: 10px; --map-card-disabled-text-color: var(--dx-text-muted);
      --map-card-room-label-color: var(--dx-text); --map-card-room-label-color-selected: var(--dx-on-accent); --map-card-room-label-font-size: 12px;
      --map-card-room-icon-color: var(--dx-text); --map-card-room-icon-color-selected: var(--dx-on-accent);
      --map-card-room-icon-background-color: rgba(12, 18, 30, 0.55); --map-card-room-icon-background-color-selected: var(--dx-accent); --map-card-room-icon-size: 18px; --map-card-room-icon-wrapper-size: 30px;
      --map-card-room-outline-fill-color: transparent; --map-card-room-outline-fill-color-selected: color-mix(in srgb, var(--dx-accent) 35%, transparent); --map-card-room-outline-line-color: rgba(255, 255, 255, 0.28); --map-card-room-outline-line-color-selected: var(--dx-accent); --map-card-room-outline-line-width: 1;
      --map-card-predefined-rectangle-fill-color: transparent; --map-card-predefined-rectangle-fill-color-selected: color-mix(in srgb, var(--dx-accent) 35%, transparent);
      --map-card-predefined-rectangle-line-color: transparent; --map-card-predefined-rectangle-line-color-selected: var(--dx-accent);
      --map-card-predefined-rectangle-label-color: var(--dx-text); --map-card-predefined-rectangle-label-color-selected: var(--dx-on-accent); --map-card-predefined-rectangle-label-font-size: 12px;
      --map-card-predefined-rectangle-icon-color: var(--dx-text); --map-card-predefined-rectangle-icon-color-selected: var(--dx-on-accent);
      --map-card-predefined-rectangle-icon-background-color: rgba(12, 18, 30, 0.55); --map-card-predefined-rectangle-icon-background-color-selected: var(--dx-accent); --map-card-predefined-rectangle-icon-size: 18px; --map-card-predefined-rectangle-icon-wrapper-size: 30px;
      --map-card-manual-rectangle-fill-color: color-mix(in srgb, var(--dx-danger) 28%, transparent); --map-card-manual-rectangle-line-color: var(--dx-danger); --map-card-manual-rectangle-fill-color-selected: color-mix(in srgb, var(--dx-danger) 40%, transparent); --map-card-manual-rectangle-line-color-selected: var(--dx-danger);
      --map-card-ripple-color: var(--dx-accent); --mdc-icon-size: 18px; }
    .catch { position: absolute; inset: 0; }
    .mtools { position: absolute; left: 10px; bottom: 10px; display: flex; gap: 6px; }
    .mtools .btn { box-shadow: var(--dx-shadow-float); background: var(--dx-surface-raised); }
    .mapcap { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--dx-text-muted); flex-wrap: wrap; }
    .mapcap b { color: var(--dx-text); font-weight: 600; }
    .mapcap .r { margin-left: auto; }
    .mapmodes { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .mapmodes .hint { flex: 1; }
    /* Raumkacheln: so viele, wie die Karte liefert – Spalten nach Platz (2 … 20 Räume), nie horizontal scrollen */
    .rooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
    .rooms button { display: grid; justify-items: center; gap: 6px; padding: 12px 6px 10px; min-height: 72px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-size: 12px; font-weight: 500; color: var(--dx-text-muted); transition: background var(--dx-dur), border-color var(--dx-dur), color var(--dx-dur); }
    .rooms button ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
    .rooms button:hover { background: var(--dx-surface-active); color: var(--dx-text); }
    .rooms button.sel { border-color: var(--dx-accent); background: var(--dx-accent-soft); color: var(--dx-text); box-shadow: inset 0 0 0 1px rgba(88, 183, 246, 0.35); }
    .rooms button.sel ha-icon { color: var(--dx-accent); }
    .runbar { display: flex; gap: 8px; align-items: center; }
    .runbar .btn.primary { flex: 1; }
    .err { color: var(--dx-danger); font-size: 12px; }
  `];
  }
  static {
    this.properties = {
      hass: { attribute: false },
      map: { attribute: false },
      robot: { attribute: false },
      history: { attribute: false },
      api: { attribute: false },
      variant: { type: String },
      dark: { type: Boolean },
      _mode: { state: true },
      _sel: { state: true },
      _error: { state: true }
    };
  }
  get mode() {
    return this._mode;
  }
  get selection() {
    return this._sel;
  }
  /** Schlüssel des Modul-Caches: die Übersicht zeigt immer das Kamerabild, die Seite Reinigen je Darstellung und Modus. */
  cacheKey() {
    if (this.variant === "compact") return "compact";
    const kind = this.map?.karte ?? "";
    return hasModes(kind) ? `${kind}|${this._mode}` : `${kind}|${this.dark}`;
  }
  updated() {
    void this.mountMap();
  }
  /** Karten-Element aus dem Cache in den Slot setzen (oder einmal erzeugen); `hass` bei jedem Tick durchreichen. */
  async mountMap() {
    const slot = this.renderRoot.querySelector(".slot");
    if (!slot || !this.map) return;
    const key = this.cacheKey();
    let el = mapElements.get(key);
    if (!el) {
      if (this._pending === key) return;
      this._pending = key;
      try {
        if (!window.loadCardHelpers) throw new Error(t3("map.helpersMissing"));
        const helpers = await window.loadCardHelpers();
        const cfg = this.variant === "compact" ? pictureConfig() : buildMapConfig(this.map.karte, this.dark, this._mode, this.map.roomShapes);
        el = helpers.createCardElement(cfg);
        mapElements.set(key, el);
        this._error = null;
      } catch (e4) {
        this._error = t3("map.loadError", { error: String(e4?.message ?? e4) });
        return;
      } finally {
        this._pending = null;
      }
      if (this.cacheKey() !== key) {
        void this.mountMap();
        return;
      }
    }
    if (this.hass) el.hass = this.hass;
    if (slot.firstChild !== el) slot.replaceChildren(el);
  }
  // ───────── Aktionen ─────────
  setMode(mode) {
    this._mode = mode;
  }
  openZones() {
    emit(this, EVENTS.openOverlay, { kind: "zones", type: "zones" });
  }
  goReinigen() {
    emit(this, EVENTS.navigate, { page: "reinigen" });
  }
  runRooms() {
    const order = this.map?.roomOrder ?? [];
    const segments = segmentsOf(this._sel, order);
    if (!segments.length) return;
    askConfirm(this, confirmText(this._sel, order), () => {
      void this.api?.startRooms(segments).then(() => emit(this, EVENTS.toast, t3("rooms.started", { what: selectionLabel(this._sel, order) })), (e4) => emit(this, EVENTS.toast, t3("rooms.failed", { error: String(e4?.message ?? e4) })));
      this._sel = /* @__PURE__ */ new Set();
    });
  }
  runAll() {
    askConfirm(this, t3("map.allConfirm"), () => {
      void this.api?.vacuum("start");
      emit(this, EVENTS.toast, t3("rooms.started", { what: t3("map.allStarted") }));
    });
  }
  // ───────── Rendern ─────────
  /** Bildunterschrift (compact): im Lauf Raum, Fläche und Rest; sonst Station und letzter Lauf. */
  caption() {
    const r4 = this.robot;
    if (r4 && (r4.vac === "cleaning" || r4.vac === "paused") && !r4.docked) {
      const rest = runOrder(r4).rest.map((id) => roomById(this.map?.roomOrder ?? [], id)?.short).filter(Boolean).join(", ");
      return b2`<b>${t3("map.live")}</b> · ${r4.room !== t3("common.dash") ? r4.room : t3("map.capAway")} · ${r4.cleanedArea} ${t3("unit.m2")}${rest ? b2` · ${t3("map.capRest", { rest })}` : A}`;
    }
    const last = this.history?.entries[0];
    return b2`<b>${t3("map.title")}</b> · ${t3("map.capStation", { name: deviceName() || t3("common.robot") })}${last ? b2` · ${t3("map.capLast", { time: fmtDate(last.ts * 1e3) })}` : A}`;
  }
  renderCompact() {
    return b2`
      <div class="tabs">
        <button class="on"><ha-icon icon="mdi:map-outline"></ha-icon>${t3("map.live")}</button>
        <button data-nav="reinigen" @click=${this.goReinigen}><ha-icon icon="mdi:view-grid-outline"></ha-icon>${t3("map.rooms")}</button>
        <button data-open="zones" @click=${this.openZones}><ha-icon icon="mdi:cancel"></ha-icon>${t3("map.zones")}</button>
        <button data-nav="protokoll" @click=${() => emit(this, EVENTS.navigate, { page: "protokoll" })}><ha-icon icon="mdi:history"></ha-icon>${t3("map.history")}</button>
      </div>
      <div class="map tap" title=${t3("map.toMap")}>
        <div class="slot"></div>
        <div class="catch" @click=${this.goReinigen}></div>
        <div class="mtools"><button class="btn sm" @click=${this.goReinigen}><ha-icon icon="mdi:map-outline"></ha-icon>${t3("map.open")}</button></div>
      </div>
      ${this._error ? b2`<div class="err">${this._error}</div>` : A}
      <div class="mapcap">${this.caption()}<span class="r">${t3("map.tapHint")}</span></div>`;
  }
  renderFull() {
    const m2 = this.map;
    const kind = m2?.karte ?? "";
    const modes = hasModes(kind);
    const heidi = isHeidiKarte(kind);
    const order = m2?.roomOrder ?? [];
    const sel = this._sel;
    const sm = m2?.selectedMap ?? null;
    return b2`
      <div class="hd"><h2><ha-icon icon="mdi:map-outline"></ha-icon>${t3("map.title")}</h2>
        ${sm ? b2`<span class="seg2 maps">${sm.options.map((o5) => b2`<button class=${o5 === sm.value ? "on" : ""} data-map=${o5} @click=${() => void this.api?.selectOption(sm.id, o5)}>${o5}</button>`)}</span>` : b2`<span class="r">${kind}</span>`}
      </div>
      <div class="map">
        ${heidi ? b2`<dx-heidi-map .map=${m2} .robot=${this.robot} .selected=${sel} @dx-room-tap=${(e4) => {
      this._sel = toggleRoom(this._sel, e4.detail.id);
    }}></dx-heidi-map>` : b2`<div class="slot"></div>`}
        ${modes ? b2`<div class="mtools">
          <button class="btn sm ${this._mode === "goto" ? "on" : ""}" data-act="goto" @click=${() => this.setMode(this._mode === "goto" ? "raeume" : "goto")}><ha-icon icon="mdi:map-marker"></ha-icon>${t3("map.goto")}</button>
          <button class="btn sm" data-open="zones" @click=${this.openZones}><ha-icon icon="mdi:cancel"></ha-icon>${t3("map.zones")}</button>
        </div>` : A}
      </div>
      ${this._error ? b2`<div class="err">${this._error}</div>` : A}
      <div class="mapmodes">
        ${modes ? b2`<div class="seg2 modes">${["raeume", "zone", "punkt"].map((k2) => b2`<button data-mode=${k2} class=${this._mode === k2 ? "on" : ""} @click=${() => this.setMode(k2)}>${MAP_MODES[k2].label}</button>`)}</div>` : b2`<button class="btn sm" data-open="zones" @click=${this.openZones}><ha-icon icon="mdi:cancel"></ha-icon>${t3("map.zones")}</button>`}
        <span class="hint">${modes ? MAP_MODES[this._mode].hint : heidi ? t3("map.hintHeidi") : t3("map.hintPlain")}</span>
        <button class="btn primary sm" data-act="all" @click=${this.runAll}><ha-icon icon="mdi:play"></ha-icon>${t3("map.all")}</button>
      </div>
      ${!modes || this._mode === "raeume" ? b2`
        <div class="rooms">${order.map((r4) => b2`<button class=${sel.has(r4.id) ? "sel" : ""} data-room=${r4.id} @click=${() => {
      this._sel = toggleRoom(this._sel, r4.id);
    }}><ha-icon icon=${r4.icon}></ha-icon>${r4.short}</button>`)}</div>
        ${sel.size ? b2`<div class="runbar"><button class="btn primary" data-act="run" @click=${this.runRooms}><ha-icon icon="mdi:play"></ha-icon>${t3("rooms.run", { sel: selectionLabel(sel, order) })}</button><button class="btn icon" aria-label=${t3("rooms.clear")} @click=${() => {
      this._sel = /* @__PURE__ */ new Set();
    }}><ha-icon icon="mdi:close"></ha-icon></button></div>` : A}
      ` : A}`;
  }
  render() {
    return this.variant === "compact" ? this.renderCompact() : this.renderFull();
  }
};
if (!customElements.get(MAP_ELEMENT)) customElements.define(MAP_ELEMENT, DxMapCard);

// src/components/dx-quickstart.ts
var QUICKSTART_ELEMENT = "dx-quickstart";
var DxQuickstart = class extends i4 {
  static {
    this.styles = [controls, i`
    :host { display: flex; flex-direction: column; gap: var(--dx-space-3); min-width: 0; }
    /* „Alles“ + Räume des Roboters: Spalten nach Platz (2 … 20 Räume) */
    .qs { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
    .qs button { display: grid; justify-items: center; gap: 6px; padding: 12px 6px 10px; min-height: 72px; border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-size: 12px; font-weight: 500; color: var(--dx-text-muted); transition: background var(--dx-dur), border-color var(--dx-dur), color var(--dx-dur); }
    .qs button ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
    .qs button:hover { background: var(--dx-surface-active); color: var(--dx-text); }
    .qs button.sel { border-color: var(--dx-accent); background: var(--dx-accent-soft); color: var(--dx-text); box-shadow: inset 0 0 0 1px rgba(88, 183, 246, 0.35); }
    .qs button.sel ha-icon { color: var(--dx-accent); }
    .runbar { display: flex; gap: 8px; align-items: center; }
    .runbar .btn.primary { flex: 1; }
  `];
  }
  static {
    this.properties = { roomOrder: { attribute: false }, api: { attribute: false }, _sel: { state: true } };
  }
  constructor() {
    super();
    this.roomOrder = [];
    this._sel = /* @__PURE__ */ new Set();
  }
  get selection() {
    return this._sel;
  }
  run() {
    const segments = segmentsOf(this._sel, this.roomOrder);
    if (!segments.length) return;
    askConfirm(this, confirmText(this._sel, this.roomOrder), () => {
      void this.api?.startRooms(segments).then(() => emit(this, EVENTS.toast, t3("rooms.started", { what: selectionLabel(this._sel, this.roomOrder) })), (e4) => emit(this, EVENTS.toast, t3("rooms.failed", { error: String(e4?.message ?? e4) })));
      this._sel = /* @__PURE__ */ new Set();
    });
  }
  render() {
    const sel = this._sel, order = this.roomOrder;
    return b2`
      <div class="hd"><h2><ha-icon icon="mdi:view-grid-outline"></ha-icon>${t3("quickstart.title")}</h2><span class="r">${sel.size ? t3("quickstart.selected", { n: sel.size }) : t3("quickstart.multi")}</span></div>
      <div class="qs">
        <button class=${sel.size && sel.size === order.length ? "sel" : ""} data-room="all" @click=${() => {
      this._sel = toggleAll(this._sel, order);
    }}><ha-icon icon="mdi:home-outline"></ha-icon>${t3("quickstart.all")}</button>
        ${order.map((r4) => b2`<button class=${sel.has(r4.id) ? "sel" : ""} data-room=${r4.id} @click=${() => {
      this._sel = toggleRoom(this._sel, r4.id);
    }}><ha-icon icon=${r4.icon}></ha-icon>${r4.short}</button>`)}
      </div>
      ${sel.size ? b2`<div class="runbar"><button class="btn primary" @click=${this.run}><ha-icon icon="mdi:play"></ha-icon>${t3("rooms.run", { sel: selectionLabel(sel, order) })}</button><button class="btn icon" aria-label=${t3("rooms.clear")} title=${t3("rooms.clear")} @click=${() => {
      this._sel = /* @__PURE__ */ new Set();
    }}><ha-icon icon="mdi:close"></ha-icon></button></div>` : b2`<div class="hint">${t3("quickstart.hint", { name: deviceName() || t3("quickstart.robotFallback") })}</div>`}
    `;
  }
};
if (!customElements.get(QUICKSTART_ELEMENT)) customElements.define(QUICKSTART_ELEMENT, DxQuickstart);

// src/dreame-x60-panel.ts
var ELEMENT = "dreame-x60-panel";
var TOAST_MS = 1900;
var GREETING = (h3) => h3 < 11 ? t3("topbar.morning") : h3 < 18 ? t3("topbar.day") : t3("topbar.evening");
var UNSET = Symbol("unset");
var DreameX60Panel = class extends i4 {
  constructor() {
    super();
    this._setupVac = "";
    this._setupEntities = UNSET;
    /** Abo auf entity_registry_updated (Bereichszuordnung gespeichert → sofort neu laden), einmal je Verbindung */
    this._registryUnsub = null;
    this._registryConn = null;
    /** Schreibzugriffe – eine Instanz je Shell, liest hass zur Laufzeit. */
    this.api = new DxApi(() => this.hass);
    this._toastTimer = null;
    this._clockTimer = null;
    this._onKey = (e4) => {
      if (e4.key === "Escape" && this._overlay) this.closeOverlay();
    };
    this._config = { page: "start" };
    this._overlay = null;
    this._toast = null;
    this._now = Date.now();
    this._setupData = null;
    this.addEventListener(EVENTS.openOverlay, (e4) => this.openOverlay(e4.detail));
    this.addEventListener(EVENTS.close, () => this.closeOverlay());
    this.addEventListener(EVENTS.back, () => this.backOverlay());
    this.addEventListener(EVENTS.confirm, () => this.confirmOverlay());
    this.addEventListener(EVENTS.toast, (e4) => this.toast(String(e4.detail ?? "")));
    this.addEventListener(EVENTS.navigate, (e4) => navigate(toPage(e4.detail?.page)));
  }
  static {
    this.styles = [tokens, base, controls, shell];
  }
  static {
    this.properties = {
      hass: { attribute: false },
      _config: { state: true },
      _overlay: { state: true },
      _toast: { state: true },
      _now: { state: true },
      _setupData: { state: true }
    };
  }
  /** Geräteerkennung vor jedem Render: Roboter-IDs und Anzeigename folgen HA (PD-012). */
  willUpdate(changed) {
    if ((changed.has("hass") || changed.has("_config")) && this.hass) {
      discoverDevice(this.hass, this._config.robot);
      const vac = device()?.vac ?? "";
      if (vac && vac !== this._setupVac) {
        this._setupVac = vac;
        this.refreshSetup(false);
      }
      this.subscribeRegistry(this.hass);
      const ents = this.hass.entities;
      if (ents !== this._setupEntities) {
        const first = this._setupEntities === UNSET;
        this._setupEntities = ents;
        if (!first) this.refreshSetup(true);
      }
    }
  }
  /** entity_registry_updated abonnieren: Änderung am Roboter-Eintrag (z. B. Bereichszuordnung) → Einrichtungsprüfung sofort neu. */
  subscribeRegistry(hass) {
    const conn = hass.connection;
    if (!conn || conn === this._registryConn) return;
    this._registryConn = conn;
    this._registryUnsub?.();
    this._registryUnsub = null;
    void conn.subscribeEvents((ev) => {
      const id = ev?.data?.entity_id;
      if (!id || id === this._setupVac || id.startsWith("vacuum.")) this.refreshSetup(true);
    }, "entity_registry_updated").then((unsub) => {
      this._registryUnsub = unsub;
    }, () => void 0);
  }
  /** Bereichszuordnung/Reparaturen nachladen (Cache 5 min); Ergebnis nur setzen, wenn es sich geändert hat. */
  refreshSetup(force) {
    const hass = this.hass, vac = this._setupVac;
    if (!hass || !vac) return;
    void loadSetupData(hass, vac, force).then((d3) => {
      if (this._setupVac === vac && d3 !== this._setupData) this._setupData = d3;
    }, () => void 0);
  }
  /** Prüfungen aus Zuständen, Profil, Diagnose und nachgeladenen Daten (reine Funktion in domain/setup.ts). */
  setupChecks(s4, robot) {
    const dev = device();
    const diag = readDiagnostics(s4);
    const profile = readProfile(s4);
    return setupChecks({
      robot: dev ? { vac: dev.vac, name: dev.name } : null,
      rooms: profile.rooms,
      hasMapData: profile.has("mapData"),
      missingRobot: (diag.groups[0]?.missing ?? []).filter((id) => id !== ENTITIES.mapData),
      missingPackage: diag.groups[1]?.missing ?? [],
      // Datenkarte hat eine eigene Prüfung
      customizedCleaning: s4[ENTITIES.customizedCleaning]?.state ?? null,
      running: robot.running,
      ids: { customizedCleaning: ENTITIES.customizedCleaning, roomName: (id) => robotEntity("select", `room_${id}_name`) },
      mapping: this._setupData?.mapping ?? null,
      repairs: this._setupData?.repairs ?? null
    });
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
    this.tickClock();
  }
  disconnectedCallback() {
    window.removeEventListener("keydown", this._onKey);
    if (this._clockTimer) {
      clearTimeout(this._clockTimer);
      this._clockTimer = null;
    }
    this._registryUnsub?.();
    this._registryUnsub = null;
    this._registryConn = null;
    super.disconnectedCallback();
  }
  /** Nächster Tick zur vollen Minute (+50 ms), damit die Uhr nie eine Minute hinterherhinkt. */
  tickClock() {
    this._now = Date.now();
    this.refreshSetup(true);
    this._clockTimer = setTimeout(() => this.tickClock(), 6e4 - Date.now() % 6e4 + 50);
  }
  // ───────── HA-Schnittstelle der Karte ─────────
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error(t3("card.noConfig"));
    this._config = { ...config, page: toPage(config.page) };
  }
  getCardSize() {
    return 12;
  }
  static getStubConfig() {
    return { page: "start" };
  }
  get page() {
    return toPage(this._config.page);
  }
  // ───────── Overlay und Toast ─────────
  get overlay() {
    return this._overlay;
  }
  openOverlay(o5) {
    this._overlay = o5;
  }
  closeOverlay() {
    this._overlay = null;
  }
  /** Zurück zum vorherigen Overlay (Räume/Dauer → Eintrag), sonst schließen. */
  backOverlay() {
    this._overlay = this._overlay && "back" in this._overlay && this._overlay.back ? this._overlay.back : null;
  }
  confirmOverlay() {
    const o5 = this._overlay;
    if (o5?.kind === "confirm") {
      this._overlay = o5.back ?? null;
      o5.onOk();
    }
  }
  toast(msg) {
    this._toast = msg;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._toast = null;
      this._toastTimer = null;
    }, TOAST_MS);
  }
  // ───────── Rendern ─────────
  render() {
    const s4 = this.hass?.states ?? {};
    const settings = readSettings(s4);
    this.classList.toggle("light", !settings.dark);
    const page = this.page;
    const robot = readRobot(s4);
    return b2`
      <div class="root"><div class="app">
        <dx-nav .page=${page} .prognoseAktiv=${readPrognose(s4).aktiv} .version=${VERSION}></dx-nav>
        <main class="content page" data-page=${page}>
          ${this.renderTopbar(page, robot)}
          ${page === "start" ? this.renderStart(s4, robot) : page === "reinigen" ? this.renderReinigen(s4, robot) : this.renderPage(page, s4)}
        </main>
      </div></div>
      ${this.renderOverlay()}
      ${this._toast ? b2`<div class="toast" role="status">${this._toast}</div>` : A}
    `;
  }
  /** Kopfzeile: Übersicht mit Tagesgruß bzw. „Heidi ist unterwegs“, Unterseiten mit Zurück-Knopf; rechts Uhr, Zuhause, Nicht stören
   *  (stabile Klassen .mi.time/.home/.dnd – später antippbar: Kalender, Anwesenheit, Zeiten; docs/dreame_x60/UX-TRANSITIONS.md). */
  renderTopbar(page, robot) {
    const now = new Date(this._now);
    let title, sub;
    if (page === "start") {
      const name = (this.hass?.user?.name ?? "").trim();
      const robotName = deviceName() || t3("common.robot");
      title = robot.running && !robot.docked ? t3("topbar.away", { name: robotName }) : robot.running ? t3("topbar.inStation", { name: robotName }) : `${GREETING(now.getHours())}${name ? ", " + name : ""}!`;
      sub = robot.hero.sub ? `${robot.hero.big} \xB7 ${robot.hero.sub}` : robot.hero.big;
    } else {
      ({ title, sub } = PAGE_TITLE[page]);
      title ||= deviceName() || t3("common.robot");
    }
    const home = robot.persons.filter((p3) => p3.known && p3.home).map((p3) => p3.name);
    return b2`
      <div class="topbar">
        ${page !== "start" ? b2`<button class="back" @click=${() => navigate("start")}><ha-icon icon="mdi:chevron-left"></ha-icon>${t3("topbar.back")}</button>` : A}
        <div><h1>${title}</h1><div class="sub">${sub}</div></div>
        <div class="meta">
          ${this.renderSetupIcons(robot)}
          <div class="mi time"><ha-icon icon="mdi:clock-outline"></ha-icon><div><b>${now.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })}</b><small>${now.toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</small></div></div>
          <div class="mi home"><ha-icon icon="mdi:home-outline"></ha-icon><div><b>${home.length ? t3("topbar.home") : t3("topbar.nobody")}<span class="dot ${home.length ? "on" : ""}"></span></b><small>${home.length ? t3("topbar.present", { names: home.join(" \xB7 ") }) : t3("topbar.allAway")}</small></div></div>
          <div class="mi dnd"><ha-icon icon="mdi:weather-night"></ha-icon><div><b>${robot.hero.dnd}</b><small>${t3("topbar.dnd")}</small></div></div>
        </div>
      </div>`;
  }
  /** Einrichtungsprüfung (PD-014): zwischen Titel und Uhr nur die Symbole mit Befund (rot pulsiert, gelb = Hinweis); Klick springt direkt zur Stelle. */
  renderSetupIcons(robot) {
    const problems = setupProblems(this.setupChecks(this.hass?.states ?? {}, robot));
    if (!problems.length) return A;
    return b2`<div class="setupicons" role="status">${problems.map((p3) => b2`<button class="si ${p3.level}" data-check=${p3.key} title=${p3.text} aria-label=${p3.text} @click=${() => this.runSetupAction(p3.action)}><ha-icon icon=${p3.icon}></ha-icon></button>`)}</div>`;
  }
  runSetupAction(a3) {
    if (!a3) return;
    if (a3.kind === "more-info") moreInfo(this, a3.entity);
    else if (a3.kind === "vacuum-areas") {
      void openVacuumSegmentMapping(this, a3.entity).then((r4) => {
        if (r4 === "fallback") this.toast(t3("topbar.inDialog", { hint: a3.hint }));
      });
    } else if (a3.kind === "page") navigate(a3.page);
    else navigateHa(a3.path);
  }
  /** Bento-Übersicht (Bauplan 4.0): Bausteine, wo sie schon existieren (4.1 dx-hero, dx-auftrag), sonst Platzhalter mit einer Vorschau der Sichten. */
  renderStart(s4, robot) {
    const entities = Object.keys(s4).length;
    const dash = t3("common.dash");
    const plans = readPlans(s4);
    const prog = readPrognose(s4);
    const hist = readHistory(s4);
    const map = readMap(s4);
    const rooms = readAllRoomValues(s4);
    const lines = {
      map: [entities ? t3("preview.entities", { n: entities }) : t3("preview.noStates"), t3("preview.map", { karte: map.karte, calib: Array.isArray(map.calibrationPoints) ? t3("preview.calibPoints", { n: map.calibrationPoints.length }) : t3("common.missing") })],
      automatik: [t3("preview.automatik", { status: readAutomatik(s4).status || dash })],
      heute: [t3("preview.today", { name: (plans.heuteName || dash) + (plans.heuteZeit ? " \xB7 " + plans.heuteZeit : "") }), prog.aktiv ? t3("preview.prognose", { window: prog.freiesFenster, back: prog.rueckkehr }) : t3("preview.prognoseOff")],
      planer: plans.plans.slice(0, 3).map((x2) => `${x2.n} ${x2.name || dash} \xB7 ${x2.aktiv ? t3("common.active") : t3("common.inactive")} \xB7 ${x2.zeit}`),
      consumables: [readConsumables(s4).map((c4) => `${c4.name} ${c4.pct} %`).join(", ")],
      station: [readStation(s4).tiles.map((x2) => `${x2.label} ${x2.value}`).join(", ")],
      stats: [t3("preview.stats", { runs: hist.count, area: hist.totalArea, time: hist.totalTime })],
      quickstart: [t3("preview.rooms", { list: map.roomOrder.map((r4) => r4.short).join(", ") || t3("preview.noRooms") })],
      history: [t3("preview.entries", { n: hist.entries.length }) + (hist.stale ? t3("preview.stale") : "")]
    };
    const box = (sl) => b2`
      <section class="b ${sl.span}" data-slot=${sl.slot}>
        <div class="hd"><h2>${sl.title || deviceName() || t3("common.robot")}</h2><span class="r">${sl.part}</span></div>
        ${(lines[sl.slot] ?? []).map((l3) => b2`<div class="hint preview">${l3}</div>`)}
        <div class="hint">${t3("preview.placeholder", { task: sl.task })}</div>
      </section>`;
    const rest = START_SLOTS.filter((sl) => !["hero", "map", "automatik", "auftrag", "heute", "quickstart"].includes(sl.slot));
    const dark = readSettings(s4).dark;
    return b2`
      <div class="bento">
        <dx-hero class="b span3" data-slot="hero" .robot=${robot} .rooms=${rooms} .roomOrder=${map.roomOrder} .api=${this.api}></dx-hero>
        <dx-map-card class="b span6" data-slot="map" variant="compact" .hass=${this.hass} .map=${map} .robot=${robot} .history=${hist} .api=${this.api} ?dark=${dark}></dx-map-card>
        <div class="span3 stack rightstack">
          ${(robot.vac === "cleaning" || robot.vac === "paused") && !robot.docked ? b2`<dx-auftrag class="b" data-slot="auftrag" .robot=${robot} .rooms=${rooms} .roomOrder=${map.roomOrder}></dx-auftrag>` : box(startSlot("automatik"))}
          ${box(startSlot("heute"))}
        </div>
        ${rest.map((sl) => sl.slot === "history" ? b2`<dx-quickstart class="b span7" data-slot="quickstart" .roomOrder=${map.roomOrder} .api=${this.api}></dx-quickstart>${box(sl)}` : box(sl))}
      </div>`;
  }
  /** Seite Reinigen (4.3): Karte `full` links, rechts App-Szenen, Schalter „Stühle am Boden“ und Knopf „Räume (Roboter-Werte)“. */
  renderReinigen(s4, robot) {
    const map = readMap(s4);
    const hist = readHistory(s4);
    const dark = readSettings(s4).dark;
    return b2`
      <div class="bento">
        <dx-map-card class="b span8" data-slot="map-full" variant="full" .hass=${this.hass} .map=${map} .robot=${robot} .history=${hist} .api=${this.api} ?dark=${dark}></dx-map-card>
        <div class="span4 stack">
          <section class="b" data-slot="scenes">
            <div class="hd"><h2><ha-icon icon="mdi:flash-outline"></ha-icon>${t3("reinigen.scenes")}</h2></div>
            <div class="plan">${APP_SCENES.map((sc) => b2`<div class="pr"><div class="ic"><ha-icon icon=${sc.icon}></ha-icon></div><div><div class="n">${sc.name}</div><div class="s">${sc.sub}</div></div><span class="tag">${t3("reinigen.app")}</span>
              <div class="acts"><button class="ib go" data-scene=${sc.id} aria-label=${t3("common.start")} title=${t3("common.start")} @click=${() => askConfirm(this, t3("reinigen.sceneConfirm", { name: sc.name }), () => {
      void this.api.runScene(sc.id);
      this.toast(t3("rooms.started", { what: sc.name }));
    })}><ha-icon icon="mdi:play"></ha-icon></button></div></div>`)}</div>
          </section>
          <section class="b" data-slot="chairs">
            <div class="crow"><div class="ic ${map.chairs ? "on" : ""}"><ha-icon icon="mdi:chair-rolling"></ha-icon></div><div><div class="t">${t3("reinigen.chairs")}</div><div class="s">${t3("reinigen.chairsSub")}</div></div>
              <button class="sw ${map.chairs ? "on" : ""}" role="switch" aria-checked=${map.chairs ? "true" : "false"} aria-label=${t3("reinigen.chairs")} data-toggle="chairs" @click=${() => void this.api.toggle(map.chairsId)}></button></div>
          </section>
          <section class="b" data-slot="rooms">
            <div class="hd"><h2><ha-icon icon="mdi:view-grid-outline"></ha-icon>${t3("reinigen.roomsTitle")}</h2></div>
            <div class="hint">${t3("reinigen.roomsHint")}</div>
            <button class="btn" data-open="rooms" style="align-self:flex-start" @click=${() => this.openOverlay({ kind: "rooms", mode: "robot" })}><ha-icon icon="mdi:view-grid-outline"></ha-icon>${t3("reinigen.roomsOpen")}</button>
          </section>
        </div>
      </div>`;
  }
  /** Unterseiten: bis zur jeweiligen Karte in Phase 4 ein Platzhalter mit einer Vorschau der Sichten, damit die Verdrahtung sichtbar ist. */
  renderPage(page, s4) {
    const preview = [];
    const dash = t3("common.dash");
    if (page === "reinigen") {
      const m2 = readMap(s4);
      preview.push(t3("preview.mapPage", { karte: m2.karte, chairs: m2.chairs ? t3("common.on") : t3("common.off"), calib: Array.isArray(m2.calibrationPoints) ? t3("preview.calibPoints", { n: m2.calibrationPoints.length }) : t3("common.missing") }));
    }
    if (page === "planer") {
      const p3 = readPlans(s4);
      preview.push(...p3.plans.map((x2) => t3("preview.plan", { n: x2.n, name: x2.name || dash, state: x2.aktiv ? t3("common.active") : t3("common.inactive"), rooms: x2.raeume.length, time: x2.zeit })));
      preview.push(t3("preview.learn", { state: readLearn(s4) ? t3("common.present") : t3("common.none") }));
    }
    if (page === "protokoll") {
      const h3 = readHistory(s4);
      preview.push(t3("preview.history", { entries: h3.entries.length, runs: h3.count, area: h3.totalArea, time: h3.totalTime, stale: h3.stale ? t3("preview.stale") : "" }));
    }
    if (page === "prognose") {
      const p3 = readPrognose(s4);
      preview.push(p3.aktiv ? t3("preview.prognosePage", { state: p3.state, days: p3.tage, window: p3.freiesFenster, back: p3.rueckkehr }) : t3("preview.prognoseOff"));
    }
    if (page === "einstellungen") {
      const d3 = readDiagnostics(s4);
      const r4 = readRobotSettings(s4);
      preview.push(t3("preview.settings", { karte: readSettings(s4).karte.value, missing: d3.missing.length, unavailable: d3.unavailable.length, total: d3.total }));
      preview.push(t3("preview.robot", { list: r4.selects.map((x2) => `${x2.label} ${x2.value}`).join(", "), start: r4.dndStart, end: r4.dndEnd }));
    }
    const entities = Object.keys(s4).length;
    return b2`
      <div class="bento">
        <section class="b span12">
          <div class="hd"><h2>${t3("preview.pageTitle", { page })}</h2><span class="r">${entities ? t3("preview.entities", { n: entities }) : t3("preview.noStates")}</span></div>
          <div class="lbl">${t3("preview.parts")}</div>
          <ul class="hint list">${PAGE_PARTS[page].map((p3) => b2`<li>${p3}</li>`)}</ul>
          <div class="lbl">${t3("preview.views")}</div>
          <ul class="hint list preview">${preview.map((p3) => b2`<li>${p3}</li>`)}</ul>
          <div class="hint">${t3("preview.mockup")} <code>dreame_x60/mockups/bento.html</code>.</div>
        </section>
      </div>`;
  }
  /** Overlay im dx-dialog-Rahmen (4.2): confirm fertig; die Inhalte der übrigen Dialoge kommen mit ihren Bausteinen (4.5, 4.6, 4.8, 4.11, 4.12). */
  renderOverlay() {
    const o5 = this._overlay;
    if (!o5) return A;
    if (o5.kind === "confirm") {
      return b2`<dx-dialog class="overlay" data-kind="confirm" variant="confirm" .text=${o5.text} .subText=${o5.sub ?? ""} .okLabel=${o5.okLabel ?? t3("common.ok")} ?danger=${!!o5.danger}></dx-dialog>`;
    }
    const hasBack = "back" in o5 && !!o5.back;
    return b2`<dx-dialog class="overlay" data-kind=${o5.kind} heading=${tx("dialog.overlay", { kind: o5.kind })} ?back=${hasBack}>
        <div class="hint">${t3("dialog.placeholder")}</div>
        ${hasBack ? b2`<button slot="foot" class="btn" @click=${() => this.backOverlay()}>${t3("common.back")}</button>` : A}
        <button slot="foot" class="btn primary" @click=${() => this.closeOverlay()}>${t3("common.close")}</button>
      </dx-dialog>`;
  }
};
if (!customElements.get(ELEMENT)) customElements.define(ELEMENT, DreameX60Panel);
window.customCards = window.customCards ?? [];
if (!window.customCards.some((c4) => c4.type === ELEMENT)) {
  window.customCards.push({ type: ELEMENT, name: t3("card.name"), description: t3("card.description"), preview: false });
}
console.info(`%c dreame_x60 %c v${VERSION} `, "background:#0b1015;color:#58b7f6;font-weight:600", "background:#0b1015;color:#e7edf3");
export {
  DreameX60Panel,
  ELEMENT,
  PAGES
};
