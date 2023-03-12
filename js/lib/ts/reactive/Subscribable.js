export function createSubscribable(callback) {
    const subscribers = [];
    const emit = function (value) {
        subscribers.forEach(subscriber => {
            if (arguments.length) {
                if (typeof subscriber === 'function') {
                    subscriber(value);
                }
                else {
                    subscriber._(value);
                }
            }
            else {
                if (typeof subscriber === 'function') {
                    subscriber();
                }
                else {
                    subscriber._();
                }
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
        return {
            _: function () {
                unsubscribe(subscriber);
            },
        };
    };
    const emitter = {
        subscribe,
    };
    Object.defineProperty(emitter, 'subscribers', { value: subscribers });
    return emitter;
}
