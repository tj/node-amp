
var amp = require('..');

describe('amp.Stream', function(){
  it('should emit "data" events', function(done){
    var stream = new amp.Stream;

    var a = amp.encode([new Buffer('tobi')]);
    var b = amp.encode([new Buffer('loki'), new Buffer('abby')]);
    var c = amp.encode([new Buffer('manny'), new Buffer('luna'), new Buffer('ewald')]);

    var n = 0;

    stream.on('data', function(msg){
      switch (n++) {
        case 0:
          msg.should.have.length(1);
          msg[0].toString().should.equal('tobi');
          break;
        
        case 1:
          msg.should.have.length(2);
          msg[0].toString().should.equal('loki');
          msg[1].toString().should.equal('abby');
          break;

        case 2:
          msg.should.have.length(3);
          msg[0].toString().should.equal('manny');
          msg[1].toString().should.equal('luna');
          msg[2].toString().should.equal('ewald');
          done();
          break;
      }
    });

    write(a, stream);
    write(b, stream);
    stream.write(c.slice(0, 5));
    stream.write(c.slice(5, c.length));
  })
})

function write(from, to) {
  for (var i = 0; i < from.length; i++) {
    to.write(new Buffer([from[i]]));
  }
}