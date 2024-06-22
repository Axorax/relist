function fillUserData(id) {
	if (id == undefined || id == '') {
		document.body.classList.add('invalid');
		document.querySelector('main').innerHTML = "<p id='invalid-message'>Invalid user!</p>";
		setTimeout(() => {
			if (document.querySelector('.comments')) {
				document.querySelector('.comments').remove();
			}
		}, 500);
	}
	api.run(`user/${id}?data=avatar,avatarURL,badges,online,status,username,presence,createdAt,background,content`, (data) => {
		if (data.error) {
			document.body.classList.add('invalid');
			document.querySelector('main').innerHTML = "<p id='invalid-message'>Invalid user!</p>";
			setTimeout(() => {
				if (document.querySelector('.comments')) {
					document.querySelector('.comments').remove();
				}
			}, 500);
			return;
		}

		document.querySelector('.header .banner img').src = data?.background?._id !== undefined ? `https://autumn.revolt.chat/backgrounds/${data.background._id}/${data.background.filename}` : './static/images/banner-not-set.png';

		document.querySelector('.name span').innerText = data.username;

		document.querySelector('.name img').onclick = () => {
			navigator.clipboard.writeText(id);
		};

		document.querySelector('.pfp img').src = data.avatarURL.replace('?max_side=256', '') + '/' + data.avatar.fileName;

		document.querySelector('.bio').innerHTML = renderMarkdown(data.content || 'Bio not set!');

		document.querySelector('.details .content').innerHTML = `
          <li><strong>Created</strong> <p>${new Date(data.createdAt).toLocaleString(undefined, {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}</p></li>
          <li><strong>Presence</strong> <p>${data.presence}</p></li>
          <li><strong>Badges</strong> <p>${data.badges || 'None'}</p></li>
          <li><strong>Online</strong> <p>${data.online}</p></li>
          `;
	});
}
