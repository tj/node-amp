
/**
 * Protocol version.
 */

var version = 1;

/**
 * Encode `msg` and `args`.
 *
 * @param {Array} args
 * @return {Buffer}
 * @api public
 */

module.exports = function(args){
  var argv = args.length;
  var len = 1;
  var off = 0;

  // data length
  for (var i = 0; i < argv; i++) {
    len += 4 + args[i].length;
  }

  // buffer
  var buf = new Buffer(len);

  // pack meta
  buf[off++] = version << 4 | argv;

  // pack args
  for (var i = 0; i < argv; i++) {
    var arg = args[i];

    buf.writeUInt32BE(arg.length, off);
    off += 4;

    arg.copy(buf, off);
    off += arg.length;
  }

  return buf;
};