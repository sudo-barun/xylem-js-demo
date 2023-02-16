const pipeArgs = (functions) => function () {
    return functions.reduce((currentValue, currentFunction) => {
        return currentFunction.apply(null, currentValue);
    }, arguments);
};
export default pipeArgs;
