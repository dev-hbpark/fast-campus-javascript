import { ImageItemFactory, VideoItemFactory } from "./item.js";
import { Subject } from "./observer.js";

class GalleryItemBuilder {
  #factory;
  #gallery;
  constructor(gallery) {
    this.#gallery = gallery;
    this.#factory = new Map();
    this.#factory.set("image", new ImageItemFactory());
    this.#factory.set("video", new VideoItemFactory());
  }
  build(src, index) {
    const item = this.#factory
      .get(src.endsWith(".mp4") || src.endsWith(".mp3") ? "video" : "image")
      .create(index, src, this.#gallery);
    this.#gallery.addObserver(item);
    return item;
  }
}

export class Gallery extends Subject {
  #animateHandle;
  #itemBuilder;
  #itemList;
  #canvas;
  #ctx;
  #maxScrollY;
  #currentScrollY;
  #hoverItem;
  selectedItem;
  constructor(imageSrcList, width, height, row, column, margin = 2) {
    super();
    this.#itemBuilder = new GalleryItemBuilder(this);
    this.#hoverItem = null;
    this.selectedItem = null;
    this.itemWidth = width / column - margin;
    this.itemHeight = height / row - margin;
    this.width = width;
    this.height = height;
    this.row = row;
    this.column = column;
    this.margin = margin;
    this.#initCanvas();
    this.#createItems(imageSrcList);
    this.#startRender();
    this.#registEventHandler();
    this.#currentScrollY = 0;
    this.#maxScrollY = this.#calcMaxScrollPos(imageSrcList.length);
  }
  get renderer() {
    return this.#canvas;
  }
  #initCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    this.#canvas = canvas;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, this.width, this.height);
    this.#ctx = ctx;
  }
  #createItems(srcList) {
    this.#itemList = srcList.map((src, index) =>
      this.#itemBuilder.build(src, index)
    );
  }
  #startRender() {
    const render = () => {
      const canvas = this.#canvas;
      const ctx = this.#ctx;

      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.translate(0, this.#currentScrollY);
      this.#itemList.forEach((item, index) => {
        if (this.#hoverItem === item || this.selectedItem === item) return;
        item.draw(ctx);
      });
      this.#hoverItem?.draw(ctx);
      this.selectedItem?.draw(ctx);
      ctx.restore();
      this.#animateHandle = requestAnimationFrame(render);
    };
    render();
  }
  #calcMaxScrollPos(itemCount) {
    const rowCount = Math.ceil(itemCount / this.column);
    const totalHeight = rowCount * (this.itemHeight + this.margin);
    return totalHeight - this.#canvas.height;
  }

  #registEventHandler() {
    this.#canvas.addEventListener("wheel", (event) => {
      if (this.selectedItem !== null) return;
      event.preventDefault();
      let scrollY = this.#currentScrollY - event.deltaY;
      scrollY = Math.min(scrollY, 0);
      scrollY = Math.max(scrollY, -this.#maxScrollY);
      this.#currentScrollY = scrollY;

      console.log(this.#currentScrollY);
    });

    this.#canvas.addEventListener("mousemove", (event) => {
      if (this.selectedItem !== null) return;
      const { offsetX, offsetY } = event;
      const hoverItem = this.#itemList.find((item) =>
        item.hitTest(offsetX, offsetY)
      );
      if (this.#hoverItem !== hoverItem) {
        // hoverItem.hover();
        const index = isFinite(hoverItem?.index) ? hoverItem.index : -1;
        this.notify({ type: "hover", index });
        this.#hoverItem = hoverItem;
      }
    });

    this.#canvas.addEventListener("click", (event) => {
      if (this.selectedItem !== null) {
        this.notify({ type: "select", index: null });
        this.selectedItem = null;
        return;
      }
      const { offsetX, offsetY } = event;
      this.selectedItem = this.#itemList.find((item) =>
        item.hitTest(offsetX, offsetY)
      );
      const index = isFinite(this.selectedItem?.index)
        ? this.selectedItem.index
        : -1;
      this.notify({ type: "select", index });
    });
  }
}
