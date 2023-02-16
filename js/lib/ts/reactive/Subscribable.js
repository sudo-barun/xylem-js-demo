export function createSubscribable(callback) {
    const subscribers = [];
    const emit = function (value) {
        subscribers.forEach(subscriber => {
            if (arguments.length) {
                subscriber(value);
            }
            else {
                subscriber();
            }
        });
    };
    callback(emit);
    const unsubscribe = function (subscriber) {
        const index = subscribers.indexOf(subscriber);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    };
    const subscribe = function (subscriber) {
        subscribers.push(subscriber);
        return function () {
            unsubscribe(subscriber);
        };
    };
    const emitter = {
        subscribe,
    };
    Object.defineProperty(emitter, 'subscribers', { value: subscribers });
    return emitter;
}
