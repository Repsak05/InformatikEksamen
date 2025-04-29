import express from 'express';
import { createServer } from 'http';
import { parse } from 'url';

const app = express();
const port = 3000;

app.use(express.json());

// Your API route
app.post('/api/saveRfid', (req, res) => {
  const handler = require('./path/to/your/saveRfid').default;
  handler(req, res);
});

const server = createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});