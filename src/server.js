const http = require('http');
const url = require('url');
const {getRepoDetails} = require(".");
const server = http.createServer();

server.on('request', async (req, res) => {
    try {
        let queryData = url.parse(req.url, true).query;
        let repoCount = queryData.repo_count ? 
            Number(queryData.repo_count) : 
            1
        let commitCount = queryData.commit_count ? 
            Number(queryData.commit_count) :
            1
        const result = await getRepoDetails(repoCount, commitCount);
        res.writeHead(200, {"Content-Type": "application/json"});
        console.log(result);
        res.end(JSON.stringify(result));
    } catch(error) {
        console.log(error);
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end(JSON.stringify({"error":error}));
    }
  }).listen(8080); 