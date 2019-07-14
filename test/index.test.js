const {getRepoDetails, getCommitDetailsPerRepo, getContributorsPerRepo, getRepositories }= require("../src");

it('get most popular clojure projects', async() => {
    const response = await getRepositories(3);
    const result = response;
    expect(result).toBeDefined();
    expect(result.data.items.length).toBeLessThanOrEqual(3);
    expect(result.data.items[0].full_name).toBeDefined();
})

it('get commit details per clojure project', async() => {
    const response = await getCommitDetailsPerRepo("tonsky/FiraCode",2);
    expect(response).toBeDefined();
    const result = response;
    expect(result.data.length).toBeLessThanOrEqual(2);
    expect(result.data[0].commit).toBeDefined();
})

it('get contributor details per clojure project', async() => {
    const response = await getContributorsPerRepo("tonsky/FiraCode");
    expect(response).toBeDefined();
    const result =  response;
    expect(result.data).toBeDefined();
    expect(result.data[0].contributions).toBeDefined();
})

it('get repo details per project in JSON format', async() => {
    const response = await getRepoDetails(3,3);
    const result =  response;
    expect(result).toBeDefined();
    expect(result[0].stargazers_count).toBeDefined();
})