const id = new URLSearchParams(window.location.search).get('id');
if (id == undefined || id == '') {
	document.body.classList.add('invalid');
	document.querySelector('main').innerHTML = "<p id='invalid-message'>Invalid user!</p>";
	setTimeout(() => {
		document.querySelector('.comments').remove();
	}, 500);
}
api.run(`botlist/${id}`, (data) => {
	if (data.error) {
		document.body.classList.add('invalid');
		document.querySelector('main').innerHTML = "<p id='invalid-message'>Invalid user!</p>";
		setTimeout(() => {
			document.querySelector('.comments').remove();
		}, 500);
		return;
	}

	document.querySelector('.bot-info-invite').href = `${window.location.origin.includes('github.io') ? 'https://axorax.github.io/revlist' : window.location.origin}/bot?id=${id}`;

	document.querySelector('.header .banner img').src = data[id].banner || './static/images/banner-not-set.png';

	document.querySelector('.bio').innerHTML = renderMarkdown(data[id].bio || 'Bio not set!');

	document.querySelector('.name span').innerText = data[id].username;

	document.querySelector('.name img').onclick = () => {
		navigator.clipboard.writeText(id);
	};

	document.querySelector('.pfp img').src = data[id].avatar;

	let tags = '';
	data[id].tags.forEach((tag) => {
		tags += `#${tag} `;
	});

	document.querySelector('.details .content').innerHTML = `
        <li><strong>Votes</strong> <p>${data[id].votes}</p></li>
        <li><strong>Prefix</strong> <p>${data[id].prefix}</p></li>
        <li><strong>Tags</strong> <p>${tags == '' ? 'none' : tags}</p></li>
        <li><strong>Created</strong> <p>${new Date(`${data[id].createdDate}, ${data[id].createdTime}`).toLocaleString(undefined, {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}</p></li>
        <li><strong>Online</strong> <p>${data[id].online || '—'}</p></li>
        `;

	api.run(`botlist/${id}/owner`, (data) => {
		document.querySelector('.developer .content').innerHTML = `
    <a href="./user?id=${data.id}" style="color:#fff;text-decoration:none;">
    <div class="owner-card">
    <img src="${data.avatar}" alt="Avatar">
    <p>${data.username}</p>
    </div>
    </a>
    `;
	});

	document.querySelector('.bot-info-vote').onclick = () => {
		vote(id, data[id].username);
	};
});
