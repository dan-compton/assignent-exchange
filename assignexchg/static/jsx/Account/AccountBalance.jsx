var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');
var jui = require('jquery-ui');
var ChangePassword = require('./ChangePassword.jsx');
var ReactScriptLoaderMixin = require('react-script-loader').ReactScriptLoaderMixin;

var AccountBalance = React.createClass({
    mixins: [ValidationMixin, React.addons.LinkedStateMixin, ReactScriptLoaderMixin],

    getScriptURL: function(){
        return 'https://checkout.stripe.com/checkout.js';
    },

    validatorTypes:  {
        paypal_account: Joi.string().email().label('Paypal Account')
    },

    getInitialState: function() {
        return {
            paypal_account: null,
            minutes: 0,
            feedback: null
        };
    },

    componentWillMount: function(){
        this.loadExchangeAccountData();
    }, 

    handleLoadExchangeAccountData: function(data){
        this.setState({
            paypal_account: data.exchange_account.paypal_account,
            minutes: data.exchange_account.minutes
        });

        this.forceUpdate();
    }, 

    loadExchangeAccountData: function(){
        $.getJSON('/api/users/' + $('#user_id').text(), this.handleLoadExchangeAccountData);
    },

    submitPayment:function(token){
        var data = {
            token:token
        }

        $.ajax({
                type: 'POST',
                headers: {
                    Accept: "text/plain; charset=utf-8",
                    "Content-Type" : "application/json; charset=utf-8"
                },

                url: '/payment/charge/',
                data:JSON.stringify(data),
                success: function(data){
                    console.log(data);
                    this.setState({minutes:this.state.minutes + 60});
                }.bind(this)
            });

    },

    withdrawFunds:function(){
        $.ajax({
                type: 'POST',
                headers: {
                    Accept: "text/plain; charset=utf-8",
                    "Content-Type" : "application/json; charset=utf-8"
                },

                url: '/payment/cash-out/'+$('#user_id').text(),
                data:JSON.stringify(profile),
                success: function(data){
                    this.setState({minutes:0});
                }.bind(this)
            });

    },

    // update profile data
    updateExchangeAccountData: function(){

        $.ajax({
            type: 'PATCH',
            headers: {
                Accept: "text/plain; charset=utf-8",
                "Content-Type" : "application/json; charset=utf-8"
            },

            url: '/api/exchange_account/' + $('#user_id').text(),
            data:JSON.stringify({'paypal_account':this.state.paypal_account}),
            success: function(data){

            }.bind(this)
        });
    },

    renderHelpText: function(message) {
        return (
                <span className="help-block">{message}</span>
           );
    },

     statics: {
        stripeHandler: null,
        scriptDidError: false,
    },

    // Indicates if the user has clicked on the button before the
    // the script has loaded.
    hasPendingClick: false,

    onScriptLoaded: function() {
        // Initialize the Stripe handler on the first onScriptLoaded call.
        // This handler is shared by all StripeButtons on the page.
        self=this;
        if (!StripeButton.stripeHandler) {
            StripeButton.stripeHandler = StripeCheckout.configure({
                key: 'pk_test_UdyYagDzXBqW9HlEFhjRdFF8',
                image: "",
                token: function(token) {
                    self.submitPayment(token);
                }
            });
            if (this.hasPendingClick) {
                this.showStripeDialog();
            }
        }
    },
    showLoadingDialog: function() {
        // show a loading dialog
    },
    hideLoadingDialog: function() {
        // hide the loading dialog
    },
    showStripeDialog: function() {
        this.hideLoadingDialog();
        StripeButton.stripeHandler.open({
                name: 'Assignment Exchange',
                description: '60 Minutes ($30.00)',
                amount: 3000
            });
    },
    onScriptError: function() {
        this.hideLoadingDialog();
        StripeButton.scriptDidError = true;
    },

    makePayment: function() {
        if (StripeButton.scriptDidError) {
            console.log('failed to load script');
        } else if (StripeButton.stripeHandler) {
            console.log("second option");
            this.showStripeDialog();
        } else {
            console.log("third option");
            this.showLoadingDialog();
            this.hasPendingClick = true;
        }
    },

    getClasses: function(field) {
        return React.addons.classSet({
            'form-group': true,
            'has-error': !this.isValid(field)
        });
    },

    handlePaypalEmailUpdate: function(event) {
        event.preventDefault();
        var onValidate = function(error, validationErrors) {

            $('#SubmitNotification').empty();
            if (error) {
                $('#SubmitNotification').append('<div class="alert alert-success">There was a problem updating your information</div>');
            } else {
                $('#SubmitNotification').append('<div class="alert alert-success">Paypal address changed successfully.</div>');

                this.updateExchangeAccountData();
            }
        }.bind(this);
        this.validate(onValidate);
    },

  render: function() {
    var buttonStyle={
        marginLeft:'2px',
        marginRight:'2px'
    };
    return (
    <section id="ExchangeAccount" >
        <div id="SubmitNotification"></div>
           <section id="Balance" className="settings">
                    <div id="BalTable" className="form-group">
                      <label htmlFor='BalanceTable'> Account Balance</label>
                        <table id="BalanceTable" className=''> 
                            <tr>
                                <td>
                                    Minutes Accrued: 
                                </td>
                                <td className="col-right">
                                    {this.state.minutes} <i className="fa fa-clock-o"> </i>
                                </td>
                            </tr> 
                        </table>
                    </div>
                    <div className='text-center form-group'>
                      <button onClick={this.withdrawFunds} style={buttonStyle} className='btn btn-large btn-primary'>Withdraw</button>
                      <button className="btn btn-primary" style={buttonStyle} onClick={this.makePayment}>Purchase 60 Minutes</button>
                    </div>
        </section>
  
        <section id="Settings" className="settings">
            <div id="Purchase" className="text-center">
            </div>
        </section>

        <section id="Settings" className="settings">
            <form onSubmit={this.handlePaypalEmailUpdate} className='form-horizontal'>
                <div className={this.getClasses('paypal_account')}>
                  <label htmlFor='paypal_account'>Paypal Account</label>
                  <input type='paypal_account' id='paypal_account' valueLink={this.linkState('paypal_account')} onBlur={this.handleValidation('paypal_account')}  className='form-control' placeholder='Paypal Account' />
                  {this.getValidationMessages('paypal_account').map(this.renderHelpText)}
                </div>
                <div className='text-center form-group'>
                  <button type='submit' className='btn btn-large btn-primary'>Update Paypal Account</button>
                  {' '}
                </div>
            </form>
        </section>
    </section>
    )
  },
 
});

module.exports = AccountBalance;
