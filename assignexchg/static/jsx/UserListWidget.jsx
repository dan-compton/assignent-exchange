var React = require('react/addons');
var io = require('socket.io-client');
var jui = require('jquery-ui');
var marked = require('marked');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

/*
    Displays an individual assignment as a row of a table
*/                 
var Friend = React.createClass({
  /* Render an assignment with context in mind */
    getInitialState: function(){
        return {
                online: false,
                iconClass: "fa fa-dot",
            };
    },
    render: function(){
            return (<tr className="widget-link">
                        <td className="col-left">
                            <a href={"#!/conversations/" + this.props.friend.user_id}> {this.props.friend.username}</a>
                        </td>
                        <td className="col-right">
                            <div className="channel-toggle">
                               <i className={this.state.iconClass}></i> 
                            </div>
                        </td>
                        
                    </tr>
                );
    }
});


var UserList = React.createClass({
    getInitialState: function(){
        return {
            friends: [],
            modal: null, 
        };
    },

    // load the users that are subscribed to the room
    handleLoadUser: function(data){
        var friends = [];
        $.each(data.friends, function(index, value){
            console.log(value);
            friends.push(<Friend friend={value} />);
        });
        this.setState({friends:friends});
    },

    // load rooms we aren't subbed to
    loadUser: function(id){
        $.getJSON("/api/users/" + $("#user_id").text(), this.handleLoadUser);
    },

    // make ajax calls to rest to load scribed and unsubscribed rooms
    componentWillMount: function(){
        var self=this;
        this.loadUser(1);
    },  

    render: function(){
        return (
            
            <table>
                {this.state.friends}
            </table>
        ); 
    }
}); 


module.exports = UserList;
