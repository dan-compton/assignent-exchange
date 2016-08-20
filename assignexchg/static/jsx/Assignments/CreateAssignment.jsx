var React = require('react/addons');
var reactbootstrap = require('react-bootstrap');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');
var jui = require('jquery-ui');
var moment = require('moment');
var DateTimeField = require('react-bootstrap-datetimepicker');
var Modal = require('react-bootstrap/lib/Modal');


require('react-bootstrap/lib/ModalHeader');
require('react-bootstrap/lib/ModalBody');
require('react-bootstrap/lib/ModalTrigger');
require('react-bootstrap/lib/ModalFooter');

/*  An Assignment Has... 
 *
 *       title **
 * description String(1024) **
 * minutes
 * files
 * solution
 * created_by
 * creation_date
 * due_date
 *
 */

var CreateAssignment = React.createClass({
    displayName: 'Create Assignment',
    mixins: [ValidationMixin, React.addons.LinkedStateMixin],

    validatorTypes:  {
        description: Joi.string().allow(null).label('Description'),
        title: Joi.string().max(140).label('Title'),
        minutes: Joi.number().integer()
    },


    getInitialState: function() {
        return {
            description:null,
            title:null,
            minutes:null,
            created_by:$("#user_id").html(),
            creation_date:moment(),
            due_date:moment().add(1, 'd'),
            subject_id: this.props.subject_id,
            room_id: 1,
            showModal:this.props.showModal,
            rooms: [],
        };


    },

    componentWillReceiveProps:function(nextProps)
    {
        this.setState({showModal:nextProps.showModal});
    },

    componentWillMount: function(){
        this.loadRooms();
    }, 

    componentDidMount: function(){
                        
    },

    // Store the state of subjects we aren't subscribed to 
    handleRoomsLoad: function(data){
        console.log(data);
        var self = this;
        this.setState({rooms:data});
        $.each(data.objects, function(k,v){
            $('#SubjectsDropdown').append('<li id='+v.id+'>' + v.description + '</li>');
        });

        $('#SubjectsDropdown li').click(function(){
            $('#SubjectsDropdownLabel').html($(this).text());
            self.setState({ room_id: $(this).attr('id') });
        });
    },


    // load all possible channels
    loadRooms: function(){
        $.getJSON("/api/subjects", this.handleRoomsLoad);
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
                    <Modal.Title>Add an Assignment</Modal.Title>
                  </Modal.Header>

                      <Modal.Body>
                            <section className="settings"  id="SubmitAssignment">
                                <form onSubmit={this.handleSubmit} className='form-horizontal'>
                                    <fieldset>
                                        <div className={this.getClasses('title')}>
                                            <label htmlFor='title'>Title</label>
                                            <input type='text' id='title' valueLink={this.linkState('title')} onBlur={this.handleValidation('title')} className='form-control' placeholder='Title' />
                                            {this.getValidationMessages('title').map(this.renderHelpText)}`
                                        </div>
                                   
                                        <div className={this.getClasses('minutes')}>
                                            <label htmlFor='minutes'>Minutes</label>
                                            <input type='text' id='minutes' valueLink={this.linkState('minutes')} onBlur={this.handleValidation('Minutes')} className='form-control' placeholder='Minutes' />
                                            {this.getValidationMessages('Minutes').map(this.renderHelpText)}
                                        </div>

                                        <label htmlFor='subject'></label>

                                        <div id="subject" className="dropdown">
                                            <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><span id="SubjectsDropdownLabel">Subjects</span>
                                              <span className="caret"></span></button>
                                              <ul className="dropdown-menu" id="SubjectsDropdown">
                                              </ul>
                                        </div>

                                        <label htmlFor='due_date'>Due Date</label>
                                        <div id="due_date">
                                            <DateTimeField />
                                        </div>

                                        <div className={this.getClasses('description')}>
                                            <label htmlFor='description'>Description</label>
                                            <textarea rows={12} id='description' valueLink={this.linkState('description')} onBlur={this.handleValidation('Description')} className='form-control' placeholder='Assignment Description' />
                                            {this.getValidationMessages('Description').map(this.renderHelpText)}
                                        </div>
                                        
                                <div className='form-group'>
                                    <h3>{this.state.feedback}</h3>
                                </div>
                                <div className='text-center form-group submit-group'>
                                    <button type='submit' className='btn btn-large btn-primary'>Submit Assignment</button>
                                    {' '}
                                </div>
                            </fieldset>
                        </form>
                        </section>
                  </Modal.Body>
                </Modal>
              </div>
          )
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

    submitAssignment: function(){
        var assignment = {
            description:this.state.description,
            title:this.state.title,
            minutes:this.state.minutes,
            created_by:$("#user_id").html(),
            created:moment(),
            due_date:$("#due_date .date input").val(),
            subject_id: this.state.room_id
        };

        $.ajax({
            type: 'POST',
            headers: {
                Accept: "text/plain; charset=utf-8",
                "Content-Type" : "application/json; charset=utf-8"
            },

            url: '/api/assignments',
            data:JSON.stringify(assignment),
            success: function(data){
                // kill modal
            }.bind(this),
            error: function(data){
                console.log(data);
            }
        });
        this.close();
    },
    handleSubmit: function(event) {
        event.preventDefault();
        var onValidate = function(error, validationErrors) {
            $('#SubmitNotification').empty();
            if (error) {
                $('#SubmitNotification').append('<div class="alert alert-success">There was a problem updating your assignment</div>');
            } else {
                this.submitAssignment();
                $('#SubmitNotification').append('<div class="alert alert-success">Your assignment was submitted.</div>');

            }
        }.bind(this);
        this.validate(onValidate);
    }


});

module.exports = CreateAssignment;
