export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      return res.status(400).json({ message: err.errors ? err.errors.map(e=>e.message).join(', ') : 'Invalid input' });
    }
  };
}
