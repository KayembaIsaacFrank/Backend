const { body, validationResult } = require('express-validator');

exports.validateProcurement = [
  body('tonnage').isFloat({ min: 1 }).withMessage('Tonnage must be at least 1 ton'),
  body('cost_per_ton').isFloat({ min: 0 }).withMessage('Cost must be positive'),
  body('dealer_id').isInt().withMessage('Valid dealer required'),
  body('branch_id').isInt().withMessage('Valid branch required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
