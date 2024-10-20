/*
scripts/api
components/createModal
*/

const searchInput = document.querySelector('revlist-search input'),
	searchButton = document.querySelector('revlist-search button');

function search() {
	const value = searchInput.value;
	if (value.replaceAll(' ', '') == '') {
		return;
	}
	searchButton.innerText = ' ';
	let count = 0;
	const interval = setInterval(() => {
		searchButton.innerText += '● ';
		count++;
		if (count == 4) {
			searchButton.innerText = ' ';
			count = 0;
		}
	}, 500);
	api.run('botlist/search/' + value, (data) => {
		const modal = createModal('Revlist Search - ' + value, '<div style="display:flex;justify-content: center;flex-wrap:wrap;gap:max(1vw, 1rem);"></div>', 0.6).selector;
		if (Object.keys(data).length == 0) {
			document.querySelector(modal + ' .body > div').innerHTML = `<h1 style="opacity:0.2;">No Search Results Found!</h1>`;
		} else {
			Object.keys(data).forEach((bot) => {
				document.querySelector(modal + ' .body > div').innerHTML += makeBotCard(data, bot, false).html;
			});
		}
		clearInterval(interval);
		searchButton.innerText = 'search';
	});
}

searchButton.addEventListener('click', () => {
	search();
});

searchInput.addEventListener('keydown', (e) => {
	if (e.key == 'Enter') {
		search();
	}
});
