import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';


function validateReview(data) {
  const errors = [];

  if (!data.reviewer || typeof data.reviewer !== 'string' || data.reviewer.trim() === '') {
    errors.push('Reviewer name is required.');
  }

  if (!data.content || typeof data.content !== 'string' || data.content.trim().length < 5) {
    errors.push('Content must be at least 5 characters long.');
  }

  if (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 10) {
    errors.push('Rating must be a number between 0 and 10.');
  }

  if (data.date && isNaN(Date.parse(data.date))) {
    errors.push('Invalid date format.');
  }

  return errors;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const dbFile = join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

await db.read();
db.data ||= { movies: [], reviews: [], actors: [] };

const router = express.Router();

let nextId = 1;

if (db.data.reviews.length > 0) {
  nextId = Math.max(...db.data.reviews.map(review => review.id)) + 1;
}


// GET all reviews
router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.reviews);
});

// POST a new review
router.post('/', async (req, res) => {
  const errors = validateReview(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newReview = { id: nextId++, ...req.body };
  db.data.reviews.push(newReview);
  await db.write();
  res.status(201).json(newReview);
});

// DELETE a review
router.delete('/:id', async (req, res) => {
  const index = db.data.reviews.findIndex((review) => review.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Review not found' });
  }

  db.data.reviews.splice(index, 1);
  await db.write();
  res.status(204).end();
});

// PUT - replace a review
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const errors = validateReview(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  await db.read();
  const index = db.data.reviews.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Review not found' });
  }

  db.data.reviews[index] = { id, ...req.body };
  await db.write();
  res.json(db.data.reviews[index]);
});

// PATCH - update part of a review
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;

  await db.read();
  const review = db.data.reviews.find(r => r.id === id);
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  Object.assign(review, updates);

  const errors = validateReview(review);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  await db.write();
  res.json(review);
});

// GET one review by ID
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  await db.read();
  const review = db.data.reviews.find(r => r.id === id);

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  res.json(review);
});

export default router;
