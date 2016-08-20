var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');
var jui = require('jquery-ui');
var AccountBalance = require('./AccountBalance.jsx');
var Modal = require('react-bootstrap/lib/Modal');
require('react-bootstrap/lib/ModalHeader');
require('react-bootstrap/lib/ModalBody');
require('react-bootstrap/lib/ModalTrigger');
require('react-bootstrap/lib/ModalFooter');



var AccountBalanceModal = React.createClass({
  mixins: [ValidationMixin, React.addons.LinkedStateMixin],

  validatorTypes:  {
    email: Joi.string().email().label('Email Address')
  },

  getInitialState: function() {
    return {
          email: null,
          profile_image: "",
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
        this.setState({
            id: data.id,
            user_id: data.user_id,
            email: data.email,
            profile_image: data.profile_image
        });
  }, 

  loadUserData: function(){
        $.getJSON('/api/users/' + $('#user_id').html(), this.handleLoadUserData);
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

  render: function() {
    return (
        <div className='static-modal'>
            <Modal show={this.state.showModal} onHide={this.close}>
                  <Modal.Header closeButton>
                    <Modal.Title>Update Account Information</Modal.Title>
                  </Modal.Header>
                <Modal.Body>
                    <AccountBalance />
                </Modal.Body>
            </Modal>
       </div>
    )
  }
});

module.exports = AccountBalanceModal;
