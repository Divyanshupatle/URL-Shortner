const http = require("k6/http");
const { check, sleep } = require("k6");

export const options = {
  vus: 100, // 20 virtual users
  duration: "10s", // test runs for 30 seconds
};

export default function () {
  const url = "http://localhost:3000/url/shorten"; 
  const payload = JSON.stringify({
    url: `http://example.com/page/${Math.random()}`, 
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "status is 200": (r) => r.status === 200 || 201,
    "response has shortUrl": (r) => r.json().data.shortUrl !== undefined,
    "response has urlCode": (r) => r.json().data.urlCode !== undefined,
  });

  sleep(1);
}
