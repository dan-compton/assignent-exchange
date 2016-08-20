var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');
var jui = require('jquery-ui');


var ChangePassword = React.createClass({
      mixins: [ValidationMixin, React.addons.LinkedStateMixin],

    validatorTypes:  {
        old_password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
        verifyPassword: Joi.any().valid(Joi.ref('password')).required().label('Password Confirmation'),
      },

      getInitialState: function() {
        return {
              old_password:"",
              password: "",
              verifyPassword: "",
              feedback: ""
        };
      },

  render: function() {
    return (
      <section className="settings"  id="ChangePassword">
        <form onSubmit={this.handleUpdatePassword} className='form-horizontal'>
          <fieldset>
            <div className={this.getClasses('old_password')}>
              <label htmlFor='old_password'>Old Password</label>
              <input type='password' id='old_password' valueLink={this.linkState('old_password')} onBlur={this.handleValidation('old_password')} className='form-control' placeholder='Old Password' />
              {this.getValidationMessages('password').map(this.renderHelpText)}
            </div>
            <div className={this.getClasses('password')}>
              <label htmlFor='password'>New Password</label>
              <input type='password' id='password' valueLink={this.linkState('password')} onBlur={this.handleValidation('password')} className='form-control' placeholder='Password' />
              {this.getValidationMessages('password').map(this.renderHelpText)}
            </div>
            <div className={this.getClasses('verifyPassword')}>
              <label htmlFor='verifyPassword'>Verify New Password</label>
              <input type='password' id='verifyPassword' valueLink={this.linkState('verifyPassword')} onBlur={this.handleValidation('verifyPassword')}  className='form-control' placeholder='Verify Password' />
              {this.getValidationMessages('verifyPassword').map(this.renderHelpText)}
            </div> 
            <div className='text-center form-group'>
              <button type='submit' className='btn btn-large btn-primary'>Change Password</button>
              {' '}
            </div>
          </fieldset>
        </form>
      </section>
    )
  },
  // update profile data
  updatePassword: function(){
   var user = {
        password: this.state.password 
    };
$.ajax({
        type: 'PATCH',
        headers: {
            Accept: "text/plain; charset=utf-8",
            "Content-Type" : "application/json; charset=utf-8"
        },
        url: '/api/users/' + $('#user_id').html(),
        data:JSON.stringify(user),
        success: function(data){
            $('#SubmitNotification').append('<div class="alert alert-success">Password Updated</div>');
        }.bind(this),
        error: function(data){
            $('#SubmitNotification').append('<div class="alert alert-failure">Password Updated</div>');
        }.bind(this)
    });
  },

  renderHelpText: function(message) {
    return (
      <span className="help-block">{message}</span>
    );
  },

  getClasses: function(field) {
    return React.addons.classSet({
      'form-group': true,
      'has-error': !this.isValid(field)
    });
  },

  handleUpdatePassword: function(event) {
    event.preventDefault();
    var onValidate = function(error, validationErrors) {
      $('#SubmitNotification').empty();
      if (error) {
        $('#SubmitNotification').append('<div class="alert alert-info">An unknown error has occurred.</div>');
      } else {

        this.updatePassword();
      }
    }.bind(this);

    this.validate(onValidate);
  }

});

module.exports = ChangePassword;



