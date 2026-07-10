const express = require("express");
const axios = require("axios");

const app = express();
const port = 8888;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/pics', express.static('pics'));

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/check", async (req, res) => {

    let textA = req.body.textA.toLowerCase();
    let textB = req.body.textB.toLowerCase();

    let wordsA = textA.split(" ");
    let wordsB = textB.split(" ");

    let sameWords = 0;

    for (let i = 0; i < wordsA.length; i++) {
        if (wordsB.includes(wordsA[i])) {
            sameWords++;
        }
    }

    let similarity = (sameWords / wordsA.length) * 100;
    similarity = similarity.toFixed(2);

    let risk = "";

    if (similarity >= 70) {
        risk = "High Risk";
    } else if (similarity >= 40) {
        risk = "Medium Risk";
    } else {
        risk = "Low Risk";
    }

    let prompt = `
You are CopyCheck AI.

Compare Submission A and Submission B.

Write only one paragraph explaining the similarities.

Rules:
- Plain text only.
- No markdown.
- No bullet points.
- No headings.
- No asterisks.
- No advice.
- No questions.
- Maximum 100 words.

Submission A:
${textA}

Submission B:
${textB}
`;
    const response = await axios.post(
        "http://localhost:11434/api/generate",
        {
            model: "gemma3:1b",
            prompt: prompt,
            stream: false
        }
    );

    let explanation = response.data.response;

    let result =
    "Similarity Percentage: " + similarity + "%\n\n" +
    "Risk Level: " + risk + "\n\n" +
    "AI Analysis:\n" + explanation;

    res.render("result", { result });

});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});