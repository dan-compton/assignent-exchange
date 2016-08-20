var React = require('react/addons');
var io = require('socket.io-client');
var jui = require('jquery-ui');
var marked = require('marked');
var AccountSettingsModal = require('./Account/AccountSettingsModal.jsx');
var AccountBalanceModal = require('./Account/AccountBalanceModal.jsx');

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var AccountWidget = React.createClass({
    getInitialState: function(){
        return {
            modal: <AccountSettingsModal showModal={false} />
        };
    },
    
    componentWillMount: function(){
        $("#firepad").hide();
    },  

    componentDidMount: function(){
    },

    showAccountSettingsModal: function(){
        this.setState({modal:<AccountSettingsModal key="setti" showModal={true}/>});
    },

    showAccountBalanceModal: function(){
        this.setState({modal:<AccountBalanceModal key="bal" showModal={true}/>});
    },

    handleLogout: function(){
       window.location.href="/logout/"; 
    },
    render: function(){
        return (
                < ReactCSSTransitionGroup >

                <tr className="widget-link">
                        <td className="col-left">
                            <a href="/">
                                Profile and User Data
                            </a>
                        </td>
                        <td className="col-right">
                        </td>
                </tr>

 
                <tr className="widget-link">
                        <td className="col-left">
                            <a onClick={this.showAccountSettingsModal}>
                                Account Settings
                            </a>
                        </td>
                        <td className="col-right">
                        </td>
                </tr>

                <tr className="widget-link">
                        <td className="col-left">
                            <a onClick={this.showAccountBalanceModal}>
                                Balance and Withdrawal
                            </a>
                        </td>
                        <td className="col-right">
                        </td>
                </tr>


                <tr className="widget-link">
                        <td className="col-left">
                            <a onClick={this.handleLogout}>
                                Sign Out
                            </a>
                        </td>
                        <td className="col-right">
                        </td>
                </tr>

                {this.state.modal}
                </ReactCSSTransitionGroup >
        ); 
    }
}); 


module.exports = AccountWidget;
