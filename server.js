const express = require('express');
const cors = require('cors');
const { fetchStudentInfo } = require('./scripts/fetchStudentInfo');

const app = express();
const port = 3000;

app.use(cors());

app.get('/api/fetch_students', async (req, res) => {
  const { students, username, password } = req.query;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers immediately

  try {
    const studentList = JSON.parse(students);
    
    // Assuming fetchStudentInfo is now a generator function that yields progress
    const studentInfoGenerator = fetchStudentInfo(studentList, username, password);
    
    for await (const update of studentInfoGenerator) {
      // Send each yielded update as an SSE event
      res.write(`data: ${JSON.stringify(update)}\n\n`);
      
      // Manually flush if available
      if (typeof res.flush === 'function') {
        res.flush();
      }
    }
    
    // Final completion message
    res.write('data: [DONE]\n\n');
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end();
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://:${port}/`);
});