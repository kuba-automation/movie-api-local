import express from 'express';
import moviesRouter from './routes/movies.js';
import reviewsRouter from './routes/reviews.js';  
import actorsRouter from './routes/actors.js';   
import apiKeyAuth from './middleware/apiKeyAuth.js';
 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(apiKeyAuth);

app.use(express.json());
app.use('/api/movies', moviesRouter);
app.use('/api/reviews', reviewsRouter);   
app.use('/api/actors', actorsRouter);     

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
