'use strict';

var pluginName = require('./package.json').name;
var through = require('through2');
var path = require('path');
var util = require('util');
var PoFile = require('pofile');
var xlsx = require('xlsx');

var gUtil = require('gulp-util');


// REF: http://git.io/WEK88Q
function datenum(v, date1904) {
  if(date1904) v+=1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

// REF: http://git.io/WEK88Q
function sheet_from_array_of_arrays(data) {
  var ws = {};
  var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
  for(var R = 0; R != data.length; ++R) {
    for(var C = 0; C != data[R].length; ++C) {
      if(range.s.r > R) range.s.r = R;
      if(range.s.c > C) range.s.c = C;
      if(range.e.r < R) range.e.r = R;
      if(range.e.c < C) range.e.c = C;
      var cell = {v: data[R][C] };
      if(cell.v == null) continue;
      var cell_ref = xlsx.utils.encode_cell({c:C,r:R});
      
      if(typeof cell.v === 'number') cell.t = 'n';
      else if(typeof cell.v === 'boolean') cell.t = 'b';
      else if(cell.v instanceof Date) {
        cell.t = 'n'; cell.z = xlsx.SSF._table[14];
        cell.v = datenum(cell.v);
      }
      else cell.t = 's';
      
      ws[cell_ref] = cell;
    }
  }
  if(range.s.c < 10000000) ws['!ref'] = xlsx.utils.encode_range(range);
  return ws;
}

// TODO: export in csv, xls, xlsx, json, etc
module.exports = function (outputFile, options) {
  options = util._extend({filter: 'all'}, options);
  var empties = {};
  outputFile = outputFile || 'out.xlsx';

  return through.obj(function (file, enc, cb) {
    var self = this;

    if (file.isNull()) {
      self.push(file);
      return cb();
    }
    
    if (file.isStream()) {
      self.emit('error', new gUtil.PluginError(pluginName, 'Streaming not supported'));
      return cb();
    }

    var pofile = PoFile.parse(file.contents.toString());
    var empty = empties[pofile.headers['Language']] = [];

    pofile.items.forEach(function(item) { 
      if (!item.msgstr || !item.msgstr.join('').length) {
        // TODO: transpose just before writing output instead of here
        empty.push([item.msgid]);
      }
    });

    self.push(file);
    cb();

  }, function(cb) {

    var workbook = {Sheets: {}, SheetNames: []};

    Object.keys(empties).forEach(function(lang) {
      workbook.SheetNames.push(lang);
      workbook.Sheets[lang] = sheet_from_array_of_arrays(empties[lang]);
    });

    xlsx.writeFile(workbook, outputFile);
    cb();
    
  });
};
