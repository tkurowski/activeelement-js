//

function ActiveElement(conf) {
    Descriptor.apply(this, arguments);

    if (this.get && this.set) return;

    var type = conf.type || 'element',
        accessor;

    switch (type) {
    case 'node':
    case 'el':
    case 'element':
        accessor = 'Element';
        break;
    case 'style':
    case 'css':
         accessor = 'Style';
        break;
    case 'attr':
    case 'attribute':
        accessor = 'Attribute';
        break;
    case 'prop':
    case 'property':
        accessor = 'Property';
        break;
    case 'class':
        accessor = 'Class';
        break;
    default:
        accessor = null;
    }

    if (accessor) {
        this.get || (this.get = ActiveElement['get' + accessor]);
        this.set || (this.set = ActiveElement['set' + accessor]);
    }
}

Descriptor.subclass(ActiveElement);

/**
 * Get root element of the owner
 * @return {HTMLElement}
 */
ActiveElement.prototype.el = function (owner, prop) {
    var selector = this.conf.selector,
        el = owner[this.conf.el || 'el'];

    return selector ? el.querySelector(selector) : el;
};

ActiveElement.prototype.prop = function (owner, prop) {
    var conf = this.conf;
    return conf.property || conf.prop || conf.name || prop;
};


// class helpers

ActiveElement.getElement = function (des, prop) {
    return des.el(this, prop);
};
ActiveElement.setElement = function (des, prop, value) {
    var el = des.el(this, prop);
    el.parentNode.repplaceChild(/*newel=*/value, el);
};

ActiveElement.getProperty = function (des, prop) {
    var el = des.el(this, prop);
    prop = des.prop(this, prop);
    return el[prop];
};
ActiveElement.setProperty = function (des, prop, value) {
    var el = des.el(this, prop);
    prop = des.prop(this, prop);
    el[prop] = value;
};

ActiveElement.getAttribute = function (des, prop) {
    var el = des.el(this, prop);
    prop = des.prop(this, prop);
    return el.getAttribute(prop);
};
ActiveElement.setAttribute = function (des, prop, value) {
    var el = des.el(this, prop);
    prop = des.prop(this, prop);
    el.setAttribute(prop);
};

ActiveElement.getStyle = function (des, prop) {
    var el = des.el(this, prop);
    prop = des.prop(this, prop);
    var conf = des.conf,
        value = conf.live ? window.getComputedStyle(el)[prop] :
            el.style[prop];
    return conf.parser ? conf.parser(value) : value;
};

ActiveElement.__serializer = function (des, prop, value) {
    if (typeof value === 'number') {
        value += prop === 'opacity' ? '' : des.conf.unit || 'px';
    }
    return value;
};
ActiveElement.setStyle = function (des, prop, value) {
    var el = des.el(this, prop);
    prop = des.prop(this, prop);
    var serializer = des.conf.serializer || ActiveElement.__serializer;
    el.style[prop] = serializer(des, prop, value);
};

ActiveElement.getClass = function (des, prop) {
    var el = des.el(this, prop);
    prop = des.prop(this, prop);
    return el.classList.contains(prop);
};
ActiveElement.setClass = function (des, prop, value) {
    var el = des.el(this, prop);
    prop = des.prop(this, prop);
    if (value) {
        el.classList.add(prop);
    }
    else {
        el.classList.remove(prop);
    }
};
