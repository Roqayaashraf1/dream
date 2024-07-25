export const validation = (shema) => {
  return (req, res, next) => {
    let { error } = shema.validate(req.body, { abortEarly: false });
    if (error) {
      let errors = error.details.map((detail) => detail.message);
      res.json(errors);
    } else {
      next();
    }
  };
};
