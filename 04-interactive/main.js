import makeCarousel from "../02-carousel/module.js";

document.addEventListener("DOMContentLoaded", () => {
  const typingSection = document.querySelector(".typing-effect");
  const imageSliderSection = document.getElementById("image-slider");
  const videoSection = document.getElementById("video-player");
  const modelViewerSection = document.getElementById("model-viewer");
  const tiltEffectSection = document.querySelector(".tilt-effect-container");
  const tiltContents = document.querySelector(".tilt-effect");
  const progress = document.getElementById("scroll-progress");
  let zoomLevel = 1;
  const minZoomLevel = 0.01;
  const maxZoomLevel = 2;
  let camera = null;

  init3DViewer(modelViewerSection);
  registTiltEffectHandler(tiltContents);
  initProgressAnimation(progress);

  function initProgressAnimation(target) {
    target.animate(
      {
        width: ["0%", "100%"],
      },
      {
        timeline: new ScrollTimeline({
          scrollOffsets: [
            { target, edge: "start", threshold: "0" },
            { target, edge: "end", threshold: "1" },
          ],
        }),
      }
    );
  }

  function registTiltEffectHandler(contents) {
    tiltEffectSection.addEventListener("mousemove", (event) => {
      const { left, top, width, height } =
        tiltEffectSection.getBoundingClientRect();
      const mouseX = event.clientX - left - width / 2;
      const mouseY = event.clientY - top - height / 2;

      const rotateX = (mouseX / height) * 30;
      const rotateY = (mouseY / width) * -30;

      contents.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  }

  function disableScroll() {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
  }

  function enableScroll() {
    document.body.style.overflow = "";
    document.body.style.height = "";
  }

  function registZoomHandler() {
    disableScroll();
    document.addEventListener("wheel", onWheel, { passive: false });
  }

  function unregistZoomHandler() {
    document.removeEventListener("wheel", onWheel);
    enableScroll();
  }

  function scrollToSection(section) {
    const targetPosition = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }

  function onWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    zoomLevel += event.deltaY * 0.001;

    camera.position.z = 10 / zoomLevel;
    if (zoomLevel > maxZoomLevel || zoomLevel < minZoomLevel) {
      zoomLevel = Math.min(Math.max(minZoomLevel, zoomLevel), maxZoomLevel);
      unregistZoomHandler();
    }
  }

  function init3DViewer(container) {
    const scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(5, 5);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    });

    camera.position.z = 10 / zoomLevel;

    const rectangle = new THREE.Mesh(geometry, material);
    scene.add(rectangle);

    const animate = () => {
      requestAnimationFrame(animate);
      rectangle.rotation.x += 0.01;
      rectangle.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();
  }

  const video = document.createElement("video");
  video.pause();
  video.muted = true;
  video.src = "./videos/01.webm";
  video.loop = true;
  video.onloadeddata = () => {
    video.play();
  };
  videoSection.appendChild(video);
  registVideoEventHandler(video);

  let index = 0;
  function typeText(text) {
    if (index < text.length) {
      typingSection.textContent += text.charAt(index);
      index++;
      setTimeout(() => typeText(text), 100);
    }
  }

  imageSliderSection.appendChild(
    makeCarousel(
      [
        "../02-carousel/images/02.jpg",
        "../02-carousel/images/03.jpg",
        "../02-carousel/images/04.jpg",
        "../02-carousel/images/05.jpg",
      ],
      {
        visibleCount: 2,
        slideCount: 2,
        captionPos: "left top",
      }
    )
  );

  function registVideoEventHandler(video) {
    video.addEventListener("mousedown", (event) => {
      video.pause();
    });

    function seekTo(duration) {
      return new Promise((resolve) => {
        let seekTime = video.currentTime + duration;
        seekTime =
          seekTime > video.duration ? seekTime % video.duration : seekTime;
        video.currentTime = seekTime < 0 ? video.duration + seekTime : seekTime;
        video.ontimeupdate = () => {
          resolve(video.currentTime);
        };
      });
    }

    let promise = null;
    video.addEventListener("mousemove", (event) => {
      if (video.paused) {
        const duration = event.movementX / 10;
        // video.currentTime += duration;
        if (!promise) {
          promise = seekTo(duration).then((time) => {
            console.log("updated:", time);
            promise = null;
          });
        }
      }
    });

    video.addEventListener("mouseup", (event) => {
      video.play();
    });
  }

  const observerOptions = { root: null, threshold: [0.5] };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (entry.target === typingSection) {
          typeText("Hello, welcom to interactive web site!");
        }
        if (entry.target === modelViewerSection) {
          registZoomHandler();
          scrollToSection(modelViewerSection);
        }
      } else {
        entry.target.classList.remove("is-visible");
        if (entry.target === typingSection) {
          index = 0;
          typingSection.textContent = "";
        }
        if (entry.target === modelViewerSection) {
          unregistZoomHandler();
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll("section").forEach((section) => {
    observer.observe(section);
  });
});
