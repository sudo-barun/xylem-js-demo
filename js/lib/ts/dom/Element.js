import combineNamedStores from "../core/combineNamedStores.js";
import Component from "./Component.js";
import createAttributeFunction from "./createAttributeFunction.js";
import map from "../core/map.js";
import NativeComponent from "./NativeComponent.js";
import setAttribute from "./setAttribute.js";
export default class Element extends NativeComponent {
    tagName;
    attributes;
    children;
    listeners;
    elementStoreSubscriber;
    _domNode;
    _virtualDom;
    constructor(tagName, attributes = {}, children = []) {
        super();
        this.tagName = tagName;
        this.attributes = attributes;
        this.children = children;
        this.listeners = {};
        this._virtualDom = children;
    }
    setup(modifier) {
        this.children.forEach(virtualNode => {
            if ((virtualNode instanceof Component) || (virtualNode instanceof Element)) {
                virtualNode.setup(modifier);
            }
        });
    }
    createDomNode() {
        return document.createElement(this.tagName);
    }
    setupDom() {
        const nodeExists = !!this._domNode;
        const element = this._domNode = this._domNode || this.createDomNode();
        if (this.elementStoreSubscriber) {
            this.elementStoreSubscriber(element);
        }
        Object.keys(this.attributes).forEach((attr) => {
            if (attr === '()') {
                this.attributes[attr](element, attr);
            }
            else if (typeof this.attributes[attr] === 'function') {
                createAttributeFunction(this.attributes[attr])(element, attr);
            }
            else if (attr === 'class' && typeof this.attributes[attr] === 'object') {
                createAttributeFunction(attrClass(this.attributes[attr]))(element, attr);
            }
            else if (attr === 'style' && typeof this.attributes[attr] === 'object') {
                createAttributeFunction(attrStyle(this.attributes[attr]))(element, attr);
            }
            else {
                setAttribute(element, attr, this.attributes[attr]);
            }
        });
        Object.keys(this.listeners).forEach((event) => {
            element.addEventListener(event, this.listeners[event]);
        });
        this.children.forEach(node => node.setupDom());
        if (!nodeExists) {
            this.getChildNodes().forEach((node) => {
                element.appendChild(node);
            });
        }
    }
    setDomNode(domNode) {
        this._domNode = domNode;
    }
    getDomNode() {
        return this._domNode;
    }
    getChildNodes() {
        return this.children.map(c => c.getDomNodes())
            .reduce((acc, item) => {
            acc.push(...item);
            return acc;
        }, []);
    }
    notifyAfterAttachToDom() {
        this._virtualDom.forEach((vDomItem) => {
            if ((vDomItem instanceof Component) || (vDomItem instanceof Element)) {
                vDomItem.notifyAfterAttachToDom();
            }
        });
    }
    notifyBeforeDetachFromDom() {
        this._virtualDom.forEach((vDomItem) => {
            if ((vDomItem instanceof Component) || (vDomItem instanceof Element)) {
                vDomItem.notifyBeforeDetachFromDom();
            }
        });
    }
    detachFromDom() {
        this._domNode.parentNode.removeChild(this._domNode);
    }
}
function attrStyle(styleDefinitions) {
    if (styleDefinitions instanceof Array) {
        return map(attrStyle(styleDefinitions[1]), (v) => {
            if (v) {
                return [styleDefinitions[0], v].join(' ');
            }
            else {
                return styleDefinitions[0];
            }
        });
    }
    else {
        return map(combineNamedStores(styleDefinitions), (v) => {
            return Object.keys(v).reduce((acc, cssProperty) => {
                acc.push(`${cssProperty}:${styleDefinitions[cssProperty]}`);
                return acc;
            }, []).join('; ');
        });
    }
}
function attrClass(classDefinitions) {
    if (classDefinitions instanceof Array) {
        return map(attrClass(classDefinitions[1]), (v) => {
            if (v) {
                return [classDefinitions[0], v].join(' ');
            }
            else {
                return classDefinitions[0];
            }
        });
    }
    else {
        return map(combineNamedStores(classDefinitions), (v) => {
            return Object.keys(v).reduce((acc, className) => {
                if (v[className]) {
                    acc.push(className);
                }
                return acc;
            }, []).join(' ');
        });
    }
}
