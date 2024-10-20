// Revlist API Wrapper

const api = {
	url: 'http://localhost:6969',
	run: (p, cb) => {
		fetch(`${api.url}/${p}`)
			.then((res) => res.json())
			.then((data) => {
				cb(data);
			});
	}
};
