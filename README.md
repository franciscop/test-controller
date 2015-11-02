# Test controller

Testing module for the controllers. Extends `req` and `res` from [dupertest](https://github.com/TGOlson/dupertest/), perform authentication, add data on the fly and perform more operations to test the controllers.



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
test(controller.show).get({}, function(err, type, file, locals){
  expect(type).to.equal('render');
  expect(file).to.equal('home/index');
  expect(locals.list).to.be.an.array;
  done();
});
```

These are the methods for the variable `test`:

| method                     | description                                                     |
|----------------------------|-----------------------------------------------------------------|
| `.get(data [, callback])`  | perform a get request to the controller                         |
| `.post(data [, callback])` | perform a post request to the controller                        |
| `.auth(mockuser)`          | add the property `user` to the `req` as the object passed       |
| `.params(data)`            | add the data to the get request, overwriting when needed        |
| `.body(data)`              | add the data to the post request, overwriting when needed       |
| `.end(callback)`           | send the request (rarely needed)                                |

And those are the properties (most are appended, see below):

| properties        | description                                  |
|-------------------|----------------------------------------------|
| `test`            | the function to test                         |
| `request`         | the request object and properties            |



## Callback

The callback that is passed to `.get(data, callback)`, `.post(data, callback)` and `.end(callback)`, receives 2+ arguments in the following way:

1. The error argument, or false
2. Type of response, or false
3. First argument of the response if any
4. Second argument of the response if any
5. Third ...
6. ...



### Error handling for the callback

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



### Response type for the callback

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

There are many chainable methods that can be used and all of them can be chained.

### constructor(fn)

This method expects one function that will be tested against the data given later on. This function accepts a `req`, `res` and (optionally) `next` parameters, which will be mocked by the module. Example:

```js
// Load the module
var test = require('test-controller');

// Include the controller to be tested (it has several methods)
var controller = require('../controller/home');

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


### .post(data [, callback])

Perform a post request to the specified controller. Some examples:

```js
// When you need to add something but you don't
it('does not allow you to post nothing', function(done){
  test(controller.add).post({}, function(err, type){
    expect(err).not.to.be.false;
  });
});

// Then you do submit it, good job!
it('allows you to post real data as a non-authenticated user', function(done){
  test(controller.add).post({ id: 24, value: 87 }, function(err, type, data){
    expect(err).to.be.false;
    expect(type).to.equal('redirect');
    done();
  });
});
```



### .auth(mockuser)

This method created the property `req.user` and fills it with the data passed or *truish* (empty object) if no data is passed. This is normally expected to be done by the authentication system that you have, so it's a way to perform authenticated calls to your methods. It function returns `this` so you can chain it with any method you want. Usage:

```js
var mockuser = { name: 'Tim', role: 'admin' };

it ('loads the admin page for an admin', function(done){
  test(adminController.index).auth(mockuser).get({}, function(err, type){
    console.log("This was an authenticated call");
    expect(type).to.equal('render');
    done();
  });
```


