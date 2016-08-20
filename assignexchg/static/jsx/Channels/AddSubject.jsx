var React = require('react/addons');
var reactbootstrap = require('react-bootstrap');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');
var jui = require('jquery-ui');
var moment = require('moment');
var DateTimeField = require('react-bootstrap-datetimepicker');
var MarkdownEditor = require('../Tools/MarkdownEditor.jsx');
var FileUpload = require('../Tools/FileUpload.jsx');
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
var Channel = React.createClass({
  /* Render an assignment with context in mind */
    getInitialState: function(){
        return {
            on: this.props.on,
            iconClass: (this.props.on ? "fa fa-check" : "fa fa-plus")
        };
    },

    toggle: function(){
        if(this.state.on)
        {
            this.unsubscribeChannel();
        }
        else
        {
            this.subscribeChannel();
        }
    },
    subscribeChannel: function(){
        var self=this;
        $.ajax({
            type: 'PATCH',
            headers: {
                Accept: "text/plain; charset=utf-8",
                "Content-Type" : "application/json; charset=utf-8"
            },

            url: '/api/room/'+self.props.data.id,
            data:JSON.stringify({"members":{"add":{"id":$('#user_id').html()}}}),
            success: function(data){
                console.log("subscribed to channel"); 
                self.setState({on:true, iconClass:"fa fa-check"});
            },
        });

    },

    unsubscribeChannel: function(){
        var self=this;
        $.ajax({
            type: 'PATCH',
            headers: {
                Accept: "text/plain; charset=utf-8",
                "Content-Type" : "application/json; charset=utf-8"
            },

            url: '/api/room/'+self.props.data.id,
            data:JSON.stringify({"members":{"remove":[{"id":2}]}}),
            success: function(data){
                self.setState({on:false, iconClass:"fa fa-plus"});
            },
        });

    },


    
    render: function(){
            return (<tr onClick={this.toggle}>
                        <td className="col-left">
                            <a href={"#!/messages/" + this.props.data.id}># {this.props.data.title}</a>
                        </td>
                        <td className="col-right">
                            <div className="channel-toggle">
                               <i className={this.state.iconClass} />
                            </div>
                        </td>
                    </tr>
                );
    }
});

var AddSubject = React.createClass({
    displayName: 'Add a Subjects',
    mixins: [ValidationMixin, React.addons.LinkedStateMixin],

    getInitialState: function() {
        return {
            description:null,
            title:null,
            minutes:null,
            created_by:$("#user_id").html(),
            creation_date:moment(),
            due_date:moment().add(1, 'd'),
            subject_id: this.props.subject_id,
            showModal:this.props.showModal,
        };
    },

    validatorTypes:  {
    },
    componentWillReceiveProps:function(nextProps)
    {
        this.setState({showModal:nextProps.showModal});
    },

    componentWillMount: function(){
    }, 

    componentDidMount: function(){
                        
    },

    close: function(){
        this.setState({ showModal: false });
        this.props.callback();
    },

    open: function(){
        this.setState({ showModal: true });
    },

    render: function() {
        var rows = [];
        
        var x = this.props.subscribedRooms.map(function(channel){
           var channel = rows.push(<Channel data={channel} key={channel.id} on={true}/>);
        });

        var y = this.props.unsubscribedRooms.map(function(channel){
           var channel = rows.push(<Channel data={channel} key={channel.id} on={false}/>);
        });

        return (
            <div className='static-modal'>
                <Modal show={this.state.showModal} onHide={this.close}>

                  <Modal.Header closeButton>
                    <Modal.Title>Add a Subject</Modal.Title>
                  </Modal.Header>

                      <Modal.Body>
                            <section className="settings"  id="AddSubject">
                            <table>
                                {rows}
                            </table> 
                            </section>
                      </Modal.Body>
                </Modal>
              </div>
          )
    },
});

module.exports = AddSubject;
