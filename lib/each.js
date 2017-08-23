module.exports = function each(obj, cb) {
  Object.keys(obj).forEach(key => {
    cb(obj[key], key);
  });
  return obj;
};
