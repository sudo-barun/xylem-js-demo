const tapArgs = (fn) => function () {
    fn.apply(null, arguments);
    return arguments;
};
export default tapArgs;
