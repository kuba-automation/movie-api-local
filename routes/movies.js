// routes/movies.js
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { fileURLToPath } from 'url';


function validateMovie(data) {
  const errors = [];

  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push('Title is required.');
  }

  if (typeof data.year !== 'number' || data.year < 1900 || data.year > 2100) {
    errors.push('Year must be between 1900 and 2100.');
  }

  if (typeof data.rating !== 'number' || data.rating < 0 || data.rating > 10) {
    errors.push('Rating must be between 0 and 10.');
  }

  return errors;
}

// Initiation of nextId variable
let nextId = 1;  // Zakładając, że zaczynasz od ID = 1, ale możesz to ustawić w zależności od danych

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const dbFile = join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Inicjalizacja bazy danych
await db.read();
db.data ||= { movies: [] };

// Ustawienie 'nextId' na najwyższy możliwy ID z istniejących danych
if (db.data.movies.length > 0) {
  nextId = Math.max(...db.data.movies.map(movie => movie.id)) + 1;
}

const router = express.Router();

// GET all movies
router.get('/', async (req, res) => {
  await db.read();
  console.log("Movies Data:", db.data.movies); // Logowanie przed wysłaniem odpowiedzi
  res.json(db.data.movies);
});

// POST a new movie
router.post('/', async (req, res) => {
  await db.read();
  // Użycie liczbowego ID
  const newMovie = { id: nextId++, ...req.body }; // Generowanie liczbowego ID i przypisanie do nowego filmu
  db.data.movies.push(newMovie);
  await db.write();
  console.log('New Movie Added:', newMovie);
  res.status(201).json(newMovie);
});

// PUT - replace a movie
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedMovie = req.body;

  await db.read();
  const index = db.data.movies.findIndex(m => m.id == id);
  if (index === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  db.data.movies[index] = { id: Number(id), ...updatedMovie };
  await db.write();
  res.json(db.data.movies[index]);
});

// PATCH - update part of a movie
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  await db.read();
  const movie = db.data.movies.find(m => m.id == id);
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  Object.assign(movie, updates);
  await db.write();
  res.json(movie);
});


// DELETE a movie
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const index = db.data.movies.findIndex((movie) => movie.id === Number(id)); // Porównanie jako liczba

  if (index === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  db.data.movies.splice(index, 1);
  await db.write();
  res.status(204).end();
});

// GET one movie by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  await db.read();
  const movie = db.data.movies.find(m => m.id == id);

  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }

  res.json(movie);
});


export default router;
