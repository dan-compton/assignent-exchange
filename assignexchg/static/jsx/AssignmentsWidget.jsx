var React = require('react/addons');
var io = require('socket.io-client');
var jui = require('jquery-ui');
var marked = require('marked');
var CreateAssignment = require('./Assignments/CreateAssignment.jsx');

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/*
    Displays an individual assignment as a row of a table
*/                 
var assignment = React.createClass({
  /* Render an assignment with context in mind */
    getInitialState: function(){
        return {
            on: false,
            iconClass: "fa fa-trash"
            };
    },
    toggle: function(){
        if(this.state.on)
        {
            this.setState({on:false, iconClass:"fa fa-trash"});
        }
        else
        {
            this.setState({on:true, iconClass:"fa fa-plus"});
        }
    },
    render: function(){
            return (<tr className="widget-link">
                        <td className="col-left">
                            <a href={"#!/messages/" + this.props.data.id}># {this.props.data.title}</a>
                        </td>
                        <td className="col-right">
                            <div className="assignment-toggle" onClick={this.toggle}>
                               <i className={this.state.iconClass}></i> 
                            </div>
                        </td>
                        
                    </tr>
                );
    }
});

/* 
 *  Function
 *  ----------
 *  This component will provide a list of assignments,
 *  and the option to add additional assignments via
 *  a jquery-UI autocomplete form.
 *
 *  For each assignment, there will be a listing
 *  of the number of new notifications/messages.
 *
 *  assignments
 *  --------
 *  # C Programming (2 new)
 *  # Java Programming (1)
 *  # Introduction to Al...
 *  ... 
 *
 *
 */
var AssignmentsWidget = React.createClass({
    getInitialState: function(){
        return {
            assignments: [],
            modal: null
        };
    },

    // Store the state of all tutor subjects
    handleLoadAssignments: function(data){
        this.setState({assignments:data.assignments});
    },

    
    /* 
        TODO (complete the tutor version)
        this is the student version
    */
    loadAssignments: function(){
        $.getJSON("/api/users/" + $('#user_id').html() , this.handleLoadAssignments);
    },

    componentWillMount: function(){
        this.loadAssignments();
    },  

    componentDidMount: function(){
    },

    addAssignment: function(){
        this.setState({modal:<CreateAssignment showModal={true} />});
    },

    render: function(){
        var rows = [];
        var x = this.state.assignments.map(function(assignment){
           var assignment = rows.push(<assignment data={assignment} key={assignment.id} />);
        });

        return (
            
            <table>
                <tr className="widget-link">
                        <td className="col-left">
                            <a className="assignment-toggle" onClick={this.addAssignment}>
                               Add An Assignment 
                            </a>
                        </td>
                        <td className="col-right">
                            <i className="fa fa-plus"></i>
                        </td>
                        {this.state.modal}
                        
                </tr>
                {rows}
            </table>
        ); 
    }
}); 


module.exports = AssignmentsWidget;
