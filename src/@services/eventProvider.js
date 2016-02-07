/**
 * Created by odin on 06.02.16.
 */

/**
 * Данный сервис реализует паттерн "наблюдатель" (Observer)
 * и позволяет реализовать подписку на события внутри компонента
 */
Banana.Global.service("eventProvider", function(){
    var handler     = undefined,
        instance    = this,
        events      = [];

    /**
     * Bind the observer to the object
     * @param obj Object
     */
    this.bind = function(obj) {
        obj.on        = instance.on;
        obj.trigger   = instance.trigger;
        handler       = obj;
    };


    /**
     * Set event handler
     * <p><b>This method is deprecated, use <i>bind</i> instead</b></p>
     * @param obj Object that will managed
     * @returns {*}
     */
    this.setHandler = function(obj) {
        handler = obj;
        return instance;
    };

    /**
     * Subscribe to event
     * @param eventName Event name
     * @param callBack function
     * @returns {*}
     */
    this.on = function(eventName, callBack) {
        if(!isset(events[eventName])) events[eventName] = [];
        events[eventName].push(callBack);
        return instance;
    };


    /**
     * Call methods that are subscribed to specific event.
     * @param eventName Event Name
     * @param eventData Data provided to event
     * @returns {*}
     */
    this.trigger = function(eventName, eventData) {
        if(!isset(events[eventName])) return true;
        for(var c = 0; c < events[eventName].length; c++) {
            var triggered = events[eventName][c];
            if(isset(eventData)) return triggered(eventData, handler, eventName);
            triggered(handler, eventName);
        }
    };
});
