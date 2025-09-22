const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = "public";

global.fetch = jest.fn(async (url, options) => {
  url = new URL(url, "http://localhost").pathname;

  if (url.endsWith(".json")) {
    return handleJsonUrl(url);
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({ mocked: true }),
  };
});

function handleJsonUrl(url) {
  const filePath = path.join(process.cwd(), PUBLIC_DIR, url);

  if (!fs.existsSync(filePath)) {
    return {
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" }),
    };
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const jsonData = JSON.parse(fileContent);

  return {
    ok: true,
    status: 200,
    json: async () => jsonData,
  };
}
