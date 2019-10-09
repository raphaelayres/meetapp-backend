export default async (err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(400).json({
      error: 'validationError',
      errors: [{ [err.field]: err.message }],
    });
  }
};
