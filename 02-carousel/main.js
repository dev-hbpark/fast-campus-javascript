import makeCarousel, { createElement } from './module.js';

const app = createElement({
  tagName: 'div',
  parent: document.body,
});

app.style.cssText = `width: 700px;
height: 250px;
background-color: rgb(100, 100, 100);`;

app.appendChild(
  makeCarousel(
    [
      './images/02.jpg',
      './images/03.jpg',
      './images/04.jpg',
      './images/05.jpg',
    ],
    { visibleCount: 2, slideCount: 2, captionPos: 'left top' }
  )
);
app.appendChild(
  makeCarousel(
    [
      './images/02.jpg',
      './images/03.jpg',
      './images/04.jpg',
      './images/05.jpg',
      './images/06.jpg',
      './images/07.jpg',
      './images/08.jpg',
      './images/09.jpg',
    ],
    { visibleCount: 3, slideCount: 5, captionPos: 'right bottom' }
  )
);
app.appendChild(
  makeCarousel(undefined, {
    captionPos: 'left',
  })
);
