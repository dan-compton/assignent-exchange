var React = require('react/addons');
var reactbootstrap = require('react-bootstrap');
var ReactS3Uploader = require('react-s3-uploader');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');
var jui = require('jquery-ui');
var moment = require('moment');
var DateTimeField = require('react-bootstrap-datetimepicker');
var FileUpload = require('../Tools/FileUpload.jsx');
var Modal = require('react-bootstrap/lib/Modal');

require('react-bootstrap/lib/ModalHeader');
require('react-bootstrap/lib/ModalBody');
require('react-bootstrap/lib/ModalTrigger');
require('react-bootstrap/lib/ModalFooter');

/*  
   Show chat options like upload file etc 
 */
var ChatOptsModal = React.createClass({
    mixins: [ValidationMixin, React.addons.LinkedStateMixin],

    validatorTypes:  {
    },

    getInitialState: function() {
        return {
            showModal:this.props.showModal,
            signingUrl: "/files/sign_s3/"+this.props.room_id
        };
    },

    componentWillReceiveProps:function(nextProps)
    {
        this.setState({showModal:nextProps.showModal});
    },

    close: function(){
        this.setState({ showModal: false });
    },

    open: function(){
        this.setState({ showModal: true });
    },

    render: function() {
        return (
            <div className='static-modal'>
                <Modal show={this.state.showModal} onHide={this.close}>

                  <Modal.Header closeButton>
                    <Modal.Title>Upload File</Modal.Title>
                  </Modal.Header>
                      <Modal.Body>
                        <ReactS3Uploader
                                signingUrl={this.state.signingUrl}
                                accept="*/*"
                                onFinish={this.close}                      
                                 />
                      </Modal.Body>
                </Modal>
              </div>
          )
    },

});

module.exports = ChatOptsModal;
