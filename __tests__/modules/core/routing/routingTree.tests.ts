import { ITypeConverter } from "../../../../src/modules/core/converters/converter";
import { HTTPMethod } from "../../../../src/modules/core/constants";
import { RouteEndpoint, RouteHandler } from "../../../../src/modules/core/routing/core";
import { RoutingTree } from "../../../../src/modules/core/routing/routingTree";

test('RoutingTree: distinct routes plain match', () => {
    var tree: RoutingTree = new RoutingTree();

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };
    var handler2: RouteHandler = {
        handler: 'h2',
        controller: undefined
    }

    tree.registerRoute(HTTPMethod.GET, "api/v1/method1", handler1);
    tree.registerRoute(HTTPMethod.GET, "api/v1/method2", handler2);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method1', isCaseSensitive: true} ]});
    expect(tree.match(HTTPMethod.GET, "api/v1/method2", undefined)).toEqual<RouteEndpoint>({handlers: [handler2], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method2', isCaseSensitive: true} ]});
    
    //Negative tests
    expect(tree.match(HTTPMethod.POST, "api/v1/method1", undefined)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "api/v1/METHOD1", undefined)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "api/v1/method3", undefined)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "api/v1/method11", undefined)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "api/v1", undefined)).toBeUndefined();
});

test('RoutingTree: overlapping plain match', () => {
    var tree: RoutingTree = new RoutingTree();

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };
    var handler2: RouteHandler = {
        handler: 'h2',
        controller: undefined
    }

    tree.registerRoute(HTTPMethod.GET, "api/v1/method1", handler1);
    tree.registerRoute(HTTPMethod.GET, "api/v1", handler2);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method1', isCaseSensitive: true} ]});
    expect(tree.match(HTTPMethod.GET, "api/v1", undefined)).toEqual<RouteEndpoint>({handlers: [handler2], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true} ]});
    
    //Negative tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method3", undefined)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "api/V1", undefined)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "api/v12", undefined)).toBeUndefined();
});

test('RoutingTree: case-insensitive plain match', () => {
    var tree: RoutingTree = new RoutingTree();

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };
    var handler2: RouteHandler = {
        handler: 'h2',
        controller: undefined
    }

    tree.registerRoute(HTTPMethod.GET, "api/v1/method1", handler1, false);
    tree.registerRoute(HTTPMethod.GET, "api/v1", handler2, false);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: false}, {pattern: 'v1', isCaseSensitive: false}, {pattern: 'method1', isCaseSensitive: false} ]});
    expect(tree.match(HTTPMethod.GET, "aPi/V1/MeTHoD1", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: false}, {pattern: 'v1', isCaseSensitive: false}, {pattern: 'method1', isCaseSensitive: false} ]});
    expect(tree.match(HTTPMethod.GET, "apI/V1", undefined)).toEqual<RouteEndpoint>({handlers: [handler2], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: false}, {pattern: 'v1', isCaseSensitive: false} ]});
    expect(tree.match(HTTPMethod.GET, "aPi/v1", undefined)).toEqual<RouteEndpoint>({handlers: [handler2], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: false}, {pattern: 'v1', isCaseSensitive: false} ]});

    //Negative tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method3", undefined)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "api/v1/Method3", undefined)).toBeUndefined();
});

test('RoutingTree: partial case-insensitive plain match', () => {
    var tree: RoutingTree = new RoutingTree();

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };

    tree.registerRoute(HTTPMethod.GET, [ {pattern:"api",isCaseSensitive:true}, {pattern:"v1/method1", isCaseSensitive: false} ], handler1);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: false}, {pattern: 'method1', isCaseSensitive: false} ]});
    expect(tree.match(HTTPMethod.GET, "api/V1/MeTHoD1", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: false}, {pattern: 'method1', isCaseSensitive: false} ]});

    //Negative tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method3", undefined)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "aPi/v1/method1", undefined)).toBeUndefined();
});

test('RoutingTree: untyped argument match', () => {
    var tree: RoutingTree = new RoutingTree();

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };

    tree.registerRoute(HTTPMethod.GET, "api/v1/method1/{id}", handler1);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/test", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [ {name:"id", value: "test"} ], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method1', isCaseSensitive: true}, {pattern: '{id}', isCaseSensitive: true} ]});

    //Negative tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1", undefined)).toBeUndefined();
});

class IntConverter implements ITypeConverter {
    convertFrom(decodedMimeType: any) {
        throw new Error("Method not implemented.");
    }
    convertTo(value: any) {
        throw new Error("Method not implemented.");
    }

    convertFromString(str: string): number | undefined {
        var value = +str;
        return Number.isInteger(value) ? value : undefined;
    }
    convertToString(item: any): string | undefined {
        return Number.isInteger(item) ? item.toString() : undefined;
    }
}

test('RoutingTree: typed argument match', () => {
    var tree: RoutingTree = new RoutingTree();
    var converters: Map<string, ITypeConverter> = new Map<string, ITypeConverter>();
    converters.set("int", new IntConverter());

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };

    tree.registerRoute(HTTPMethod.GET, "api/v1/method1/{id:int}", handler1);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/23", converters)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [ {name:"id", value: 23} ], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method1', isCaseSensitive: true}, {pattern: '{id:int}', isCaseSensitive: true} ]});

    //Negative tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/test", converters)).toBeUndefined();
});

test('RoutingTree: minLength argument match', () => {
    var tree: RoutingTree = new RoutingTree();

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };

    tree.registerRoute(HTTPMethod.GET, "api/v1/method1/{id::2}", handler1);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/test", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [ {name:"id", value: "test"} ], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method1', isCaseSensitive: true}, {pattern: '{id::2}', isCaseSensitive: true} ]});

    //Negative tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/t", undefined)).toBeUndefined();
});

test('RoutingTree: maxLength argument match', () => {
    var tree: RoutingTree = new RoutingTree();

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };

    tree.registerRoute(HTTPMethod.GET, "api/v1/method1/{id:::5}", handler1);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/test", undefined)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [ {name:"id", value: "test"} ], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method1', isCaseSensitive: true}, {pattern: '{id:::5}', isCaseSensitive: true} ]});

    //Negative tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/helloworld", undefined)).toBeUndefined();
});

test('RoutingTree: multiple argument match', () => {
    var tree: RoutingTree = new RoutingTree();
    var converters: Map<string, ITypeConverter> = new Map<string, ITypeConverter>();
    converters.set("int", new IntConverter());

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };

    tree.registerRoute(HTTPMethod.GET, "api/v1/method1/id{id:int::4}{name}", handler1);

    //Positive tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/id1234test", converters)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [ {name:"id", value: 1234}, {name:"name", value: "test"} ], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method1', isCaseSensitive: true}, {pattern: 'id{id:int::4}{name}', isCaseSensitive: true} ]});
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/id12", converters)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [ {name:"id", value: 12}, {name:"name", value: ""} ], pattern: [ {pattern: 'api', isCaseSensitive: true}, {pattern: 'v1', isCaseSensitive: true}, {pattern: 'method1', isCaseSensitive: true}, {pattern: 'id{id:int::4}{name}', isCaseSensitive: true} ]});

    //Negative tests
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/id123test", converters)).toBeUndefined();
    expect(tree.match(HTTPMethod.GET, "api/v1/method1/12", converters)).toBeUndefined();
});

test('RoutingTree: route preference test', () => {
    var converters: Map<string, ITypeConverter> = new Map<string, ITypeConverter>();
    converters.set("int", new IntConverter());

    var handler1: RouteHandler = {
        handler: 'h1',
        controller: undefined
    };
    var handler2: RouteHandler = {
        handler: 'h2',
        controller: undefined
    };
    var handler3: RouteHandler = {
        handler: 'h3',
        controller: undefined
    };
    var handler4: RouteHandler = {
        handler: 'h4',
        controller: undefined
    };
    var handler5: RouteHandler = {
        handler: 'h5',
        controller: undefined
    };
    var handler6: RouteHandler = {
        handler: 'h6',
        controller: undefined
    };
    var handler7: RouteHandler = {
        handler: 'h7',
        controller: undefined
    };

    var tree: RoutingTree = new RoutingTree();

    //To make this test cleaner, register the routes in a semi-random order
    tree.registerRoute(HTTPMethod.GET, "hello/world/{id}", handler1);
    tree.registerRoute(HTTPMethod.GET, "hello/world/{id:int::4}d", handler3);
    tree.registerRoute(HTTPMethod.GET, "hello/world/{id:int::4}{code}", handler2);
    tree.registerRoute(HTTPMethod.GET, "hello/world/id{id}", handler5);
    tree.registerRoute(HTTPMethod.GET, "hello/world/i{id}", handler4);
    tree.registerRoute(HTTPMethod.GET, "hello/world/i/am/here", handler7);
    tree.registerRoute(HTTPMethod.GET, "hello/world/i", handler6);

    expect(tree.match(HTTPMethod.GET, "hello/world/i/am/here", converters)).toEqual<RouteEndpoint>({handlers: [handler7], arguments: [], pattern: [ {pattern: 'hello', isCaseSensitive: true}, {pattern: 'world', isCaseSensitive: true}, {pattern: 'i', isCaseSensitive: true}, {pattern: 'am', isCaseSensitive: true}, {pattern: 'here', isCaseSensitive: true} ]});
    expect(tree.match(HTTPMethod.GET, "hello/world/i", converters)).toEqual<RouteEndpoint>({handlers: [handler6], arguments: [], pattern: [ {pattern: 'hello', isCaseSensitive: true}, {pattern: 'world', isCaseSensitive: true}, {pattern: 'i', isCaseSensitive: true}]});
    expect(tree.match(HTTPMethod.GET, "hello/world/id5", converters)).toEqual<RouteEndpoint>({handlers: [handler5], arguments: [ {name: "id", value: "5"} ], pattern: [ {pattern: 'hello', isCaseSensitive: true}, {pattern: 'world', isCaseSensitive: true}, {pattern: 'id{id}', isCaseSensitive: true}]});
    expect(tree.match(HTTPMethod.GET, "hello/world/i5", converters)).toEqual<RouteEndpoint>({handlers: [handler4], arguments: [ {name: "id", value: "5"} ], pattern: [ {pattern: 'hello', isCaseSensitive: true}, {pattern: 'world', isCaseSensitive: true}, {pattern: 'i{id}', isCaseSensitive: true} ]});
    expect(tree.match(HTTPMethod.GET, "hello/world/1234d", converters)).toEqual<RouteEndpoint>({handlers: [handler3], arguments: [ {name: "id", value: 1234} ], pattern: [ {pattern: 'hello', isCaseSensitive: true}, {pattern: 'world', isCaseSensitive: true}, {pattern: '{id:int::4}d', isCaseSensitive: true} ]});
    expect(tree.match(HTTPMethod.GET, "hello/world/1234f", converters)).toEqual<RouteEndpoint>({handlers: [handler2], arguments: [ {name: "id", value: 1234}, {name: "code", value: "f"} ], pattern: [ {pattern: 'hello', isCaseSensitive: true}, {pattern: 'world', isCaseSensitive: true}, {pattern: '{id:int::4}{code}', isCaseSensitive: true}] });
    expect(tree.match(HTTPMethod.GET, "hello/world/abacd", converters)).toEqual<RouteEndpoint>({handlers: [handler1], arguments: [ {name: "id", value: "abacd"} ], pattern: [ {pattern: 'hello', isCaseSensitive: true}, {pattern: 'world', isCaseSensitive: true}, {pattern: '{id}', isCaseSensitive: true} ]});
});