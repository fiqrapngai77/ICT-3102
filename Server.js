var http = require('http');
var fs = require('fs');
var url = require('url');
var morgan = require('morgan');
var multer = require('multer');
var express =   require("express");
var formidable = require('formidable');
var app = express();

app.use(express.static('public'));
app.use('/upload', express.static('public'));
app.use(morgan('combined'));
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname+"/public/imgdatabank");
    },
    filename: function (req, file, callback) {
        // console.log(file);
        file.originalname = file.originalname.replace(/\s/g, '');
        imgdir.push(Date.now()+file.originalname);
        callback(null, Date.now()+file.originalname );
        // callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage : Storage}).array('displayImage',1);
// a middleware function with no mount path. This code is executed for every request to the router
const path = require('path');
// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = process.argv[2] || 8081;
// maps file extention to MIME types
const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt'
};
var imgdir = [];
fs.readdir(__dirname+"/public/imgdatabank", (err, files) => {
    files.forEach(file => {
        // console.log(file);
        if(file !== ".DS_Store" && file !== "profile") {
            imgdir.push(file);
        }

    });
});

// console.log(imgdir);
var currentI = 0;
http.createServer(function (req, res) {
    // console.log('Time:', Date.now()+" "+`${req.method} ${req.url}`);
    // parse URL
    const parsedUrl = url.parse(req.url);
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8081');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // extract URL path
    // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
    // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
    // by limiting the path to current directory only
    const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
    let pathname = path.join(__dirname+"/public", sanitizePath);
    if(req.method === 'POST'){
        if (req.url === '/upload') {
            // let form = new formidable.IncomingForm();
            upload(req, res, function (err) {
                if (err) {
                    console.log("Something went wrong!");
                    console.log(err);
                    res.end("Something went wrong!");
                }
                console.log("The file was saved!");
                res.end("File uploaded sucessfully!.");
            });
        }
    }else{
        var q = url.parse(req.url, true).query;
        // var txt = q.offset + " " + q.limit;
        // console.log(txt);
        fs.exists(pathname, function (exist) {
            if (!exist) {
                // if the file is not found, return 404
                res.statusCode = 404;
                res.end(`File ${pathname} not found!`);
                return;
            }
            // if is a directory, then look for index.html
            if (fs.statSync(pathname).isDirectory()) {
                pathname += '/index.html';
            }

            if(q.offset != null) {
                if(currentI >= imgdir.length){
                    return;
                }else{
                    for (i = 0; i < 3; i++) {
                        // console.log(q.offset+ " "+ currentI);
                        console.log(imgdir[currentI]);
                        res.write('<section class=\'center\'>');
                        res.write('<div class=\'username\'><img src=\'/imgdatabank/profile/profile.jpg\' class=\'profile\' ><span class=\'name\'>'+imgdir[currentI]+'</span></div>');
                        res.write('<hr/>');
                        res.write('<div> <img src=/imgdatabank/'+imgdir[currentI]+' class="image"></div>');
                        res.write('<div><p>Comments</p>');
                        res.write('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\\\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,</div>');
                        res.write('</section>');
                        currentI += 1;
                    }
                }
                res.end();
                // if(q.offset >= imgdir.length){
                //     // console.log(imgdir.length);
                //     currentI = q.offset;
                //     return;
                // }
                // res.writeHead(200, {'Content-Type': 'text/html'});
                // for (i = currentI; i < q.offset; i++) {
                //     console.log(q.offset+ " "+ i);
                //     console.log(imgdir[i]);
                //     res.write('<section class=\'center\'>');
                //     res.write('<div class=\'username\'><img src=\'/imgdatabank/profile/profile.jpg\' class=\'profile\' ><span class=\'name\'>'+imgdir[i]+'</span></div>');
                //     res.write('<hr/>');
                //     res.write('<div> <img src=/imgdatabank/'+imgdir[i]+' class="image"></div>');
                //     res.write('<div><p>Comments</p>');
                //     res.write('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\\\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,</div>');
                //     res.write('</section>');
                //     currentI = i;
                // }
                // res.end();
                return;
            }
            // read file from file system
            fs.readFile(pathname, function (err, data) {
                if (err) {
                    res.statusCode = 500;
                    res.end(`Error getting the file: ${err}.`);
                } else {
                    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                    const ext = path.parse(pathname).ext;
                    // if the file is found, set Content-type and send data
                    res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                    res.end(data);
                }
            });
        });
    };
}).listen(parseInt(port));
console.log(`Server listening on port ${port}`);