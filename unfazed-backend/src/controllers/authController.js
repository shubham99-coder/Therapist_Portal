const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Therapist = require('../models/Therapist');
const generateSlug = require('../utils/generateSlug');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    if (await Therapist.exists({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const slug = await generateSlug(name);
    const therapist = await Therapist.create({ name, email, password_hash, slug });

    res.status(201).json({
      token: signToken(therapist._id),
      therapist: { id: therapist._id, name, email, slug },
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const therapist = await Therapist.findOne({ email }).select('+password_hash');
    if (!therapist || !(await bcrypt.compare(password, therapist.password_hash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: signToken(therapist._id),
      therapist: { id: therapist._id, name: therapist.name, email, slug: therapist.slug },
    });
  } catch (err) { next(err); }
};