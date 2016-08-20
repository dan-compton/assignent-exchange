/*
    Displays an individual channel as a row of a table
*/                 
var React = require('react');
var moment = require('moment');
var jqueryui = require('jquery-ui');

var ChatHeader = React.createClass({
        getInitialState: function(){
                return{
                    arrowClass: "ion-ios-arrow-down",
                    channel:null,
                    channel_name:""
                }
           },
                
            updateUserList: function(data){

            },

            handleGetChannel: function(data){
                this.setState({channel:data, channel_name:data.description});    
            },
             
            getChannel: function(){
                $.getJSON("/api/room/" + this.props.channel, this.handleGetChannel);
            },

        /*
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
        */

                componentWillMount:function(){
                this.getChannel();
            },
 
           componentDidMount: function(){
             $(function() {
                //$( "#onlineUsersDropdown" ).menu();
              });
           },

            toggleUserList: function(){
                //reverse the arrow class                
                var arrowClass = $("#"+this.props.channel + "_body").is(":visible") ? "ion-ios-arrow-down" : "ion-ios-arrow-up"; 

               $("#"+this.props.channel.id +"_body").slideToggle();   
               this.setState({arrowClass:arrowClass});
            },

          /* Render an channel with context in mind */
            render: function()
            {
                    return(
                            <div className="channel-top-heading">
                                <div className="channel-title">
                                    {this.state.channel_name}                      
                                </div>
                                
                                <div className="controls">
                                </div>
                            </div>
                    )
                }

});

module.exports = ChatHeader; 
