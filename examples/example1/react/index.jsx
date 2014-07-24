var React = require('react');
var userStore = require('../flux/stores/user');
var userActions = require('../flux/actions/user');


var App = React.createClass({

	getInitialState: function(){
		return {
			user: userStore.getState()
		};
	},

	componentWillMount: function(){
		userStore.onChange(this.onUserChange);
	},

	componentWillUnount: function(){
		userStore.offChange(this.onUserChange);
	},

	onUserChange: function(){
		this.setState(userStore.getState());
	},

	login: function(){
		var username = this.refs.username.getDOMNode().value;
		userActions.login(username, '1234567');
		return false;
	},

	logout: function(){
		userActions.logout();
		return false;
	},

	render: function(){
		if( !this.state.isAuth ){
			return this.renderLogin();
		}
		return this.renderHome();
	},

	renderHome: function(){
		return (
			<div>
			<h3>Hello {this.state.data.username}!</h3>
			<a href="#" onClick={this.logout}>Logout</a>
			</div>
		);
	},

	renderLogin: function(){
		if( this.state.isLoggingIn ){
			return(<div>Logging in...</div>);
		}
		return(
			<div>
				<h3>LOGIN</h3>
				Username: <input type="text" ref="username" />
				<br />
				<button onClick={this.login}>Click to login</button>
				{this.renderLoginError()}
			</div>
		);
	},
	
	renderLoginError: function(){
		if( !this.state.error ){
			return;
		}
		return (<div style={{color: 'brown'}}>{this.state.error}</div>)
	}

});

window.onload = function(){
	React.renderComponent(<App />, document.body);
};