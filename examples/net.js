
var net = require('net');
var amp = require('..');

var server = net.createServer(function(sock){
  var parser = new amp.Stream;
  
  parser.on('data', function(chunk){
    var args = chunk.map(function(c){
      return c.toString();
    });

    var meth = args.shift();
    console.log('.%s(%s)', meth, args.join(', '));
  });

  sock.pipe(parser);
});

server.listen(3000);

var client = net.connect(3000);

setInterval(function(){
  var msg = amp.encode([new Buffer('thumb'), new Buffer('image data here')]);
  client.write(msg);
}, 100);
