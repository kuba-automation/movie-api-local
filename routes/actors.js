import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

function validateActor(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Name is required.');
  }

  if (!Array.isArray(data.movies)) {
    errors.push('Movies must be an array of movie IDs.');
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

// Initiation of nextId variable
let nextId = 1;

// Ustawienie 'nextId' na najwyższy możliwy ID z istniejących danych
if (db.data.actors.length > 0) {
  nextId = Math.max(...db.data.actors.map(actor => actor.id)) + 1;
}

// GET all actors
router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.actors);
});

// POST a new actor
router.post('/', async (req, res) => {
  const newActor = { id: nextId++, ...req.body };
  db.data.actors.push(newActor);
  await db.write();
  res.status(201).json(newActor);
});

// DELETE an actor
router.delete('/:id', async (req, res) => {
  const actorId = parseInt(req.params.id); // Konwersja na liczbę
  const index = db.data.actors.findIndex((actor) => actor.id === Number(req.params.id)); // Porównanie liczbowe

  if (index === -1) {
    return res.status(404).json({ message: 'Actor not found' });
  }

  db.data.actors.splice(index, 1);
  await db.write();
  res.status(204).end();
});


// PUT - replace an actor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedActor = req.body;

  await db.read();
  const index = db.data.actors.findIndex(a => a.id == id);
  if (index === -1) {
    return res.status(404).json({ message: 'Actor not found' });
  }

  db.data.actors[index] = { id: Number(id), ...updatedActor };
  await db.write();
  res.json(db.data.actors[index]);
});

// PATCH - update part of an actor
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  await db.read();
  const actor = db.data.actors.find(a => a.id == id);
  if (!actor) {
    return res.status(404).json({ message: 'Actor not found' });
  }

  Object.assign(actor, updates);
  await db.write();
  res.json(actor);
});

// GET one actor by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  await db.read();
  const actor = db.data.actors.find(a => a.id == id);

  if (!actor) {
    return res.status(404).json({ message: 'Actor not found' });
  }

  res.json(actor);
});



export default router;
