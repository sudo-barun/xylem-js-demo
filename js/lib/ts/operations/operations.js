import createMappedSourceStream from "../core/createMappedSourceStream.js";
import { createSubscribable } from "../reactive/Subscribable.js";
// type EmitterDeriver<T,U> = (emitter: SourceStream<T,U>)=>SourceStream<T,U>;
export function combinePipes(pipes) {
    if (pipes.length === 0) {
        throw new Error('Array cannot be empty');
    }
    let previousPipe = null;
    pipes.forEach(function (pipe) {
        if (previousPipe) {
            previousPipe.subscribe(pipe);
            // emitterToReturn = previousPipe();
        }
        previousPipe = pipe;
    });
    previousPipe;
    let emitterToReturn = createMappedSourceStream(function (emit, value) {
        pipes[0](value);
        // emit(value);
    });
    return emitterToReturn;
}
// export
// function map<T> (callback: (value: T) => T): Pipe<T,T>;
export function map(callback) {
    return createMappedSourceStream((emit, value) => emit(callback(value)));
}
export function filter(callback) {
    return createMappedSourceStream((emit, value) => {
        if (callback(value)) {
            emit(value);
        }
    });
}
export function forEach(callback) {
    createMappedSourceStream((_emit, value) => void callback(value));
}
export function any(subscribables) {
    return createSubscribable((emit) => {
        subscribables.forEach((subscribable) => {
            subscribable.subscribe((value) => void emit(value));
        });
    });
}
export function anyAsArray(subscribables) {
    return createSubscribable((emit) => {
        subscribables.forEach((subscribable, index) => {
            subscribable.subscribe((value) => {
                const arr = new Array(subscribables.length);
                arr[index] = value;
                emit(arr);
            });
        });
    });
}
export function interval(delayMilliseconds) {
    return createSubscribable((emit) => {
        setInterval(() => emit(), delayMilliseconds);
    });
}
