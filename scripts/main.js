// -- Initialize Page

window.addEventListener('load', () => {
	document.querySelector('revlist-imports').remove();
});

const navElement = document.createElement('nav');

navElement.innerHTML = `
<a href="index.html"><img src="./static/images/revlist.svg" alt="Revlist logo"></a>
<ul>
<li class="nav-menu"><button onclick="navDropdownToggle('.nav-dropdown')">Menu</button></li>
<div class="nav-dropdown">
<li><button onclick="accessibilityModal()">Accessibility</button></li>
<li><a href="https://github.com/Axorax/socials" target="_blank"><button>Revolt Server</button></a></li>
<li><a href="./api.html"><button>API</button></a></li>
<li><a href="./submit.html"><button>Submit bot</button></a></li>
<li><a href="https://patreon.com/axorax"><button>Donate</button></a></li>
</div>
</ul>
<ul class="right">
<li><a href="./login.html"><button>Login</button></a></li>
</ul>
`;

document.body.prepend(navElement);

// -- Navigation Bar

function navDropdownToggle(elem) {
	const element = document.querySelector(elem);
	if (!element.classList.contains('dropdown')) element.classList.add('dropdown');
	if (element.classList.contains('active')) {
		element.classList.remove('active');
		element.style.display = 'none';
	} else {
		element.style.display = 'block';
		element.classList.add('active');
	}
}

// -- Notice

function notice(message) {
	const element = document.createElement('revlist-notice');
	element.innerHTML = `
${message}
<button class="close" onclick="this.parentNode.remove()">x</button>`;
	document.body.prepend(element);
	setTimeout(() => {
		element.remove();
	}, 3000);
}

// -- Sessions

let session;

function getSessionInfo() {
	return new Promise((resolve, reject) => {
		if (document.cookie.includes('session')) {
			const session = document.cookie.replace('session=', '');
			api.run('getsession/' + session, (data) => {
				if (data.active === true) {
					resolve(data);
				} else {
					resolve(null);
				}
			});
		} else {
			resolve(null);
		}
	});
}

async function checkSession() {
	session = await getSessionInfo();
	if (session == null) return;
	document.querySelector('nav .right').innerHTML = `
<div class="profile" onclick="navDropdownToggle('.profile-dropdown')">
  <img src="${session.avatar}">
  <p>${session.username}</p>
</div>
<ul class="dropdown profile-dropdown">
  <li><a href="./@me.html">My profile</a></li>
  <li><button onclick="removeAllCookies();window.location.reload()">Logout</button></li>
</ul>
`;
}

checkSession();

// -- Cookies

function removeAllCookies() {
	var cookies = document.cookie.split(';');
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i];
		var eqPos = cookie.indexOf('=');
		var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
	}
}

// -- Local Storage

function localToggle(item) {
	if (localStorage.getItem(item)) {
		localStorage.removeItem(item);
	} else {
		localStorage.setItem(item, '1');
	}
}

// -- Floating Window

function createWindow(html, activator) {
	if (document.querySelector('.window')) {
		document.querySelector('.window').remove();
	}
	const id = 'revlist-win-' + Math.random().toString(36).substring(2);
	const window = document.createElement('div');
	window.classList.add('window');
	window.id = id;
	window.innerHTML = html;
	document.body.prepend(window);
	windrag.create('.window', activator);
	return '#' + id;
}

// -- Floating Vote Window

function vote(id, name) {
	if (session) {
		api.run(`vote?bot=${id}&session=${session.session}`, (data) => {
			if (data.error) {
				notice(data.message);
			}
		});
	} else {
		const tag = createWindow(
			`<div class="panel">
    <div class="title">Revlist Vote</div>
        <div class="close" onclick="this.parentNode.parentNode.remove()">x</div>
    </div>
        <div class="body">
        <div class="header">
        Vote for ${name}
        </div>
        <div class="form">
        Type <code onclick='navigator.clipboard.writeText("r!vote <@${id}>")'>r!vote <@${id}></code> <br> in <a href="https://app.revolt.chat/invite/01GVK81S6KZJF5E0EVDGD75AHH" target="_blank">this server!</a>
        <div class="center-text">or</div>
        <input type="text" class="vote-id s1" placeholder="Your Revolt ID">
        <button class="vote-confirm">Vote</button><br><br>
        </div>
        </div>`,
			'.window .panel'
		);
		document.querySelector(`${tag} button`).addEventListener('click', () => {
			const value = document.querySelector(`${tag} input`).value;
			if (value.replaceAll(' ', '') == '') return;
			api.run(`vote?id=${value}&bot=${id}`, (data) => {
				if (data.error || data.voted) {
					document.querySelector(`${tag} .form`).innerHTML = `Error: ${data.message}<br><button onclick="this.parentNode.parentNode.parentNode.remove()">Close</button>`;
				} else {
					document.querySelector(`${tag} .form`).innerHTML = `
1) Join <a href="https://app.revolt.chat/invite/01GVK81S6KZJF5E0EVDGD75AHH">this server</a> <br><br>
2) Type <code onclick='navigator.clipboard.writeText("r!vote ${data.token}")'>r!vote ${data.token}</code> in any channel.
<br><br><button onclick="this.parentNode.parentNode.parentNode.remove()">Done</button>`;
				}
			});
		});
	}
}

// -- Modal

function createModal(title, html, padding = true, custom = {}) {
	const template = `
<dialog open>
    <div class="panel">
      <p class="title">${title}</p>
      <button class="close" onclick="closeModal()">x</button>
    </div>
    <div class="body">
      ${html}
    </div>
</dialog>
  `;
	const id = Math.random().toString(36).substring(2);
	const element = document.createElement('revlist-modal');
	if (padding) {
		element.classList.add('body-padding-true');
	}
	element.classList.add('revlist-modal-' + id);
	element.innerHTML = template;
	Object.keys(custom).forEach((key) => {
		element.style[key] = custom[key];
	});
	document.body.prepend(element);
	document.body.classList.add('no-scroll');
	return {
		selector: '.' + 'revlist-modal-' + id
	};
}

function closeModal() {
	document.querySelector('revlist-modal').remove();
	document.body.classList.remove('no-scroll');
}

function accessibilityModal() {
	createModal(
		'Accessibility',
		`
<div class="accessibility">
  <div class="toggle-s1">
    <p>Click Effects</p>
    <div class="toggle">
      <input data-item="c" checked onclick="localToggle('c')" type="checkbox"/>
      <label></label>
    </div>
  </div>

  <div class="toggle-s1">
    <p>Background Rain</p>
    <div class="toggle">
      <input data-item="r" checked onclick="localToggle('r')" type="checkbox"/>
      <label></label>
    </div>
  </div>

  <div class="toggle-s1">
    <p>Heavy Rain</p>
    <div class="toggle">
      <input data-item="hr" onclick="localToggle('hr')" type="checkbox"/>
      <label></label>
    </div>
  </div>

  <div class="toggle-s1">
    <p>3D Tilting Effect</p>
    <div class="toggle">
      <input data-item="t" onclick="localToggle('t')" type="checkbox"/>
      <label></label>
    </div>
  </div>

  <br /><br />

  <button class="s1" onclick="window.location.reload()">Save changes</button> &nbsp;
  <button class="s1 danger" onclick="localStorage.clear();window.location.reload()">Clear all settings</button>
</div>
`
	);

	document.querySelectorAll('.accessibility input').forEach((e) => {
		if (localStorage.getItem(e.getAttribute('data-item'))) {
			if (e.checked == true) {
				e.checked = false;
			} else {
				e.checked = true;
			}
		}
	});
}

// -- Markdown

function renderMarkdown(markdown) {
	markdown = markdown.replace(/<[^>]+>/g, '');

	markdown = markdown.replace(/^(#{1,6})\s+(.*)$/gm, function (match, hashes, title) {
		var level = hashes.length;
		return '<h' + level + '>' + title + '</h' + level + '>';
	});

	markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

	markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');

	markdown = markdown.replace(/__(.*?)__/g, '<u>$1</u>');

	markdown = markdown.replace(/^\s*\*\s+(.*)$/gm, '<ul><li>$1</li></ul>');

	markdown = markdown.replace(/^\s*\d+\.\s+(.*)$/gm, '<ol><li>$1</li></ol>');

	markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

	markdown = markdown.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

	return markdown;
}

// -- Cursor Click Effects

function createParticle(x, y) {
	const particle = document.createElement('div');
	particle.className = 'particle';
	document.body.appendChild(particle);

	let posX = x;
	let posY = y;

	const angle = Math.random() * Math.PI * 2;
	const speed = Math.random() * 5 + 2;
	const velX = Math.cos(angle) * speed;
	const velY = Math.sin(angle) * speed;

	const interval = setInterval(() => {
		posX += velX;
		posY += velY;
		particle.style.left = posX + 'px';
		particle.style.top = posY + 'px';

		const rect = particle.getBoundingClientRect();
		const inViewport = rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
		if (!inViewport) {
			clearInterval(interval);
			document.body.removeChild(particle);
		}
	}, 10);

	setTimeout(() => {
		clearInterval(interval);
		document.body.removeChild(particle);
	}, 1000);
}

if (!localStorage.getItem('c')) {
	document.addEventListener('click', function (event) {
		const x = event.clientX;
		const y = event.clientY;

		const scrollX = window.scrollX || window.pageXOffset;
		const scrollY = window.scrollY || window.pageYOffset;
		const adjustedX = x + scrollX;
		const adjustedY = y + scrollY;

		for (let i = 0; i < 3; i++) {
			createParticle(adjustedX, adjustedY);
		}
	});
}
