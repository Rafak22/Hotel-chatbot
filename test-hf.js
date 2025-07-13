const axios = require('axios');
const apiKey = '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';
const endpoint = "https://api-inference.huggingface.co/models/gpt2";
const headers = { Authorization: `Bearer ${apiKey}` };
const payload = {
  inputs: "Hello! How are you?"
};

axios.post(endpoint, payload, { headers })
  .then(res => {
    console.log(res.data);
  })
  .catch(err => {
    console.error(err.response ? err.response.data : err.message);
  }); 