const validateRequest = (schema) => async (req, res, next) => {
    try {
      const parseBody = await schema.parseAsync(req.body);
      req.body = parseBody;
      next();
    } catch (err) {
      const error = {
        status: 422,
        message: err.errors[0].message,
      };
      next(error);
    }
};
  
module.exports = validateRequest;
  