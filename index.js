// Testing the controllers
var request = require('dupertest');


module.exports = function(toTest){
  
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
      json: callback.bind(null, false, 'json'),
      jsonp: callback.bind(null, false, 'jsonp'),
      download: callback.bind(null, false, 'download'),
      end: callback.bind(null, false, 'end'),
      location: callback.bind(null, false, 'location'),
      redirect: callback.bind(null, false, 'redirect'),
      render: callback.bind(null, false, 'render'),
      send: callback.bind(null, false, 'send'),
      sendFile: callback.bind(null, false, 'sendFile'),
      sendStatus: callback.bind(null, false, 'sendStatus')
    };
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
      .errNext(callback)
      .end();
    return this;
  };
  
  return this;
};