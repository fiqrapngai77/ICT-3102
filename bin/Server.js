var http = require('http');
var fs = require('fs');
var url = require('url');

var multer = require('multer');
var express =   require("express");
var formidable = require('formidable');
var app = express();

var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/Users/jerahmeel/WebstormProjects/ICT3102NodeJS/img/');
    },
    filename: function (req, file, callback) {
        // console.log(file);
        callback(null, Date.now()+file.originalname );
        // callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage : Storage}).array('displayImage',1);

// Create a server
http.createServer( function (request, response) {
    // Parse the request containing file name
    var pathname = url.parse(request.url).pathname;

    // Print the name of the file for which request is made.
    console.log("Request for " + pathname + " received.");

    if(request.method === 'POST') {
        if (request.url === '/file-upload') {
            let form = new formidable.IncomingForm();
            upload(request, response, function (err) {
                if (err) {
                    console.log("Something went wrong!");
                    response.end("Something went wrong!");
                }
                console.log("The file was saved!");
                response.end("File uploaded sucessfully!.");
            });
        }
    }else {
        // Read the requested file content from file system
        // console.log("The file: "+ pathname.substr(1));
        fs.readFile(pathname.substr(1), function (err, data) {
            if (err) {
                console.log(err);
                // HTTP Status: 404 : NOT FOUND
                // Content Type: text/plain
                response.writeHead(404, {'Content-Type': 'text/html'});
                response.write(data.toString());
                response.end();
            } else {
                //Page found
                // HTTP Status: 200 : OK
                // Content Type: text/plain
                if (pathname.indexOf('.js') != -1) { //req.url has the pathname, check if it conatins '.js'
                    fs.readFile(pathname.substr(1), function (err, data) {
                        if (err) console.log(err);
                        response.writeHead(200, {'Content-Type': 'text/javascript'});
                        response.write(data);
                        response.end();
                    });
                }

                if (pathname.indexOf('.css') != -1) { //req.url has the pathname, check if it conatins '.css'
                    fs.readFile(pathname.substr(1), function (err, data) {
                        if (err) console.log(err);
                        response.writeHead(200, {'Content-Type': 'text/css'});
                        response.write(data);
                        response.end();
                    });
                }

                if (pathname.indexOf('.html') != -1) { //req.url has the pathname, check if it conatins '.css'
                    fs.readFile(pathname.substr(1), function (err, data) {
                        if (err) console.log(err);
                        response.writeHead(200, {'Content-Type': 'text/html'});
                        response.write(data);
                        response.end();
                    });
                }
            }
        });
    }
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');