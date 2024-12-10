const express = require('express');
const {exec} = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/fetch_students', (req, res) => {
    const {emails} = req.body
    exec(`python3 ./scripts/fetchStudentInfo.py "${emails}"`, 
    (error, stdout, stderr) => {
        if (error){
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error: ${stderr}`);
        }
        res.status(200).send(`Success!`);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`)
})
