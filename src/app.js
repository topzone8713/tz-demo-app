const express = require('express')
const app = express()
app.disable("x-powered-by");
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const path = require('path')
const axios = require('axios');

app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
  return res.redirect('/index')
});

app.get('/index', (req, res) => {
    res.render("index.ejs",{})
})

app.get('/index2', (req, res) => {
    for (const key in req.headers) {
        console.log("---", `${key}: ${req.headers[key]}`);
    }
    res.render("index.ejs",{})
})

app.post('/gpt', function (req, res) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    let prompt = req.body.prompt;

    let IS_CHAT = true;
    async function getGPT3Response(text) {
        let rslt = '';
        let apiUrl = 'https://api.openai.com/v1/chat/completions';

        let messages = [{"role": "user", "content": text}];

        let params = {
            messages: messages,
            model: process.env.MODEL_ID,
            max_tokens: 2048,
            temperature: 0,
        }
        if (!IS_CHAT) {
            apiUrl = 'https://api.openai.com/v1/completions';
            params = {
                prompt: text,
                model: "text-davinci-003",
                max_tokens: 2048,
                temperature: 0,
            }
        }
        await axios.post(apiUrl, params, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
        })
        .then(response => {
            let choices = response.data.choices;
            if (IS_CHAT) {
                for (let choice in choices) {
                    if (choice.messages) {
                        for (let message in choice.messages) {
                            rslt += message.content + '\n';
                        }
                    } else {
                        rslt += choice.message.content + '\n';
                    }
                }
            } else {
                for (let choice in choices) {
                    rslt += choice.text + '\n';
                }
            }
            if (rslt.startsWith('\n\n')) {
                rslt = rslt.substring(2, rslt.length - 1);
            }
            console.log(rslt);
        })
        .catch(error => {
            rslt = error;
            rslt.message = 'Model (' + process.env.MODEL_ID + '): ' + rslt.message;
            console.log(error);
        });
        return rslt;
    }

    getGPT3Response(prompt).then(response => {
      res.status(200).send(response);
    }).catch(error => {
      console.error(error);
      res.status(502).send('error!!!');
    });
})

app.listen(3000)
console.log('Server started at http://localhost:' + 3000)



