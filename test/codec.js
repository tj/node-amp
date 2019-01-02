
var amp = require('..');

describe('amp.encode(args...)', function(){
  it('should support no args', function(){
    var bin = amp.encode([]);
    var msg = amp.decode(bin);

    msg.should.eql([]);
  })

  it('should support multiple args', function(){
    var bin = amp.encode([Buffer.from('hello'), Buffer.from('world')]);
    var msg = amp.decode(bin);

    msg.should.have.length(2);
    msg[0].toString().should.equal('hello');
    msg[1].toString().should.equal('world');
  })
})
