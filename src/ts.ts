import * as tf from '@tensorflow/tfjs-node';
var fs = require('fs'); 

var fetcsh = require('node-fetch'); 


// console.log(tf)

// // fs.readFile('file:///_gits/ts-debugging-nodemon-boilerplate/model/model.json', 'utf8', function(err: any, data: any){ 
      
// //     // Display the file content 
// //     console.log(data); 
// // }); 

// console.log(__dirname)

// // const f = fs.


// const not_result = [[   1,    1, 1938, 1917, 5255, 5961, 3433, 4090, 4521, 5604,    1,
//     1,    1,    1, 4934, 3271,  794, 2477,    1,    0,    0,    0,
//     0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,
//     0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,
//     0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,
//     0,    0,    0,    0,    0]]

// const result = [[   1,   11,    1,  250, 2801,    1,    1,    1, 2477, 4844, 4305,
//     0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,
//     0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,
//     0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,
//     0,    0,    0,    0,    0,    0,    0,    0,    0,    0,    0,
//     0,    0,    0,    0,    0]]

// ;(async () => {
//     const MODEL_PATH = 'file:///_gits/ts-debugging-nodemon-boilerplate/model/model.json';
//     const model = await tf.loadGraphModel(MODEL_PATH);
//     // console.log(model)
//     const t = tf.tensor(result).asType("int32")

//     console.log(t)

//     const prediction = model.predict(t)
//     console.log(prediction.toString())
    
//     // prediction.argMax().dataSync()[0]

    

//     // const model = await tf.loadLayersModel('https://foo.bar/tfjs_artifacts/model.json');
// })();

// var exec = require('child_process').execFile;

// var opt = function(){
//       exec('musicET.exe', function(err: any, data: any) {  
//         console.log(err)
//         console.log(data.toString());                       
//     });  
// }
// opt();

// setTimeout(() => {
//     console.log("closing")
// }, 5000)

// Example POST method implementation:
async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetcsh(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "no-cors", // no-cors, *cors, same-origin
    //   cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //   credentials: "same-origin", // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/plain'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    //   redirect: "follow", // manual, *follow, error
    //   referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response; // parses JSON response into native JavaScript objects
  }
  

var cors = require('cors')

const express = require('express')
const app = express()
const port = 3000
app.use(cors())
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());
app.post('/', async (req:any, res:any) => {
    console.log(req.body.question)
    const data = await postData("http://127.0.0.1:8080", { question: req.body.question })
    // console.log(data.body)
    const d = await data.text()
    // console.log(d)
    res.send(d)
})

app.get('/', async (req:any, res:any) => {
  fs.readFile('./model/model.json', (err: any, json:any) => {
    let obj = JSON.parse(json);
    res.json(obj);
 });

})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})