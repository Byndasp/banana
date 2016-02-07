/**
 * Created by odin on 06.02.16.
 */

/**
 * 2015 (c) BananaJS Framework
 * BananaJS is licensed under MIT license
 *
 * @author Denis 'odin3' Sedchenko
 * @version 0.8
 */

/**
 * Main namespace of Banana
 * @type {{version: string, modules: {}, debug: boolean, Tools: {add: Banana.Tools.add, GUID: Banana.Tools.GUID, DOM: {hasAttribute: Banana.Tools.DOM.hasAttribute, isManaged: Banana.Tools.DOM.isManaged, exists: Banana.Tools.DOM.exists}, KeyCodes: {backSpace: number, tab: number, enter: number, shift: number, ctrl: number, alt: number, pause: number, capsLock: number, escape: number, pageUp: number, pageDown: number, end: number, home: number, left: number, up: number, right: number, down: number, insert: number, del: number}, Console: {print: Banana.Tools.Console.print}}, Dictionary: Banana.Dictionary, Node: Banana.Node, Module: Banana.Module, require: Banana.require, panic: Banana.panic, info: Banana.info, warn: Banana.warn, log: Banana.log, createModule: Banana.createModule, module: Banana.module}}
 */
var Banana = {
    version: "0.8",
    modules: {},
    debug: true,

    /**
     * Utilites
     */
    Tools:{

        /**
         * Add new tool to namespace
         * @param toolName
         * @param func
         * @returns {Banana}
         */
        add: function(toolName, func) {
            this[toolName] = func;
            return this;
        },

        /**
         * Generate a new GUID
         * @returns {string}
         * @constructor
         */
        GUID: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        },

        DOM: {
            hasAttribute: function(element, attributeName){
                if(element instanceof jQuery) element = element.get(0);
                var attr = element.getAttribute(attributeName);
                return (typeof attr != typeof undefined && attr != null);
            },
            isManaged: function(element, requiredGUID) {
                requiredGUID = (requiredGUID == true) ? requiredGUID = this.hasAttribute(element, "data-guid") : true;
                return this.hasAttribute(element, "data-controller") && requiredGUID;
            },
            exists: function(querySelector) {
                return document.querySelectorAll(querySelector).length > 0;
            },
            nodeExistsInDOM: function(guid) {
                return document.querySelectorAll("*[data-guid='"+guid+"']").length > 0;
            }

        },
        Arrays: {
            forEach:function(arr, e) {
                for(var c = 0; c < arr.length; c++) {
                    e(arr[c], c, this);
                }
            }
        },
        KeyCodes: {
            backSpace:8,
            tab:9,
            enter:13,
            shift:16,
            ctrl:17,
            alt:18,
            pause:19,
            capsLock:20,
            escape:27,
            pageUp:33,
            pageDown:34,
            end:35,
            home:36,
            left:37,
            up:38,
            right:39,
            down:40,
            insert:45,
            del:46
        },
        Console: {
            /**
             * Show force error
             *
             * @param txt error
             */
            print: function(method, from, message, data) {
                if(typeof console == "undefined") var console = {log:function(){},error:function(){},warn:function(){}};
                if(Banana.debug) {
                    if(isset(data)) {
                        console[method]("%c["+from+"] %c"+message,"color: #881391;","color:initial",data);
                    } else {
                        console[method]("%c["+from+"] %c"+message,"color: #881391;","color:initial");
                    }
                }
            }
        },
        Factory: {
            findAppComponent: function(appComponentName, appComponentType, appInstance) {
                if(isset(appInstance) && isset(appInstance[appComponentType][appComponentName])) {
                    return appInstance[appComponentType][appComponentName];
                }
                else if(isset(Banana.Global[appComponentType][appComponentName])) {
                    return Banana.Global[appComponentType][appComponentName];
                }
                else {
                    throw new Error("Banana: App component '"+appComponentName+"' not found in "+appComponentType);
                }
            },
            resourceExists: function(appInstance, storageName, resource) {
                if (!isset(appInstance)) return isset(Banana.Global[storageName][resource]);
                return (isset(appInstance[storageName][resource]) || isset(Banana.Global[storageName][resource]));
            },
            inspectDependencies: function(dependsOn, appInstance){
                var dependencies = [];
                if(isset(dependsOn))
                {
                    if(typeof dependsOn == "string") dependsOn = [dependsOn];
                    for(var c = 0; c < dependsOn.length; c++)
                    {
                        if(this.resourceExists(appInstance, 'models', dependsOn[c]) || this.resourceExists(appInstance, 'services', dependsOn[c]))
                        {
                            dependencies.push(dependsOn[c]);
                        } else {
                            throw new Error("Banana: unsolvable dependency '"+dependsOn[c]+"'");
                        }
                    }
                }
                return dependencies;
            },
            createController: function(controllerName, controllerBody, dependsOn, appInstance) {
                appInstance.controllers[controllerName] = new Banana.Controller(controllerName, controllerBody, dependsOn, appInstance);
            },
            createModel: function(modelName, modelBody, dependsOn, appInstance) {
                appInstance.models[modelName] = new Banana.Model(modelName, modelBody, dependsOn, appInstance);
            },
            createService: function(serviceName, serviceBody, dependsOn, appInstance) {
                appInstance.services[serviceName] = new Banana.Service(serviceName, serviceBody, dependsOn, appInstance);
            }

        }

    },

    /**
     * Global app components
     */
    Global:{
        services:[],
        models:[],
        controllers:[],
        /**
         * Create a global service
         * @param mName
         * @param mBody
         * @param dependsOn
         * @param returnObject
         * @returns {Banana}
         */
        service: function(mName, mBody, dependsOn, returnObject) {
            if(!isset(returnObject)) returnObject = false;
            Banana.Tools.Factory.createService(mName, mBody, dependsOn, this);
            if(!returnObject) return this;
        },

        /**
         * Create a global controller
         * @param controllerName
         * @param controllerBody
         * @param dependsOn
         * @returns {Banana}
         */
        controller: function(controllerName, controllerBody, dependsOn) {
            Banana.Tools.Factory.createController(controllerName, controllerBody, dependsOn, this);
            return this;
        },

        /**
         * Create a global model
         * @param mName
         * @param mBody
         * @param dependsOn
         * @returns {Banana}
         */
        model: function(mName, mBody, dependsOn) {
                Banana.Tools.Factory.createModel(mName, mBody, dependsOn, this);
                return this;
        },

        /**
         * Import a component from global namespace
         * @param storage
         * @param target
         * @returns {*}
         */
        require: function(storage, target) {
            if(typeof target == "undefined") target = [];
            if(typeof this[storage] != 'undefined' && this[storage] instanceof Array) {
                target = target.concat(this[storage]);
            }
            return target;
        }
    },
    Model: function(name, body, dependsOn, appInstance) {
        this.name = name;
        this.model = body;
        this.type = "model";
        this.di = Banana.Tools.Factory.inspectDependencies(dependsOn, appInstance);
    },
    Service: function(name, body, dependsOn, appInstance) {
        this.name = name;
        this.service = body;
        this.type = "service";
        this.di = Banana.Tools.Factory.inspectDependencies(dependsOn, appInstance);
    },
    Controller: function(controllerName, controllerBody, dependsOn, appInstance){
        this.name = controllerName;
        this.controller = controllerBody;
        this.type = "controller";
        this.di = Banana.Tools.Factory.inspectDependencies(dependsOn, appInstance);
    },

    /**
     * Object to store key based values
     * @constructor
     */
    Dictionary: function() {
        this.get = function(key,def) {
            if(isset(this[key])) return this[key];
            if(isset(def)) return def;
            if(isset(UI)) Banana.warn("scope","Trying to get undefined value: '"+key+"'",scope);
            return false;
        };
        this.set = function(key,val) {
            this[key] = val;
            return this[key];
        };

        this.push = function(data) {
            for(var k in data) {
                if(data.hasOwnProperty(k)) this[k] = data[k];
            }
        };
    },

    /**
     * BananaJS virtual element tree node
     * @param targetElement DOM element or selector
     * @param controllerName controller name [optional]
     * @constructor
     */
    Node: function(targetElement, controllerName) {
        if(Banana.Tools.DOM.hasAttribute(targetElement,"data-guid")) throw new Error("Node has been already binded to this element");

        this.guid           = Banana.Tools.GUID();
        this.module         = undefined;
        this.element        = (typeof targetElement == "string") ? document.querySelector(targetElement) : targetElement;
        this.$              = $(this.element);

        this.controllerName = (isset(controllerName)) ? controllerName : this.$.attr("data-controller");

        this.$.attr("data-guid",this.guid);

        this.controller = undefined;

        this.appendToTree = function(appModule) {
            this.module = appModule;
            this.module.nodes[this.guid] = this;
            this.controller = appModule.getController(this.controllerName, this.guid);
        };

        this.getParentNode = function()
        {
            if(Banana.Tools.DOM.hasAttribute(this.element.parentElement, "data-controller")) return $(this.element.parentElement).node();
            return $(this.element).parent("[data-controller]").node();
        };

        this.getChildren = function() {
            return $(this.element).children("[data-controller]").node();
        };

        this.getParentController = function() {
            return this.getParentNode().controller;
        };
    },


    /**
     * App module class.
     * @author Denis Sedchenko
     * @version 1.1b
     * @type {{controllers: Array, models: Array, controller: app.controller, model: app.model}}
     */
    Module: function(element, bootstrap) {
        var appInstance = this;
        this.selector = element.toString();
        if(typeof element == "string") element = document.querySelector(element);
        this.htmlElement = element;
        this.controllers = {};
        /**
         * Models container
         */
        this.models = {};
        this.services = {};
        this.started = false;
        this.events = {};


        this.nodes = {};

        this.scope = new Banana.Dictionary();

        this.on = function(eventName, eventFunc) {
            if (!isset(this.events[eventName]))  this.events[eventName] = [];
            this.events[eventName].push(eventFunc);
        };

        this.trigger = function(eventName) {
            if (isset(this.events[eventName])){
                this.events[eventName].forEach(function(ev){
                    ev();
                });

            }
        };
        this.onLoad = function() {
            this.trigger("load");
        };
        this.onInit = function() {
            this.trigger("init");
        };

        this.bindElement =function(elem, controllerName) {
            if(Banana.Tools.DOM.hasAttribute(elem,"data-guid")) return true;
            if(!isset(controllerName)) controllerName = $(elem).attr("data-controller");

            return new Banana.Node(elem, controllerName).appendToTree(this);
        };

        function gc() {
            for(var c in appInstance.nodes) {
                    if(!Banana.Tools.DOM.nodeExistsInDOM(c)) delete appInstance.nodes[c];

            }
        }
        this.init = function(target){
            var instance = this;
            if(!isset(target)) target = this.htmlElement;
            var elementsToLoad = Array.prototype.slice.call(target.querySelectorAll("*[data-controller]:not([data-guid])"));
            if(isset(target) && Banana.Tools.DOM.isManaged(target)) elementsToLoad.push(target);

            elementsToLoad.forEach(function(e){
                if(!Banana.Tools.DOM.hasAttribute(e,"data-guid"))
                    instance.bindElement(e);
            });

            if(this.started == false) {
                $(this.htmlElement).on("DOMNodeInserted", function(ev){
                    setTimeout(function(){
                        gc();
                        appInstance.init(ev.target);
                    },100);
                }).on("DOMNodeRemoved", function(ev){
                    setTimeout(function(){
                        gc();
                    },100);
                });
                this.started = true;
                this.onLoad();
            }
        };

        function injectDependencies(appComponent){
            var args = "";
            for(var c = 0; c < appComponent.di.length; c++){
                var pushed = false;
                if(Banana.Tools.Factory.resourceExists(appInstance,"models",appComponent.di[c])) {
                    args += "appInstance.model('"+appComponent.di[c]+"')";
                    pushed = true;
                }

                if(Banana.Tools.Factory.resourceExists(appInstance,"services",appComponent.di[c])) {
                    if(pushed) args += ", ";
                    args += "appInstance.service('"+appComponent.di[c]+"')";
                }
                if(c < (appComponent.di.length - 1)) args += ", ";
            }
            return args;
        }

        this.getController = function(controllerName, bindElement){
            var ctrl = Banana.Tools.Factory.findAppComponent(controllerName, "controllers", appInstance);
            var args = injectDependencies(ctrl);
            if(isset(bindElement)){
                if(ctrl.di.length > 0) args += ", ";
                args += "appInstance.htmlElement.querySelector(\"*[data-controller='"+controllerName+"'][data-guid='"+bindElement+"']\")";
            }
            return eval("new ctrl.controller("+args+")");
        };


        /**
         * Get or make a new controller
         * @param controllerName Controller name
         * @param controllerBody [Optional] Controller body
         * @param dependsOn [Optional] Array of required modules
         * @param runImmediately [Optional] Boolean, run controller after it was registered
         * @returns {*}
         */
        this.controller = function(controllerName, controllerBody, dependsOn, runImmediately) {
            if(isset(controllerBody)) {
                Banana.Tools.Factory.createController(controllerName, controllerBody, dependsOn, appInstance);
                if(isset(runImmediately) && runImmediately == false) return this;
            }
            return appInstance.getController(controllerName);
        };


        this.getModel = function(modelName){
            var ctrl = Banana.Tools.Factory.findAppComponent(modelName, "models", appInstance);
            var args = injectDependencies(ctrl);
            return eval("new ctrl.model("+args+")");
        };

        this.model = function(mName, mBody, dependsOn) {
            if(isset(mBody)) {
                Banana.Tools.Factory.createModel(mName, mBody, dependsOn, appInstance);
                return this;
            }
            return appInstance.getModel(mName);
        };


        this.getService = function(modelName){
            var ctrl = Banana.Tools.Factory.findAppComponent(modelName, "services", appInstance);
            var args = injectDependencies(ctrl);
            return eval("new ctrl.service("+args+")");
        };

        /**
         * Get or create a new service
         * @param mName Model name
         * @param mBody Model Body
         * @param dependsOn Dependencies
         * @param returnObject Return as service
         * @returns {app}
         */
        this.service = function(mName, mBody, dependsOn, returnObject) {
            if(!isset(returnObject)) returnObject = false;
            if(isset(mBody)) {
                Banana.Tools.Factory.createService(mName, mBody, dependsOn, appInstance);
                if(!returnObject) return this;
            }
            return appInstance.getService(mName);
        };

        if(isset(bootstrap)) bootstrap(this);
    },

    /**
     * Import a tool from `Banana.Tools` to selected namespace (object)
     * @param toolName
     * @param target
     */
    require: function(toolName, target){
        if(typeof target == "undefined") target = this;
        target[toolName] = this.Tools[toolName];
    },
    panic: function(mod,msg,args){
        this.print("error",mod,msg,args);
    },

    /**
     * Show info in shell, if Debug mode is enabled
     *
     * @param mod module name
     * @param msg Message string
     * @param args debug data
     */

    info: function(mod,msg,args) {
        this.print("info",mod,msg,args);
    },

    /**
     * Show warning in shell, if Debug mode is enabled
     *
     * @param mod module name
     * @param msg Message string
     * @param args debug data
     */
    warn: function(mod,msg,args) {
        this.print("warn",mod,msg,args);
    },

    /**
     * Show event log in shell, if Debug mode is enabled
     *
     * @param mod module name
     * @param msg Message string
     * @param args debug data
     */
    log: function(mod,msg,args) {
        this.print("log",mod,msg,args);
    },

    // Methods
    createModule: function(name, nodeSelector, bootstrap) {
        var _nselector = undefined;
        if(isset(nodeSelector)) {
            switch(typeof nodeSelector) {
                case "function" :
                    bootstrap = nodeSelector;
                    nodeSelector = "*[data-banana='"+name+"']";
                    break;

                case "object" :
                    if(nodeSelector instanceof jQuery) nodeSelector = nodeSelector.get(0);

                    if(nodeSelector instanceof HTMLElement) {
                        _nselector = nodeSelector;
                        if(nodeSelector.id.length == 0) nodeSelector.id = Banana.Tools.GUID();
                        nodeSelector = "#"+nodeSelector.id;
                    } else {
                        throw new Error("Banana: cannot create module, 'nodeSelector' is not an HTML node");
                    }
                    break;
            }
        } else {
            nodeSelector = "*[data-banana='"+name+"']";
        }
        if(!isset(_nselector)) _nselector = document.querySelector(nodeSelector);
        if(_nselector == null) throw new Error("Banana: cannot create module '"+name+"', root DOM element with selector '"+nodeSelector+"' doesn't exists");

        this.modules[name] = {
            "name":     name,
            "node":     _nselector,
            "module":   new Banana.Module(nodeSelector, bootstrap)
        };
        return this.modules[name];
    },

    module: function(name, nodeSelector, bootstrap) {
        Banana.createModule(name, nodeSelector, bootstrap);
        return Banana.modules[name].module;
    }
};

