const express = require('express')
const multer = require('multer')
const jpeg = require('jpeg-js')
const port = process.env.PORT || 8080

const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')
const axios = require('axios')

const app = express()
const upload = multer()

let model

const convert = async (img) => {
  const image = await jpeg.decode(img, true)
  const numChannels = 3
  const numPixels = image.width * image.height
  const values = new Int32Array(numPixels * numChannels)
  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c]
  return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
}

const getBuffer = async (url) =>
    (
        await axios.get(url, {
            responseType: 'arraybuffer'
        })
    ).data

const nsfwAnalysis = async (image) => {
  const predictions = await model.classify(image)
  image.dispose()
  const responseObj = {}
  predictions.forEach((p) => {
    responseObj[p.className.toLowerCase()] = p.probability
  })
  return responseObj
}

app.get('/', (req, res) => {
  res.send('Running...')
})

app.post('/post', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('Missing Image File')
  } else {
    try {
      const image = await convert(req.file.buffer)
      const responseObj = await nsfwAnalysis(image)
      res.json(responseObj)
    } catch (error) {
      console.log(error)
      res.status(500).send('An error occurred while processing the image')
    }
  }
})

app.get('/get', async (req, res) => {
  if (!req.query.url) {
    res.status(400).send('Missing image URL')
  } else {
    try {
      const buffer = await getBuffer(req.query.url)
      const image = await convert(buffer)
      const responseObj = await nsfwAnalysis(image)
      res.json(responseObj)
    } catch (error) {
      console.log(error)
      res.status(500).send('An error occurred while processing the image')
    }
  }
})

const loadModel = async () => {
  model = await nsfw.load()
}

loadModel().then(() =>
  app.listen(port, () => {
    console.log(`Server started on port ${port}`)
  })
)
