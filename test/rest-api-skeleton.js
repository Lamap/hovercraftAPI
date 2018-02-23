// import libraries
let request  = require('supertest');
let expect   = require('chai').expect;
let jwt      = require('jsonwebtoken');
let mongoose = require('mongoose');
let chalk    = require('chalk');
let random   = require('randomstring');
let _        = require('lodash');

// load the config
require('dotenv').config();

const DEBUG = false;

// load the server
let app = require('../server');

// create a JWT
let token = jwt.sign({ user: 'some.body@example.com' }, process.env.AUTH0_SECRET, {
    expiresIn: '5s',
    audience: process.env.AUTH0_ID
});

// load the data generator
let dg = require('./data-generator');

// utility function for turning BSON into JSON
let unBSON = bson => JSON.parse(JSON.stringify(bson));

describe(`The ${process.env.APP} REST API`, function() {

  // create a variable to keep track of items added/removed from the database
  let doc_stats = {};
  this.timeout(0);

  // setup
  before(function(done) {
    dg.generate((counts) => {
      doc_stats = counts;
      done();
    });
  });

  // teardown
  after(function() {
    // remove all documents from the database
    for(let model in mongoose.models) {
      mongoose.models[model].remove({}, err => {
        if(DEBUG) {
          console.log(chalk.cyan(`  After: Removed all ${model} documents`));
        }
      });
    }

    // clear connection and models
    mongoose.disconnect();
    mongoose.models = {};
    mongoose.modelSchemas = {};
  });

  it('can blow smoke', function() {
    expect(true).to.be.true;
  });

  describe('JWT Middleware', function() {

    it('returns 401 error without a proper Authorization header', function(done) {
      request(app).get('/')
        .expect(401, { name: 'UnauthorizedError',
          message: 'No authorization token was found',
          code: 'credentials_required',
          status: 401,
          inner: {
            message: 'No authorization token was found'
          }
        }, done);
    });

    it('returns 200 if valid Authorization header sent', function(done) {
      request(app).get('/')
        .set('Authorization', `Bearer ${token}`)
        .expect(200, {
          message: `This is the ${process.env.APP} REST API`
        }, done);
    });

    it('returns 401 error if the token is expired', function(done) {
      // create a short-lived JWT
      let t = jwt.sign({ user: 'some.body@example.com' }, process.env.AUTH0_SECRET, {
          expiresIn: '10', // 10ms
          audience: process.env.AUTH0_ID
        });
      // wait 50ms before we try to use it
      setTimeout(function() {
        request(app).get('/')
          .set('Authorization', `Bearer ${t}`)
          .expect(401, done);
      }, 50);
    });
  });

  describe('Error Handling Middleware', function() {

    it('returns 404 error for an unknown route', function(done) {
      request(app).get('/unimplemented')
        .set('Authorization', `Bearer ${token}`)
        .expect(404, {
          name: 'RouteNotFoundError',
          message: 'You have tried to access an API endpoint (/unimplemented) that does not exist.'
        }, done);
    });
  });

  describe('Routes', function() {

    // set up the DB with test fixtures
    before(function(done) {
      // console.log(mongoose.models['Activity'].collection.name);
      // console.log(mongoose.Types.ObjectId());
      // for(let model in mongoose.models) {

      // }
      done();
    });

    // remove all of the test data
    after(function(done) {
      done();
    });

    // get a list of all defined routes
    let routes = app._router.stack.filter(r => 'undefined' !== typeof r.route).map(r => r.route);

    // create a describe block for each model
    for(let model in mongoose.models) {
      let collection = mongoose.models[model].collection.name
      let path = '/' + collection;
      let schema = mongoose.models[model].schema;
      let requiredPaths = schema.requiredPaths();
      let validatedPaths = _.filter(schema.paths, p => 'undefined' !== typeof p.options.validate);
      // for aggregate endpoints
      describe(path, function() {
        let methods = routes.filter(r => r.path === path).map(r => r.methods)[0];
        for(let method in methods) {
          switch(method) {
            case 'get':
              it(`can ${method.toUpperCase()} all ${collection}`, function(done) {
                request(app).get(path).set('Authorization', `Bearer ${token}`)
                  .expect(200, function(err, res) {
                    // check # of docs retrieved vs # expected in the db
                    if(doc_stats[model] !== res.body.length) {
                      throw new Error(`Expected ${doc_stats[model]} results, got ${res.body.length}`)
                    }
                    done();
                  });
              });
              break;
            case 'post':
              it(`can create (${method.toUpperCase()}) a new ${model}`, function(done) {
                dg.createDocument(model, mongoose.models[model].schema, new_doc => {
                  request(app).post(path).set('Authorization', `Bearer ${token}`)
                    .send(new_doc)
                    .expect(200, unBSON(new_doc), done);
                }, false, false);
              });
              // test required path validators
              for(let rp of requiredPaths) {
                it(`returns 400 error if required ${rp} path is missing on create`, function(done) {
                  let message = schema.paths[rp].validators.filter(v => 'required' === v.type)[0].message;
                  dg.createDocument(model, schema, new_doc => {
                    new_doc = unBSON(new_doc);
                    delete new_doc[rp];
                    request(app).post(path).set('Authorization', `Bearer ${token}`)
                      .send(new_doc)
                      .expect(400, (err, res) => {
                        if(res.body.errors[rp].message !== message) {
                          throw new Error('The error messages were not the same.' );
                        }
                        done();
                      });
                  }, false, false);
                });
              }
              // test validators
              for(let vp of validatedPaths) {
                it(`returns 400 error if ${vp.path} is not valid on create`, function(done) {
                  let message = vp.options.validate.message;
                  let isValid = vp.options.validate.validator;
                  let invalid_text = '';
                  do { // FIX: This could potentially be infinite!!!
                    invalid_text = random.generate();
                  } while(isValid(invalid_text));
                  dg.createDocument(model, schema, new_doc => {
                    new_doc = unBSON(new_doc);
                    new_doc[vp.path] = invalid_text;
                    request(app).post(path).set('Authorization', `Bearer ${token}`)
                      .send(new_doc)
                      .expect(400, (err, res) => {
                        if(res.body.errors[vp.path].message !== message) {
                          throw new Error('The error messages were not the same.');
                        }
                        done();
                      });
                  }, false, false);
                });
              }
              break;
          }
        }
      });
      // for specific object endpoints
      let spec_path = path + '/:id';
      if (routes.filter(r => r.path === spec_path).length > 0) {
        describe(spec_path, function() {
          let methods = routes.filter(r => r.path === spec_path).map(r => r.methods)[0];
          let doc = {};
          before(function(done) {
            mongoose.models[model].findOne({}, (err, d) => {
              doc = d;
              spec_path = spec_path.replace(':id', doc.id);
              done();
            });
          });
          for(let method in methods) {
            switch(method) {
              case 'get':
                it(`can ${method.toUpperCase()} a specific ${model}`, function(done) {
                  request(app).get(spec_path).set('Authorization', `Bearer ${token}`)
                    .expect(200, unBSON(doc.toJSON()), done);
                });
                break;
              case 'post':
                it(`can update (${method.toUpperCase()}) a specific ${model}`, function(done) {
                  let edited_doc = unBSON(doc.toJSON());
                  delete edited_doc.updatedAt;
                  request(app).post(spec_path).set('Authorization', `Bearer ${token}`)
                    .send(edited_doc)
                    .expect(200, (err, res) => {
                      if(err) {
                        console.log(err);
                        throw new Error(err);
                      }
                      if(res.body.createdAt === res.body.updatedAt) {
                        throw new Error(`Expected ${model}.createdAt NOT to equal ${model}.updatedAt.`);
                      }
                      done();
                    });
                });
                for(let vp of validatedPaths) {
                  it(`returns 400 error if ${vp.path} is not valid on update`, function(done) {
                    let edited_doc = unBSON(doc.toJSON());
                    let message = vp.options.validate.message;
                    let isValid = vp.options.validate.validator;
                    let invalid_text = '';
                    do { // FIX: This could potentially be infinite!!!
                      invalid_text = random.generate();
                    } while(isValid(invalid_text));
                    edited_doc[vp.path] = invalid_text;
                    request(app).post(spec_path).set('Authorization', `Bearer ${token}`)
                      .send(edited_doc)
                      .expect(400, (err, res) => {
                        if(res.body.errors[vp.path].message !== message) {
                          throw new Error('The error messages were not the same.');
                        }
                        done();
                      });
                  });
                }
                break;
              case 'delete':
                it(`can ${method.toUpperCase()} a specific ${model}`, function(done) {
                  request(app).delete(spec_path).set('Authorization', `Bearer ${token}`)
                    .expect(200, done);
                });
                break;
            }
          }
        });
      }
    }
  });
});