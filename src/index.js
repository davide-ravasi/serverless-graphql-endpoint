require("dotenv").config();

const { createLocalServer } = require("./server");

const server = createLocalServer();

server.listen().then((results) => {
  console.log(results);

  console.log(`🚀 Server ready at ${results.url}`);
});
