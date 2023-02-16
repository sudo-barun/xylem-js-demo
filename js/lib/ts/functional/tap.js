const tap = (fn) => (value) => {
    fn(value);
    return value;
};
export default tap;
