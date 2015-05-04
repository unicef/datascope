// InterfaceMixin takes a list of string "interfaces"
// and adds a static called implementsInterface to the component that simply checks if an interface is in the list
// This way, a parent component can pass particular props only to children which implement the relevant interface
// by checking child.type.implementsInterface('SomeInterface')
// usage:
// mixins: [InterfaceMixin('SomeInterface')] // or...
// mixins: [InterfaceMixin(['SomeInterface', 'AnotherInterface'])]

var InterfaceMixin = function(interfaces) {
    interfaces = isStr(interfaces) ? [interfaces] : interfaces;

    return {
        statics: {
            implementsInterface(name) { return interfaces.indexOf(name) >= 0; }
        }
    }
};

function isStr(s){ return typeof s === "string" || s instanceof String; }

module.exports = InterfaceMixin;