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
    let authors = {};
    let uniqueAuthor = new Set();
    for(let count = 0; count < commitResponse.data.length; count ++) {
        let authorLogin = commitResponse.data[count].author.login;
        if (!(uniqueAuthor.has(authorLogin))) {
            uniqueAuthor.add(authorLogin);
            let email = commitResponse.data[count].commit.author.email ;
            let contribution = contributionMap[authorLogin];
            const numContribution = contribution ? contribution : 1 ;
            if (!(numContribution in authors)) {
                authors[numContribution] = [];
            }
            authors[numContribution].push(email);
        }
    }
    return authors;
}

function iterateAuthorsList (authors) {
    let authorDetails = [];
    let authorList = Object.entries(authors);
    // sort based on contribution count and break tie with email id 
    authorList.sort((a,b) => (Number(a[0]) > Number(b[0]) ? -1 : a[1] < b[1] ? 1 : -1));
    for(count in authorList)  {
        for (index in authorList[count][1]) {
            const author = {"email": authorList[count][1][index], "number_of_commits": authorList[count][0]};
            authorDetails.push(author);
        }
    };
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