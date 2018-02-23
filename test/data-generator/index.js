let mongoose = require('mongoose');
let faker    = require('faker');
let async    = require('async');
let chalk    = require('chalk');

// globals for this module
let models   = mongoose.models;
let names    = mongoose.modelNames();

const DEBUG = false;

let removeAllDocuments = removeCB => {
  async.each(names, (model, cb) => {
    models[model].deleteMany({}, err => {
      if (err) {
        throw err;
      }
      if(DEBUG) {
        console.log(chalk.cyan(`    Before: Deleted all documents in ${model} collection.`));
      }
      cb();
    });
  }, err => {
    removeCB();
  });
};

let createDocuments = createCB => {
  async.each(names, (model, cb) => {
    createDocument(model, models[model].schema, nd => {
      cb();
    }, true);
  }, err => {
    createCB();
  });
};

let countAllDocuments = countCB => {
  async.reduce(names, {}, (counts, model, cb) => {
    models[model].count({}, (err, cnt) => {
      counts[model] = cnt;
      if(DEBUG) {
        console.log(chalk.cyan(`    Before: Created ${cnt} documents in the ${model} collection.`));
      }
      cb(null, counts);
    });
  }, (err, res) => {
    countCB(null, res);
  });
};

let createDocument = (model, schema, cdCB, subs = false, save = true) => {
  let props = names.indexOf(model) !== -1 ? {
    _id: new mongoose.Types.ObjectId,
    __v: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  } : {
    _id: new mongoose.Types.ObjectId
  };
  async.reduce(Object.keys(schema.paths), props, (props, name, cb) => {

    let path = schema.paths[name];

    // skip auto-generated paths
    if('_id __v createdAt updatedAt'.indexOf(name) === -1) {
      if('Array' === path.instance) {
        if(path.schema) {
          createDocument(name, path.schema, nd => {
            props[name] = [ nd ];
            cb(null, props);
          });
        }
        else if('ObjectID' === path.caster.instance && path.caster.options.ref) {
          props[name] = [];
          if(subs) {
            let ref = path.caster.options.ref;
            createDocument(ref, models[ref].schema, nd => {
              props[name].push(nd._id);
              cb(null, props);
            });
          } else {
            cb(null, props);
          }
        }
      }
      else if('ObjectID' === path.instance && path.options.ref) {
        let ref = path.options.ref;
        createDocument(ref, models[ref].schema, nd => {
          props[name] = nd._id;
          cb(null, props);
        });
      }
      else if(path.options.generator) {
        let gen = faker;
        let seg = path.options.generator.split('.');
        let key;
        while(key = seg.shift()) {
          gen = gen[key];
        }
        props[name] = gen();
        cb(null, props);
      }
      else if(path.options.default || path.options.defaultValue) {
        let def = path.options.default || path.options.defaultValue;
        props[name] = 'function' === typeof def ? def() : def;
        cb(null, props);
      }
      else {
        switch(path.instance) {
          case 'String': props[name] = 'abcd'; break;
          case 'Number': props[name] = 0;   break;
          case 'Date':   props[name] = new Date(); break;
        }
        cb(null, props);
      }
    } else {
      cb(null, props);
    }
  }, (err, doc) => {
    if(save && names.indexOf(model) !== -1) {
      let mod = mongoose.model(model);
      let new_doc = new mod(doc);
      new_doc.save((err, nd) => {
        if(err) {
          console.log(err);
          throw err;
        }
        cdCB(nd);
      });
    } else {
      cdCB(doc);
    }
  });
};

let generator = (callback) => {

  async.series({
    remove: removeAllDocuments,
    create: createDocuments,
    count:  countAllDocuments
  }, (err, res) => {
    callback(res.count);
  });
};
module.exports = {
  generate: generator,
  createDocument: createDocument
};