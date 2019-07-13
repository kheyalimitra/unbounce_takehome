const axios = require("axios");
require('custom-env').env();
const urlList = {
    repoListUrl: "https://api.github.com/search/repositories",
    repoDetailsUrl : "https://api.github.com/repos/"
};

async function getRepositories(repoCount, language="clojure") {
    try {
        const url  = urlList.repoListUrl + "?q=language:" + language + "&sort=stars&order=desc&per_page=" + repoCount;
        const result = await axios.get(
            url,
            { 
                headers: {
                    Authorization: process.env.AUTHORIZATION_TOKEN ? "token " + process.env.AUTHORIZATION_TOKEN : ''
                }
            }
        );
        return result;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }

}
async function getContributorsPerRepo(repoName) {
    try {
        const result = axios.get(
            urlList.repoDetailsUrl + repoName + "/contributors",
            { 
                headers: {
                    Authorization: process.env.AUTHORIZATION_TOKEN ? "token " + process.env.AUTHORIZATION_TOKEN : ''
                }
            }
        );
        return result;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

async function getCommitDetailsPerRepo(repoName, commitsPerRepoCount) {
    try {
        const result = axios.get(
            urlList.repoDetailsUrl + repoName + "/commits?per_page=" + commitsPerRepoCount,
            { 
                headers: {
                    Authorization: process.env.AUTHORIZATION_TOKEN ? "token " + process.env.AUTHORIZATION_TOKEN : ''
                }
            }
        );
        return result;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

async function getRepoDetails(repoCount, commitsPerRepoCount) {
    let resultSet = {};
    try {
        const repos = await getRepositories(repoCount);
        var commitPromises = [];
        var contributorPromises = [];
        for(let count = 0; count < repoCount; count ++) {
            let result = {};
            result["repository_name"] = repos[count].items.full_name;
            result["stargazers_count"] = repos[count].items.stargazers_count;
            commitPromises.push(getCommitDetailsPerRepo(repos[count].items.full_name, commitsPerRepoCount));
            contributorPromises.push(getContributorsPerRepo(repos[count].items.full_name));
            result["authors"] = {};
            resultSet.push(result);
    }
        const commitResponse = await Promise.all(commitPromises);
        const contributionResponse = await Promise.all(contributorPromises);
        return resultSet;
    } catch (error) {
        console.log("error occured", error);
        return {"error": error};
    }
}

module.exports = {
    getRepoDetails,
    getCommitDetailsPerRepo,
    getContributorsPerRepo,
    getRepositories
};