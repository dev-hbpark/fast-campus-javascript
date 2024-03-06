import { Gallery } from "./gallery.js";

const parent = document.createElement("div");
document.body.appendChild(parent);
parent.style.width = "640px";
parent.style.height = "640px";

const imageSrcList = [
  "./videos/01.mp4",
  "./audio/01.mp3",
  "./audio/02.mp3",
  "./audio/03.mp3",
  "./images/04.jpg",
  "./images/05.jpg",
  "./images/06.jpg",
  "./images/07.jpg",
  "./images/08.jpg",
  "./images/09.jpg",
  "./images/10.jpg",
  "./images/11.jpg",
  "./images/12.jpg",
  "./images/13.jpg",
  "./images/14.jpg",
  "./images/15.jpg",
  "./images/01.jpg",
  "./images/02.jpg",
  "./images/03.jpg",
  "./images/04.jpg",
  "./images/05.jpg",
  "./images/01.jpg",
  "./images/02.jpg",
  "./images/03.jpg",
  "./images/04.jpg",
  "./images/05.jpg",
  "./images/06.jpg",
  "./images/07.jpg",
  "./images/08.jpg",
  "./images/09.jpg",
  "./images/10.jpg",
  "./images/11.jpg",
  "./images/12.jpg",
  "./images/13.jpg",
  "./images/14.jpg",
  "./images/15.jpg",
  "./images/01.jpg",
  "./images/02.jpg",
  "./images/03.jpg",
  "./images/04.jpg",
  "./images/05.jpg",
  "./images/06.jpg",
];

// parent.appendChild(gallery(imageSrcList, 640, 640, 4, 5));

parent.appendChild(new Gallery(imageSrcList, 640, 640, 4, 5, 2).renderer);
