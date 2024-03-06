import { drawClipPath, isDrawableItem, getOrgSize } from "./util.js";

const defaultAudioImg = document.createElement("img");
defaultAudioImg.src = "./images/mp3.png";
defaultAudioImg.onload = () => {
  console.log("audio image loaded");
};

class DrawStrategy {
  draw(ctx, item) {
    throw new Error("구현해!");
  }
}

export class NormalDraw extends DrawStrategy {
  draw(ctx, item) {
    const { left, top, width, height } = item.position;
    const destWidth = width * item.scale;
    const destHeight = height * item.scale;
    const destLeft = left + (width - destWidth) / 2;
    const destTop = top + (height - destHeight) / 2;

    ctx.save();
    drawClipPath(ctx, destLeft, destTop, destWidth, destHeight, 10);
    ctx.drawImage(
      isDrawableItem(item.source) ? item.source : defaultAudioImg,
      destLeft,
      destTop,
      destWidth,
      destHeight
    );
    ctx.restore();
  }
}

export class SelectDraw extends DrawStrategy {
  draw(ctx, item) {
    const source = item.visualizer?.renderer || item.source;
    const canvas = ctx.canvas;
    const { width, height } = getOrgSize(source);
    const imgAspectRatio = width / height;
    const canvasAspectRatio = canvas.width / canvas.height;
    let renderWidth, renderHeight, offsetX, offsetY;
    if (imgAspectRatio > canvasAspectRatio) {
      renderWidth = canvas.width;
      renderHeight = canvas.width / imgAspectRatio;
      offsetX = 0;
      offsetY = (canvas.height - renderHeight) / 2;
    } else {
      renderWidth = canvas.height * imgAspectRatio;
      renderHeight = canvas.height;
      offsetX = (canvas.width - renderWidth) / 2;
      offsetY = 0;
    }
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();
  }
}
