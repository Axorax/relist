// Relist API Wrapper

const api = {
  url: "https://relist.axorax.repl.co",
  run: (p, cb) => {
    fetch(`${api.url}/${p}`)
      .then((res) => res.json())
      .then((data) => {
        cb(data);
      });
  },
};
