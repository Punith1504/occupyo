const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: "dummy" });
console.log("openai.beta:", Object.keys(openai.beta || {}));
if (openai.beta && openai.beta.chat) {
  console.log("openai.beta.chat:", Object.keys(openai.beta.chat || {}));
} else {
  console.log("openai.beta.chat is undefined");
}
console.log("openai.chat:", Object.keys(openai.chat || {}));
if (openai.chat.completions) {
  console.log("openai.chat.completions.parse exists?", !!openai.chat.completions.parse);
}
