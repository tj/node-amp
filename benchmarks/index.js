
var amp = require('..');

suite('amp', function(){
  var args = ['foo', 'bar', 'baz'].map(function(s){ return Buffer.from(s); });

  bench('amp.encode()', function(){
    amp.encode(args);
  })

  var stream = new amp.Stream;
  var msg = amp.encode(args);

  bench('amp.Stream#write()', function(){
    stream.write(msg);
  })
})
