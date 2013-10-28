
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
  this[this.state](chunk, encoding);
  if (fn) fn();
};

/**
 * Parse message meta data.
 */

Parser.prototype.message = function(chunk, encoding){
  var meta = chunk[0];
  this.version = meta >> 4;
  this.argv = meta & 0xf;
  this.state = 'arglen';
  this._args = [];
  this._leni = 0;

  // remaining
  if (chunk.length > 1) this._write(chunk.slice(1), encoding);
};

/**
 * Parse argument length.
 */

Parser.prototype.arglen = function(chunk, encoding){
  this._lenbuf[this._leni++] = chunk[0];

  // done
  if (2 == this._leni) {
    this._arglen = this._lenbuf.readUInt16BE();
    this._argcur = 0;
    this._argbuf = [];
    this.state = 'arg';
  }

  // remaining
  if (chunk.length > 1) this._write(chunk.slice(1), encoding);
};

/**
 * Parse argument.
 */

Parser.prototype.arg = function(chunk, encoding){
  // remaining
  var rem = this._arglen - this._argcur;
  var pos = Math.min(rem, chunk.length);

  // slice arg chunk
  var part = chunk.slice(0, pos);
  this._argbuf.push(part);

  // mixed boundary chunk
  var mixed = pos != chunk.length;

  // check if we have the complete arg
  this._argcur += pos;
  var done = this._argcur == this._arglen;

  if (done) {
    var arg = Buffer.concat(this._argbuf);
    this._args.push(arg);
  }

  // no more args
  if (this._args.length == this.argv) {
    this.state = 'message';
    this.emit('data', this._args);
  } else if (done) {
    this.state = 'arglen';
    this._leni = 0;
  }

  // parse remaining mixed-boundary chunks
  if (mixed) this._write(chunk.slice(pos), encoding);
};
