let start = 0,
  end = 6,
  total = 0,
  firstCardGeneration = true;

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("i")) {
  window.location.replace(`https://app.revolt.chat/bot/${urlParams.get('i')}`)
}

function getTotalBots() {
  return new Promise((resolve) => {
    api.run("botlist/", (data) => {
      total = data.total;
      resolve();
    });
  });
}

getTotalBots().then(() => {
  const loadMoreDiv = document.querySelector("relist-bots .end");
  let interval;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          interval = setInterval(() => {
            if (end > total) {
              clearInterval(interval);
              return observer.unobserve(entry.target);
            }
            generateCards();
          }, 1500);
          generateCards();
        } else {
          try {
            clearInterval(interval);
          } catch (e) {}
          if (end > total) return observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "250px",
    }
  );

  observer.observe(loadMoreDiv);
});

function lazyImage(img) {
  if (!img.className.includes("no-banner")) {
    img.style.filter = "blur(4px)";
  }
  const src = img.getAttribute("data-src");
  if (!src) {
    return;
  }
  function lazyImageNoFilter() {
    img.style.filter = null;
  }
  // img.style.cssText += `background: url('${src}');background-size: cover;`;
  img.src = src;
  const bg = new Image();
  bg.src = src;
  bg.addEventListener("load", lazyImageNoFilter, { once: true });
  bg.remove();
}

const lazyImageObserver = new IntersectionObserver(
  (entries, lazyImageObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      } else {
        lazyImage(entry.target);
        lazyImageObserver.unobserve(entry.target);
      }
    });
  },
  {}
);

function randomBots() {
  api.run(
    "botlist/random?amount=" + Math.floor(Math.random() * (10 - 1) + 1),
    (data) => {
      const modal = createModal(
        "✨ Random bot(s)",
        '<div style="display:flex;justify-content: center;flex-wrap:wrap;gap:1rem;"></div>',
        0.6
      ).selector;
      Object.keys(data).forEach((bot) => {
        document.querySelector(modal + " .body > div").innerHTML += makeBotCard(
          data,
          bot,
          false
        ).html;
      });
    }
  );
}

function getBotsFromTag(tag) {
  api.run("botlist/tag/" + tag, (data) => {
    const modal = createModal(
      "✨ Bot(s) with tag " + tag,
      '<div style="display:flex;justify-content: center;flex-wrap:wrap;gap:1rem;"></div>',
      0.6
    ).selector;
    Object.keys(data).forEach((bot) => {
      document.querySelector(modal + " .body > div").innerHTML += makeBotCard(
        data,
        bot,
        false
      ).html;
    });
  });
}

function generateCards() {
  api.run(
    `botlist/range/${start}/${end}?data=banner,avatar,username,bio,votes,online,createdDate,tags`,
    (data) => {
      Object.keys(data).forEach((bot) => {
        const x = makeBotCard(data, bot);
        document.querySelector(".bot-wrapper").innerHTML += x.html;
      });
      document.querySelectorAll(".banner img").forEach((e) => {
        lazyImageObserver.observe(e);
      });
      if (firstCardGeneration) {
        setTimeout(() => {
          const cards = document.querySelectorAll(".bot-wrapper .card");
          if (cards.length == 0) {
            window.location.reload();
          }
        }, 2000);
        firstCardGeneration = false;
      }
    }
  );

  start = end + 1;
  end = end + 5;
}

generateCards();

function makeBotCard(data, bot, src = true) {
  const id = Math.random().toString(36).substring(2);
  const bio = data[bot].bio.replace(/<[^>]+>/g, "");
  let tags = "";
  if (data[bot].tags) {
    data[bot].tags.forEach((tag) => {
      tags += `#${tag} `;
    });
  }
  const html = `
    <div class="card">

      <div class="banner banner-${id} ${data[bot].banner ? "" : "no-banner"}">
      ${
        src
          ? `<img data-src="${data[bot].banner}">`
          : `<img src="${data[bot].banner}">`
      }
      </div>

      <div class="pfp">
        <div style="background: url('${
          data[bot].avatar
        }');background-size: cover;"></div>
      </div>

      <a href="https://app.revolt.chat/bot/${bot}">
        <button class="invite">Invite</button>
      </a>

      <div data-tooltip="${data[bot].online ? "Bot is online" : "Bot is offline"}" class="status ${data[bot].online ? "online" : "offline"}">
      </div>

      <div class="text">
          <div class="name">${data[bot].username}</div>
          <div class="info">
              ${data[bot].votes} ${data[bot].votes ? (data[bot].votes == 1 ? "vote" : "votes") : "votes"}
              • <span data-tooltip="created on ${data[bot].createdDate}">${
    data[bot].createdDate
  }</span>
  <p class="tags">${tags}</p>
          </div>
          <div class="bio">${
            bio.length > 30
              ? bio.substring(0, 300) + "..."
              : bio.substring(0, 300)
          }</div>
      </div>

      <div class="btn-group">
          <a href="${
            window.location.origin.includes("github.io")
              ? "https://axorax.github.io/relist"
              : window.location.origin
          }/bot?id=${bot}"><button class="view">View</button></a>
          <button class="vote" onclick="vote('${bot}', '${
    data[bot].username
  }')">Vote</button>
      </div>
    </div>`;

  return {
    html,
    banner: ".banner-" + id,
  };
}

function addTiltEffect(element) {
  element.addEventListener("mousemove", tilt);
  element.addEventListener("touchmove", tilt);
  element.addEventListener("mouseout", resetTilt);
  element.addEventListener("touchend", resetTilt);

  function applyTiltEffect(tiltX, tiltY) {
    const rs = 25;

    element.style.transform = `perspective(1000px) rotateX(${
      tiltY * rs
    }deg) rotateY(${-tiltX * rs}deg)`;
  }

  function resetTilt() {
    element.style.transform = "";
  }

  function tilt(event) {
    let inputX, inputY;

    if (event.type === "mousemove") {
      inputX = event.clientX;
      inputY = event.clientY;
    } else if (event.type === "touchmove") {
      inputX = event.touches[0].clientX;
      inputY = event.touches[0].clientY;
    }

    const boundingRect = element.getBoundingClientRect();
    const elementWidth = boundingRect.width;
    const elementHeight = boundingRect.height;

    const centerX = elementWidth / 2;
    const centerY = elementHeight / 2;

    const tiltX = (inputX - boundingRect.left - centerX) / centerX;
    const tiltY = (inputY - boundingRect.top - centerY) / centerY;

    applyTiltEffect(tiltX, tiltY);
  }
}

if (localStorage.getItem("t")) {
  addTiltEffect(document.querySelector(".landing .box"));
}

if (!localStorage.getItem("r")) {
  function createBolt() {
    const bolt = document.createElement("div");
    bolt.className = "bolt";
    bolt.style.left = `${Math.random() * 100}%`;
  
    const electricSurge = document.getElementById("electric-surge");
    const electricSurgeRect = electricSurge.getBoundingClientRect();
    const boltRect = bolt.getBoundingClientRect();
  
    if (
      boltRect.left + boltRect.width >
      electricSurgeRect.left + electricSurgeRect.width
    ) {
      const newLeft =
        electricSurgeRect.left + electricSurgeRect.width - boltRect.width;
      bolt.style.left = `${newLeft}px`;
    }
  
    electricSurge.appendChild(bolt);
    setTimeout(() => {
      bolt.remove();
    }, 800);
  }

  if (localStorage.getItem("hr")) {
    const animationInterval = setInterval(createBolt, 1);
  } else {
    const animationInterval = setInterval(createBolt, 200);
  }
}
