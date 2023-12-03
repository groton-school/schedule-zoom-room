const query = new URLSearchParams(window.location.search);
if (!query.has("beta")) {
  window.location.href = `${process.env.URL}/v0`;
}
