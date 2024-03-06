export async function createImageItem(src, index) {
  return new Promise((resolve) => {
    const image = document.createElement("img");
    image.src = src;
    image.onload = () => {
      resolve(image);
    };
  });
}

export async function createVideoItem(src, index) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.onloadeddata = () => {
      resolve(video);
    };
    // video.ontimeupdate = () => {
    //   drawItem(video, index);
    // };
  });
}

export function isDrawableItem(item) {
  return (
    item instanceof HTMLImageElement ||
    (item instanceof HTMLVideoElement &&
      item.videoWidth > 0 &&
      item.videoHeight > 0)
  );
}

export function drawClipPath(ctx, left, top, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(left + radius, top);
  ctx.arcTo(left + width, top, left + width, top + height, radius);
  ctx.arcTo(left + width, top + height, left, top + height, radius);
  ctx.arcTo(left, top + height, left, top, radius);
  ctx.arcTo(left, top, left + width, top, radius);
  ctx.closePath();
  ctx.clip();
}

export function getOrgSize(item) {
  if (item instanceof HTMLVideoElement) {
    return { width: item.videoWidth, height: item.videoHeight };
  } else {
    return { width: item.width, height: item.height };
  }
}
