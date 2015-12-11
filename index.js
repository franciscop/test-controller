// Testing the controllers
var request = require('dupertest');


function TestController(toTest){
  
  // Function to test
  this.test = toTest;
  
  // The data to send as the request
  this.request = {};
  
  // This allows for any of the typical responses to be called. When testing,
  // the testing callback will take first an argument. If we could reach one
  // of the following responses it means there was no error. This is like:
  //   callback(err = false, type, ...others);
  this.response = function(callback){
    if (!callback) return {};
    
    return {
      // Call the callback with the first argument false (error) and the second equal to the type of response
      json: callback.bind(null, null, 'json'),
      jsonp: callback.bind(null, null, 'jsonp'),
      download: callback.bind(null, null, 'download'),
      end: callback.bind(null, null, 'end'),
      location: callback.bind(null, null, 'location'),
      redirect: callback.bind(null, null, 'redirect'),
      render: callback.bind(null, null, 'render'),
      send: callback.bind(null, null, 'send'),
      sendFile: callback.bind(null, null, 'sendFile'),
      sendStatus: callback.bind(null, null, 'sendStatus')
    };
  };
  
  this.req = (data) => {
    for (var key in data) {
      this.request[key] = data[key];
    }
    return this;
  }
  
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
    if (callback){
      this.end(callback);
    }
    return this;
  };
  
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
      .extendRes(this.response(callback))
      .errNext(function(err){ callback(err, 'next'); })
      .end();
    return this;
  };
  
  return this;
}

module.exports = function(toTest){
  return new TestController(toTest);
};