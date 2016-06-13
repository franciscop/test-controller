// Testing the controllers
var request = require('dupertest');


function TestController (toTest) {

  // Function to test
  this.test = toTest;

  // The data to send as the request
  this.request = {};

  function chainable(){
    return this;
  }

  function untested (method) {
    var self = this;
    return function () {
      console.log('The method "' + method + '" hasn\'t been defined yet by "test-controller" so it won\'t be tested');
      return self;
    };
  }

  // This allows for any of the typical responses to be called. When testing,
  // the testing callback will take first an argument. If we could reach one
  // of the following responses it means there was no error. This is like:
  //   callback(err = false, type, ...others);
  this.response = callback => ({
    append: untested('append'),
    attachment: untested('append'),
    cookie: untested('cookie'),
    clearCookie: untested('clearCookie'),

    // Call the callback with the first argument false (error) and the second equal to the type of response
    format: callback.bind(null, 'jsonp'),
    get: untested('get'),
    json: callback.bind(null, 'json'),
    jsonp: callback.bind(null, 'jsonp'),
    download: callback.bind(null, 'download'),
    end: callback.bind(null, 'end'),
    links: untested('links'),
    location: callback.bind(null, 'location'),
    redirect: callback.bind(null, 'redirect'),
    render: callback.bind(null, 'render'),
    send: callback.bind(null, 'send'),
    sendFile: callback.bind(null, 'sendFile'),
    sendStatus: callback.bind(null, 'sendStatus'),
    set: untested('set'),
    status: chainable,
    type: untested('type'),
    vary: untested('vary')
  });

  this.req = (data) => {
    for (var key in data) {
      this.request[key] = data[key];
    }
    return this;
  };

  this.auth = (data) => {
    this.request.user = this.request.user || {};
    for (var key in data) {
      this.request.user[key] = data[key];
    }
    return this;
  };

  this.get = (data, callback) => {
    this.params(data);
    if (callback) {
      this.end(callback);
    }
    return this;
  };

  this.params = (data) => {
    this.request.params = this.request.params || {};
    for (var key in data) {
      this.request.params[key] = data[key];
    }
    return this;
  };

  this.post = (data, callback) => {
    this.body(data);
    if (callback) {
      this.end(callback);
    }
    return this;
  };

  // Their footprints (definitions) are similar
  this.delete = this.get;
  this.put = this.post;

  this.body = (data) => {
    this.request.body = this.request.body || {};
    for (var key in data) {
      this.request.body[key] = data[key];
    }
    return this;
  };

  this.end = (callback) => {
    request(this.test)
      .params(this.request.params)
      .body(this.request.body)
      .extendReq(this.request)
      .extendRes(this.response(callback || function(){}))
      // Handle the errors
      .errNext(function (err) { callback('error', err); })
      .end();
    return this;
  };

  return this;
}

module.exports = function (toTest) {
  return new TestController(toTest);
};
