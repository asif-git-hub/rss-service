import { ChatGPTClient } from './clients/chatgpt.client';

const chatgpt = new ChatGPTClient()
chatgpt.completeWithErrorHandling("Say hello")
  .then(r => console.log(r?.data?.choices[0]?.text))
  .catch(e => console.log(e))
