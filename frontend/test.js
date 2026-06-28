const test = typeof "{\"name\":\"Anjali\"}" === 'string' ? JSON.parse("{\"name\":\"Anjali\"}") : {};
console.log(test.name);
