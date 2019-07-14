# Project Details

This Project analyze most popular Clojure projects in github
API Used: [GitHub API](https://developer.github.com/v3/) 
User is asked to pass 2 arguments:
- number of repositories to process
- number of commits per repository to examine
For example, if number of repositories is 10, this should process 10 or fewer repositories.
This returns list of repositories ordered by number of stargazers
with:
- repository name (in the format `organization/repository-name`)
  - stargazers count
  - authors/contributors and number of commits like:
    - email
    - number of commits

### Prerequisites

```
node  --version
v12.6.0
npm --version
6.9.0
yarn --version
1.16.0
```
** Other Dependencies: ** 
axios - Promise based HTTP client for the browser and node.js. I have used it for calling API endpoints
jest - JavaScript Testing Framework for runing functional testings
http by nodejs - The server for handling and routing HTTP requests
custom-env - This library helps loading environment variables from a .env file, into the node's process.env object.

## Getting Started
this project has used Node for implementation. In order to run the project 
```
$ git clone https://github.com/kheyalimitra/unbounce_takehome.git
$ cd <PROJECT>
$ npm install
```

## Run the application
From the project folder pelase run
```
yarn start
or 
node src/server.js
```
Now from any browser, go to `http://localhost:8080/`
Pass repo_count and commit_count as query stirng. E.g.  `?repo_count=2&commit_count=5` hit enter. 
If no parameter is passed, default values are 1 and 1 respectively. 
Sample output could be 

```
[
   {
      "repository_name": "tonsky/FiraCode",
      "stargazers_count": 36579,
      "authors": [
         {
            "email": "prokopov@gmail.com",
            "number_of_commits": "208"
         },
         {
            "email": "vdustr@gmail.com",
            "number_of_commits": "1"
         }
      ]
   },
   {
      "repository_name": "metabase/metabase",
      "stargazers_count": 15688,
      "authors": [
         {
            "email": "cammsaul@gmail.com",
            "number_of_commits": "3269"
         },
         {
            "email": "simon.belak@gmail.com",
            "number_of_commits": "993"
         },
         {
            "email": "paulrosenzweig@users.noreply.github.com",
            "number_of_commits": "43"
         }
      ]
   }
]

```
## Run test
From the project folder pelase run
```
yarn test 
```


## Application Structure
 
src/ - This folder contains all js code. server.js, index.js
tests/ - This folder contains test suits for this project.
src/server.js - The entry point to this application. This file defines our http server and listen to port 8080.  User is supposed to pass 2 parameters in a query string to get the result; default value is 1 repo count and 1 commit count
```
http://localhost:8080/?repo_count=2&commit_count=5
```
src/index - This folder contains all the business logic and helper methods for calling github api and get prepare the result
## Application logic and my assumptions

*** Assumptions ***
1. I was not sure how commit number is playing a role in result set. When we say number of commits for author does that mean, find toral commit by that user with in that commit count range. For e.g.: if commit count is 10, and then find total commits by that author say 9 out of 10. 

However I havenot implemneted that. 
When I saw the examples, I saw 1000, 999 and other big nubmers and that triggered me thinking towards finding total contribution count for this given author for that repo. 
And I have implemented that. 


2. There were author and committer in each commit details. In few cases authors and committer are both same but there are cases where they are not. I have used authors login id to look for his/her contribution. 
There are cases where I do not find the login id in contribution list, and then I used `1` as default value. Meaning this commit is the only contribution to the repo. 

3. In order to get more rate limits (5000 hits per hour), I have used Authoriaztion token and saved it in my local `./env` file. this is located under my root directory. I am reading that token using `process.env.AUTHORIZATION_TOKEN` and passing that to each get request as header. 
A sample env file should be 
```
AUTHORIZATION_TOKEN=<your token generated in github>
```
** This application will also work without token (unauthorized mode). Rate limit is 60 per hour. **

- I queried `https://api.github.com/search/repositories?q=language:clojure&sort=stars&order=desc`with `per_page` limit to get list of repositories for clojure. 
- Once I get all the list,  Loop through each repo to 
     -- qeuery `https://api.github.com/repos/<reponame>/commits` for each repor name. 
     -- collect full name of the repo and `stargazers_count` 
     -- `query https://api.github.com/repos/<repo name>/contributors` for getting all contributon details (for total number of commits). I have created a Map (login id and contribution number)
- For each commit details, I populated author details.  
- Get login id and email of each author. 
- search login id in already populated contribution map (login id -> contribution count) 
- get contribution count and update authors list. 
- sort the list based on contribution list (desc) and break the tie using email id (asc). 
- return json result to client. 


## Time taken
I created the folder structure and read me file outside of 2 hours time frame. 
I have also fixed a bug (the last commit) out side 2 hours time frame. 
So to be honest, I have taken 2 hours plus close to 1 and half hour extra time. 


