// catches rejected promises and forwards to next(), skips try/catch in every controller
function asyncHandler(handler) {
  return function (req, res, next) {
    handler(req, res, next).catch(next);
  };
}

module.exports = asyncHandler;
