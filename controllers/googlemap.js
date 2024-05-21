const Request = require("request");

getPlaces = async (req, res) => {
  const { query, token } = req.body;
  const key = process.env.MAP_API_KEY || "";
  const base_url = process.env.MAP_URL + "place/autocomplete/json";
  let url = `${base_url}?input=${query}&key=${key}&sessiontoken=${token}`;
  let list = [];

  await Request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let arr = JSON.parse(body).predictions;
      console.log(list);

      arr.forEach((element) => {
        list.push({
          place: element.description,
        });
      });
      return res.status(200).json({ list });
    }
  });
};

module.exports = {
  getPlaces,
};
