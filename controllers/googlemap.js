const Request = require("request");
const polyline = require("google-polyline");
const axios = require("axios");

/// places
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
    } else {
      return res.status(200).json({ msg: "error" });
    }
  });
};

/// routes
getRoutes = async (req, res) => {
  const { origin, destination, token } = req.body;
  const key = process.env.MAP_API_KEY || "";
  const base_url = process.env.MAP_URL + "directions/json";
  const url = `${base_url}?origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(
    destination
  )}&key=${key}&travelMode=Driving&unitSystem=Imperial&alternatives=true`;
  let list = [];

  await Request(url, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let arr = JSON.parse(body).routes;
      const list = arr.map((a) => {
        return a.legs.map((e) => {
          const r = {
            add_s: e.start_address,
            add_e: e.end_address,
            distance: e.distance.text,
            duration: e.duration.text,
            start: [e.start_location.lat, e.start_location.lng],
            end: [e.end_location.lat, e.end_location.lng],
            route: e.steps.map((s) => {
              const r1 = {
                distance: s.distance.text,
                duration: s.duration.text,
                instruction: s.html_instructions,
                start: [s.start_location.lat, s.start_location.lng],
                end: [s.end_location.lat, s.end_location.lng],
                polyline: s.polyline.points,
                points: polyline.decode(s.polyline.points),
              };
              return r1;
            }),
          };
          return r;
        });
      });
      return res.status(200).json({ count: list.length, data: list });
    } else {
      return res.status(200).json({ msg: "error" });
    }
  });
};

// location
const getGeocode = (address) => {
  const key = process.env.MAP_API_KEY || "";
  const baseUrl = process.env.MAP_URL + "geocode/json";
  const url = `${baseUrl}?address=${encodeURIComponent(address)}&key=${key}`;

  return new Promise((resolve, reject) => {
    Request(url, { json: true }, (err, res, body) => {
      if (err) {
        reject(`HTTP Error: ${err.message}`);
      } else if (body.status !== "OK") {
        reject(`Error: ${body.status} for address: ${address}`);
      } else {
        const location = body.results[0].geometry.location;
        resolve({
          address: address,
          latitude: location.lat,
          longitude: location.lng,
        });
      }
    });
  });
};

const getGeocodesForAddresses = async (addresses) => {
  const results = [];
  for (const address of addresses) {
    try {
      const result = await getGeocode(address);
      results.push(result);
    } catch (error) {
      console.error(error);
    }
  }
  return results;
};

const getLocations = async (req, res) => {
  const { addresses, token } = req.body;

  getGeocodesForAddresses(addresses)
    .then((results) => {
      return res.status(200).json({ data: results });
    })
    .catch((error) => {
      console.error(`Error fetching geocodes: ${error}`);
      return res.status(200).json({ msg: "error" });
    });
};

// nearest
const getDistanceMatrix = (origins, destinations) => {
  const key = process.env.MAP_API_KEY || "";
  const baseUrl = process.env.MAP_URL + "distancematrix/json";
  const url = `${baseUrl}?origins=${encodeURIComponent(
    origins.join("|")
  )}&destinations=${encodeURIComponent(destinations.join("|"))}&key=${key}`;

  return new Promise((resolve, reject) => {
    Request(url, { json: true }, (err, res, body) => {
      if (err) {
        reject(`HTTP Error: ${err.message}`);
      } else if (body.status !== "OK") {
        reject(`Error: ${body.status} - ${body.error_message}`);
      } else {
        resolve(body);
      }
    });
  });
};

const findShortestDistance = async (addresses) => {
  try {
    const distanceMatrix = await getDistanceMatrix(addresses, addresses);

    let minDistance = Infinity;
    let minPair = [];

    for (let i = 0; i < addresses.length; i++) {
      for (let j = 0; j < addresses.length; j++) {
        if (i !== j) {
          const distance = distanceMatrix.rows[i].elements[j].distance.value;
          if (distance < minDistance) {
            minDistance = distance;
            minPair = [addresses[i], addresses[j]];
          }
        }
      }
    }

    return {
      minPair,
      minDistance,
    };
  } catch (error) {
    console.error(`Error: ${error}`);
    return null;
  }
};

const getShortestDistances = async (req, res) => {
  const { addresses, token } = req.body;

  findShortestDistance(addresses)
    .then((result) => {
      if (result) {
        console.log(
          `The shortest distance is between ${result.minPair[0]} and ${result.minPair[1]}: ${result.minDistance} meters`
        );
      }
      return res.status(200).json({ data: result });
    })
    .catch((error) => {
      console.error(`Error finding shortest distance: ${error}`);
      return res.status(200).json({ msg: "error" });
    });
};

// shortest
const haversineDistance = (coords1, coords2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;

  const R = 6371e3; // metres
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
};

const buildGraph = (addresses, coordinates) => {
  const graph = {};

  for (let i = 0; i < addresses.length; i++) {
    graph[addresses[i]] = {};

    for (let j = 0; j < addresses.length; j++) {
      if (i !== j) {
        const distance = haversineDistance(coordinates[i], coordinates[j]);
        graph[addresses[i]][addresses[j]] = distance;
      }
    }
  }

  return graph;
};

const dijkstra = (graph, startNode) => {
  const distances = {};
  const visited = {};
  const queue = new Set(Object.keys(graph));

  // Initialize distances
  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[startNode] = 0;

  while (queue.size > 0) {
    // Get the node with the smallest distance
    let currentNode = [...queue].reduce((minNode, node) =>
      distances[node] < distances[minNode] ? node : minNode
    );

    queue.delete(currentNode);
    visited[currentNode] = true;

    for (let neighbor in graph[currentNode]) {
      if (!visited[neighbor]) {
        let newDist = distances[currentNode] + graph[currentNode][neighbor];
        if (newDist < distances[neighbor]) {
          distances[neighbor] = newDist;
        }
      }
    }
  }

  return distances;
};

const getGeocode1 = (address) => {
  const key = process.env.MAP_API_KEY || "";
  const baseUrl = process.env.MAP_URL + "geocode/json";
  const url = `${baseUrl}?address=${encodeURIComponent(address)}&key=${key}`;
  // console.log(url);
  return new Promise((resolve, reject) => {
    Request(url, { json: true }, (err, res, body) => {
      if (err) {
        reject(`HTTP Error: ${err.message}`);
      } else if (body.status !== "OK") {
        reject(`Error: ${body.status} - ${body.error_message}`);
      } else {
        const location = body.results[0].geometry.location;

        const d1 = {
          address: address,
          loc: [location.lat, location.lng],
        };

        const d2 = [location.lat, location.lng];

        resolve({ d1, d2 });
      }
    });
  });
};

const getGeocode2 = (address) => {
  console.log("... calling api geocode");
  const key = process.env.MAP_API_KEY || "";
  const baseUrl = process.env.MAP_URL + "geocode/json";
  const addresses = address.join("|");
  const url = `${baseUrl}?address=${encodeURIComponent(addresses)}&key=${key}`;
  console.log(url);
  return new Promise((resolve, reject) => {
    Request(url, { json: true }, (err, res, body) => {
      if (err) {
        reject(`HTTP Error: ${err.message}`);
      } else if (body.status !== "OK") {
        reject(`Error: ${body.status} - ${body.error_message}`);
      } else {
        var d1 = [];
        var d2 = [];

        body.results.map((e) => {
          const location = e.geometry.location;

          const _d1 = {
            address: e.formatted_address,
            place: e.place_id,
            loc: [location.lat, location.lng],
          };

          const _d2 = [location.lat, location.lng];
          d1 = [...d1, _d1];
          d2 = [...d2, _d2];
        });
        resolve({
          d1,
          d2,
          query: address,
        });
      }
    });
  });
};

const getCoordinatesForAddresses = async (addresses) => {
  const coordinates = [];
  const data = [];
  for (const address of addresses) {
    try {
      const { d1, d2 } = await getGeocode1(address);
      coordinates.push(d2);
      data.push(d1);
    } catch (error) {
      // console.error(error);
      console.error(`getCoordinatesForAddresses ${error}`);
    }
  }
  return { coordinates, data };
};

const findShortestDistanceUsingDijkstra = async (addresses) => {
  const coordinates = await getCoordinatesForAddresses(addresses);
  const graph = buildGraph(addresses, coordinates);
  const distances = dijkstra(graph, addresses[0]);

  let minDistance = Infinity;
  let minPair = [];

  for (let address in distances) {
    if (distances[address] < minDistance && distances[address] > 0) {
      minDistance = distances[address];
      minPair = [addresses[0], address];
    }
  }

  return {
    minPair,
    minDistance,
  };
};

const greedyTSP = (graph, startNode) => {
  const visited = new Set();
  const path = [startNode];
  let currentNode = startNode;

  while (visited.size < Object.keys(graph).length - 1) {
    visited.add(currentNode);
    let nextNode = null;
    let minDistance = Infinity;

    for (let neighbor in graph[currentNode]) {
      if (
        !visited.has(neighbor) &&
        graph[currentNode][neighbor] < minDistance
      ) {
        minDistance = graph[currentNode][neighbor];
        nextNode = neighbor;
      }
    }

    if (nextNode) {
      path.push(nextNode);
      currentNode = nextNode;
    }
  }

  path.push(startNode);
  return path;
};

const findShortestPath = async (start, addresses) => {
  const { coordinates, data } = await getCoordinatesForAddresses(addresses);
  if (coordinates.length !== addresses.length) {
    console.error("Error: Not all addresses could be geocoded.");
    return;
  }
  const graph = buildGraph(addresses, coordinates);
  const path = greedyTSP(graph, start);

  return { path, coordinates, d1: data };
};

const getShortestDistancesUsingDijkstra = async (req, res) => {
  const { start, addresses, token } = req.body;

  findShortestPath(start, addresses)
    .then((data) => {
      const { path, coordinates, d1 } = data;
      if (path) {
        console.log(`The order of addresses from shortest to longest path is:`);
        const arr = [];
        path.forEach((address, index) => {
          d1.forEach((d, index) => {
            if (address === d.address) {
              arr.push(d);
            }
          });
        });
        return res.status(200).json({ data: arr.slice(0, arr.length - 1) });
      }
    })
    .catch((error) => {
      console.error(`Error finding shortest path: ${error}`);
      return res.status(200).json({ msg: "error" });
    });
};

///
const getDistanceMatrix1 = (origins, destinations) => {
  const key = process.env.MAP_API_KEY || "";
  const baseUrl = process.env.MAP_URL + "distancematrix/json";
  const originsStr = origins.map((coord) => coord.join(",")).join("|");
  const destinationsStr = destinations
    .map((coord) => coord.join(","))
    .join("|");

  const url = `${baseUrl}?origins=${originsStr}&destinations=${destinationsStr}&key=${key}&mode=driving&units=imperial`;
  // console.log(`${url}`);
  return new Promise((resolve, reject) => {
    Request(url, { json: true }, (err, res, body) => {
      if (err) {
        reject(`HTTP Error: ${err.message}`);
      } else if (body.status !== "OK") {
        reject(`Error: ${body.status} - ${body.error_message}`);
      } else {
        const distances = body.rows.map((row) =>
          row.elements.map((element) => element.distance.value)
        );
        const durations = body.rows.map((row) =>
          row.elements.map((element) => element.distance.text)
        );
        resolve({
          distances,
          durations,
          origin: body.origin_addresses,
          destinations: body.destination_addresses,
        });
      }
    });
  });
};
const buildGraph1 = (addresses, distances) => {
  const graph = {};

  for (let i = 0; i < addresses.length; i++) {
    graph[addresses[i]] = {};

    for (let j = 0; j < addresses.length; j++) {
      if (i !== j) {
        graph[addresses[i]][addresses[j]] = distances[i][j];
      }
    }
  }

  return graph;
};
const greedyTSP1 = (graph, startNode) => {
  const visited = new Set();
  const path = [startNode];
  let currentNode = startNode;

  while (visited.size < Object.keys(graph).length) {
    visited.add(currentNode);
    let nextNode = null;
    let minDistance = Infinity;

    for (let neighbor in graph[currentNode]) {
      if (
        !visited.has(neighbor) &&
        graph[currentNode][neighbor] < minDistance
      ) {
        minDistance = graph[currentNode][neighbor];
        nextNode = neighbor;
      }
    }

    if (nextNode) {
      path.push(nextNode);
      currentNode = nextNode;
    }
  }

  return path;
};
const findShortestPath1 = async (start, addresses) => {
  const { coordinates, data } = await getCoordinatesForAddresses(addresses);
  if (coordinates.length !== addresses.length) {
    console.error("Error: Not all addresses could be geocoded.");
    return;
  }

  const { distances, durations, origin, destinations } =
    await getDistanceMatrix1(coordinates, coordinates);
  const graph = buildGraph1(destinations, distances);
  const path = greedyTSP1(graph, addresses[0]);
  return { path, coordinates, d1: data };
};
const getShortestDistances11 = async (req, res) => {
  const { start, addresses, token } = req.body;
  findShortestPath1(start, addresses)
    .then((data) => {
      const { path, coordinates, d1 } = data;
      print(data);
      if (path) {
        console.log("The order of addresses from shortest to longest path is:");
        const arr = [];
        path.forEach((address, index) => {
          d1.forEach((d, index) => {
            if (address === d.address) {
              arr.push(d);
            }
          });
        });
        return res.status(200).json({ length: arr.length, data: arr });
      }
      return res.status(200).json({ msg: "error" });
    })
    .catch((error) => {
      console.error(`Error finding shortest path: ${error}`);
      return res.status(200).json({ msg: "error", error: error });
    });
};

///
const getDistanceMatrix2 = (origins, destinations) => {
  const key = process.env.MAP_API_KEY || "";
  const baseUrl = process.env.MAP_URL + "distancematrix/json";
  const originsStr = origins.map((coord) => coord.join(",")).join("|");
  const destinationsStr = destinations
    .map((coord) => coord.join(","))
    .join("|");
  const url = `${baseUrl}?origins=${originsStr}&destinations=${destinationsStr}&key=${key}&mode=driving&units=imperial`;

  return new Promise((resolve, reject) => {
    Request(url, { json: true }, (err, res, body) => {
      if (err) {
        reject(`HTTP Error: ${err.message}`);
      } else if (body.status !== "OK") {
        reject(`Error: ${body.status} - ${body.error_message}`);
      } else {
        const distances = body.rows.map((row) =>
          row.elements.map((element) => element.distance.value)
        );
        resolve(distances);
      }
    });
  });
};
const getDistanceMatrix3 = (origins, destinations) => {
  const key = process.env.MAP_API_KEY || "";
  const baseUrl = process.env.MAP_URL + "distancematrix/json";
  const originsStr = origins.map((coord) => coord.join(",")).join("|");
  const destinationsStr = destinations
    .map((coord) => coord.join(","))
    .join("|");

  const url = `${baseUrl}?origins=${originsStr}&destinations=${destinationsStr}&key=${key}&mode=driving&units=imperial`;
  // console.log(`${url}`);

  return new Promise((resolve, reject) => {
    Request(url, { json: true }, (err, res, body) => {
      if (err) {
        reject(`HTTP Error: ${err.message}`);
      } else if (body.status !== "OK") {
        reject(`Error: ${body.status} - ${body.error_message}`);
      } else {
        const distances = body.rows.map((row) =>
          row.elements.map((element) => element.distance.value)
        );
        const durations = body.rows.map((row) =>
          row.elements.map((element) => element.distance.text)
        );
        resolve({ distances, durations });
      }
    });
  });
};
const mergeDistanceMatrices = (matrices, size) => {
  const merged = Array.from({ length: size }, () => Array(size).fill(Infinity));

  for (i = 0; i < matrices.length - 1; i++) {
    const matrix = matrices[i];
    for (j = 0; j < matrix.length; j++) {
      const row = matrix[j];
      const value = row;
      const rowIndex = i + j;
      merged[i][rowIndex] = value;
    }
  }
  return merged;
};
const mergeDurationMatrices = (matrices, size) => {
  const merged = Array.from({ length: size }, () => Array(size).fill(Infinity));
  for (i = 0; i < matrices.length; i++) {
    const matrix = matrices[i];
    for (j = 0; j < matrix.length; j++) {
      const row = matrix[j];
      for (k = 0; k < row.length; k++) {
        const value = row[k];
        const rowIndex = i * 10 + j;
        merged[rowIndex][k] = value;
      }
    }
  }
  return merged;
};
const buildGraph2 = (addresses, distances) => {
  const graph = {};

  for (let i = 0; i < addresses.length; i++) {
    graph[addresses[i]] = {};

    for (let j = 0; j < addresses.length; j++) {
      if (i !== j) {
        graph[addresses[i]][addresses[j]] = distances[i][j];
      }
    }
  }

  return graph;
};
const greedyTSP2 = (graph, startNode) => {
  const visited = new Set();
  const path = [startNode];
  let currentNode = startNode;

  while (visited.size < Object.keys(graph).length) {
    visited.add(currentNode);
    let nextNode = null;
    let minDistance = Infinity;

    for (let neighbor in graph[currentNode]) {
      if (
        !visited.has(neighbor) &&
        graph[currentNode][neighbor] < minDistance
      ) {
        minDistance = graph[currentNode][neighbor];
        nextNode = neighbor;
      }
    }

    if (nextNode) {
      path.push(nextNode);
      currentNode = nextNode;
    }
  }

  return path;
};
const findShortestPath22 = async (start, addresses) => {
  const { coordinates, data } = await getCoordinatesForAddresses(addresses);
  // console.log(addresses);
  // console.log(addresses.length);

  if (coordinates.length !== addresses.length) {
    console.error("Error: Not all addresses could be geocoded.");
    return;
  }

  var distances = [];
  var durations = [];
  const res = await getDistanceMatrix4(addresses);
  distances = res.distances;
  durations = res.durations;
  const graph = buildGraph2(addresses, distances);
  const path = greedyTSP2(graph, addresses[0]);
  return { path, coordinates, d1: data };
};
const findShortestPath2 = async (start, addresses) => {
  const { coordinates, data } = await getCoordinatesForAddresses(addresses);

  if (coordinates.length !== addresses.length) {
    console.error("Error: Not all addresses could be geocoded.");
    return;
  }
  var distances = [];
  var durations = [];
  const res = await getDistanceMatrix4(addresses);
  distances = res.distances;
  durations = res.durations;
  const graph = buildGraph2(addresses, distances);
  const path = greedyTSP2(graph, addresses[0]);
  // console.log(`shortest path:`);
  // console.log(path);
  // console.log(data);
  return { path, coordinates, d1: data };
};

const getShortestDistances1_ = async (req, res) => {
  const { start, addresses, token } = req.body;
  var addresses1;
  try {
    addresses1 = JSON.parse(addresses);
  } catch (e) {
    addresses1 = addresses;
  }

  findShortestPath2(start, addresses1)
    .then((data) => {
      const { path, coordinates, d1 } = data;
      if (path) {
        const arr = [];
        path.forEach((address, index) => {
          d1.forEach((d, index) => {
            if (address === d.address) {
              arr.push(d);
            }
          });
        });
        return res.status(200).json({ length: arr.length, data: arr });
      }
      return res.status(200).json({ msg: "error" });
    })
    .catch((error) => {
      console.error(`Error finding shortest path: ${error}`);
      return res.status(200).json({ msg: "error", error: error });
    });
};

async function getDistanceMatrixBatch(origins, destinations) {
  console.log("... calling api distance-matrix");
  const originsStr = origins.join("|");
  const destinationsStr = destinations.join("|");
  const key = process.env.MAP_API_KEY || "";
  const baseUrl = process.env.MAP_URL + "distancematrix/json";
  const url = `${baseUrl}?origins=${encodeURIComponent(
    originsStr
  )}&destinations=${encodeURIComponent(
    destinationsStr
  )}&key=${key}&mode=driving&units=imperial`;
  // console.log(url);
  try {
    const response = await axios.get(url);

    const distances = response.data.rows.map((row) =>
      row.elements.map((element) => element.distance.value)
    );

    const durations = response.data.rows.map((row) =>
      row.elements.map((element) => element.duration.value)
    );

    return { distances, durations };
  } catch (error) {
    console.error("Error fetching distance matrix:", error);
  }
}

async function getDistanceMatrix4(addresses) {
  const maxBatchSize = 10;
  const numAddresses = addresses.length;
  const distanceMatrix = Array.from(Array(numAddresses), () =>
    new Array(numAddresses).fill(Infinity)
  );
  const durationMatrix = Array.from(distanceMatrix);

  for (let i = 0; i < numAddresses; i += maxBatchSize) {
    for (let j = 0; j < numAddresses; j += maxBatchSize) {
      const batchOrigins = addresses.slice(i, i + maxBatchSize);
      const batchDestinations = addresses.slice(j, j + maxBatchSize);
      const { distances, durations } = await getDistanceMatrixBatch(
        batchOrigins,
        batchDestinations
      );

      const distanceBatchMatrix = distances;
      const durationBatchMatrix = durations;

      for (let k = 0; k < batchOrigins.length; k++) {
        for (let l = 0; l < batchDestinations.length; l++) {
          distanceMatrix[i + k][j + l] = distanceBatchMatrix[k][l];
          durationMatrix[i + k][j + l] = durationBatchMatrix[k][l];
        }
      }
    }
  }

  return { distances: distanceMatrix, durations: durationMatrix };
}
async function getGeocodeBatch(addresses) {
  const maxBatchSize = 3;
  const numAddresses = addresses.length;
  const coordinateMatrix = Array.from(Array(numAddresses), () =>
    new Array(numAddresses).fill(Infinity)
  );
  const dataMatrix = Array.from(coordinateMatrix);
  const queryMatrix = new Array(numAddresses).fill(Infinity);

  var l = 0;
  for (let i = 0; i < numAddresses; i += maxBatchSize) {
    const batchOrigins = addresses.slice(i, i + maxBatchSize);
    const r = await getGeocode2(batchOrigins);
    const coordinateBatchMatrix = r.d2;
    const dataBatchMatrix = r.d1;
    const queryBatchMatrix = r.query;

    for (let k = 0; k < batchOrigins.length; k++) {
      coordinateMatrix[i + k] = coordinateBatchMatrix[k];
      dataMatrix[i + k] = dataBatchMatrix[k];
    }

    queryBatchMatrix.map((e) => {
      queryMatrix[l] = e;
      l++;
    });
  }

  return {
    coordinates: coordinateMatrix,
    data: dataMatrix,
    query: queryMatrix,
  };
}

async function solveTSP(addresses) {
  const distanceMatrix = await getDistanceMatrix4(addresses);
  console.log(distanceMatrix);
  if (distanceMatrix) {
    const tsp = new TSP(distanceMatrix);
    const result = tsp.solve();

    const orderedAddresses = result.bestRoute.map((index) => addresses[index]);

    // console.log("Best route:", result.bestRoute);
    // console.log("Ordered addresses:", orderedAddresses);
    // console.log("Total distance:", result.bestDistance);
  }
}

const getShortestDistances1__ = async (req, res) => {
  const { start, addresses, token } = req.body;
  var addresses1;
  try {
    addresses1 = JSON.parse(addresses);
  } catch (e) {
    addresses1 = addresses;
  }

  const arr = [];
  await solveTSP(addresses1);
  return res.status(200).json({ length: arr.length, data: arr });
};

const getShortestDistances1 = async (req, res) =>
  await getShortestDistances1_(req, res);
// const getShortestDistances1 = async (req, res) =>
// await getShortestDistances1__(req, res);

module.exports = {
  getPlaces,
  getLocations,
  getShortestDistances,
  getShortestDistancesUsingDijkstra,
  getShortestDistances1,
  getRoutes,
};
