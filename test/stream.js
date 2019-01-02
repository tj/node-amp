
var amp = require('..');

describe('amp.Stream', function(){
  it('should emit "data" events', function(done){
    var stream = new amp.Stream;

    var a = amp.encode([Buffer.from('tobi')]);
    var b = amp.encode([Buffer.from('loki'), Buffer.from('abby')]);
    var c = amp.encode([Buffer.from('manny'), Buffer.from('luna'), Buffer.from('ewald')]);

    var n = 0;

    stream.on('data', function(buf){
      var msg = amp.decode(buf).map(function(b){ return b.toString(); });

      switch (n++) {
        case 0:
          msg.should.have.length(1);
          msg[0].should.equal('tobi');
          break;
        
        case 1:
          msg.should.have.length(2);
          msg[0].should.equal('loki');
          msg[1].should.equal('abby');
          break;

        case 2:
          msg.should.have.length(3);
          msg[0].should.equal('manny');
          msg[1].should.equal('luna');
          msg[2].should.equal('ewald');
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
    to.write(Buffer.from([from[i]]));
  }
}
