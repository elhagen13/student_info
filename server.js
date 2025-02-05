const express = require('express');
const {exec} = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const {fetchStudentInfo, fetchStudents} = require('./scripts/fetchStudentInfo')

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/fetch_students', async (req, res) => {
    const {students} = req.body
    console.log(students)
    /*exec(`python3 ./scripts/fetchStudentInfo.py "${JSON.stringify(students).replace(/"/g, '\\"')}"`, 
    (error, stdout, stderr) => {
        if (error){
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error: ${stderr}`);
        }
        res.status(200).send(`${stdout}`);
    });
    */
   try{
    const studentInfoList = await fetchStudentInfo(students);
    res.status(200).json(studentInfoList)
   }
   catch(error){
    console.error(`Error fetching students: ${error}`);
    res.status(500).send(`Error: ${error.message}`);
   }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
})
