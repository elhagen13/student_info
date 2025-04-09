const express = require('express');
const {exec} = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const {fetchStudentInfo} = require('./scripts/fetchStudentInfo')

const app = express();
const port = 3001;

app.use(express.json());


app.post('/fetch_students', async (req, res) => {
  const {students, username, password} = req.body
  
   try{
    const studentInfoList = await fetchStudentInfo(students, username, password);
    res.status(200).json(studentInfoList)
   }
   catch(error){
    res.status(500).send(`Error: ${error.message}`);
   }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
})
