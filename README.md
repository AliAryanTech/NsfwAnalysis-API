## NsfwAnalysis-API

An Image analysis Express API using post & get method.
> Can be deploy on heroku 

### Request

```js
const axios = require('axios')

const response = axios.get('http://localhost:8080?url=your_nsfw_image_url').then(res =>
console.log(res.data))
```

### Response 
> An example

```json
{
  "hentai": 0.8291944861412048,
  "drawing": 0.16338874399662018,
  "porn": 0.006925638765096664,
  "neutral": 0.00032094394555315375,
  "sexy": 0.00017022907559294254
}
```
