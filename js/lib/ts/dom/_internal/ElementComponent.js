import applyNativeComponentMixin from "./applyNativeComponentMixin.js";
import combineNamedDataNodes from "../../core/combineNamedDataNodes.js";
import Component from "../Component.js";
import isDataNode from "../../utilities/isDataNode.js";
import map from "../../core/map.js";
export default class ElementComponent {
    constructor(tagName, attributes = {}, children = []) {
        this._tagName = tagName;
        this._attributes = attributes;
        this._children = children;
        this._listeners = {};
        this._elementSubscriber = null;
        this._isSelfClosing = false;
        this._domNode = undefined;
    }
    tagName() {
        return this._tagName;
    }
    attributes() {
        return this._attributes;
    }
    children() {
        return this._children;
    }
    listeners() {
        return this._listeners;
    }
    addListener(eventName, listener) {
        this._listeners[eventName] = listener;
    }
    elementSubscriber(subscriber) {
        if (arguments.length !== 0) {
            this._elementSubscriber = subscriber;
        }
        return this._elementSubscriber;
    }
    isSelfClosing(isSelfClosing) {
        if (arguments.length !== 0) {
            this._isSelfClosing = isSelfClosing;
        }
        return this._isSelfClosing;
    }
    setup(modifier) {
        this._children.forEach(child => {
            if ((child instanceof Component) || (child instanceof ElementComponent)) {
                child.setup(modifier);
            }
        });
    }
    createDomNode() {
        return document.createElement(this._tagName);
    }
    setupDom() {
        const nodeExists = !!this._domNode;
        const element = this._domNode = this._domNode || this.createDomNode();
        if (this._elementSubscriber) {
            if (typeof this._elementSubscriber === 'function') {
                this._elementSubscriber(element);
            }
            else {
                this._elementSubscriber._(element);
            }
        }
        Object.keys(this._attributes).forEach((attr) => {
            if (attr === '()') {
                this._attributes[attr](element, attr);
            }
            else if (isDataNode(this._attributes[attr])) {
                createAttributeFunction(this._attributes[attr])(element, attr);
            }
            else if (attr === 'class' && typeof this._attributes[attr] === 'object') {
                createAttributeFunction(attrClass(this._attributes[attr]))(element, attr);
            }
            else if (attr === 'style' && typeof this._attributes[attr] === 'object') {
                createAttributeFunction(attrStyle(this._attributes[attr]))(element, attr);
            }
            else {
                setAttribute(element, attr, this._attributes[attr]);
            }
        });
        Object.keys(this._listeners).forEach((event) => {
            element.addEventListener(event, this._listeners[event]);
        });
        this._children.forEach(node => node.setupDom());
        if (!nodeExists) {
            this.getChildNodes().forEach((node) => {
                element.appendChild(node);
            });
        }
    }
    getChildNodes() {
        return this._children.map(c => c.domNodes())
            .reduce((acc, item) => {
            acc.push(...item);
            return acc;
        }, []);
    }
    notifyAfterAttachToDom() {
        this._children.forEach((vDomItem) => {
            if ((vDomItem instanceof Component) || (vDomItem instanceof ElementComponent)) {
                vDomItem.notifyAfterAttachToDom();
            }
        });
    }
    notifyBeforeDetachFromDom() {
        this._children.forEach((vDomItem) => {
            if ((vDomItem instanceof Component) || (vDomItem instanceof ElementComponent)) {
                vDomItem.notifyBeforeDetachFromDom();
            }
        });
    }
}
applyNativeComponentMixin(ElementComponent);
class CombineStyleStringAndArray {
    constructor(classDefinition) {
        this._classDefinition = classDefinition;
    }
    _(v) {
        if (v) {
            return [this._classDefinition, v].join(' ');
        }
        else {
            return this._classDefinition;
        }
    }
}
function stringObjectToStringMapper(v) {
    return Object.keys(v).reduce((acc, cssProperty) => {
        acc.push(`${cssProperty}: ${v[cssProperty]}`);
        return acc;
    }, []).join('; ');
}
function attrStyle(styleDefinitions) {
    if (styleDefinitions instanceof Array) {
        return map(attrStyle(styleDefinitions[1]), new CombineStyleStringAndArray(styleDefinitions[0]));
    }
    else {
        return map(combineNamedDataNodes(styleDefinitions), stringObjectToStringMapper);
    }
}
function classObjectToStringMapper(v) {
    return Object.keys(v).reduce((acc, className) => {
        if (v[className]) {
            acc.push(className);
        }
        return acc;
    }, []).join(' ');
}
class CombineClassStringAndArray {
    constructor(classDefinition) {
        this._classDefinition = classDefinition;
    }
    _(v) {
        if (v) {
            return [this._classDefinition, v].join(' ');
        }
        else {
            return this._classDefinition;
        }
    }
}
function attrClass(classDefinitions) {
    if (classDefinitions instanceof Array) {
        return map(attrClass(classDefinitions[1]), new CombineClassStringAndArray(classDefinitions[0]));
    }
    else {
        return map(combineNamedDataNodes(classDefinitions), classObjectToStringMapper);
    }
}
class AttributeSubscriber {
    constructor(element, attributeName) {
        this._element = element;
        this._attributeName = attributeName;
    }
    _(value) {
        setAttribute(this._element, this._attributeName, value);
    }
}
function createAttributeFunction(dataNode) {
    return function (element, attributeName) {
        setAttribute(element, attributeName, dataNode._());
        dataNode.subscribe(new AttributeSubscriber(element, attributeName));
    };
}
function setAttribute(element, name, value) {
    if (value === true) {
        element.setAttribute(name, '');
    }
    else if ([undefined, null, false].indexOf(value) !== -1) {
        element.removeAttribute(name);
    }
    else {
        element.setAttribute(name, value);
    }
}