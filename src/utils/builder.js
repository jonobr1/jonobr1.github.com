/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var fs = require('fs'),
    closure = require('./closure'),
    params,
    defined,
    namespaces,
    third_party,
    request_counts,
    next_load = '',
    next_path = '';

exports.build = build;
exports.file_exists = file_exists;
exports.read_file = read_file;
exports.tab = tab;

function build(_params) {

  params = _params;

  defined = {};
  third_party = {};
  request_counts = {};
  namespaces = {};

  var deps = [];

  // load_module(params.baseUrl + params.main + '.js', params.main);

  load_require(params.baseUrl + params.main + '.js', params.main);

  var to_write = '(function() {\n\n';
  var ensured = {};

  for (var name in params.paths) {
    var path = params.baseUrl + params.paths[name] + '.js';
    var str = read_file(path);
    if (str === false) {
      console.log('Failed to locate dependency \'' + name + '\' at ' + path);
      fail();
    }
    load_module(path, name);
  }

  for (var name in namespaces) {
    var ns = namespaces[name];
    to_write += 'var ' + name + ' = ' + name + ' || {};\n';
  }

  to_write += '\n';

  var shared_count = 0;
  for (i in request_counts) {
    var count = request_counts[i];
    if (count > 1) {
      if (i in defined && !defined[i].shared) {
        var new_shared = i.replace(/\//g, '.');
        var v = new_shared + ' = ' + defined[i].getClosure() + ';\n';
        to_write += v + "\n\n";
        defined[i].shared = new_shared;
        shared_count++;
      }
    }
  }

  to_write += defined[params.main].getClosure() + ';';

  // TODO: Add no conflict

  // to_write += '\n\n';
  // to_write += 'root.' + params.shortcut + '.noConflict = function() {\n';
  // to_write += 'root.' + params.shortcut + ' = previousShortcut;\n';
  // to_write += 'return this;\n';
  // to_write += '};\n';
  to_write += '\n\n})();'

  if (params.verbose) console.log('Exported: ' + params.main + ' to window.' + params.shortcut);

  if (params.minify) {

    console.log('Compiling minified source ...');


    closure.compile(to_write, function(error, code) {
      if (error) {
        console.log(error);
      } else {
        write(code);
      }
      if (params.on_compile) {
        params.on_compile();
      }
    });

  } else {

    write(to_write);

  }

  return deps;

}

var require = define;

function define(deps, callback) {

  this.name = next_load;
  this.path = next_path;
  this.shared = false;
  this.closured = false;

  defined[this.name] = this;

  if (Array.isArray(deps)) {

    this.deps = deps;
    this.callback = callback.toString();
    this.module = true;

    // Simple define call, just an object
  } else if (typeof deps === 'object') {

    var props = [];
    for (var i in deps) {
      props.push(i + ':' + deps[i].toString())
    }
    this.callback = '{' + props.join(',') + '}';
    this.module = true;

  } else {

    this.deps = deps;
    this.callback = callback;

  }

  var ns = this.name.split('/');
  for (var i in ns) {
    var namespace = ns[i];
    if (i < ns.length - 1) {
      namespaces[namespace] = {};
      // TODO: RECURSE, expects one level deep of namespaces
    }
  }

  this.getClosure = function() {
    if (this.shared) return this.shared;
    if (!this.deps || this.text) return this.callback;
    var arg_string = '(';
    var args = [];
    for (var i in this.deps) {
      var dep = this.deps[i];
      if (dep in defined) {
        var closure = defined[dep].getClosure();
        if (!defined[dep].shared && !defined[dep].text) {
          var def = defined[dep];
          def.shared = def.name.replace(/\//g, '.');
          closure = def.shared + ' = ' + closure;
        }
        args.push(closure);
      }
    }
    arg_string += args.join(',\n');
    arg_string += ')';
    return '(' + this.callback + ')' + arg_string;

  };

  this.recurseDeps = function() {

    if (!this.deps) return;

    for (var i in this.deps) {

      var dep = this.deps[i];

      // if (dep in params.paths) continue;

      var path = params.baseUrl + dep;

      // Define module?
      if (file_exists(path + '.js')) {
        load_module(path + '.js', dep);

        // Text module?
      } else if (path.match(/text!/) != null) {
        load_text(path.replace('text!', ''), dep);
      }

      // up the request count
      if (dep in request_counts) {
        request_counts[dep]++
      } else {
        request_counts[dep] = 1;
      }

    }

  };

  this.recurseDeps();

}

function file_exists(path) {
  try {
    var stats = fs.lstatSync(path)
    return stats.isFile();
  } catch (e) {
    return false;
  }
}

function read_file(path) {
  try {
    return fs.readFileSync(path).toString();
  } catch (e) {
    return false;
  }
}

function load_require(path, name) {
  name = name || path;
  if (name in defined) return;
  next_load = name;
  next_path = path;
  eval(read_file(path));
}

function load_module(path, name) {
  name = name || path;
  if (name in defined) return;
  next_load = name;
  next_path = path;
  eval('new ' + read_file(path));
}

function load_text(path, name) {
  name = name || path;
  if (name in defined) return;
  var text = read_file(path);
  text = text.replace(/\r/g, "\\r");
  text = text.replace(/\n/g, "\\n");
  text = text.replace(/"/g, "\\\"");
  next_load = name;
  next_path = path;
  var d = new define([], '"' + text + '"');
  d.text = true;
  d.module = false;
}

function tab(str, tabs) {
  var lines = str.split("\n");
  for (var i in lines) {
    lines[i] = tabs + lines[i];
  }
  return lines.join("\n");
}

function write(str) {
  fs.writeFile(params.out, str);
  console.log('Saved to ' + params.out);
}

function fail() {
  console.log('Build failed.');
  process.exit(0);
}