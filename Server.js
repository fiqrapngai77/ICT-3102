/**
 * 
 * @type Module http|Module http
 * Author: JERAHMEEL
 */

var http = require('http');
var fs = require('fs');
var url = require('url');

var multer = require('multer');
var express =   require("express");
var formidable = require('formidable');
var app = express();

app.use(express.static('public'));
app.use('/upload', express.static('public'));

var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname+"/public/imgdatabank");
    },
    filename: function (req, file, callback) {
        // console.log(file);
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
http.createServer(function (req, res) {
    console.log('Time:', Date.now()+" "+`${req.method} ${req.url}`);
    // parse URL
    const parsedUrl = url.parse(req.url);
    // extract URL path
    // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
    // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
    // by limiting the path to current directory only
    const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
    let pathname = path.join(__dirname+"/public", sanitizePath);

    if(req.method === 'POST'){
        if (req.url === '/upload') {
            let form = new formidable.IncomingForm();
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
    }else {
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