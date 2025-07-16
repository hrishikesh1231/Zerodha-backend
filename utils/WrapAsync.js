module.exports = (fn) => {
    return (req, res, next) => {
        // fn(req, res, next).catch(err=>next(err));
        Promise.resolve(fn(req, res, next)).catch(err=>next(err));
    };
};
