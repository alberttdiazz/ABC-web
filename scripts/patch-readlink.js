// Node.js 24 on Windows returns EISDIR (not EINVAL) when readlink() is called
// on a regular file. Patch all readlink/realpath variants so any caller (Node
// module resolution, enhanced-resolve, @vercel/nft) gets EINVAL instead and
// treats the file as a non-symlink.
const fs = require('fs');
const nodePath = require('path');

function eisDirToEInval(err, path) {
  if (!err || err.code !== 'EISDIR') return err;
  return Object.assign(
    new Error(`EINVAL: invalid argument, readlink '${path}'`),
    { code: 'EINVAL', errno: -4048, syscall: 'readlink', path }
  );
}

// --- fs.readlinkSync ---
const _readlinkSync = fs.readlinkSync.bind(fs);
fs.readlinkSync = function readlinkSync(path, options) {
  try { return _readlinkSync(path, options); }
  catch (err) { throw eisDirToEInval(err, path); }
};

// --- fs.readlink (callback) ---
const _readlink = fs.readlink.bind(fs);
fs.readlink = function readlink(path, options, callback) {
  if (typeof options === 'function') { callback = options; options = undefined; }
  _readlink(path, options, (err, str) => callback(eisDirToEInval(err, path), str));
};

// --- fs.promises.readlink ---
const _promisesReadlink = fs.promises.readlink.bind(fs.promises);
fs.promises.readlink = async function readlink(path, options) {
  try { return await _promisesReadlink(path, options); }
  catch (err) { throw eisDirToEInval(err, path); }
};

// --- fs.realpathSync (its internal C++ binding also calls readlink) ---
const _realpathSync = fs.realpathSync.bind(fs);
const _nativeRealpath = typeof fs.realpathSync.native === 'function'
  ? fs.realpathSync.native.bind(fs.realpathSync)
  : null;

function safeRealpathSync(filepath, options) {
  try { return _realpathSync(filepath, options); }
  catch (err) {
    if (err && err.code === 'EISDIR') return nodePath.resolve(filepath);
    throw err;
  }
}
safeRealpathSync.native = _nativeRealpath
  ? function nativeRealpathSync(filepath, options) {
      try { return _nativeRealpath(filepath, options); }
      catch (err) {
        if (err && err.code === 'EISDIR') return nodePath.resolve(filepath);
        throw err;
      }
    }
  : _realpathSync;
fs.realpathSync = safeRealpathSync;

// --- fs.realpath (async) ---
const _realpath = fs.realpath.bind(fs);
fs.realpath = function safeRealpath(filepath, options, callback) {
  if (typeof options === 'function') { callback = options; options = undefined; }
  _realpath(filepath, options, (err, resolved) => {
    if (err && err.code === 'EISDIR') return callback(null, nodePath.resolve(filepath));
    callback(err, resolved);
  });
};

// --- fs.promises.realpath ---
const _promisesRealpath = fs.promises.realpath.bind(fs.promises);
fs.promises.realpath = async function safePromisesRealpath(filepath, options) {
  try { return await _promisesRealpath(filepath, options); }
  catch (err) {
    if (err && err.code === 'EISDIR') return nodePath.resolve(filepath);
    throw err;
  }
};
