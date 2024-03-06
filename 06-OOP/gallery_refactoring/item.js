import { NormalDraw, SelectDraw } from "./draw.js";
import { createImageItem, createVideoItem, isDrawableItem } from "./util.js";
import { getVisualizer } from "./visualizer.js";
import { Observer } from "./observer.js";

class Drawable extends Observer {
  #drawStrategy;
  constructor() {
    super();
    this.#drawStrategy = new NormalDraw();
  }
  draw(ctx) {
    this.#drawStrategy.draw(ctx, this);
  }
  setDrawStrategy(drawStrategy) {
    this.#drawStrategy = drawStrategy;
  }
  update(data) {
    throw new Error("구현해!");
  }
}

class Item extends Drawable {
  #position;
  #animateHandle;
  scale;
  visualizer;
  constructor(index, gallery) {
    super();
    this.visualizer = null;
    this.source = null;
    this.index = index;
    this.scale = 1;
    this.#calcPosition(gallery, index);
  }
  get position() {
    return this.#position;
  }
  #calcPosition(gallery, index) {
    const { column, margin, itemWidth, itemHeight } = gallery;
    const row = Math.floor(index / column);
    const col = index % column;

    this.#position = {
      left: col * (itemWidth + margin),
      top: row * (itemHeight + margin),
      width: itemWidth,
      height: itemHeight,
    };
  }
  #animateScale(targetScale, duration = 250) {
    const start = Date.now();
    const initialScale = 1;
    const diff = targetScale - initialScale;
    const step = () => {
      const timePassed = Date.now() - start;
      const progress = timePassed / duration;
      this.scale = initialScale + diff * progress;

      if (progress < 1) {
        this.#animateHandle = requestAnimationFrame(step);
      }
    };
    step();
  }
  select() {
    this.setDrawStrategy(new SelectDraw());
  }
  unselect() {
    this.setDrawStrategy(new NormalDraw());
  }
  hover() {
    this.#animateScale(1.2);
  }
  leave() {
    cancelAnimationFrame(this.#animateHandle);
    this.scale = 1;
  }
  hitTest(x, y) {
    const { left, top, width, height } = this.#position;
    return x > left && x < left + width && y > top && y < top + height;
  }
  draw(ctx) {
    this.source && super.draw(ctx);
  }
  update(data) {
    switch (data.type) {
      case "select":
        {
          data.index === this.index ? this.select() : this.unselect();
        }
        break;
      case "hover":
        {
          data.index === this.index ? this.hover() : this.leave();
        }
        break;
    }
  }
}

export class ImageItem extends Item {
  constructor(index, src, gallery) {
    super(index, gallery);
    createImageItem(src).then((image) => {
      this.source = image;
    });
  }
}

export class VideoItem extends Item {
  constructor(index, src, gallery) {
    super(index, gallery);
    createVideoItem(src).then((video) => {
      this.source = video;
      video.muted = true;
      video.play();
    });
  }
  #initVisualizer() {
    this.visualizer === null &&
      !isDrawableItem(this.source) &&
      (this.visualizer = getVisualizer(this.source, 640, 320));
  }
  select() {
    this.#initVisualizer();
    this.visualizer?.play();
    this.source.muted = false;
    this.source.play();
    super.select();
  }
  unselect() {
    this.source.muted = true;
    this.source.pause();
    this.visualizer?.pause();
    super.unselect();
  }
}

export class ItemFactory {
  create(index, src, gallery) {
    return this.createItem(index, src, gallery);
  }
  createItem(index, src, gallery) {
    throw new Error("구현해");
  }
}

export class ImageItemFactory extends ItemFactory {
  createItem(index, src, gallery) {
    return new ImageItem(index, src, gallery);
  }
}

export class VideoItemFactory extends ItemFactory {
  createItem(index, src, gallery) {
    return new VideoItem(index, src, gallery);
  }
}
