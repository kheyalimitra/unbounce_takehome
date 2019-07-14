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
        return await result;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }

}
async function getContributorsPerRepo(repoName) {
    try {
        const result = await axios.get(
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
        const result = await axios.get(
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

function generateContributionMapPerRepo(contributionResponse) {
    let contributionMap = new Map();
    for(let count = 0; count < contributionResponse.data.length; count ++) {
        contributionMap[contributionResponse.data[count].login] = parseInt(contributionResponse.data[count].contributions);
    }
    return contributionMap;
}

function getAuthorDetails(commitResponse, contributionResponse) {
    const contributionMap = generateContributionMapPerRepo(contributionResponse);
    let authors = new Map();
    for(let count = 0; count < commitResponse.data.length; count ++) {
        let authorLogin = commitResponse.data[count].author.login;
        let email = commitResponse.data[count].commit.author.email ;
        let contribution = contributionMap[authorLogin];
        const numContribution = contribution ? parseInt(contribution) : -1 ;
        if (!authors.has(numContribution) ) {
            authors[numContribution] = [];
        }
        authors[numContribution].push(email);
    }
    return authors;
}

function iterateAuthorsList (authors) {
    let authorDetails = [];
    Object.keys(authors).sort().reverse().forEach(function(key) {
        for (index in authors[key].sort()) {
            const author = {"email": authors[key][index], "number_of_commits": key};
            authorDetails.push(author);
        }
    })
    return authorDetails;
}

async function getRepoDetails(repoCount, commitsPerRepoCount) {
    let resultSet = [];
    try {
        const repos = (await getRepositories(repoCount)).data;
        for(let count = 0; count < repoCount; count ++) {
            let result = {};
            result["repository_name"] = repos.items[count].full_name;
            result["stargazers_count"] = repos.items[count].stargazers_count;
            let commitResponse = await getCommitDetailsPerRepo(repos.items[count].full_name, commitsPerRepoCount);
            let contributionResponse = await getContributorsPerRepo(repos.items[count].full_name);
            result["authors"]  = iterateAuthorsList(getAuthorDetails(commitResponse, contributionResponse));
            resultSet.push(result);

        }        
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