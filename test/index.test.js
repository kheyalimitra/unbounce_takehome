const getRepoDetails = require("../src/query");
it('get most popular clojure projects', async() => {
    const response = await getRepoDetails(3,2);
    expect(response).toBeDefined();
})