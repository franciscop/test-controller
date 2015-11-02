# Test controller

Testing module for the controllers. Extends req and res from dupertest and other nice properties

## Getting started

If you are installing a testing suite to mock your request and response you probably know what you're doing. But anyway, for the beginners. Install it in your repo using npm:

```bash
npm install test-controller --save
```

Require it within your code (within the test code):

```js
// /tests/controller/index.js

// Some testing modules (not needed, but they are nice to have)
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

// The actual testing controller module
var test = require('test-controller');

// ... your tests
```


## Usage

A simple example of how to mock a request.

```js
test(controller.add).auth(1000).post(mockTest, function(err, type, res){
  expect(type).to.equal('json');
  expect(!!res.error).to.equal(false);
  done();
});
```

| method                     | description                                                     |
|----------------------------|-----------------------------------------------------------------|
| .get(data [, callback])    | perform a get request to the controller                         |
| .post(data [, callback])   | perform a post request to the controller                        |
| .auth(mockuser)            | add the property `user` to the `req` as the object passed       |
| .params(data)              | add the data to the get request, overwriting when needed        |
| .body(data)                | add the data to the post request, overwriting when needed       |
| .end(callback)             | send the request (rarely needed)                                |




## Callback

The callback that is returned to several methos, including `.get(data, callback)`, `.post(data, callback)` and `.end(callback)`, receives 2+ arguments in the following way:

1. The error argument, if any
2. Type of response, if any
3. First argument of the response
4. Second argument of the response
5. Third ...
6. ...

For example, for the following controller:

```js
// Controller (example)
module.exports.show = function(req, res, next){
  if (!req.params.id) next(new Error('No id provided'));
  res.render('show', { title: 'Hello world', id: req.params.id });
};
```

When testing it, the callback will look like this:

```js
test(controller.show).get({ id: 1 }, function(err, type, jade, locals){
  err = false;
  type = 'render';
  jade = 'show';
  locals = { title: 'Hello world', id: 1 };
});
```

On the other hand (and that's why this library was born), if you don't pass the id you get the following:

```js
test(controller.show).get({}, function(err, type, jade, locals){
  err = '[Error] No id provided';   // Error object and it's stacktrace
  type = false;
  jade = false;
  locals = false;
});
```

You can also test the type of response given. For this controller:

```js
// Controller (example)
module.exports.show = function(req, res, next){
  if (!req.params.id || !req.params.id.match(/[0-9]+/)) res.redirect('/');
  res.render('show', { title: 'Hello world', id: req.params.id });
};
```


Test this way that depending on the get arguments :

```js
it('If no id given, go back to home', function(done){
  test(controller.show).get({}, function(err, type, url){
    expect(type).to.equal('redirect');
    expect(url).to.equal('/');
    done();
  });
});

it('Show the element if an id is given', function(done){
  test(controller.show).get({ id: 1 }, function(err, type, file, locals){
    expect(type).to.equal('render');
    expect(file).to.equal('index/show');
    expect(locals.id).to.equal(1);
    done();
  });
});
```





## Methods

### constructor(fn)

This method expects one function that will be tested against the data given later on. This function accepts a `req`, `res` and (optionally) `next` parameters, which will be mocked by the module. Example:

```js
// Load the module
var test = require('test-controller');

// Include the controller to be tested (it has several methods)
var controller = require('../controller/index');

// Test the method `index` from the controller, performing a get request to it
test(controller.index).get({}, console.log);
```



### .get(data [, callback])

Perform a get request to the specified controller

```js
// Test the method `index` from the controller, performing a get request to it
test(controller.index).get({}, console.log);

// Test the method `show` from the controller for a single id
test(controller.show).get({ id: 24 }, function(err, type, data){
  
});
```


### .post()

### .auth(mockuser)

> This feature is in progress and should be considerate as unstable

This method is created to be overrided as/if desired. When using passport, you generate a `req.user` object. This function created the `user` object and assigns the value `{ points: points }`. The function returns a reference to `test` so you can chain it with any method you want. Usage:

```js
it ('does not load the main page for a non-registered user', function(done){
  test(controller.add).auth(100).get({}, function(err, type){
    expect(type).to.equal('redirect');
  });
```


Overriding it:

```js
var test = require('test-controller');
var controller = require('../controller/index');
test.auth = function(role){
  this.user = { name: 'Peter', role: role };
}

describe('Get homepage', function(){
  it ('does not load the main page for a non-registered user', function(done){
    test(controller.add).get({}, function(err, type){
      expect(type).to.equal('redirect');
    });
  });

  it ('loads the main page for the admin', function(done){
    test(controller.add).auth('admin').get({}, function(err, type){
      expect(type).to.equal('render');
    });
  });
});
```
