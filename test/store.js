var ReactFlux = require('../');
var assert = require('chai').assert;
var sinon = require("sinon");

var constants = ReactFlux.createConstants(['ONE','TWO'], 'STORE');


var storeDidMountSpy = sinon.spy();

var FooMixin = {
	bar: sinon.spy(),
	getInitialState: sinon.spy(function () {
		return {
			abc: "abc",
			xyz: "xyz"
		};
	}),
	storeDidMount: sinon.spy()
};

var BarMixin = {
	foo: sinon.spy(),
	getInitialState: sinon.spy(function () {
		return {
			def: "def"
		};
	}),
	storeDidMount: sinon.spy()
};

var EnhancedFooMixin = {
	mixins: [FooMixin],
	enhancedBar: sinon.spy(),
	getInitialState: sinon.spy(function () {
		return {
			abc: "abc-enhanced"
		};
	}),
	storeDidMount: sinon.spy()
};

var getInitialStateSpy = sinon.spy(function(){
	return {
		id: 1,
		username: 'mustermann'
	};
});

var store = ReactFlux.createStore({

	mixins: [
		EnhancedFooMixin,
		BarMixin
	],

	getInitialState: getInitialStateSpy,

	storeDidMount: storeDidMountSpy,

	getId: function(){
		return this.state.get('id');
	}

}, [
[constants.ONE, function(){}]
]);

store.addActionHandler(constants.TWO, {
	getInitialState: function(){
		return {
			name: 'TWO_HANDLER'
		};
	},
	before: function(){
	},
	after: function(){
	},
	success: function(){
	},
	fail: function(){
	}
});

describe("store", function(){

	it("should create store with mixins", function(){
		assert.typeOf(store, 'object');
		assert.typeOf(store.getId, 'function');
	});

	it("should use the mixins property", function(){
		assert.typeOf(store.foo, 'function');
		assert.typeOf(store.enhancedBar, 'function');
	});

	it("should recursively use the mixins property", function(){
		assert.typeOf(store.bar, 'function');
	});

	it("should call each mixin's storeDidMount function", function(){
		assert.isTrue(FooMixin.storeDidMount.calledOnce);
		assert.isTrue(BarMixin.storeDidMount.calledOnce);
		assert.isTrue(EnhancedFooMixin.storeDidMount.calledOnce);
		assert.isTrue(storeDidMountSpy.calledOnce);
	});

	it("should call and merge each mixin's getInitialState function", function(){
		assert.equal(store.state.get('abc'),'abc-enhanced');
		assert.equal(store.state.get('xyz'),'xyz');
		assert.equal(store.state.get('def'),'def');
	});

	it("should call getInitialState", function(){
		assert.isTrue( getInitialStateSpy.called );
	});

	it("should call storeDidMount", function(){
		assert.isTrue( storeDidMountSpy.called );
	});

	it("should call storeDidMount after getInitialState", function(){
		assert.isTrue( storeDidMountSpy.calledAfter( getInitialStateSpy ) );
	});

	it("should have a state", function(){
		assert.typeOf(store.state, "object");
	});

	it("store.state.get() should work", function(){
		assert.equal(store.state.get('id'), 1);
		assert.equal(store.state.get('username'), "mustermann");
	});

	it("store.get() should work", function(){
		assert.equal(store.get('id'), 1);
		assert.equal(store.get('username'), "mustermann");
	});

	it("should be able to call mixin methods", function(){
		assert.equal(store.getId(), 1);
	});

	it("should have a working setState", function(){
		store.setState({
			id: 3
		});
		assert.equal(store.state.get('id'), 3);
		assert.equal(store.state.get('username'), 'mustermann');
	});


	it("should have onChange/offChange", function(){
		assert.typeOf(store.onChange, "function");
		assert.typeOf(store.offChange, "function");
	});

	it("should call onChange when state changes", function(){
		var spy = sinon.spy();
		store.onChange( spy );
		store.setState({id: 2});
		assert.isTrue( spy.called );
	});

	it("offChange should remove listener", function(){
		var spy = sinon.spy();
		store.onChange( spy );
		store.offChange( spy );
		store.setState({id: 2});
		assert.isFalse( spy.called );
	});

	it("getActionState should work", function(){

		assert.typeOf(store.getActionState, 'function', 'store.getActionState should be a function');

		var state = store.getActionState(constants.TWO);

		assert.typeOf(state, 'object', 'store.getActionState should return an object');
		assert.equal(state.name, 'TWO_HANDLER', 'store.getActionState should return state object correctly');
		assert.equal(store.getActionState(constants.TWO, 'name'), 'TWO_HANDLER');

		assert.throw(function(){
			store.getActionState('nonexistant');
		}, 'Store.getActionState constant handler for [nonexistant] is not defined');

		assert.equal(store.getActionState(constants.TWO, 'nonexistantKey'), undefined);
	});

	it("should have a working setActionState method", function(){
			assert.typeOf(store.setActionState, 'function', 'store.setActionState should be a function');

			store.setActionState(constants.TWO, {'name': 'bar'});
			assert.equal(store.getActionState(constants.TWO, 'name'), 'bar', 'setActionState should reset state');
	});

	it("should have a working resetActionState method", function(){
		assert.typeOf(store.resetActionState, 'function', 'store.resetActionState should be a function');

		assert.throw(function(){
			store.resetActionState('nonexistant');
		}, 'Store.resetActionState constant handler for [nonexistant] is not defined');

		store.setActionState(constants.TWO, {'name': 'bar'});
		store.resetActionState(constants.TWO);
		assert.equal(store.getActionState(constants.TWO, 'name'), 'TWO_HANDLER', 'resetActionState should reset state');
	});

	it("should provide a functional toJS method", function(){
		assert.typeOf(store.toJS, 'function', 'store.toJS should be a function');
		store.setState({'foo': 'bar'});
		var toJS = store.toJS();
		assert.typeOf(toJS, 'object', 'store.toJS should return an object');
		assert.equal(toJS.foo, 'bar', 'store.toJS should return state');
	});

	it("should provide a functional toObject method", function(){
		assert.typeOf(store.toObject, 'function', 'store.toObject should be a function');
		store.setState({'foo': 'bar'});
		var toObject = store.toObject();
		assert.typeOf(toObject, 'object', 'store.toObject should return an object');
		assert.equal(toObject.foo, 'bar', 'store.toObject should return state');
	});

	it("should provide a functional toJSON method", function(){
		assert.typeOf(store.toJSON, 'function', 'store.toJSON should be a function');
		store.setState({'foo': 'bar'});
		var toJSON = store.toJSON();
		assert.typeOf(toJSON, 'object', 'store.toJSON should return an object');
		assert.equal(toJSON.foo, 'bar', 'store.toJSON should return state');
	});

	it("should be able to replaceState", function(){
		store.setState({'foo': 'bar'});
		store.replaceState({
			'foo2': 'bar2'
		});
		assert.isUndefined(store.get('foo'));
		assert.equal(store.get('foo2'), 'bar2');
	});

	it("getHandlerIndex should throw an error when provided a non-existant constant", function(){
		assert.throw(function(){
			store.getHandlerIndex();
		}, /Can not get store handler for constant/);
	});

	it("should provide a mixin method for react components", function(){
		var mixin = store.mixin();
		assert.typeOf(mixin, 'Object', 'Store mixin should return a mixin');
		assert.typeOf(mixin.componentWillMount, 'function', 'store.mixin should return a mixin with componentWillMount');
		assert.typeOf(mixin.componentDidMount, 'function', 'store.mixin should return a mixin with componentDidMount');
		assert.typeOf(mixin.componentWillUnmount, 'function', 'store.mixin should return a mixin with componentWillUnmount');
	});


	it("createStore should complain about wrong handler definitions", function(){
		assert.throw(function(){
			ReactFlux.createStore({

			}, {});
		}, /store expects handler definitions to be an array/);

		assert.throw(function(){
			ReactFlux.createStore({
			}, [
				[null, function(){}]
			]);
		}, /store expects all handler definitions to contain a constant as the first parameter/);

		assert.throw(function(){
			ReactFlux.createStore({
			}, [
				['FOO', null]
			]);
		}, /store expects all handler definitions to contain a callback/);

		assert.throw(function(){
			ReactFlux.createStore({
				},[
					'buggy', function(){}
				]);
		}, /store expects handler definition to be an array/);

		assert.throw(function(){
			ReactFlux.createStore({
			},[
				['FOO', store, function(){}]
			]);
		}, /store expects waitFor to be an array of stores/);

		assert.throw(function(){
			ReactFlux.createStore({
			},[
				['FOO', [function(){}], function(){}]
			]);
		}, /store expects waitFor to be an array of stores/);

	});

});
