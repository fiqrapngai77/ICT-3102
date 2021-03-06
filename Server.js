var http = require('http');
var fs = require('fs');
var url = require('url');
var morgan = require('morgan');
var multer = require('multer');
var express =   require("express");
var qs = require('querystring');
var app = express();
var mongoose = require("mongoose");
const { parse } = require('querystring');

 //sum mongoose schtick for connecting to local monogod
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/test",{ useNewUrlParser: true })
	.catch(function (reason) { console.log('Unable to connect to the mongodb instance. Error: ', reason);
});

// mongoose.connect("mongodb+srv://user1:user1@cluster0-t39x7.gcp.mongodb.net/test?retryWrites=true",{ useNewUrlParser: true })
//     .catch(function (reason) { console.log('Unable to connect to the mongodb instance. Error: ', reason);
//     });

//mongoose schtick for scheme
var accountSchema = new mongoose.Schema({
 username: String,
 passworde: String
});
var Account = mongoose.model("Account", accountSchema);

app.use(express.compress());
app.use(express.static('public'));
app.use('/upload', express.static('public'));
// app.use(morgan('common'));
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
var logger = morgan('[:date[web]] :remote-addr :remote-user :method :url :status :response-time ms - :res[content-length]');
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname+"/public/imgdatabank");
    },
    filename: function (req, file, callback) {
        // console.log(req.body.tag[1]);
        // console.log(req.body.tag[2]);
        // console.log(req.body.tag1);
        // console.log(req.body.tag2);
        // console.log(req.body.tag3);
		// for(var key in req.body){
			// if(req.body.hasOwnProperty(key)){
			// 	console.log([key]);
				// console.log(req.body[key]);
			// }
		// }
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
    '.jpeg': 'image/jpeg',
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

var fakeSession = "";
http.createServer(function (req, res) {
    // console.log('Time:', Date.now()+" "+`${req.method} ${req.url}`);
    logger(req, res, function (err) {
        if (err) return done(err);
        // parse URL
        const parsedUrl = url.parse(req.url);
        // Website you wish to allow to connect
        // res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8081');
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        // Request headers you wish to allow
        // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        // res.setHeader('Access-Control-Allow-Credentials', true);
        // extract URL path
        // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
        // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
        // by limiting the path to current directory only
        const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
        let pathname = path.join(__dirname + "/public", sanitizePath);
        if (req.method === 'POST') {
            if (req.url === '/upload') {
                // let form = new formidable.IncomingForm();
                upload(req, res, function (err) {
                    if (err) {
                        console.log("Something went wrong!");
                        console.log(err);
                        res.end("Something went wrong!");
                    }
                    console.log("A file was saved!");
                    res.end("File uploaded successfully!.");
                });
            }

            if (req.url === '/search.html') {
                // let form = new formidable.IncomingForm();
                // se got to search for closest stuff in imgdir
                console.log("SEARCH HERE ");
                var body = '';
                req.on('data', function (data) {
                    body += data;
                    // Too much POST data, kill the connection!
                    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                    if (body.length > 1e6)
                        req.connection.destroy();
                });

                req.on('end', function () {
                    var post = qs.parse(body);
                    // use post['blah'], etc.
                    console.log(post.s);
                    var matches = [];
                    for (var j = 0; j < imgdir.length; j++) {
                        if (imgdir[j].indexOf(post.s) > -1) matches.push(imgdir[j]);
                    }
                    console.log(matches.length);
                    for (var k = 0; k < matches.length; k++) {
                        res.write('<section class=\'center\'>');
                        res.write('<div class=\'username\'><img src=\'/imgdatabank/profile/profile.jpg\' class=\'profile\' ><span class=\'name\'>' + matches[k] + '</span></div>');
                        res.write('<hr/>');
                        res.write('<div> <img src=/imgdatabank/' + matches[k] + ' class="image"></div>');
                        res.write('<div><p>Comments</p>');
                        res.write('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\\\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,</div>');
                        res.write('</section>');
                    }
                    res.end();
                });

                // return -1;
            } else if (req.url === '/registerAction') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString(); // convert Buffer to string
                });
                req.on('end', () => {
                    var myData = new Account(parse(body));
                    res.writeHead(302, {
                        'Location': '/login.html'
                    });
                    myData.save();
                    /* .then(item => {
                    })
                    .catch(err => {
                    }); */
                    res.end();

                });
            } else if (req.url === '/loginAction') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString(); // convert Buffer to string
                });
                req.on('end', () => {
                    var jsonAccount = parse(body);

                    Account.findOne({username: jsonAccount.username},
                        function (err, obj) {
                            var account = obj;
                            if (account) {
                                if (account.passworde === jsonAccount.passworde) {
                                    fakeSession = jsonAccount.username;
                                    res.writeHead(302, {
                                        'Location': '/'
                                    });
                                    res.end();
                                } else {
                                    res.writeHead(302, {
                                        'Location': '/login.html'
                                    });
                                    res.end();
                                }
                            } else {
                                res.writeHead(302, {
                                    'Location': '/login.html'
                                });
                                res.end();
                            }
                        });

                    /* var myData = new Account(parse(body));
                    res.writeHead(302, {
                      'Location': '/login.html'
                    });
                    res.end(); */

                });
            }
        } else {
            if (req.url === "/" || req.url === "/upload/index.html" || req.url === "/index.html") {
                if (fakeSession == "") {
                    res.writeHead(302, {
                        'Location': '/login.html'
                    });
                    res.end();
                    return;
                }
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

                    if (req.url === '/search') {
                        //extract key using req.query.key
                        //call MySQL Query.
                        //form JSON response and return.
                        pathname += '/search.html';
                    }

                    if (q.offset != null) {
                        if (q.offset < imgdir.length) {
                            res.setHeader("maxlength", imgdir.length);
                            res.write('<section class=\'center\'>');
                            res.write('<div class=\'username\'><img src=\'/imgdatabank/profile/profile.jpg\' class=\'profile\' ><span class=\'name\'>' + imgdir[q.offset] + '</span></div>');
                            res.write('<hr/>');
                            res.write('<div> <img src=/imgdatabank/' + imgdir[q.offset] + ' class="image"></div>');
                            res.write('<div><p>Comments</p>');
                            res.write('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\\\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,</div>');
                            res.write('</section>');
                        }
                        res.end();
                        return;
                    }
                    // read file from file system
                    if(pathname.indexOf(".png") > -1 || pathname.indexOf(".jpg") > -1
						|| pathname.indexOf(".jpeg") > -1 || pathname.indexOf(".gif") > -1){
                        // console.log("Readstream! "+pathname);
                        let readStream = fs.createReadStream(pathname, { highWaterMark: 128 * 1024 });
                        // When the stream is done being read, end the response
                        readStream.on('close', () => {
                            res.end()
                        });

                        // Stream chunks to response
                        readStream.pipe(res);
                    }else{
                        // console.log("readFile! "+pathname);
                        fs.readFile(pathname, function (err, data) {
                            if (err) {
                                res.statusCode = 500;
                                res.end(`Error getting the file: ${err}.`);
                            } else {
                                // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                                const ext = path.parse(pathname).ext;
                                // if the file is found, set Content-type and send data
                                res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                                res.setHeader("Cache-Control", "public, max-age=86400");
                                res.setHeader("Expires", new Date(Date.now() + 86400000).toUTCString());
                                res.end(data);
                            }
                        });
                    };
                });
            } else if (req.url === "/logout") {
                fakeSession = "";
                res.writeHead(302, {
                    'Location': '/login.html'
                });
                res.end();
            } else {
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

                    if (req.url === '/search') {
                        //extract key using req.query.key
                        //call MySQL Query.
                        //form JSON response and return.
                        pathname += '/search.html';
                    }

                    if (q.offset != null) {
                        if (q.offset < imgdir.length) {
                            res.setHeader("maxlength", imgdir.length);
                            res.write('<section class=\'center\'>');
                            res.write('<div class=\'username\'><img src=\'/imgdatabank/profile/profile.jpg\' class=\'profile\' ><span class=\'name\'>' + imgdir[q.offset] + '</span></div>');
                            res.write('<hr/>');
                            res.write('<div> <img src=/imgdatabank/' + imgdir[q.offset] + ' class="image"></div>');
                            res.write('<div><p>Comments</p>');
                            res.write('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\\\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,</div>');
                            res.write('</section>');
                        }
                        res.end();
                        return;
                    }
                    // read file from file system
                    if(pathname.indexOf(".png") > -1 || pathname.indexOf(".jpg") > -1
                        || pathname.indexOf(".jpeg") > -1 || pathname.indexOf(".gif") > -1){
						// console.log("Readstream! "+pathname);
                        let readStream = fs.createReadStream(pathname, { highWaterMark: 128 * 1024 });
                        // When the stream is done being read, end the response
                        readStream.on('close', () => {
                            res.end()
                        });

                        // Stream chunks to response
                        readStream.pipe(res);
					}else{
                        // console.log("readFile! "+pathname);
						fs.readFile(pathname, function (err, data) {
							if (err) {
								res.statusCode = 500;
								res.end(`Error getting the file: ${err}.`);
							} else {
								// based on the URL path, extract the file extention. e.g. .js, .doc, ...
								const ext = path.parse(pathname).ext;
								// if the file is found, set Content-type and send data
								res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                                res.setHeader("Cache-Control", "public, max-age=86400");
                                res.setHeader("Expires", new Date(Date.now() + 86400000).toUTCString());
								res.end(data);
							}
						});
                	};
            });
        }
    }
});
}).listen(parseInt(port));
console.log(`Server listening on port http://127.0.0.1:${port}`);
var os = require( 'os' );
var networkInterfaces = os.networkInterfaces( );
console.log("Server facing on port http://"+ networkInterfaces['en0'][1]['address']  +`:${port}`);
