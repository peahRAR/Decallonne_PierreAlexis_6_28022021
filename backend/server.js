const http = require('http');
const server = http.createServer((req, res) => {
    res.end('Reponse du server nodemon');
});

server.listen(process.env.PORT || 3000);