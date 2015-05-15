// InterfaceMixin takes a list of string "interfaces"
// and adds a static called implementsInterface to the component that simply checks if an interface is in the list
// This way, a parent component can pass particular props only to children which implement the relevant interface
// by checking child.type.implementsInterface('SomeInterface')
// usage:
// mixins: [InterfaceMixin('SomeInterface')] // or...
// mixins: [InterfaceMixin(['SomeInterface', 'AnotherInterface'])]

export default function InterfaceMixin(...interfaces) {
    return {
        statics: {
            implementsInterface(name) { return interfaces.indexOf(name) >= 0; }
        }
    }
};
