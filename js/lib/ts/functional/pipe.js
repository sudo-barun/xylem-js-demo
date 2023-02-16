const pipe = (functions) => (value) => {
    return functions.reduce((currentValue, currentFunction) => {
        return currentFunction(currentValue);
    }, value);
};
export default pipe;
