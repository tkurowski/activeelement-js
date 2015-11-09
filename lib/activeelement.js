//

function ActiveElement(conf) {
    Descriptor.apply(this, arguments);

    if (this.get && this.set) return;

    var accessors = ActiveElement._descriptors[conf.type || 'el'];
    if (accessors) {
        this.get || (this.get = accessors.get);
        this.set || (this.set = accessors.set);
    }
}

ActiveElement._descriptors = {};

Descriptor.subclass(ActiveElement);

/**
 * Get target Element. Try `conf.el` then `conf.selector`;
 * return conf.el or owner[conf.el] or root.querySelector(conf.selector) or root
 * where root is conf.root or owner[conf.root]
 * @return {HTMLElement}
 */
ActiveElement.prototype.el = function (owner, prop) {
    var el = this.conf.el || 'el';
    if (typeof el === 'string') el = owner[el];
    var selector = this.conf.selector;
    return selector ? el.querySelector(selector) : el;
};

ActiveElement.prototype.prop = function (owner, prop) {
    var conf = this.conf;
    return conf.property || conf.prop || conf.name || prop;
};



ActiveElement.registerDescriptor = function (names, accessors) {
    if (typeof names === 'string') {
        names = [names];
    }
    names.forEach(function (name) {
        this._descriptors[name] = accessors;
    }, this);
    return this;
};


// descriptors

ActiveElement.registerDescriptor(['el', 'element', 'node'], {
    get: function (des, prop) {
        return des.el(this, prop);
    },
    set: function (des, prop, value) {
        var el = des.el(this, prop);
        el.parentNode.replaceChild(/*newel=*/value, el);
    }
}).registerDescriptor(['prop', 'property'], {
    get: function (des, prop) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        return el[prop];
    },
    set: function (des, prop, value) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        el[prop] = value;
    }
}).registerDescriptor(['attr', 'attribute'], {
    get: function (des, prop) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        return el.getAttribute(prop);
    },
    set: function (des, prop, value) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        el.setAttribute(prop, value);
    }
}).registerDescriptor(['style', 'css'], {
    get: function (des, prop) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        var conf = des.conf,
            value = conf.live ? window.getComputedStyle(el)[prop] :
                el.style[prop];
        return conf.parser ? conf.parser(value) : value;
    },
    set: function (des, prop, value) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        var serializer = des.conf.serializer || ActiveElement.__serializer;
        el.style[prop] = serializer(value, prop, des);
    }
}).registerDescriptor('class', {
    get: function (des, prop) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        return el.classList.contains(prop);
    },
    set: function (des, prop, value) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        if (value) {
            el.classList.add(prop);
        }
        else {
            el.classList.remove(prop);
        }
    }
}).registerDescriptor(['mode', 'classmode'], {
    get: function (des, prop) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        if (Array.isArray(prop)) {
            var present = prop.filter(function (cls) {
                return cls && el.classList.contains(cls);
            });
            if (present.length > 1) {
                throw new Error("Multiple values: " + present.join(", "));
            }
            return present.length ? present[0] : null;
        }
        else {
            // '-' are not allowed in data-* attributes
            var mode = 'mode_' + prop.replace('-', '_');
            return el.dataset[mode] || null;
        }
    },
    set: function (des, prop, value) {
        var el = des.el(this, prop);
        prop = des.prop(this, prop);
        if (Array.isArray(prop)) {
            if (value && prop.indexOf(value) === -1) {
                throw new Error("Unexpected value " + value +
                                "; valid choices are: " + prop.join(", "));
            }
            el.classList.remove.apply(el.classList, prop);
            if (value) el.classList.add(value);
        }
        else {
            var mode = 'mode_' + prop.replace('-', '_'),
                current = el.dataset[mode];
            if (value == current) return; // allow conversion: null,  undefined
            if (current) el.classList.remove(current);
            if (value) {
                el.classList.add(el.dataset[mode] = value);
            }
            else {
                // el.removeAttribute(...)
                delete el.dataset[mode];
            }
        }
    }
});

ActiveElement.__serializer = function (value, prop, des) {
    if (typeof value === 'number') {
        value += prop === 'opacity' ? '' : des.conf.unit || 'px';
    }
    return value;
};

// helpers

ActiveElement.html = function (conf) {
    conf || (conf = {});
    conf.type = 'prop';
    conf.name = 'innerHTML';
    return conf;
};

ActiveElement.text = function (conf) {
    conf || (conf = {});
    conf.type = 'prop';
    conf.name = 'textContent';
    return conf;
};

ActiveElement.cls = function (conf) {
    conf || (conf = {});
    conf.type = 'class';
    return conf;
};
