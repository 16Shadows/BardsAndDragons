import { HTTPMethod } from "../constants";
import { IRouteRegistry, RouteArgument, RouteDefinitionPart, RouteEndpoint } from "./core";
import { IConvertersProvider, ITypeConverter } from "../converter";
import { ArrayView, getArrayView } from "../utils/arrayUtils";
import { sanitizeRoute } from "./utils";

module RoutingTree {
    class PreprocessedRoutePart {
        private _Part: string;
        private _PartLower: string;
    
        get part(): string {
            return this._Part;
        }
    
        get partLower(): string {
            return this._PartLower;
        }
    
        constructor(routePart: string) {
            this._Part = routePart;
            this._PartLower = routePart.toLocaleLowerCase();
        } 
    }

    /*
    Note: escaped characters are poorly handled as they only examine presence of the preceeding backslash, won't properly handle \\:
    Argument syntax:
        Curly brackets are used to specify an argument.
        The argument follows the following pattern:
            {argumentName:typeId:minLength:maxLength}
        If Nth argument is omitted, all arguments after it must be omitted as well. To skip an argument leave it empty.
        argumentName - specifies the name of the argument which the RouteArgument instance will contain. If not specified, the name won't be specified as well.
        typeId - used to determine which converter to use when parsing this argument.
                    If not specified or empty, no converter will be applied.
                    If the specified convert fails (returns undefined), the route won't match.
        minLength - at least this many characters from the route must be captured for the argument to match. Default (unspecified or empty) is 0.
        maxLength - at most this many characters from the route will be captured for this argument. Default (unspecified or empty) is unlimited.
        Do note that if the argument isn't the last part in the pattern, it will always match its maxLength
    Examples (forward slash is used to denote route part boundaries):
        /{name}/ - matches anything and passes it on as a string:
            hello, world!
            test123
            5312
        /{id:int}/ - matches anything that passes converter with typeId 'int' (we will assume that the converter converts only proper integers):
            232
            434121
            22
        /{id::2}/ - matches any string which is at least 2 characters long
            he
            hello, world
            h - WON'T MATCH
        /{id::2:5}/ - matches any string which is 2 to 5 characters long
            he
            hello
            hello, world - WON'T MATCH
            h - WON'T MATCH
        /he{id}/ - matches any string but won't include the plain text in the route
            for route /hello/ will match and capture 'llo'
        /{id::2:5}test/ - matches any string which is exactly 5 characters long.
                            This happens because matching is done left-to-right with priority give to the leftmost unmatched expression.
            route /hellotest/ will match with string 'hello'
            route /helltest/ won't match as the argument will capture 'hellt' and 'est' won't match plain text 'test' 
*/
    class ArgumentMatcher {
        protected _ArgumentName: string;
        protected _TypeId: string;
        protected _MinLength: number;
        protected _MaxLength: number | undefined;
        
        constructor(pattern: string) {
            if (!pattern.startsWith('{') || !pattern.endsWith('}'))
                throw new Error(`${pattern} is an invalid argument pattern. An argument should start with '{' and end with '}'.`)

            //Strip curly brackets - we needed them to check for proper format pattern but not for actual parsing. Then split by :
            var patternParts = pattern.substring(1, pattern.length - 1).split(/(?<!\\):/);

            if (patternParts.length > 4)
                throw new Error(`Pattern ${pattern} has too many parts.`);


            this._ArgumentName = patternParts[0]; //Unnamed arguments are allowed
            this._TypeId = patternParts[1] ?? ''; //No typeId is allowed
            
            if (patternParts[2] != undefined && isNaN(+patternParts[2]))
                throw new Error(`${patternParts[2]} is no a valid number in pattern ${pattern}.`);

            this._MinLength = patternParts[2] == undefined ? 0 : +patternParts[2];

            if (patternParts[3] != undefined && isNaN(+patternParts[3]))
                throw new Error(`${patternParts[3]} is no a valid number in pattern ${pattern}.`);

            this._MaxLength = patternParts[3] == undefined ? undefined : +patternParts[3];
        }

        patternMatches(pattern: ArgumentMatcher): boolean {
            return pattern._ArgumentName == this._ArgumentName &&
                pattern._TypeId == this._TypeId &&
                pattern._MinLength == this._MinLength &&
                pattern._MaxLength == this._MaxLength;
        }

        match(routePart: string, from: number, converters: IConvertersProvider): { charactersRead: number; argument: RouteArgument; } | undefined {
            //Not enough symbols in the routePart to satisfy this argument's MinLength
            if (routePart.length - from < this._MinLength)
                return undefined;

            var endIndex: number = this._MaxLength == undefined ?
                                routePart.length :
                                Math.min(from + this._MaxLength, routePart.length);

            var stringVal = routePart.substring(from, endIndex);

            var value: any;
            if (this._TypeId.length == 0)
                value = stringVal;
            else
            {
                var converter: ITypeConverter | undefined = converters.get(this._TypeId);
                if (converter == undefined)
                    throw new Error(`Missing type converter for typeId ${this._TypeId} in current context.`);
                value = converter.convertFromString(stringVal);
                if (value == undefined)
                    return undefined;
            }

            return {
                charactersRead: endIndex - from,
                argument: {
                    name: this._ArgumentName,
                    value: value
                }
            };
        }
    }

    class RoutePartMatcher {
        protected _Components: (ArgumentMatcher | string)[];
        protected _IsCaseSensitive: boolean;
        protected _HasArguments: boolean;
        protected _HasPlainText: boolean;
    
        constructor(pattern: string, isCaseSensitive: boolean) {
            /*
                This regex is used to split the string into parts of plain text and parts of arguments (because JS includes capture-groups into output):
                    dev{id}hey{num::2:3} -> dev, {id}, hey, {num::2:3}
                It also takes care of escaped { or } (escaping depends on context - { must be escaped outside arguments, } - inside)
                    \{hey{id:\}:2:5}}hey => {hey, {id:}:2:5}, }hey
                Note: escaped characters are poorly handled as they only examine presence of the preceeding backslash, won't properly handle \\{ or \\}
            */
            this._Components = pattern.split(/({[^{}]*})/).filter(x => x.length > 0).map<string | ArgumentMatcher>(x => {
                return x.startsWith('{') ? new ArgumentMatcher(x) :
                       isCaseSensitive ? x : x.toLowerCase();
            })
            this._IsCaseSensitive = isCaseSensitive;
            this._HasArguments = this._Components.some(x => typeof x != 'string');
            this._HasPlainText = this._Components.some(x => typeof x == 'string');
        }
    
        get isCaseSensitive(): boolean {
            return this._IsCaseSensitive;
        }
    
        get componentsCount(): number {
            return this._Components.length;
        }
    
        get hasArguments(): boolean {
            return this._HasArguments;
        }
    
        get hasPlainText(): boolean {
            return this._HasPlainText;
        }
    
        /**
         * Fetches length of plain text in the specified component.
         * @param componentIndex Index of the component to fetch info for
         * @returns The length of the plain text for the specified component or 0 if its an argument component.
         */
        getPlainTextLengthAt(componentIndex: number): number {
            if (componentIndex < 0 || componentIndex >= this._Components.length)
                return undefined;
    
            return typeof this._Components[componentIndex] == 'string' ? (this._Components[componentIndex] as string).length : 0;
        }
    
        patternMatches(pattern: RoutePartMatcher): boolean {
            if (pattern.componentsCount != this.componentsCount)
                return false;
            for (var i : number = 0; i < this.componentsCount; i++)
            {
                if (typeof this._Components[i] != typeof pattern._Components[i] ||
                    typeof this._Components[i] == 'string' && this._Components[i] != pattern._Components[i] ||
                    typeof this._Components[i] != 'string' && !(this._Components[i] as ArgumentMatcher).patternMatches(pattern._Components[i] as ArgumentMatcher))
                    return false;
            }
            return true;
        }
    
        match(routePart: PreprocessedRoutePart, converters: IConvertersProvider): RouteArgument[] | null | undefined {
            var out : RouteArgument[] | null = this.hasArguments ? [] : null;
    
            var matchAgainst = this._IsCaseSensitive ? routePart.part : routePart.partLower;
    
            var partIndex = 0;
            for (var i = 0; i < this._Components.length; i++) {
                if (typeof this._Components[i] == 'string')
                {
                    var asString = this._Components[i] as string;
                    for (var j = 0; j < asString.length; j++, partIndex++)
                    {
                        if (partIndex >= matchAgainst.length || matchAgainst[partIndex] != asString[j])
                            return undefined;
                    }
                }
                else
                {
                    var asArgumentMatcher = this._Components[i] as ArgumentMatcher;
                    var result = asArgumentMatcher.match(routePart.part, partIndex, converters);
                    if (result == undefined)
                        return undefined;
                    partIndex += result.charactersRead;
                    out.push(result.argument);
                }
            }
    
            return partIndex < matchAgainst.length ? undefined : out;
        }
    }

    type RoutingTreeNodeEntry = {
        /**
         * A matcher used to determine if the route part is a part of the route
         */
        matcher: RoutePartMatcher;
    
        node?: RoutingTreeNode;
        handlers?: Function[];
    };

    class RoutingTreeNode {
        private _Entries: RoutingTreeNodeEntry[];
    
        constructor() {
            this._Entries = [];
        }
    
        registerRoute(route: ArrayView<RouteDefinitionPart> | RouteDefinitionPart[], handler: Function): RoutingTreeNode {
            /*
                Route preference rules:
                    1. Longer routes are preferred to shorter routes.
                    2. Routes without arguments are preferred to routes with arguments.
                    3. Routes with arguments AND plain text are preferred to routes without plain text
                    4. If both routes contain plain text, the one with the longer plain text segment in the same position (from left to right) wins
                    5. Routes with multiple arguments are preferred to routes without arguments
                Routes with higher preference should be located at the beginning of _Entries.
                Example of routes ordering based on preference:
                    /hello/world/i/am/here - route contains 5 elements, very specific, prefer it
                    /hello/world/i - route contains 3 elements, will be matched if the first one doesn't match
                    /hello/world/id{id} - route contains 3 elements but the last one is an argument so it will only match if the previous one doesn't
                    /hello/world/i{id} - similar to the previous one but its plain text is shorter
                    /hello/world/{id:::4}d - similar to the previous one but its plain text is shorter because plain text length for arguments is considered to be 0.
                                                 Also worth noting that while the argument's min length is 0, since there is something after the argument it will always match to a length of 4 
                    /hello/world/{id:int::4}{code} - route contains 3 elements but the last one has no text so it will only match if the previous one doesn't
                    /hello/world/{code} - this route has less arguments that the previous one in the respective route part
            */
            var routePart: string = route[0].pattern;        
            var matcher: RoutePartMatcher = new RoutePartMatcher(routePart, route[0].isCaseSensitive ?? true);
    
            var entry: RoutingTreeNodeEntry;
            var i: number = 0;
            for (; i < this._Entries.length; i++)
            {
                entry = this._Entries[i];
                //Check for exact pattern match with this entry
                if (entry.matcher.patternMatches(matcher))
                {
                    if (route.length > 1)
                    {
                        if (entry.node == undefined)
                            entry.node = new RoutingTreeNode();
                        
                        entry.node.registerRoute(getArrayView(route, 1), handler);
                    }
                    else
                    {
                        if (entry.handlers == undefined)
                            entry.handlers = [];
    
                        if (!entry.handlers.includes((x: Function) => x == handler))
                            entry.handlers.push(handler);
                    }
                    return;
                }
    
                if( entry.handlers !== undefined && route.length > 1 || //This conditions ensures than longer routes are preferred
                    entry.matcher.hasArguments && !matcher.hasArguments || //This condition ensures that routes without arguments are preferred
                    !entry.matcher.hasPlainText && matcher.hasPlainText) //This condition ensures that routes with plain text are preferred
                    break;
                
                //This loop ensures that routes with longer plain text are preferred
                var earlyExit: boolean = false;
                for (var j : number = 0; j < Math.min(entry.matcher.componentsCount, matcher.componentsCount); j++) {
                    if (entry.matcher.getPlainTextLengthAt(j) >= matcher.getPlainTextLengthAt(j))
                        continue;
                    earlyExit = true;
                    break;
                }
                
                if (earlyExit ||
                    entry.matcher.componentsCount < matcher.componentsCount) //This condition ensures that routes with more arguments are preferred
                    break;
            }
    
            entry = {
                matcher: matcher,
                node: (route.length > 1 ? (new RoutingTreeNode()).registerRoute(getArrayView(route, 1), handler) : undefined),
                handlers: (route.length == 1 ? [handler] : undefined)
            };
    
            if (i >= this._Entries.length)
                this._Entries.push(entry);
            else
                this._Entries.splice(i, 0, entry);
    
            return this;
        }
    
        /**
         * Tries to match the route left-to-right 
         * @param route 
         * @param result 
         * @param converters 
         * @returns 
         */
        match(route: ArrayView<PreprocessedRoutePart> | PreprocessedRoutePart[], result: RouteEndpoint, converters: IConvertersProvider): boolean  {
            var match: RouteArgument[] | null | undefined;
            var routePart: PreprocessedRoutePart = route[0];
    
            if (route.length == 1)
            {
                for (var entry of this._Entries)
                {
                    if (entry.handlers === undefined)
                        continue;
    
                    match = entry.matcher.match(routePart, converters);
                    if (match === undefined)
                        continue;
                    else if (match != null)
                        for (var item of match)
                            result.arguments.push(item);
    
                    result.handlers = entry.handlers;
                    return true;
                }
            }
            else
            {
                for (var entry of this._Entries)
                {
                    if (entry.node === undefined)
                        continue;
    
                    match = entry.matcher.match(routePart, converters);
                    if (match === undefined)
                        continue;
                    else if (match != null)
                        for (var item of match)
                            result.arguments.push(item);
    
                    return entry.node.match(getArrayView(route, 1), result, converters)
                }
            }
            return false;
        }
    }

    export class RoutingTree implements IRouteRegistry {
        private _RootNodes : RoutingTreeNode[];
    
        constructor() {
            this._RootNodes = [];
            for (var _item in HTTPMethod)
                this._RootNodes.push(new RoutingTreeNode());
        }
    
        registerRoute(method: HTTPMethod, route: RouteDefinitionPart, handler: Function): void;
        registerRoute(method: HTTPMethod, route: RouteDefinitionPart[], handler: Function): void;
        registerRoute(method: HTTPMethod, route: string, handler: Function): void;
        registerRoute(method: HTTPMethod, route: string, handler: Function, caseSensitive: boolean): void;
        registerRoute(method: HTTPMethod, route: string | RouteDefinitionPart | RouteDefinitionPart[], handler: Function, caseSensitive?: boolean): void {
            var node : RoutingTreeNode = this._RootNodes[method];
    
            if (typeof route == 'string')
                route = [ { pattern: sanitizeRoute(route), isCaseSensitive: caseSensitive } ];
            else if (!Array.isArray(route))
                route = [route];
    
            route = route.flatMap<RouteDefinitionPart>(x => {
                return sanitizeRoute(x.pattern).split('/').filter(x => x.length > 0).map<RouteDefinitionPart>(y => {
                    return {
                        pattern: y,
                        isCaseSensitive: x.isCaseSensitive
                    };
                });
            });
    
            node.registerRoute(route, handler);
        }
    
        match(method: HTTPMethod, route: string, converters: IConvertersProvider): RouteEndpoint | undefined {
            var node : RoutingTreeNode = this._RootNodes[method];
    
            var endpoint: RouteEndpoint = {
                handlers: undefined,
                arguments: []
            };
            return node.match(sanitizeRoute(route).split('/').filter(x => x.length > 0).map(x => new PreprocessedRoutePart(x)), endpoint, converters) ? endpoint : undefined;
        }
    }
}

export = RoutingTree;