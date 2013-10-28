
/**
 * Module dependencies.
 */

var Stream = require('stream').Writable;
var encode = require('./encode');

/**
 * Expose parser.
 */

module.exports = Parser;

/**
 * Initialize parser.
 *
 * TODO: remove recursion
 *
 * @param {Options} [opts]
 * @api public
 */

function Parser(opts) {
  Stream.call(this, opts);
  this.state = 'message';
  this._lenbuf = new Buffer(2);
}

/**
 * Inherit from `Stream.prototype`.
 */

Parser.prototype.__proto__ = Stream.prototype;

/**
 * Write implementation.
 */

Parser.prototype._write = function(chunk, encoding, fn){
  for (var i = 0; i < chunk.length; i++) {
    switch (this.state) {
      case 'message':
        var meta = chunk[i];
        this.version = meta >> 4;
        this.argv = meta & 0xf;
        this.state = 'arglen';
        this._args = [];
        this._leni = 0;
        break;

      case 'arglen':
        this._lenbuf[this._leni++] = chunk[i];

        // done
        if (2 == this._leni) {
          this._arglen = this._lenbuf.readUInt16BE();
          this._argcur = 0;
          this._argbuf = [];
          this.state = 'arg';
        }
        break;

      case 'arg':
        // bytes remaining in the argument
        var rem = this._arglen - this._argcur;

        // consume the chunk we need to complete
        // the argument, or the remainder of the
        // chunk if it's not mixed-boundary
        var pos = Math.min(rem + i, chunk.length);

        // slice arg chunk
        var part = chunk.slice(i, pos);
        this._argbuf.push(part);

        // check if we have the complete arg
        this._argcur += pos - i;
        var done = this._argcur == this._arglen;
        i = pos - 1;

        if (done) {
          var arg = Buffer.concat(this._argbuf);
          this._args.push(arg);
        }

        // no more args
        if (this._args.length == this.argv) {
          this.state = 'message';
          this.emit('data', this._args);
          break;
        }

        if (done) {
          this.state = 'arglen';
          this._leni = 0;
        }
        break;
    }
  }


  fn();
};