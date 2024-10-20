let total = 0;

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('i')) {
	window.location.replace(`https://app.revolt.chat/bot/${urlParams.get('i')}`);
}

function generate() {
	api.run('botlist/', (data) => {
		api.run(`botlist/range/0/${data.total}?data=banner,avatar,username,bio,votes,online,createdDate,tags`, (data) => {
			if (Object.keys(data).length == 0) {
				generate();
			} else {
				Object.keys(data).forEach((bot) => {
					const x = makeBotCard(data, bot);
					document.querySelector('.bot-wrapper').innerHTML += x.html;
				});
				document.querySelectorAll('.banner img').forEach((e) => {
					lazyImageObserver.observe(e);
				});
			}
		});
	});
}

generate();

function lazyImage(img) {
	if (!img.className.includes('no-banner')) {
		img.style.filter = 'blur(4px)';
	}
	const src = img.getAttribute('data-src');
	if (!src) {
		return;
	}
	function lazyImageNoFilter() {
		img.style.filter = null;
	}
	img.src = src;
	const bg = new Image();
	bg.src = src;
	bg.addEventListener('load', lazyImageNoFilter, { once: true });
	bg.remove();
}

const lazyImageObserver = new IntersectionObserver((entries, lazyImageObserver) => {
	entries.forEach((entry) => {
		if (!entry.isIntersecting) {
			return;
		} else {
			lazyImage(entry.target);
			lazyImageObserver.unobserve(entry.target);
		}
	});
}, {});

function randomBots() {
	api.run('botlist/random?amount=' + Math.floor(Math.random() * (10 - 1) + 1), (data) => {
		const modal = createModal('✨ Random bot(s)', '<div style="display:flex;justify-content: center;flex-wrap:wrap;gap:1rem;"></div>', 0.6).selector;
		Object.keys(data).forEach((bot) => {
			document.querySelector(modal + ' .body > div').innerHTML += makeBotCard(data, bot, false).html;
		});
	});
}

function getBotsFromTag(tag) {
	api.run('botlist/tag/' + tag, (data) => {
		const modal = createModal('✨ Bot(s) with tag ' + tag, '<div style="display:flex;justify-content: center;flex-wrap:wrap;gap:1rem;"></div>', 0.6).selector;
		Object.keys(data).forEach((bot) => {
			document.querySelector(modal + ' .body > div').innerHTML += makeBotCard(data, bot, false).html;
		});
	});
}

function makeBotCard(data, bot, src = true) {
	const id = Math.random().toString(36).substring(2);
	const bio = (data[bot].bio || 'Bio not set!').replace(/<[^>]+>/g, '');
	let tags = '';
	if (data[bot].tags) {
		data[bot].tags.forEach((tag) => {
			tags += `#${tag} `;
		});
	}
	const html = `
    <div class="card">

      <div class="banner banner-${id} ${data[bot].banner ? '' : 'no-banner'}">
      ${src ? `<img data-src="${data[bot].banner}">` : `<img src="${data[bot].banner}">`}
      </div>

      <div class="pfp">
        <div style="background: url('${data[bot].avatar}');background-size: cover;"></div>
      </div>

      <a href="https://app.revolt.chat/bot/${bot}">
        <button class="invite">Invite</button>
      </a>

      <div data-tooltip="${data[bot].online ? 'Bot is online' : 'Bot is offline'}" class="status ${data[bot].online ? 'online' : 'offline'}">
      </div>

      <div class="text">
          <div class="name">${data[bot].username}</div>
          <div class="info">
              ${data[bot].votes} ${data[bot].votes ? (data[bot].votes == 1 ? 'vote' : 'votes') : 'votes'}
              • <span data-tooltip="created on ${data[bot].createdDate}">${data[bot].createdDate}</span>
  <p class="tags">${tags}</p>
          </div>
          <div class="bio">${bio.length > 30 ? bio.substring(0, 300) + '...' : bio.substring(0, 300)}</div>
      </div>

      <div class="btn-group">
          <a href="${window.location.origin.includes('github.io') ? 'https://axorax.github.io/revlist' : window.location.origin}/bot?id=${bot}"><button class="view">View</button></a>
          <button class="vote" onclick="vote('${bot}', '${data[bot].username}')">Vote</button>
      </div>
    </div>`;

	return {
		html,
		banner: '.banner-' + id
	};
}

function addTiltEffect(element) {
	element.addEventListener('mousemove', tilt);
	element.addEventListener('touchmove', tilt);
	element.addEventListener('mouseout', resetTilt);
	element.addEventListener('touchend', resetTilt);

	function applyTiltEffect(tiltX, tiltY) {
		const rs = 25;

		element.style.transform = `perspective(1000px) rotateX(${tiltY * rs}deg) rotateY(${-tiltX * rs}deg)`;
	}

	function resetTilt() {
		element.style.transform = '';
	}

	function tilt(event) {
		let inputX, inputY;

		if (event.type === 'mousemove') {
			inputX = event.clientX;
			inputY = event.clientY;
		} else if (event.type === 'touchmove') {
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

if (localStorage.getItem('t')) {
	addTiltEffect(document.querySelector('.landing .box'));
}

if (!localStorage.getItem('r')) {
	function createBolt() {
		const bolt = document.createElement('div');
		bolt.className = 'bolt';
		bolt.style.left = `${Math.random() * 100}%`;

		const electricSurge = document.getElementById('electric-surge');
		const electricSurgeRect = electricSurge.getBoundingClientRect();
		const boltRect = bolt.getBoundingClientRect();

		if (boltRect.left + boltRect.width > electricSurgeRect.left + electricSurgeRect.width) {
			const newLeft = electricSurgeRect.left + electricSurgeRect.width - boltRect.width;
			bolt.style.left = `${newLeft}px`;
		}

		electricSurge.appendChild(bolt);
		setTimeout(() => {
			bolt.remove();
		}, 800);
	}

	if (localStorage.getItem('hr')) {
		const animationInterval = setInterval(createBolt, 1);
	} else {
		const animationInterval = setInterval(createBolt, 200);
	}
}
