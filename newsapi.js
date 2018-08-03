const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('d8e8067cc070417abfec871e54795553');
 
// To query top headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them
newsapi.v2.topHeadlines({
  q: 'trump',
  category: 'politics',
  language: 'en',
  country: 'us'
}).then(response => {
  console.log(response);
});