// initRecognition();
const OPENAI_API_KEY = "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";

let recognition = null;
document.getElementById("startBtn").onclick = () => {
  wakeUp();
};
async function wakeUp() {
  await addChatMessage("음성인식을 시작합니다.", "ai");
  recognition = initRecognition();
}

function startRecognition() {
  try {
    recognition?.start();
  } catch (err) {
    //
  }
}

function stopRecognition() {
  try {
    recognition.stop();
  } catch (err) {
    //
  }
}

async function addChatMessage(text, author = "user", url = null) {
  const chatContainer = document.getElementById("chatContainer");
  const messageElement = document.createElement("div");
  messageElement.classList.add("chatMessage", author);
  messageElement.textContent = text;

  if (url) {
    const image = document.createElement("img");
    image.src = url;
    messageElement.appendChild(image);
    console.log(image, messageElement);
  }

  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  author === "ai" && (await speak(text));
}

async function weatherForecast() {
  const API_KEY =
    "3YjvCKjj7GRuyvUtCInuvHw0u3YwbwjFqonVyAKUuCUR3oqrQD29uIG4gRz59kKF4TnTzIOn5Ydqc9WWRuczZA%3D%3D";
  const now = new Date();
  const date = now
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replaceAll(". ", "")
    .replace(".", "");
  //   console.log(date);
  const time = String(now.getHours()).padStart(2, "0") + "00";
  //   console.log(time);
  const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${date}0&base_time=${time}&nx=61&ny=125`;
  //   console.log(url);
  const response = await fetch(url);
  const data = await response.json();
  const items = data.response.body.items.item;
  const temperature = items.find((item) => item.category === "T1H").obsrValue;
  const humidity = items.find((item) => item.category === "REH").obsrValue;
  return `현재 기온은 ${temperature}도이고 습도는 ${humidity}%입니다.`;
}

async function process(message) {
  let aiMessage = "죄송합니다. 이해할 수 없습니다.";
  let url = null;
  if (message.startsWith("날씨")) {
    aiMessage = await weatherForecast();
  } else if (message.startsWith("번역")) {
    aiMessage = await translate(message.split("번역")[1]);
  } else if (message.startsWith("그림")) {
    url = (await generateImage(message.split("그림")[1])).url;
    console.log(url);
    aiMessage = "";
  } else {
    aiMessage = await askQuestion(message);
  }
  await addChatMessage(aiMessage, "ai", url);
}

async function translate(text) {
  return await askQuestion(`"${text}"을 영어로 번역한 결과를 설명없이 알려줘`);
}

async function askQuestion(question) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "assistant",
          content: question,
        },
      ],
    }),
  });
  return (await response.json()).choices[0].message.content;
}

async function generateImage(text) {
  text = await translate(text);
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-2",
      prompt: text,
      n: 1,
      size: "256x256",
    }),
  });
  const result = await response.json();
  console.log(result);
  return {
    created: result.created,
    url: result.data[0].url,
  };
}

function initRecognition() {
  let isRun = Promise.resolve(false);
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  console.log(recognition);
  recognition.continuos = true;
  recognition.lang = "ko-KR";
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log("started");
  };

  recognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript;
    isRun = process(text);
    addChatMessage(text, "user");
    // speak(text);
  };

  recognition.onend = () => {
    isRun.then(() => {
      recognition.start();
    });
  };

  //   document.getElementById("speech").onclick = () => {
  //     recognition.start();
  //   };
  //   recognition.start();

  return recognition;
}

function speak(text) {
  stopRecognition();
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
  utterance.onend = () => {
    startRecognition();
  };
}
