var React = require('react/addons');
var io = require('socket.io-client');
var jui = require('jquery-ui');
var marked = require('marked');
var AddSubject = require('./Channels/AddSubject.jsx');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/*
    Displays an individual assignment as a row of a table
*/                 
var Channel = React.createClass({
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
                            <a href={"#!/messages/" + this.props.data.id + "/0"}># {this.props.data.title}</a>
                        </td>
                        <td className="col-right">
                            <div className="channel-toggle" onClick={this.toggle}>
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
 *  This component will provide a list of unsubscribedRooms,
 *  and the option to add additional unsubscribedRooms via
 *  a jquery-UI autocomplete form.
 *
 *  For each channel, there will be a listing
 *  of the number of new notifications/messages.
 *
 *  unsubscribedRooms
 *  --------
 *  # C Programming (2 new)
 *  # Java Programming (1)
 *  # Introduction to Al...
 *  ... 
 *
 *
 */
var Channels = React.createClass({
    getInitialState: function(){
        return {
            subscribedRooms: [],
            unsubscribedRooms: [],
            modal: null, 
        };
    },

    // Store the state of subjects we aren't subscribed to 
    handleUnsubscribedRoomsLoad: function(data){
        var unsubbedRooms = []
        var z = data.objects.map(function(room){
            var add = true;
            $.each(room.members, function(i, member){
                if(member.id == $('#user_id').html())
                    add=false;
            });
            if(add)
                unsubbedRooms.push(room);
        });
        this.setState({unsubscribedRooms:unsubbedRooms});
    },

    // Store the state of subjects we are subscribed to
    handleSubscribedRoomsLoad: function(data){
        this.setState({subscribedRooms:data.rooms});
    },

    // load rooms we aren't subbed to
    loadUnsubscribedRooms: function(){
        $.getJSON("/api/subjects", this.handleUnsubscribedRoomsLoad);
    },

    // load rooms we are subbed to
    loadSubscribedRooms: function(){
        $.getJSON("/api/users/" + $('#user_id').html(), this.handleSubscribedRoomsLoad);
    },

    // make ajax calls to rest to load scribed and unsubscribed rooms
    componentWillMount: function(){
        var self=this;
        this.loadUnsubscribedRooms();
        this.loadSubscribedRooms();
    },  

    addSubject: function(){
        this.setState({modal:<AddSubject showModal={true} subscribedRooms={this.state.subscribedRooms} unsubscribedRooms={this.state.unsubscribedRooms} callback={this.loadSubscribedRooms}/> });
    },

    render: function(){
        var rows = [];
        var x = this.state.subscribedRooms.map(function(channel){
           var channel = rows.push(<Channel data={channel} key={channel.id} />);
        });

        return (
            
            <table>
                <tr className="widget-link">
                        <td className="col-left">
                            <a className="channel-toggle" onClick={this.addSubject}>
                                Add a subject
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


module.exports = Channels;
