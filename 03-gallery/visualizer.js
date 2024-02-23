let audioContext = null;

function setupAudioContext(audioElement) {
  let analyser = null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  analyser = audioContext.createAnalyser();

  if (!analyser) throw new Error("failed!");

  const source = audioContext.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(audioContext.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  return {
    analyser,
    dataArray: new Uint8Array(bufferLength),
    bufferLength,
  };
}

export function getVisualizer(audio, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  const { analyser, dataArray, bufferLength } = setupAudioContext(audio);

  let handle = null;
  let rotation = 0;
  let hue = Math.random() * 360;
  let interval = null;

  function updateRotation() {
    rotation += 0.02;
    if (rotation >= 2 * Math.PI) {
      rotation = 0;
    }
  }

  function drawVisualizer() {
    handle = requestAnimationFrame(drawVisualizer);

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    ctx.translate(-centerX, -centerY);

    ctx.beginPath();

    for (let i = 0; i < bufferLength; ++i) {
      const barHeight = dataArray[i] / 2;
      const radian = (i / bufferLength) * 2 * Math.PI;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

      const x = centerX + barHeight * Math.cos(radian);
      const y = centerY + barHeight * Math.sin(radian);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();

    updateRotation();
  }

  return {
    renderer: canvas,
    play: () => {
      handle === null && drawVisualizer();
      if (interval === null) {
        interval = setInterval(() => {
          hue = (hue + 10) % 360;
        }, 1000);
      }
    },
    pause: () => {
      cancelAnimationFrame(handle);
      handle = null;
      clearInterval(interval);
      interval = null;
    },
  };
}
