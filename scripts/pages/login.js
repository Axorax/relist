function loginUser() {
	const value = document.querySelector('.user-id').value;
	const form = document.querySelector('.form');
	if (value.replaceAll(' ', '') == '') return;
	api.run('requestlogin/' + value, (data) => {
		if (data.error && data.error == true) {
			form.innerHTML = 'Error: ' + data.message;
		}
		form.innerHTML = `<p>
          1) Join <a href="https://app.revolt.chat/invite/01GVK81S6KZJF5E0EVDGD75AHH">this server</a> <br><br>
              2) Type <code onclick='navigator.clipboard.writeText("r!login ${data.token}")'>r!login ${data.token}</code> in any channel.
              <br><br><button class="s1" onclick="checkLogin('${data.token}')">Check</button>
              </p>`;
	});
}

function checkLogin(token) {
	const form = document.querySelector('.form');
	api.run('checklogin/' + token, (data) => {
		if (data.error && data.error == true) {
			form.innerHTML = 'Error: ' + data.message;
		}
		if (data.verified != true) {
			form.innerHTML = `Login token not verified! Try again...`;
		}
		if (data.verified == true) {
			form.innerHTML = `✨ Great! You are logged in!`;
			document.cookie = `session=${data.session};`;
		}
	});
}
