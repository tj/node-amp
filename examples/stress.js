
var assert = require('assert');
var net = require('net');
var amp = require('..');

var server = net.createServer(function(sock){
  var parser = new amp.Stream;
  var n = 0;
  
  parser.on('data', function(msg){
    assert('foo, bar baz' == msg.join(', '));
    if (n++ % 1000 == 0) {
      process.stdout.write('.');
    }
  });

  sock.pipe(parser);
});

server.listen(3000);

var client = net.connect(3000);

var msg = amp.encode([Buffer.from('foo'), Buffer.from('bar baz')]);

function next() {
  var n = 200;
  while (n--) client.write(msg);
  setImmediate(next);
}

next();
