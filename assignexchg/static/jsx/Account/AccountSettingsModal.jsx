var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');
var jui = require('jquery-ui');
var ChangePassword = require('./ChangePassword.jsx');
var ChangeProfileImage = require('./ChangeProfileImage.jsx');
var Modal = require('react-bootstrap/lib/Modal');
require('react-bootstrap/lib/ModalHeader');
require('react-bootstrap/lib/ModalBody');
require('react-bootstrap/lib/ModalTrigger');
require('react-bootstrap/lib/ModalFooter');



var AccountSettingsModal = React.createClass({
  mixins: [ValidationMixin, React.addons.LinkedStateMixin],

  validatorTypes:  {
    email: Joi.string().email().label('Email Address')
  },

  getInitialState: function() {
    return {
          user: null,
          feedback: null,
          showModal:this.props.showModal
    };
  },

    componentWillMount: function(){
        this.loadUserData();
    }, 

    componentWillReceiveProps:function(nextProps)
    {
        this.setState({showModal:nextProps.showModal});
    },

    open: function(){
        this.setState({ showModal: true });
    },

    close: function(){
        this.setState({ showModal: false });
    },

  handleLoadUserData: function(data){
        console.log(data.email);
        console.log(data.profile_image);
        this.setState({user:data});
  }, 

  loadUserData: function(){
        $.getJSON('/api/users/' + $('#user_id').html(), this.handleLoadUserData);
  },

  // update profile data
  updateEmail: function(){
      var user = {
            email: this.state.user.email,
        };

    $.ajax({
        type: 'PATCH',
        headers: {
            Accept: "text/plain; charset=utf-8",
            "Content-Type" : "application/json; charset=utf-8"
        },

        url: '/api/users/' + this.state.user.id,
        data:JSON.stringify(user),
        success: function(data){
            $('#SubmitNotification').append('<div class="alert alert-success">Your information was updated.</div>');
        }.bind(this),
        error: function(data){
            $('#SubmitNotification').append('<div class="alert alert-failure">An unknown error has occurred</div>');
        }.bind(this),
        
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

  handleSubmitUpdateEmail: function(event) {
    event.preventDefault();
    var onValidate = function(error, validationErrors) {

      $('#SubmitNotification').empty();
      if (error) {
        $('#SubmitNotification').append('<div class="alert alert-info">An unknown error has occurred</div>');
      } else {
        this.updateEmail();
      }
    }.bind(this);
    this.validate(onValidate);
  },

  render: function() {
    return (
        <div className='static-modal'>
            <Modal show={this.state.showModal} onHide={this.close}>
                  <Modal.Header closeButton>
                    <Modal.Title>Account Information</Modal.Title>
                  </Modal.Header>
                <Modal.Body>
                    <div id="SubmitNotification"></div>
                    <div className='form-group'>
                        <h3>{this.state.feedback}</h3>
                    </div>
                    <ChangeProfileImage key={"profile_image"}/>
                    <ChangePassword /> 
                    <section className="settings"> 
                        <form className="form-horizontal" >
                            <div className={this.getClasses('email')}>
                              <label htmlFor='email'>Email</label>
                              <input type='email' id='email' valueLink={this.linkState('email')} onBlur={this.handleValidation('email')}  className='form-control' placeholder='Email' />
                              {this.getValidationMessages('email').map(this.renderHelpText)}
                            </div>
                        <div className='text-center form-group'>
                          <button onClick={this.handleSubmitUpdateEmail}  className='btn btn-large btn-primary' id="btn-update-email">Update Email</button>
                          {' '}
                        </div>
                        </form>
                    </section>
            </Modal.Body>
        </Modal>
       </div>
    )
  }
});

module.exports = AccountSettingsModal;
