// dreame_x60 – Heidi-Karte v2.0.0-alpha.4 (gebaut aus dreame_x60/card, nicht von Hand ändern)

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t3, e4, o5) {
    if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e4;
  }
  get styleSheet() {
    let t3 = this.o;
    const s4 = this.t;
    if (e && void 0 === t3) {
      const e4 = void 0 !== s4 && 1 === s4.length;
      e4 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
var i = (t3, ...e4) => {
  const o5 = 1 === t3.length ? t3[0] : e4.reduce((e5, s4, o6) => e5 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t3[o6 + 1], t3[0]);
  return new n(o5, t3, s);
};
var S = (s4, o5) => {
  if (e) s4.adoptedStyleSheets = o5.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
  else for (const e4 of o5) {
    const o6 = document.createElement("style"), n4 = t.litNonce;
    void 0 !== n4 && o6.setAttribute("nonce", n4), o6.textContent = e4.cssText, s4.appendChild(o6);
  }
};
var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e4 = "";
  for (const s4 of t4.cssRules) e4 += s4.cssText;
  return r(e4);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t3, s4) => t3;
var u = { toAttribute(t3, s4) {
  switch (s4) {
    case Boolean:
      t3 = t3 ? l : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, s4) {
  let i5 = t3;
  switch (s4) {
    case Boolean:
      i5 = null !== t3;
      break;
    case Number:
      i5 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t3);
      } catch (t4) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t3, s4) => !i2(t3, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t3) {
    this._$Ei(), (this.l ??= []).push(t3);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t3, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t3) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t3, s4), !s4.noAccessor) {
      const i5 = Symbol(), h3 = this.getPropertyDescriptor(t3, i5, s4);
      void 0 !== h3 && e2(this.prototype, t3, h3);
    }
  }
  static getPropertyDescriptor(t3, s4, i5) {
    const { get: e4, set: r4 } = h(this.prototype, t3) ?? { get() {
      return this[s4];
    }, set(t4) {
      this[s4] = t4;
    } };
    return { get: e4, set(s5) {
      const h3 = e4?.call(this);
      r4?.call(this, s5), this.requestUpdate(t3, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t3 = n2(this);
    t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t4 = this.properties, s4 = [...r2(t4), ...o2(t4)];
      for (const i5 of s4) this.createProperty(i5, t4[i5]);
    }
    const t3 = this[Symbol.metadata];
    if (null !== t3) {
      const s4 = litPropertyMetadata.get(t3);
      if (void 0 !== s4) for (const [t4, i5] of s4) this.elementProperties.set(t4, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t4, s4] of this.elementProperties) {
      const i5 = this._$Eu(t4, s4);
      void 0 !== i5 && this._$Eh.set(i5, t4);
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
  static _$Eu(t3, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t3) => t3(this));
  }
  addController(t3) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
  }
  removeController(t3) {
    this._$EO?.delete(t3);
  }
  _$E_() {
    const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t3.set(i5, this[i5]), delete this[i5]);
    t3.size > 0 && (this._$Ep = t3);
  }
  createRenderRoot() {
    const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t3, this.constructor.elementStyles), t3;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t3) => t3.hostConnected?.());
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t3) => t3.hostDisconnected?.());
  }
  attributeChangedCallback(t3, s4, i5) {
    this._$AK(t3, i5);
  }
  _$ET(t3, s4) {
    const i5 = this.constructor.elementProperties.get(t3), e4 = this.constructor._$Eu(t3, i5);
    if (void 0 !== e4 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t3, null == h3 ? this.removeAttribute(e4) : this.setAttribute(e4, h3), this._$Em = null;
    }
  }
  _$AK(t3, s4) {
    const i5 = this.constructor, e4 = i5._$Eh.get(t3);
    if (void 0 !== e4 && this._$Em !== e4) {
      const t4 = i5.getPropertyOptions(e4), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : u;
      this._$Em = e4;
      const r4 = h3.fromAttribute(s4, t4.type);
      this[e4] = r4 ?? this._$Ej?.get(e4) ?? r4, this._$Em = null;
    }
  }
  requestUpdate(t3, s4, i5, e4 = false, h3) {
    if (void 0 !== t3) {
      const r4 = this.constructor;
      if (false === e4 && (h3 = this[t3]), i5 ??= r4.getPropertyOptions(t3), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t3) && !this.hasAttribute(r4._$Eu(t3, i5)))) return;
      this.C(t3, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t3, s4, { useDefault: i5, reflect: e4, wrapped: h3 }, r4) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t3) && (this._$Ej.set(t3, r4 ?? s4 ?? this[t3]), true !== h3 || void 0 !== r4) || (this._$AL.has(t3) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t3, s4)), true === e4 && this._$Em !== t3 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t3));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t5, s5] of this._$Ep) this[t5] = s5;
        this._$Ep = void 0;
      }
      const t4 = this.constructor.elementProperties;
      if (t4.size > 0) for (const [s5, i5] of t4) {
        const { wrapped: t5 } = i5, e4 = this[s5];
        true !== t5 || this._$AL.has(s5) || void 0 === e4 || this.C(s5, void 0, i5, e4);
      }
    }
    let t3 = false;
    const s4 = this._$AL;
    try {
      t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), this._$EO?.forEach((t4) => t4.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t3 = false, this._$EM(), s5;
    }
    t3 && this._$AE(s4);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    this._$EO?.forEach((t4) => t4.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
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
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$Eq &&= this._$Eq.forEach((t4) => this._$ET(t4, this[t4])), this._$EM();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t3) => t3;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var u2 = Array.isArray;
var d2 = (t3) => u2(t3) || "function" == typeof t3?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t3) => (i5, ...s4) => ({ _$litType$: t3, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t3, i5) {
  if (!u2(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t3, i5) => {
  const s4 = t3.length - 1, e4 = [];
  let n4, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t3[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
    const x2 = c4 === p2 && t3[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e4.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t3, l3 + (t3[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e4];
};
var S2 = class _S {
  constructor({ strings: t3, _$litType$: i5 }, e4) {
    let r4;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = N(t3, i5);
    if (this.el = _S.createElement(f3, e4), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r4.nodeType) {
        if (r4.hasAttributes()) for (const t4 of r4.getAttributeNames()) if (t4.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r4.getAttribute(t4).split(o3), e5 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e5[2], strings: s4, ctor: "." === e5[1] ? I : "?" === e5[1] ? L : "@" === e5[1] ? z : H }), r4.removeAttribute(t4);
        } else t4.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t4));
        if (y2.test(r4.tagName)) {
          const t4 = r4.textContent.split(o3), i6 = t4.length - 1;
          if (i6 > 0) {
            r4.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r4.append(t4[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r4.append(t4[i6], c3());
          }
        }
      } else if (8 === r4.nodeType) if (r4.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = r4.data.indexOf(o3, t4 + 1)); ) d3.push({ type: 7, index: l3 }), t4 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t3, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t3, s4;
  }
};
function M(t3, i5, s4 = t3, e4) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e4 ? s4._$Co?.[e4] : s4._$Cl;
  const o5 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t3), h3._$AT(t3, s4, e4)), void 0 !== e4 ? (s4._$Co ??= [])[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t3, h3._$AS(t3, i5.values), h3, e4)), i5;
}
var R = class {
  constructor(t3, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e4 = (t3?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e4;
    let h3 = P.nextNode(), o5 = 0, n4 = 0, r4 = s4[0];
    for (; void 0 !== r4; ) {
      if (o5 === r4.index) {
        let i6;
        2 === r4.type ? i6 = new k(h3, h3.nextSibling, this, t3) : 1 === r4.type ? i6 = new r4.ctor(h3, r4.name, r4.strings, this, t3) : 6 === r4.type && (i6 = new Z(h3, this, t3)), this._$AV.push(i6), r4 = s4[++n4];
      }
      o5 !== r4?.index && (h3 = P.nextNode(), o5++);
    }
    return P.currentNode = l2, e4;
  }
  p(t3) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t3[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t3, i5, s4, e4) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s4, this.options = e4, this._$Cv = e4?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t3?.nodeType && (t3 = i5.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i5 = this) {
    t3 = M(this, t3, i5), a2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== E && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : d2(t3) ? this.k(t3) : this._(t3);
  }
  O(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  T(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
  }
  _(t3) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(l2.createTextNode(t3)), this._$AH = t3;
  }
  $(t3) {
    const { values: i5, _$litType$: s4 } = t3, e4 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e4) this._$AH.p(i5);
    else {
      const t4 = new R(e4, this), s5 = t4.u(this.options);
      t4.p(i5), this.T(s5), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i5 = C.get(t3.strings);
    return void 0 === i5 && C.set(t3.strings, i5 = new S2(t3)), i5;
  }
  k(t3) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e4 = 0;
    for (const h3 of t3) e4 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e4], s4._$AI(h3), e4++;
    e4 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i5.length = e4);
  }
  _$AR(t3 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t3 !== this._$AB; ) {
      const s5 = i3(t3).nextSibling;
      i3(t3).remove(), t3 = s5;
    }
  }
  setConnected(t3) {
    void 0 === this._$AM && (this._$Cv = t3, this._$AP?.(t3));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, i5, s4, e4, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t3, i5 = this, s4, e4) {
    const h3 = this.strings;
    let o5 = false;
    if (void 0 === h3) t3 = M(this, t3, i5, 0), o5 = !a2(t3) || t3 !== this._$AH && t3 !== E, o5 && (this._$AH = t3);
    else {
      const e5 = t3;
      let n4, r4;
      for (t3 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r4 = M(this, e5[s4 + n4], i5, n4), r4 === E && (r4 = this._$AH[n4]), o5 ||= !a2(r4) || r4 !== this._$AH[n4], r4 === A ? t3 = A : t3 !== A && (t3 += (r4 ?? "") + h3[n4 + 1]), this._$AH[n4] = r4;
    }
    o5 && !e4 && this.j(t3);
  }
  j(t3) {
    t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== A);
  }
};
var z = class extends H {
  constructor(t3, i5, s4, e4, h3) {
    super(t3, i5, s4, e4, h3), this.type = 5;
  }
  _$AI(t3, i5 = this) {
    if ((t3 = M(this, t3, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e4 = t3 === A && s4 !== A || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== A && (s4 === A || e4);
    e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i5, s4) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    M(this, t3);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t3, i5, s4) => {
  const e4 = s4?.renderBefore ?? i5;
  let h3 = e4._$litPart$;
  if (void 0 === h3) {
    const t4 = s4?.renderBefore ?? null;
    e4._$litPart$ = h3 = new k(i5.insertBefore(c3(), t4), t4, void 0, s4 ?? {});
  }
  return h3._$AI(t3), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t3 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t3.firstChild, t3;
  }
  update(t3) {
    const r4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(r4, this.renderRoot, this.renderOptions);
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

// src/ha/contract.ts
var ROOM_IDS = [1, 2, 3, 4, 5, 6, 7];
var PLAN_NUMBERS = [1, 2, 3, 4];
var ENTITIES = {
  // Roboter (Dreame-Integration)
  vac: "vacuum.heidi",
  map: "camera.heidi_map",
  status: "sensor.heidi_status",
  error: "sensor.heidi_error",
  taskStatus: "sensor.heidi_task_status",
  battery: "sensor.heidi_battery_level",
  currentRoom: "sensor.heidi_current_room",
  cleanedArea: "sensor.heidi_cleaned_area",
  cleaningTime: "sensor.heidi_cleaning_time",
  cleaningHistory: "sensor.heidi_cleaning_history",
  cleaningCount: "sensor.heidi_cleaning_count",
  totalCleanedArea: "sensor.heidi_total_cleaned_area",
  totalCleaningTime: "sensor.heidi_total_cleaning_time",
  firstCleaningDate: "sensor.heidi_first_cleaning_date",
  mainBrushLeft: "sensor.heidi_main_brush_left",
  sideBrushLeft: "sensor.heidi_side_brush_left",
  filterLeft: "sensor.heidi_filter_left",
  sensorDirtyLeft: "sensor.heidi_sensor_dirty_left",
  wheelDirtyLeft: "sensor.heidi_wheel_dirty_left",
  dustBagStatus: "sensor.heidi_dust_bag_status",
  cleanWaterTankStatus: "sensor.heidi_clean_water_tank_status",
  dirtyWaterTankStatus: "sensor.heidi_dirty_water_tank_status",
  detergentStatus: "sensor.heidi_detergent_status",
  lowWaterWarning: "sensor.heidi_low_water_warning",
  autoEmptyStatus: "sensor.heidi_auto_empty_status",
  selfWashBaseStatus: "sensor.heidi_self_wash_base_status",
  resetMainBrush: "button.heidi_reset_main_brush",
  resetSideBrush: "button.heidi_reset_side_brush",
  resetFilter: "button.heidi_reset_filter",
  resetSensor: "button.heidi_reset_sensor",
  resetWheel: "button.heidi_reset_wheel",
  startAutoEmpty: "button.heidi_start_auto_empty",
  selfClean: "button.heidi_self_clean",
  manualDrying: "button.heidi_manual_drying",
  baseStationCleaning: "button.heidi_base_station_cleaning",
  customizedCleaning: "switch.heidi_customized_cleaning",
  carpetCleaning: "select.heidi_carpet_cleaning",
  waterTemperature: "select.heidi_water_temperature",
  dryingTime: "select.heidi_drying_time",
  autoEmptyMode: "select.heidi_auto_empty_mode",
  selfCleanFrequency: "select.heidi_self_clean_frequency",
  cleangenius: "select.heidi_cleangenius",
  mapRotation: "select.heidi_map_rotation",
  selfCleanArea: "number.heidi_self_clean_area",
  volume: "number.heidi_volume",
  dndStart: "time.heidi_dnd_start",
  dndEnd: "time.heidi_dnd_end",
  // Paket (ha/packages/heidi.yaml)
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
  chairs: "input_boolean.stuehle_am_boden",
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
  prognoseMindesttage: "input_number.heidi_prognose_mindesttage"
};
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
  return `${domain}.heidi_plan${n4}_${feld}`;
}
var ROOM_SELECT_FIELDS = ["cleaning_mode", "suction_level", "cleaning_times", "mop_pad_humidity", "cleaning_route"];
function roomEntity(id, feld) {
  return `select.heidi_room_${id}_${feld}`;
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
function allContractIds() {
  const ids = [...Object.values(ENTITIES), ...PERSONS.map((p3) => p3.id)];
  for (const n4 of PLAN_NUMBERS) for (const f3 of [...PLAN_TEXT_FIELDS, ...PLAN_SELECT_FIELDS, ...PLAN_BOOL_FIELDS, ...PLAN_TIME_FIELDS]) ids.push(planEntity(n4, f3));
  for (const r4 of ROOM_IDS) for (const f3 of ROOM_SELECT_FIELDS) ids.push(roomEntity(r4, f3));
  return [...new Set(ids)];
}

// src/domain/raumwerte.ts
var { RV } = ROOM_VALUE_CODES;
function lookup(table, code) {
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
    if (!(n4 >= 1 && n4 <= 7)) return;
    out[n4] = {
      modus: lookup(RV.modus, f3[0]) ?? "Saugen",
      saug: lookup(RV.saug, f3[1]) ?? "Standard",
      wasser: lookup(RV.wasser, f3[2]) ?? null,
      route: lookup(RV.route, f3[3]) ?? null,
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
var inverse2 = (t3) => Object.fromEntries(Object.entries(t3).map(([k2, v2]) => [v2, k2]));
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
  /** Raumwert am Roboter sofort setzen; `'all'` = alle sieben Räume parallel. Wdh als „2x“, sonst HA-Option aus RV_HA. */
  setRoomValue(room, key, value) {
    const ids = room === "all" ? ROOM_IDS : [room];
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
  /** Historie von sensor.heidi_phase und vacuum.heidi im Fenster (Sekunden). */
  history(startSec, endSec) {
    const h3 = this.hass();
    if (!h3.callApi) return Promise.resolve([]);
    return h3.callApi("GET", historyPath(new Date(startSec * 1e3).toISOString(), new Date(endSec * 1e3).toISOString()));
  }
};

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
  let prev = null;
  let result;
  const sel = (states) => {
    if (prev !== null) {
      let same = true;
      for (const id of ids) {
        const cmp = compare[id] ?? sameStateAndUpdated;
        if (!cmp(prev[id], states[id])) {
          same = false;
          break;
        }
      }
      if (same) return result;
    }
    result = fn(states);
    prev = states;
    return result;
  };
  Object.defineProperty(sel, "ids", { value: ids, writable: false });
  sel.reset = () => {
    prev = null;
  };
  return sel;
}

// src/config.ts
var NAV = [
  { key: "start", label: "\xDCbersicht", icon: "mdi:home-outline", page: "start", tab: true },
  { key: "reinigen", label: "Karte", icon: "mdi:map-outline", page: "reinigen", tab: true },
  { key: "rooms", label: "R\xE4ume", icon: "mdi:view-grid-outline", overlay: "rooms", tab: false },
  { key: "planer", label: "Planer", icon: "mdi:calendar-outline", page: "planer", tab: true },
  { key: "protokoll", label: "Verlauf", icon: "mdi:format-list-bulleted", page: "protokoll", tab: true },
  { key: "prognose", label: "Prognose", icon: "mdi:chart-line", page: "prognose", onlyWhen: "prognose", tab: true },
  { key: "einstellungen", label: "Einstellungen", icon: "mdi:cog-outline", page: "einstellungen", tab: true }
];
var ROOMS = [
  { id: 7, short: "Wohnz.", name: "Wohnzimmer", icon: "mdi:sofa-outline" },
  { id: 6, short: "K\xFCche", name: "K\xFCche", icon: "mdi:chef-hat" },
  { id: 5, short: "B\xFCro", name: "B\xFCro", icon: "mdi:desk" },
  { id: 4, short: "Flur", name: "Flur", icon: "mdi:foot-print" },
  { id: 3, short: "WC", name: "WC", icon: "mdi:toilet" },
  { id: 2, short: "Schlafz.", name: "Schlafzimmer", icon: "mdi:bed-king-outline" },
  { id: 1, short: "Bad", name: "Bad", icon: "mdi:shower" }
];
var roomById = (id) => ROOMS.find((r4) => r4.id === id);
var ROOMS_DE = { Bathroom: "Bad", "Primary Bedroom": "Schlafzimmer", WC: "WC", Corridor: "Flur", Study: "B\xFCro", Kitchen: "K\xFCche", "Living Room": "Wohnzimmer" };
var STATUS_DE = {
  sleeping: "schl\xE4ft",
  charging: "l\xE4dt",
  cleaning: "reinigt",
  sweeping: "saugt",
  mopping: "wischt",
  sweeping_and_mopping: "saugt und wischt",
  returning: "f\xE4hrt zur Station",
  paused: "pausiert",
  idle: "bereit",
  docked: "angedockt",
  washing: "Mopp-W\xE4sche",
  drying: "trocknet",
  auto_emptying: "saugt ab",
  error: "Fehler",
  charging_completed: "voll geladen",
  segment_cleaning: "reinigt R\xE4ume",
  zone_cleaning: "reinigt Zone",
  spot_cleaning: "reinigt Punkt",
  cruising: "f\xE4hrt"
};
var ERR_DE = {
  clean_mop_pad: "Mopps reinigen",
  dust_bag_full: "Staubbeutel voll",
  clean_water_tank_empty: "Frischwasser leer",
  dirty_water_tank_full: "Abwasser voll",
  dust_box_missing: "Staubbox fehlt",
  mop_pad_stop_rotate: "Mopp blockiert",
  wheels_stuck: "Rad blockiert",
  brush_stuck: "B\xFCrste blockiert",
  low_battery: "Akku leer",
  station_disconnected: "Station getrennt",
  detergent_empty: "Reinigungsmittel leer",
  water_tank_missing: "Wassertank fehlt",
  clean_water_tank_missing: "Frischwassertank fehlt",
  dirty_water_tank_missing: "Abwassertank fehlt"
};

// src/domain/status.ts
var TASK_DE = {
  room_cleaning: "Reinigt R\xE4ume",
  zone_cleaning: "Reinigt Zone",
  spot_cleaning: "Reinigt Punkt",
  cleaning: "Reinigt",
  cruising: "F\xE4hrt",
  mapping: "Erstellt Karte",
  fast_mapping: "Erstellt Karte"
};
var EMPTY = ["unknown", "unavailable", ""];
var cap = (s4) => s4.replace(/^./, (c4) => c4.toUpperCase());
var B2 = (service, icon, label, primary = false) => ({ service, icon, label, primary });
function heroButtons(vac) {
  switch (vac) {
    case "cleaning":
      return [B2("pause", "mdi:pause", "Pause", true), B2("stop", "mdi:stop", "Stopp"), B2("return_to_base", "mdi:home-import-outline", "Station")];
    case "paused":
      return [B2("start", "mdi:play", "Weiter", true), B2("stop", "mdi:stop", "Stopp"), B2("return_to_base", "mdi:home-import-outline", "Station")];
    case "returning":
      return [B2("pause", "mdi:pause", "Pause", true), B2("stop", "mdi:stop", "Stopp"), B2("locate", "mdi:map-marker", "Orten")];
    case "docked":
      return [B2("start", "mdi:play", "Start", true), B2("locate", "mdi:map-marker", "Orten")];
    default:
      return [B2("start", "mdi:play", "Start", true), B2("return_to_base", "mdi:home-import-outline", "Station"), B2("locate", "mdi:map-marker", "Orten")];
  }
}
function heroModel(i5) {
  const phaseOk = !EMPTY.includes(i5.phase);
  const statusTxt = phaseOk ? i5.phase : cap(STATUS_DE[i5.status] ?? i5.status.replace(/_/g, " "));
  const auto = i5.autoLauf ? i5.autoLetzterPlan : "";
  const job = auto && !EMPTY.includes(auto) ? auto : TASK_DE[i5.task] ?? "Reinigt";
  let big = statusTxt, sub = "";
  if (i5.vac === "error") big = "Fehler";
  else if (i5.vac === "paused") {
    big = "Pausiert";
    sub = job;
  } else if (i5.vac === "returning") {
    big = "F\xE4hrt zur Station";
    sub = phaseOk && i5.phase !== big ? i5.phase : "";
  } else if (i5.vac === "cleaning") {
    big = job;
    sub = phaseOk ? i5.phase : "";
  }
  if (sub === big) sub = "";
  const dot = i5.vac === "cleaning" ? "accent" : i5.vac === "returning" ? "warning" : i5.vac === "error" ? "danger" : "positive";
  const errorChip = i5.error !== "no_error" && i5.error !== "unavailable" ? { text: ERR_DE[i5.error] ?? i5.error.replace(/_/g, " "), level: i5.hasError ? "danger" : "warning" } : null;
  const roomChip = i5.room !== "\u2013" && i5.vac === "cleaning" && !phaseOk ? i5.room : null;
  const dnd = `${(i5.dndStart || "").slice(0, 5)}\u2013${(i5.dndEnd || "").slice(0, 5)}`;
  return { big, sub, dot, buttons: heroButtons(i5.vac), errorChip, roomChip, dnd, phaseOk };
}

// src/domain/labels.ts
function roomName(raw, deutsch) {
  if (!raw || ["unknown", "unavailable"].includes(raw)) return "\u2013";
  return deutsch ? ROOMS_DE[raw] ?? raw : raw;
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
var VAC_ATTRS = ["has_error", "current_segment", "active_segments", "cleaning_sequence", "cleaned_area", "charging", "mop_pad", "paused", "washing", "drying", "returning_to_wash", "mapping", "cruising"];
var ROBOT_IDS = [E2.vac, E2.status, E2.error, E2.taskStatus, E2.battery, E2.currentRoom, E2.cleanedArea, E2.cleaningTime, E2.phase, E2.autoLauf, E2.autoLetzterPlan, E2.laufReihenfolge, E2.dndStart, E2.dndEnd, E2.raumnamen, E2.ninaZaehlt, ...PERSONS.map((p3) => p3.id)];
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
}, { [E2.vac]: stateAndAttributes(VAC_ATTRS) });
var PLAN_FIELDS = ["name", "raeume", "tage", "personen", "raumwerte", "modus", "saugstufe", "wasser", "route", "wiederholungen", "homeoffice", "ho_saug", "ho_wdh", "sp_saug", "sp_wdh", "aktiv", "schnell", "zeit"];
var planIds = (n4) => PLAN_FIELDS.map((f3) => planEntity(n4, f3));
function makeReadPlan(n4) {
  const id = (f3) => planEntity(n4, f3);
  return memoizeSelector(planIds(n4), (s4) => {
    const sel = (f3) => st(s4, id(f3));
    const tx = (f3) => txt(s4, id(f3));
    const mask = tx("tage").padEnd(7, "0").slice(0, 7);
    return {
      n: n4,
      name: tx("name"),
      aktiv: on(s4, id("aktiv")),
      raeume: [...new Set(tx("raeume").split(",").map((x2) => parseInt(x2, 10)).filter((x2) => x2 >= 1 && x2 <= 7))],
      modus: sel("modus"),
      saug: sel("saugstufe"),
      wasser: sel("wasser"),
      route: sel("route"),
      wdh: sel("wiederholungen"),
      tage: [...mask].map((c4) => c4 === "1"),
      zeit: (txt(s4, id("zeit")) || "09:30").slice(0, 5),
      personen: tx("personen").split(",").map((x2) => x2.trim()).filter(Boolean),
      ho: sel("homeoffice"),
      hoSaug: sel("ho_saug"),
      hoWdh: sel("ho_wdh"),
      schnell: on(s4, id("schnell")),
      spSaug: sel("sp_saug"),
      spWdh: sel("sp_wdh"),
      raum: parseRaum(tx("raumwerte")),
      entities: Object.fromEntries(PLAN_FIELDS.map((f3) => [f3, id(f3)]))
    };
  });
}
var PLAN_SELECTORS = { 1: makeReadPlan(1), 2: makeReadPlan(2), 3: makeReadPlan(3), 4: makeReadPlan(4) };
var readPlans = memoizeSelector([...PLAN_NUMBERS.flatMap(planIds), E2.heutePlan, E2.planerBereich], (s4) => {
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
var { RV_HA, RV_ENT } = ROOM_VALUE_CODES;
var roomIds = (id) => ROOM_SELECT_FIELDS.map((f3) => roomEntity(id, f3));
function roomValuesOf(s4, id) {
  const g2 = (k2) => {
    const v2 = st(s4, roomEntity(id, RV_ENT[k2]));
    return EMPTY2.includes(v2) ? null : v2;
  };
  const m2 = g2("modus");
  if (m2 === null) return null;
  const saugRaw = g2("saug"), wasserRaw = g2("wasser"), routeRaw = g2("route");
  return {
    modus: RV_HA.modus[m2] ?? m2,
    saug: saugRaw && RV_HA.saug[saugRaw] || "\u2013",
    wasser: wasserRaw ? RV_HA.wasser[wasserRaw] ?? wasserRaw : null,
    route: routeRaw ? RV_HA.route[routeRaw] ?? routeRaw : null,
    wdh: (g2("wdh") ?? "1x").replace("x", "")
  };
}
var ROOM_SELECTORS = Object.fromEntries(ROOM_IDS.map((id) => [id, memoizeSelector(roomIds(id), (s4) => roomValuesOf(s4, id))]));
var readAllRoomValues = memoizeSelector([...ROOM_IDS.flatMap(roomIds), E2.customizedCleaning], (s4) => {
  const rooms = Object.fromEntries(ROOM_IDS.map((id) => [id, ROOM_SELECTORS[id](s4)]));
  return { rooms, customized: on(s4, E2.customizedCleaning), anyUnavailable: ROOM_IDS.some((id) => rooms[id] === null) };
});
var readLearn = memoizeSelector([E2.lern], (s4) => {
  const e4 = ent(s4, E2.lern);
  return e4 && !EMPTY2.includes(e4.state) && e4.attributes?.raten ? e4.attributes : null;
});
var histCache = {};
var histOk = (e4) => !!e4 && !EMPTY2.includes(e4.state) && Object.values(e4.attributes ?? {}).some((v2) => v2 && typeof v2 === "object" && "timestamp" in v2);
var readHistory = memoizeSelector([E2.cleaningHistory, E2.cleaningCount, E2.totalCleanedArea, E2.totalCleaningTime], (s4) => {
  const live = ent(s4, E2.cleaningHistory);
  const ok = histOk(live);
  if (ok && live) histCache = live.attributes;
  const a3 = ok && live ? live.attributes : histCache;
  const entries = Object.entries(a3).filter(([, v2]) => v2 && typeof v2 === "object" && "timestamp" in v2).map(([, v2]) => v2).sort((x2, y3) => Number(y3.timestamp) - Number(x2.timestamp)).slice(0, 30).map((v2) => ({ key: String(Math.floor(Number(v2.timestamp))), ts: Math.floor(Number(v2.timestamp)), area: parseInt(String(v2.cleaned_area ?? "").replace(/[^0-9]/g, ""), 10) || 0, min: parseInt(String(v2.cleaning_time ?? "").replace(/[^0-9]/g, ""), 10) || 0, raw: v2 }));
  return { entries, count: num(s4, E2.cleaningCount, 0), totalArea: num(s4, E2.totalCleanedArea, 0), totalTime: num(s4, E2.totalCleaningTime, 0), stale: !ok };
});
var readPrognose = memoizeSelector([E2.prognose, E2.prognoseAktiv, E2.abweichungHeute, E2.progHerbert, E2.progNicole, E2.progNina, E2.prognoseWochen, E2.prognoseMindesttage], (s4) => {
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
      { id: E2.abweichungHeute, label: "Abweichung heute", sub: "Urlaub, Feiertag", on: on(s4, E2.abweichungHeute) },
      { id: E2.progHerbert, label: "Herbert einbeziehen", sub: "GPS + WLAN", on: on(s4, E2.progHerbert) },
      { id: E2.progNicole, label: "Nicole einbeziehen", sub: "WLAN", on: on(s4, E2.progNicole) },
      { id: E2.progNina, label: "Nina einbeziehen", sub: "WLAN", on: on(s4, E2.progNina) }
    ]
  };
});
var readAutomatik = memoizeSelector([E2.automatik, E2.autoStatus, E2.arbeitszeitStart, E2.arbeitszeitEnde, E2.rueckkehr, E2.schnellMinuten, E2.minAkku, E2.beiHeimkehr, E2.autoLetzterPlan, E2.letzteAutoReinigung], (s4) => {
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
    letzterPlan: txt(s4, E2.autoLetzterPlan) || "\u2013",
    letzteAutoReinigung: !letzte || EMPTY2.includes(letzte) || letzte.startsWith("2000") ? "noch nie" : letzte
  };
});
var CONSUMABLES = [
  ["Hauptb\xFCrste", E2.mainBrushLeft, E2.resetMainBrush],
  ["Seitenb\xFCrste", E2.sideBrushLeft, E2.resetSideBrush],
  ["Filter", E2.filterLeft, E2.resetFilter],
  ["Sensoren", E2.sensorDirtyLeft, E2.resetSensor],
  ["R\xE4der", E2.wheelDirtyLeft, E2.resetWheel]
];
var readConsumables = memoizeSelector(CONSUMABLES.flatMap(([, s4, b3]) => [s4, b3]), (s4) => CONSUMABLES.map(([name, sensor, reset]) => {
  const pct = num(s4, sensor, 0);
  return { name, pct, level: pct <= 10 ? "danger" : pct <= 25 ? "warning" : "ok", resetEntity: reset, known: available(s4, sensor) };
}));
var readStation = memoizeSelector([E2.dustBagStatus, E2.cleanWaterTankStatus, E2.dirtyWaterTankStatus, E2.detergentStatus, E2.lowWaterWarning, E2.startAutoEmpty, E2.selfClean, E2.manualDrying, E2.baseStationCleaning], (s4) => {
  const inst = (id) => st(s4, id) === "installed";
  const lowWater = st(s4, E2.lowWaterWarning) !== "no_warning";
  const tiles = [
    { key: "beutel", label: "Beutel", value: inst(E2.dustBagStatus) ? "OK" : "Pr\xFCfen", warn: !inst(E2.dustBagStatus) },
    { key: "frisch", label: "Frisch", value: lowWater ? "Leer" : inst(E2.cleanWaterTankStatus) ? "OK" : "Fehlt", warn: lowWater || !inst(E2.cleanWaterTankStatus) },
    { key: "abwasser", label: "Abwasser", value: inst(E2.dirtyWaterTankStatus) ? "OK" : "Voll", warn: !inst(E2.dirtyWaterTankStatus) },
    { key: "mittel", label: "Mittel", value: inst(E2.detergentStatus) ? "OK" : "Leer", warn: !inst(E2.detergentStatus) }
  ];
  return {
    tiles,
    ok: tiles.every((t3) => !t3.warn),
    buttons: [
      { entity: E2.startAutoEmpty, label: "Absaugen", confirm: null },
      { entity: E2.selfClean, label: "Mopp", confirm: null },
      { entity: E2.manualDrying, label: "Trocknen", confirm: null },
      { entity: E2.baseStationCleaning, label: "Station", confirm: "Reinigung der Station starten?" }
    ]
  };
});
var rng = (s4, id, label, unit, sub, dMin, dMax, dStep) => {
  const a3 = ent(s4, id)?.attributes ?? {};
  const n4 = (v2, d3) => typeof v2 === "number" ? v2 : d3;
  return { id, label, sub, unit, value: num(s4, id, n4(a3.min, dMin)), min: n4(a3.min, dMin), max: n4(a3.max, dMax), step: n4(a3.step, dStep) };
};
var ROT_DEFAULT = ["0", "90", "180", "270"];
var readSettings = memoizeSelector([E2.dark, E2.karte, E2.mapRotation, E2.raumnamen, E2.automatik, E2.planerBereich, E2.prognoseAktiv, E2.ninaZaehlt, E2.prognoseIntervall, E2.prognoseAufloesung, E2.prognoseWochen, E2.prognoseHalbwert, E2.prognoseMindesttage], (s4) => {
  const rotOpts = opts(s4, E2.mapRotation, ROT_DEFAULT);
  return {
    dark: st(s4, E2.dark) !== "off",
    darkId: E2.dark,
    karte: { id: E2.karte, value: st(s4, E2.karte), options: opts(s4, E2.karte), labels: opts(s4, E2.karte) },
    rotation: { id: E2.mapRotation, value: st(s4, E2.mapRotation), options: rotOpts, labels: rotOpts.map((x2) => x2 + "\xB0") },
    raumnamen: { id: E2.raumnamen, value: st(s4, E2.raumnamen), options: opts(s4, E2.raumnamen, ["Original", "Deutsch"]), labels: opts(s4, E2.raumnamen, ["Original", "Deutsch"]) },
    schalter: [
      { id: E2.automatik, label: "Automatik", sub: "", on: on(s4, E2.automatik) },
      { id: E2.planerBereich, label: "Planer anzeigen", sub: "", on: on(s4, E2.planerBereich) },
      { id: E2.prognoseAktiv, label: "Prognose", sub: "Lernende Anwesenheit, eigene Seite", on: on(s4, E2.prognoseAktiv) },
      { id: E2.ninaZaehlt, label: "Nina z\xE4hlt f\xFCr Anwesenheit", sub: "", on: on(s4, E2.ninaZaehlt) }
    ],
    prognose: [
      rng(s4, E2.prognoseIntervall, "Protokoll-Intervall", " min", "Wie oft die Anwesenheit gespeichert wird", 5, 60, 5),
      rng(s4, E2.prognoseAufloesung, "Aufl\xF6sung", " min", "Rasterbreite der Heatmap und Prognose", 15, 60, 15),
      rng(s4, E2.prognoseWochen, "Lernzeitraum", " Wochen", "\xC4ltere Daten werden verworfen", 2, 12, 1),
      rng(s4, E2.prognoseHalbwert, "Gewichtung", " Tage", "Halbwertszeit \u2013 so alt z\xE4hlt ein Tag nur noch halb", 7, 60, 1),
      rng(s4, E2.prognoseMindesttage, "Aktiv ab", " Tagen", "Erst dann nutzt die Automatik die Prognose", 3, 28, 1)
    ],
    version: ""
  };
});
var readRobotSettings = memoizeSelector([E2.carpetCleaning, E2.waterTemperature, E2.dryingTime, E2.autoEmptyMode, E2.selfCleanFrequency, E2.cleangenius, E2.selfCleanArea, E2.volume, E2.dndStart, E2.dndEnd], (s4) => {
  const sel = (id, label) => ({ id, label, value: st(s4, id), options: opts(s4, id) });
  return {
    selects: [sel(E2.carpetCleaning, "Teppich"), sel(E2.waterTemperature, "Wassertemperatur"), sel(E2.dryingTime, "Trocknung"), sel(E2.autoEmptyMode, "Absaugen"), sel(E2.selfCleanFrequency, "Mopp-W\xE4sche"), sel(E2.cleangenius, "CleanGenius")],
    numbers: [rng(s4, E2.selfCleanArea, "Mopp-W\xE4sche nach", " m\xB2", "", 0, 100, 1), rng(s4, E2.volume, "Lautst\xE4rke", " %", "", 0, 100, 1)],
    dndStart: txt(s4, E2.dndStart).slice(0, 5),
    dndEnd: txt(s4, E2.dndEnd).slice(0, 5),
    dndStartId: E2.dndStart,
    dndEndId: E2.dndEnd
  };
});
var readMap = memoizeSelector([E2.map, E2.karte, E2.chairs], (s4) => ({
  entityPicture: String(attr(s4, E2.map, "entity_picture") ?? ""),
  calibrationPoints: attr(s4, E2.map, "calibration_points") ?? null,
  noGoAreas: attr(s4, E2.map, "no_go_areas") ?? null,
  noMoppingAreas: attr(s4, E2.map, "no_mopping_areas") ?? null,
  virtualWalls: attr(s4, E2.map, "virtual_walls") ?? null,
  rooms: attr(s4, E2.map, "rooms") ?? null,
  karte: st(s4, E2.karte),
  chairs: on(s4, E2.chairs),
  roomOrder: ROOMS
}), { [E2.map]: stateAndAttributes(["entity_picture", "calibration_points", "no_go_areas", "no_mopping_areas", "virtual_walls", "rooms"]) });
var isRobotId = (id) => /^(vacuum|camera|switch|button|select\.heidi_(room_|carpet|water|drying|auto_empty|self_clean|cleangenius|map_rotation)|number|time)\./.test(id) || /^sensor\.heidi_(status|error|task_status|battery_level|current_room|cleaned_area|cleaning_time|cleaning_history|cleaning_count|total_|first_cleaning|main_brush|side_brush|filter_left|sensor_dirty|wheel_dirty|dust_bag|clean_water|dirty_water|detergent|low_water|auto_empty|self_wash)/.test(id);
var readDiagnostics = memoizeSelector(allContractIds(), (s4) => {
  const ids = allContractIds();
  const group = (name, list) => ({ name, total: list.length, missing: list.filter((id) => !s4[id]), unavailable: list.filter((id) => s4[id] && EMPTY2.includes(s4[id].state)) });
  const robot = group("Roboter (Dreame)", ids.filter(isRobotId));
  const paket = group("Paket (Helfer, Sensoren)", ids.filter((id) => !isRobotId(id)));
  return { total: ids.length, missing: [...robot.missing, ...paket.missing], unavailable: [...robot.unavailable, ...paket.unavailable], groups: [robot, paket] };
});
var ALL_SELECTORS = {
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
  ...Object.fromEntries(PLAN_NUMBERS.map((n4) => [`readPlan(${n4})`, PLAN_SELECTORS[n4]])),
  ...Object.fromEntries(ROOM_IDS.map((id) => [`readRoomValues(${id})`, ROOM_SELECTORS[id]]))
};

// src/pages.ts
var PAGES = ["start", "reinigen", "planer", "protokoll", "prognose", "einstellungen"];
var PAGE_TITLE = {
  start: { title: "Heidi", sub: "\xDCbersicht" },
  reinigen: { title: "Karte", sub: "R\xE4ume, Zone oder Punkt reinigen \xB7 Hinfahren \xB7 Sperrzonen" },
  planer: { title: "Planer", sub: "Vier Eintr\xE4ge \xB7 Automatik entscheidet voll, schnell oder warten" },
  protokoll: { title: "Verlauf", sub: "Reinigungsprotokoll der App \xB7 Zeitleiste je Lauf \xB7 Lernwerte" },
  prognose: { title: "Prognose", sub: "Lernende Anwesenheit \xB7 Grundlage f\xFCr Start, Schnellprogramm und R\xFCckkehr" },
  einstellungen: { title: "Einstellungen", sub: "Darstellung, Funktionen, Prognose, Roboter, Diagnose" }
};
var PAGE_PARTS = {
  reinigen: ["dx-map-card full (4.3)", "App-Szenen", "St\xFChle am Boden", "R\xE4ume (Roboter-Werte) \u2192 dx-rooms-dialog (4.6)"],
  planer: ["dx-planer (4.4)", "dx-planer-editor + dx-clock-picker (4.5)", "Automatik-Regeln", "dx-estimate-dialog (4.8)"],
  protokoll: ["dx-history (4.7)", "Lernwerte-Tabelle"],
  prognose: ["dx-prognose-view (4.10)"],
  einstellungen: ["dx-settings-panel (4.11)", "dx-robot-settings (4.7)", "Diagnose", "Version"]
};
var START_SLOTS = [
  { slot: "hero", title: "Heidi", span: "span3", part: "dx-hero", task: "4.1" },
  { slot: "map", title: "Live-Karte", span: "span6", part: "dx-map-card compact", task: "4.3" },
  { slot: "automatik", title: "Automatik", span: "", part: "dx-automatik", task: "4.9" },
  { slot: "auftrag", title: "Aktueller Auftrag", span: "", part: "dx-auftrag", task: "4.1" },
  { slot: "heute", title: "Heute", span: "", part: "dx-heute", task: "4.10" },
  { slot: "planer", title: "Planer", span: "span3", part: "dx-planer compact", task: "4.4" },
  { slot: "consumables", title: "Verschlei\xDF", span: "span3", part: "dx-consumables", task: "4.9" },
  { slot: "station", title: "Station", span: "span3", part: "dx-station", task: "4.9" },
  { slot: "stats", title: "Statistik", span: "span3", part: "dx-stats", task: "4.7" },
  { slot: "quickstart", title: "Schnellstart \u2013 R\xE4ume ausw\xE4hlen", span: "span7", part: "dx-quickstart", task: "4.3" },
  { slot: "history", title: "Letzte L\xE4ufe", span: "span5", part: "dx-history compact", task: "4.7" }
];
var startSlot = (slot) => START_SLOTS.find((s4) => s4.slot === slot);
function toPage(value) {
  return PAGES.includes(String(value)) ? value : "start";
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
function moreInfo(target, entityId) {
  emit(target, "hass-more-info", { entityId });
}

// src/shared/navigate.ts
var DASHBOARD_PATH = "/dreame-x60";
var pagePath = (page) => `${DASHBOARD_PATH}/${page}`;
function navigate(page, replace = false) {
  const path = pagePath(page);
  if (replace) history.replaceState(null, "", path);
  else history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace } }));
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
    .topbar .meta { display: none; }
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
  .overlay { position: fixed; inset: 0; z-index: 30; }
  .scrim { position: absolute; inset: 0; background: rgba(3, 6, 9, 0.62); animation: fade var(--dx-dur) both; }
  .dlg {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: min(640px, calc(100% - 32px)); max-height: calc(100% - 32px); overflow: auto;
    background: var(--dx-bg-elevated); border: 1px solid var(--dx-border-strong); border-radius: var(--dx-radius-xl);
    padding: 18px 20px 20px; box-shadow: var(--dx-shadow-float); display: grid; gap: 14px; align-content: start; animation: fade var(--dx-dur) var(--dx-ease) both;
  }
  .dlg > h2 { font-size: 18px; display: flex; align-items: center; gap: 8px; }
  .dlg > h2 .iconbtn { margin-left: auto; }
  .dlg .foot { display: flex; justify-content: flex-end; gap: 8px; }
  .iconbtn { width: 40px; height: 40px; border-radius: var(--dx-radius-md); display: inline-flex; align-items: center; justify-content: center; color: var(--dx-text-muted); }
  .iconbtn:hover { background: var(--dx-surface-raised); color: var(--dx-text); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: var(--dx-touch); padding: 0 16px;
    border-radius: var(--dx-radius-md); background: var(--dx-surface-raised); border: 1px solid var(--dx-border); font-weight: 600; font-size: 14px; color: var(--dx-text);
  }
  .btn:hover { background: var(--dx-surface-active); }
  .btn.primary { background: var(--dx-positive); color: var(--dx-on-positive); border-color: transparent; }
  .alert {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(360px, calc(100% - 48px));
    background: var(--dx-bg-elevated); border: 1px solid var(--dx-border-strong); border-radius: var(--dx-radius-lg); box-shadow: var(--dx-shadow-float); overflow: hidden; animation: fade var(--dx-dur) var(--dx-ease) both;
  }
  .alert .m { padding: 20px 18px 16px; font-weight: 600; font-size: 15px; text-align: center; }
  .alert .m small { display: block; font-weight: 400; color: var(--dx-text-muted); font-size: 13px; margin-top: 6px; }
  .alert .b { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--dx-border); }
  .alert .b button { height: 48px; font-weight: 600; color: var(--dx-text-muted); }
  .alert .b button + button { border-left: 1px solid var(--dx-border); color: var(--dx-accent); }
  .alert .b button.danger { color: var(--dx-danger); }
  .toast {
    position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 60;
    background: var(--dx-surface-active); border: 1px solid var(--dx-border-strong); color: var(--dx-text);
    padding: 10px 16px; border-radius: var(--dx-radius-md); font-size: 13px; font-weight: 500; box-shadow: var(--dx-shadow-float);
    max-width: min(90vw, 520px); text-align: center; pointer-events: none; animation: fade var(--dx-dur) var(--dx-ease) both;
  }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @container content (max-width: 640px) {
    .dlg { top: auto; bottom: 0; left: 0; transform: none; width: 100%; max-height: 92%; border-radius: var(--dx-radius-xl) var(--dx-radius-xl) 0 0; padding-bottom: calc(20px + env(safe-area-inset-bottom)); }
    .alert { top: auto; bottom: 16px; left: 16px; right: 16px; transform: none; width: auto; }
  }
`;

// src/version.ts
var VERSION = "2.0.0-alpha.4";

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
      <nav class="side" aria-label="Seitenleiste">
        <div class="inner">
          <div class="brand"><span class="logo"></span><div><div class="t">Heidi</div><div class="s">Dein Saugroboter</div></div></div>
          <div class="navlist">${es.map((e4) => this.item(e4))}</div>
          <div class="foot">${robotSvg}<div class="m">Dreame X60 Ultra</div><div class="version">dreame_x60 v${this.version}</div></div>
        </div>
      </nav>
      <nav class="tabbar" aria-label="Tab-Leiste">${es.filter((e4) => e4.tab).slice(0, TAB_MAX).map((e4) => this.item(e4))}</nav>`;
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
var shortOf = (id) => roomById(id)?.short;
var FAN_ICON = { Leise: "mdi:fan-speed-1", Standard: "mdi:fan-speed-2", Stark: "mdi:fan-speed-3", Turbo: "mdi:fan" };
var modusIcons = (modus) => modus === "Saugen" ? ["mdi:broom"] : modus === "Nur Wischen" ? ["mdi:water"] : ["mdi:broom", "mdi:water"];
function roomValueChips(v2) {
  const chips = [{ icons: modusIcons(v2.modus), text: v2.modus }, { icons: [FAN_ICON[v2.saug] ?? "mdi:fan"], text: v2.saug }];
  if (v2.modus !== "Saugen" && v2.wasser) chips.push({ icons: ["mdi:water-percent"], text: v2.wasser });
  if (v2.modus === "Nur Wischen" && v2.route) chips.push({ icons: ["mdi:routes"], text: v2.route });
  chips.push({ icons: ["mdi:repeat"], text: `${v2.wdh}\xD7` });
  return chips;
}
function stripModel(r4, roomValues) {
  if (!["cleaning", "paused"].includes(r4.vac)) return null;
  const seg = r4.currentSegment;
  const room = seg === null ? void 0 : roomById(seg);
  const v2 = room ? roomValues(room.id) : null;
  if (!room || !v2) return null;
  const { order, rest } = runOrder(r4);
  const restTxt = rest.map(shortOf).filter(Boolean).join(" \u2192 ");
  const first = order.length ? shortOf(order[0]) : void 0;
  if (r4.vac === "cleaning" && r4.cleanedArea === 0) {
    return { kind: "startpunkt", roomId: room.id, icon: "mdi:map-marker-path", head: "F\xE4hrt zum Startpunkt", right: first ? `zu ${first}` : "", chips: [] };
  }
  if (r4.activeSegments.length && !r4.activeSegments.includes(room.id)) {
    return { kind: "durchfahrt", roomId: room.id, icon: room.icon, head: `F\xE4hrt durch ${room.short}`, right: restTxt ? `zu ${restTxt}` : "", chips: [] };
  }
  return { kind: "jetzt", roomId: room.id, icon: room.icon, head: `Jetzt: ${room.short}`, right: restTxt ? `danach ${restTxt}` : "letzter Raum", chips: roomValueChips(v2) };
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
  .st.pill { padding: 4px 10px; border-radius: 999px; font-size: 12px; background: var(--dx-surface-raised); border: 1px solid var(--dx-border); }

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
    .params { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .param { background: var(--dx-surface-raised); border: 1px solid var(--dx-border); border-radius: var(--dx-radius-md); padding: 10px; display: grid; gap: 2px; min-height: 44px; text-align: left; }
    .param:hover { background: var(--dx-surface-active); }
    .param b { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .param span { font-size: 11px; color: var(--dx-text-muted); }
    .param ha-icon { --mdc-icon-size: 16px; width: 16px; height: 16px; color: var(--dx-text-muted); margin-bottom: 2px; }
    .ctl { display: flex; gap: 8px; }
    .ctl .btn { flex: 1; min-width: 0; padding: 0 10px; } .ctl .btn:first-child { flex: 1.4; }
    .strip small { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 2px; }
    .strip .chip { gap: 4px; }
    .strip > ha-icon:last-child { margin-left: auto; color: var(--dx-text-muted); align-self: center; }
    @container content (max-width: 640px) { .robotpic { max-width: 170px; } }
  `];
  }
  static {
    this.properties = { robot: { attribute: false }, rooms: { attribute: false }, api: { attribute: false } };
  }
  openRooms() {
    emit(this, EVENTS.openOverlay, { kind: "rooms", mode: "robot" });
  }
  /** Streifen aus Roboterzustand und Raumwerten (reine Funktion, billig). */
  get strip() {
    const r4 = this.robot, rooms = this.rooms;
    return r4 && rooms ? stripModel(r4, (id) => rooms.rooms[id]) : null;
  }
  /** Drei Werte: im Lauf die des aktuellen Raums, sonst der gemeinsame Wert aller Räume („–“ bei Abweichung oder unavailable). */
  params(strip) {
    const rooms = this.rooms;
    const cur = strip && rooms ? rooms.rooms[strip.roomId] : null;
    if (cur) return [cur.modus, cur.saug, cur.modus !== "Saugen" && cur.wasser ? cur.wasser : "\u2013"];
    const vals = rooms ? Object.values(rooms.rooms).filter((v2) => v2 !== null) : [];
    const common = (pick) => {
      if (!vals.length) return "\u2013";
      const first = pick(vals[0]);
      return first !== null && vals.every((v2) => pick(v2) === first) ? first : "\u2013";
    };
    return [common((v2) => v2.modus), common((v2) => v2.saug), common((v2) => v2.modus !== "Saugen" && v2.wasser ? v2.wasser : null)];
  }
  stationText(r4) {
    if (r4.running) return "unterwegs";
    if (r4.vac === "docked") return r4.charging ? "angedockt \xB7 l\xE4dt" : "angedockt";
    return STATUS_DE[r4.vac] ?? r4.vac;
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
          <div class="name">Heidi</div>
          <button class="st big ${DOT_CLASS[h3.dot]}" title="Status" @click=${() => moreInfo(this, r4.moreInfo.vac)}><i></i><span class="bigtext">${h3.big}</span></button>
          ${h3.sub ? b2`<div class="hint sub">${h3.sub}</div>` : A}
        </div>
        <div class="station"><div class="lbl">Station</div><div>${this.stationText(r4)}</div></div>
        ${robotSvg}
        <button class="batt" title="Akku" @click=${() => moreInfo(this, r4.moreInfo.battery)}>
          <div class="kv"><span class="v">${r4.battery}<span class="u"> %</span></span></div><div class="lbl">Akku</div>
          <div class="battbar ${battCls}" style="--p:${r4.battery}"><i></i></div>
        </button>
      </div>
      <div class="chips">${r4.persons.filter((p3) => p3.known).map((p3) => b2`<button class="chip ${p3.home ? "on" : ""} ${p3.counts ? "" : "dim"}" title="${p3.home ? "zu Hause" : "abwesend"}${p3.counts ? "" : " \xB7 z\xE4hlt nicht"}" @click=${() => moreInfo(this, p3.id)}><ha-icon icon=${p3.home ? "mdi:account" : "mdi:account-outline"}></ha-icon>${p3.name}</button>`)}${h3.roomChip ? b2`<span class="chip on"><ha-icon icon="mdi:floor-plan"></ha-icon>${h3.roomChip}</span>` : A}${h3.errorChip ? b2`<button class="chip ${h3.errorChip.level === "danger" ? "bad" : "warn"}" @click=${() => moreInfo(this, r4.moreInfo.error)}><ha-icon icon=${h3.errorChip.level === "danger" ? "mdi:alert" : "mdi:information-outline"}></ha-icon>${h3.errorChip.text}</button>` : A}<span class="chip" title="Nicht stören"><ha-icon icon="mdi:sleep"></ha-icon>${h3.dnd}</span></div>
      <div class="params">
        <button class="param" title="Reinigungsmodus" @click=${this.openRooms}><ha-icon icon="mdi:broom"></ha-icon><b>${modus}</b><span>Modus</span></button>
        <button class="param" title="Saugleistung" @click=${this.openRooms}><ha-icon icon="mdi:fan"></ha-icon><b>${saug}</b><span>Saugstufe</span></button>
        <button class="param" title="Wassermenge" @click=${this.openRooms}><ha-icon icon="mdi:water"></ha-icon><b>${wasser}</b><span>Wasser</span></button>
      </div>
      <div class="ctl">${h3.buttons.map((b3) => b2`<button class="btn ${b3.primary ? "primary" : ""}" data-svc=${b3.service} @click=${() => this.api?.vacuum(b3.service)}><ha-icon icon=${b3.icon}></ha-icon>${b3.label}</button>`)}</div>
      ${strip ? b2`<button class="note strip" title="Räume einstellen" @click=${this.openRooms}><ha-icon icon=${strip.icon}></ha-icon><div><b>${strip.head}</b> <small>${strip.right}${strip.chips.length ? b2` · ` : A}${strip.chips.map((c4) => b2`<span class="chip k">${c4.icons.map((i5) => b2`<ha-icon icon=${i5}></ha-icon>`)}${c4.text}</span>`)}</small></div><ha-icon icon="mdi:chevron-right"></ha-icon></button>` : A}
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
    this.properties = { robot: { attribute: false }, rooms: { attribute: false } };
  }
  render() {
    const r4 = this.robot;
    if (!r4 || !r4.running) return b2``;
    const { order, idx, rest } = runOrder(r4);
    const total = order.length;
    const startpunkt = r4.vac === "cleaning" && r4.cleanedArea === 0;
    const cur = startpunkt ? -1 : idx;
    const done = startpunkt || idx < 0 ? 0 : idx;
    const pct = total ? Math.round(done / total * 100) : 0;
    const nextId = startpunkt ? order[0] : rest[0];
    const next = nextId !== void 0 ? roomById(nextId) : void 0;
    const nextVals = next && this.rooms ? this.rooms.rooms[next.id] : null;
    const short = (id) => roomById(id)?.short ?? String(id);
    return b2`
      <div class="hd"><h2>Aktueller Auftrag</h2><span class="st pill ${DOT_CLASS2[r4.hero.dot]}"><i></i>${r4.hero.big}</span></div>
      <div>
        <div class="lbl route">${total ? order.map((id, i5) => b2`${i5 ? " \u2192 " : ""}${i5 === cur ? b2`<b>${short(id)}</b>` : short(id)}`) : r4.room !== "\u2013" ? b2`<b>${r4.room}</b>` : "R\xE4ume \u2013"}</div>
        <div class="kv"><span class="v">${r4.cleaningTime}<span class="u"> min</span></span><span class="u">· ${r4.cleanedArea} m²</span></div>
      </div>
      ${total ? b2`<div><div class="meter two"><span class="n">Räume</span><span class="p">${done} / ${total}</span></div><div class="bar" style="--p:${pct}"><i></i></div></div>` : A}
      ${next ? b2`<div class="row next"><div><div class="s">${startpunkt ? "Erster Raum" : "N\xE4chster Raum"}</div><div class="t">${next.short}</div></div>${nextVals ? b2`<span class="tag">${nextVals.modus}</span>` : A}</div>` : total ? b2`<div class="row next"><div><div class="s">Letzter Raum</div><div class="t">${cur >= 0 ? short(order[cur]) : "\u2013"}</div></div></div>` : A}
    `;
  }
};
if (!customElements.get(AUFTRAG_ELEMENT)) customElements.define(AUFTRAG_ELEMENT, DxAuftrag);

// src/dreame-x60-panel.ts
var ELEMENT = "dreame-x60-panel";
var TOAST_MS = 1900;
var GREETING = (h3) => h3 < 11 ? "Guten Morgen" : h3 < 18 ? "Guten Tag" : "Guten Abend";
var DreameX60Panel = class extends i4 {
  constructor() {
    super();
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
    this.addEventListener(EVENTS.openOverlay, (e4) => this.openOverlay(e4.detail));
    this.addEventListener(EVENTS.close, () => this.closeOverlay());
    this.addEventListener(EVENTS.back, () => this.backOverlay());
    this.addEventListener(EVENTS.confirm, () => this.confirmOverlay());
    this.addEventListener(EVENTS.toast, (e4) => this.toast(String(e4.detail ?? "")));
    this.addEventListener(EVENTS.navigate, (e4) => navigate(toPage(e4.detail?.page)));
  }
  static {
    this.styles = [tokens, base, shell];
  }
  static {
    this.properties = {
      hass: { attribute: false },
      _config: { state: true },
      _overlay: { state: true },
      _toast: { state: true },
      _now: { state: true }
    };
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
    super.disconnectedCallback();
  }
  /** Nächster Tick zur vollen Minute (+50 ms), damit die Uhr nie eine Minute hinterherhinkt. */
  tickClock() {
    this._now = Date.now();
    this._clockTimer = setTimeout(() => this.tickClock(), 6e4 - Date.now() % 6e4 + 50);
  }
  // ───────── HA-Schnittstelle der Karte ─────────
  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("dreame-x60-panel: Konfiguration fehlt");
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
          ${page === "start" ? this.renderStart(s4, robot) : this.renderPage(page, s4)}
        </main>
      </div></div>
      ${this.renderOverlay()}
      ${this._toast ? b2`<div class="toast" role="status">${this._toast}</div>` : A}
    `;
  }
  /** Kopfzeile: Übersicht mit Tagesgruß bzw. „Heidi ist unterwegs“, Unterseiten mit Zurück-Knopf; rechts Uhr, Zuhause, Nicht stören. */
  renderTopbar(page, robot) {
    const now = new Date(this._now);
    let title, sub;
    if (page === "start") {
      const name = (this.hass?.user?.name ?? "").trim();
      title = robot.running ? "Heidi ist unterwegs" : `${GREETING(now.getHours())}${name ? ", " + name : ""}!`;
      sub = robot.hero.sub ? `${robot.hero.big} \xB7 ${robot.hero.sub}` : robot.hero.big;
    } else {
      ({ title, sub } = PAGE_TITLE[page]);
    }
    const home = robot.persons.filter((p3) => p3.known && p3.home).map((p3) => p3.name);
    return b2`
      <div class="topbar">
        ${page !== "start" ? b2`<button class="back" @click=${() => navigate("start")}><ha-icon icon="mdi:chevron-left"></ha-icon>Übersicht</button>` : A}
        <div><h1>${title}</h1><div class="sub">${sub}</div></div>
        <div class="meta">
          <div class="mi"><ha-icon icon="mdi:clock-outline"></ha-icon><div><b>${now.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })}</b><small>${now.toLocaleDateString("de-AT", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</small></div></div>
          <div class="mi"><ha-icon icon="mdi:home-outline"></ha-icon><div><b>${home.length ? "Zu Hause" : "Niemand zu Hause"}<span class="dot ${home.length ? "on" : ""}"></span></b><small>${home.length ? home.join(" \xB7 ") + " anwesend" : "alle unterwegs"}</small></div></div>
          <div class="mi"><ha-icon icon="mdi:weather-night"></ha-icon><div><b>${robot.hero.dnd}</b><small>Nicht stören</small></div></div>
        </div>
      </div>`;
  }
  /** Bento-Übersicht (Bauplan 4.0): Bausteine, wo sie schon existieren (4.1 dx-hero, dx-auftrag), sonst Platzhalter mit einer Vorschau der Sichten. */
  renderStart(s4, robot) {
    const entities = Object.keys(s4).length;
    const plans = readPlans(s4);
    const prog = readPrognose(s4);
    const hist = readHistory(s4);
    const map = readMap(s4);
    const rooms = readAllRoomValues(s4);
    const lines = {
      map: [entities ? `${entities} Entit\xE4ten verbunden` : "keine Zustandsdaten", `Kartendarstellung: ${map.karte} \xB7 Kalibrierung: ${Array.isArray(map.calibrationPoints) ? map.calibrationPoints.length + " Punkte" : "fehlt"}`],
      automatik: [`Automatik: ${readAutomatik(s4).status || "\u2013"}`],
      heute: [`Heutiger Eintrag: ${plans.heuteName || "\u2013"}${plans.heuteZeit ? " \xB7 " + plans.heuteZeit : ""}`, prog.aktiv ? `Freies Fenster ${prog.freiesFenster} \xB7 R\xFCckkehr ${prog.rueckkehr}` : "Prognose aus"],
      planer: plans.plans.slice(0, 3).map((x2) => `${x2.n} ${x2.name || "\u2013"} \xB7 ${x2.aktiv ? "aktiv" : "inaktiv"} \xB7 ${x2.zeit}`),
      consumables: [readConsumables(s4).map((c4) => `${c4.name} ${c4.pct} %`).join(", ")],
      station: [readStation(s4).tiles.map((x2) => `${x2.label} ${x2.value}`).join(", ")],
      stats: [`${hist.count} L\xE4ufe \xB7 ${hist.totalArea} m\xB2 \xB7 ${hist.totalTime} min`],
      quickstart: [`R\xE4ume: ${ROOMS.map((r4) => r4.short).join(", ")}`],
      history: [`${hist.entries.length} Eintr\xE4ge${hist.stale ? " \xB7 letzter Stand" : ""}`]
    };
    const box = (sl) => b2`
      <section class="b ${sl.span}" data-slot=${sl.slot}>
        <div class="hd"><h2>${sl.title}</h2><span class="r">${sl.part}</span></div>
        ${(lines[sl.slot] ?? []).map((l3) => b2`<div class="hint preview">${l3}</div>`)}
        <div class="hint">Platzhalter – entsteht in Aufgabe ${sl.task}.</div>
      </section>`;
    const rest = START_SLOTS.filter((sl) => !["hero", "map", "automatik", "auftrag", "heute"].includes(sl.slot));
    return b2`
      <div class="bento">
        <dx-hero class="b span3" data-slot="hero" .robot=${robot} .rooms=${rooms} .api=${this.api}></dx-hero>
        ${box(startSlot("map"))}
        <div class="span3 stack rightstack">
          ${robot.running ? b2`<dx-auftrag class="b" data-slot="auftrag" .robot=${robot} .rooms=${rooms}></dx-auftrag>` : box(startSlot("automatik"))}
          ${box(startSlot("heute"))}
        </div>
        ${rest.map(box)}
      </div>`;
  }
  /** Unterseiten: bis zur jeweiligen Karte in Phase 4 ein Platzhalter mit einer Vorschau der Sichten, damit die Verdrahtung sichtbar ist. */
  renderPage(page, s4) {
    const preview = [];
    if (page === "reinigen") {
      const m2 = readMap(s4);
      preview.push(`Kartendarstellung: ${m2.karte} \xB7 St\xFChle am Boden: ${m2.chairs ? "an" : "aus"} \xB7 Kalibrierung: ${Array.isArray(m2.calibrationPoints) ? m2.calibrationPoints.length + " Punkte" : "fehlt"}`);
    }
    if (page === "planer") {
      const p3 = readPlans(s4);
      preview.push(...p3.plans.map((x2) => `${x2.n} ${x2.name || "\u2013"} \xB7 ${x2.aktiv ? "aktiv" : "inaktiv"} \xB7 ${x2.raeume.length} R\xE4ume \xB7 ${x2.zeit}`));
      preview.push(`Lernwerte: ${readLearn(s4) ? "vorhanden" : "keine"}`);
    }
    if (page === "protokoll") {
      const h3 = readHistory(s4);
      preview.push(`${h3.entries.length} Eintr\xE4ge \xB7 ${h3.count} L\xE4ufe \xB7 ${h3.totalArea} m\xB2 \xB7 ${h3.totalTime} min${h3.stale ? " \xB7 letzter Stand" : ""}`);
    }
    if (page === "prognose") {
      const p3 = readPrognose(s4);
      preview.push(p3.aktiv ? `${p3.state} \xB7 ${p3.tage} Tage \xB7 frei ${p3.freiesFenster} \xB7 R\xFCckkehr ${p3.rueckkehr}` : "Prognose aus");
    }
    if (page === "einstellungen") {
      const d3 = readDiagnostics(s4);
      const r4 = readRobotSettings(s4);
      preview.push(`Karte ${readSettings(s4).karte.value} \xB7 Diagnose: ${d3.missing.length} fehlend, ${d3.unavailable.length} unavailable von ${d3.total}`);
      preview.push(`Roboter: ${r4.selects.map((x2) => `${x2.label} ${x2.value}`).join(", ")} \xB7 DND ${r4.dndStart}\u2013${r4.dndEnd}`);
    }
    const entities = Object.keys(s4).length;
    return b2`
      <div class="bento">
        <section class="b span12">
          <div class="hd"><h2>Seite „${page}“</h2><span class="r">${entities ? `${entities} Entit\xE4ten verbunden` : "keine Zustandsdaten"}</span></div>
          <div class="lbl">Hier entstehen</div>
          <ul class="hint list">${PAGE_PARTS[page].map((p3) => b2`<li>${p3}</li>`)}</ul>
          <div class="lbl">Sichten (Vorschau aus den Selektoren)</div>
          <ul class="hint list preview">${preview.map((p3) => b2`<li>${p3}</li>`)}</ul>
          <div class="hint">Platzhalter aus Aufgabe 3.3 – Optik nach Mockup <code>dreame_x60/mockups/bento.html</code>.</div>
        </section>
      </div>`;
  }
  /** Overlay: bis 4.2 (dx-dialog) ein Platzhalter-Rahmen; confirm ist schon bedienbar. */
  renderOverlay() {
    const o5 = this._overlay;
    if (!o5) return A;
    if (o5.kind === "confirm") {
      return b2`<div class="overlay" data-kind="confirm"><div class="scrim" @click=${() => this.closeOverlay()}></div>
        <div class="alert" role="alertdialog" aria-modal="true"><div class="m">${o5.text}${o5.sub ? b2`<small>${o5.sub}</small>` : A}</div>
          <div class="b"><button @click=${() => this.closeOverlay()}>Abbrechen</button><button class=${o5.danger ? "danger" : ""} @click=${() => this.confirmOverlay()}>${o5.okLabel ?? "OK"}</button></div></div></div>`;
    }
    return b2`<div class="overlay" data-kind=${o5.kind}><div class="scrim" @click=${() => this.closeOverlay()}></div>
      <div class="dlg" role="dialog" aria-modal="true"><h2>Overlay „${o5.kind}“ <button class="iconbtn" aria-label="Schließen" @click=${() => this.closeOverlay()}>✕</button></h2>
        <div class="hint">Platzhalter – der Dialog entsteht in Phase 4 (dx-dialog 4.2).</div>
        <div class="foot">${"back" in o5 && o5.back ? b2`<button class="btn" @click=${() => this.backOverlay()}>Zurück</button>` : A}<button class="btn primary" @click=${() => this.closeOverlay()}>Schließen</button></div></div></div>`;
  }
};
if (!customElements.get(ELEMENT)) customElements.define(ELEMENT, DreameX60Panel);
window.customCards = window.customCards ?? [];
if (!window.customCards.some((c4) => c4.type === ELEMENT)) {
  window.customCards.push({ type: ELEMENT, name: "Heidi (dreame_x60)", description: "Heidi-Karte v2 \u2013 \xDCbersicht und Unterseiten des Saugroboters", preview: false });
}
console.info(`%c dreame_x60 %c v${VERSION} `, "background:#0b1015;color:#58b7f6;font-weight:600", "background:#0b1015;color:#e7edf3");
export {
  DreameX60Panel,
  ELEMENT,
  PAGES
};
