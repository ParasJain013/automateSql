
//LET's DO IT


// console.log(uuidv4())
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

const JobTitles=require('./adminData')
// console.log(JobTitles)
dotenv.config()
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 7000;
app.use(express.json())
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBFUQkWOOUUDFJ1AoYKnx2sjNjkGkRlZTk");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const prompt = "Explain how AI works";

// const uid = generateUniqueId();
//app.get('/',async (req, res) => {
 //   res.send(200).json({success: true,message:"REACHED"});
//});
let currentCount=87;
var currIndex = 87;
var currTagId=3514;
// console.log(JobTitles[currIndex])
//app.get("/tags")
    
  const tags=  async (req, res) => {
    try {
        console.log("CURRENT INDEX: ", currentCount++, " JOB ID: ", JobTitles.JobTitles[currIndex][0], " JOB TITLE: ", JobTitles.JobTitles[currIndex][1]);

        const prompt = `give me 50-60 tags/keywords related to job in ${JobTitles.JobTitles[currIndex][1]}  i don't need any heading or any styling just give me the keywords/tags separated by comma and nothing else`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const tags = text.split(",").map(tag => tag.trim()).filter(tag => tag !== "");

        for (const tag of tags) {
            const query1 = `SELECT tag_id FROM Tags WHERE tag_name = ?`;
            const [row1] = await (await db).query(query1, [tag]);

            if (row1.length === 0) {
                await (await db).query("INSERT INTO tags (tag_id, tag_name) VALUES (?, ?)", [currTagId, tag]);
                await (await db).query("INSERT INTO Jobs_Tags (tag_id, JobID) VALUES (?, ?)", [currTagId, JobTitles.JobTitles[currIndex][0]]);
                currTagId++;
            } else {
                const tagId = row1[0].tag_id;
                await (await db).query("INSERT INTO Jobs_Tags (tag_id, JobID) VALUES (?, ?)", [tagId, JobTitles.JobTitles[currIndex][0]]);
            }
        }

        console.log("Processed tags:", tags);
        currIndex++;
        // res.status(200).json({ success: true, tags });
    } catch (error) {
        console.error("Error in /tags:", error.message);
        // res.status(500).json({ success: false, message: "Failed to process tags" });
    }
};



app.listen(PORT,()=>{
    console.log(`SERVER LISTENING ON PORT ${PORT}`)
;
    setInterval(async () => {

        try {
            tags()
            // const response = await fetch(`http://localhost:${PORT}/tags`);
            // console.log(response.data);
            // const response = await axios.get(`http://localhost:${PORT}/imageGenerate`);
            // console.log("Response from /imageGenerate:", response.data);
        } catch (error) {
            console.error("Error hitting /imageGenerate:");
        }
    }, 60000); // 1000 ms = 1 second

})
