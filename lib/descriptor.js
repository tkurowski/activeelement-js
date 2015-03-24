//

function Descriptor(conf) {
    this.conf = conf;
    this.get = conf.get;
    this.set = conf.set;
}

Descriptor.newDescriptor = function (descriptor) {
    if (descriptor instanceof this) {
        return descriptor;
    }
    else if (descriptor instanceof Descriptor) {
        return new this(descriptor.conf);
    }
    else {
        return new this(descriptor);
    }
};

Descriptor.defineDescriptor = function (obj, name, descriptor) {
    descriptor = this.newDescriptor(descriptor);
    Object.defineProperty(obj, name, {
        get: function () {
            return descriptor.get.call(this, descriptor, name);
        },
        set: function (value) {
            descriptor.set.call(this, descriptor, name, value);
        }
    });
    return obj;
};

Descriptor.defineDescriptors = function (obj, descriptors) {
    Object.keys(descriptors).forEach(function (name) {
        this.defineDescriptor(obj, name, descriptors[name]);
    }, this);
    return obj;
};


Descriptor.subclass = function (subclass) {
    subclass.newDescriptor = this.newDescriptor;
    subclass.defineDescriptor = this.defineDescriptor;
    subclass.defineDescriptors = this.defineDescriptors;
};
