var React = require('react/addons');
var moment = require('moment');
var marked = require('marked');

// Test syntax highlighting
marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});
 
/*
    Represents a Message sent in a chatroom
    

*/
var Message = React.createClass({
        getInitialState: function(){
            return {
                liked:false,
                iconClass:"fa fa-heart-o",
                flairClass:"fa fa-education-cap"
            }
        },

        componentWillMount: function(){
            var self=this;
            
            // Set liked icon
            if(this.props.liked)
                this.setState({liked:true, iconClass:"fa fa-heart"});
            else
                this.setState({liked:false, iconClass:"fa fa-heart-o"});

            // Set flair icon
            if(this.props.message.users.account_type == "student")
                this.setState({flairClass: "fa fa-child"});
            else if(this.props.message.users.account_type == "tutor")
                this.setState({flairClass: "fa fa-graduation-cap"});
            else if(this.props.message.users.account_type == "admin")
                this.setState({flairClass: "fa fa-exclamation"});
            
        },  

        componentDidMount: function(){
        },

        handleLikeClicked: function(){
            if(this.state.liked)
            {
                this.unHeartMessage()
            }
            else
            {
                this.heartMessage(1)
            }
        },

        unHeartMessage: function(){
            var self=this;
            $.ajax({
                type: 'POST',
                headers: {
                    Accept: "text/plain; charset=utf-8",
                    "Content-Type" : "application/json; charset=utf-8"
                },

                url: '/messages/unlike/' + self.props.message.id,
                data:JSON.stringify(profile),

                success: function(data){
                    self.setState({liked:false, iconClass:"fa fa-heart-o"});
                }.bind(this)
            });
        },

        heartMessage: function(){
            var self=this;
            $.ajax({
                type: 'POST',
                headers: {
                    Accept: "text/plain; charset=utf-8",
                    "Content-Type" : "application/json; charset=utf-8"
                },

                url: '/messages/like/' + self.props.message.id,
                data:JSON.stringify(profile),

                success: function(data){
                    self.setState({liked:true, iconClass:"fa fa-heart"});
                }.bind(this)
            });
        },

        /*
            Renders somewhat like message on slack
        */
        render:function(){
            var heart = {
                cursor:'pointer',
            }; 
            var link = {
                color:'#333'
            }
            var time = {
                color:'#ccc',
                fontSize:'10px'
            }; 
             var username= {
                float:'left',
                color:'#333',
                fontSize:'10px',
                marginRight:'3px'
            }; 
            var profileimage={
                paddingTop:'10px'
            };
            var markdown = {__html: marked(this.props.message.body, sanitize=true).toString()};

            // New like, avoid reload
            var like_addend = (this.props.liked == false && this.state.liked == true) ? 1 : 0;
            var total_likes = this.props.message.likes.length + like_addend
            var like_text = (total_likes == 1 ) ? "(1 heart)" : "(" + (total_likes - (this.state.liked ? 1 : 0)) + " hearts)";
            var like_text = (total_likes == 0) ? "" : like_text;
                
            return(
                <li>
                 <div id={"message_"+this.props.message.id} className={"media " + this.props.message.users.account_type+"-message"}>
                    <div className="media-left message-profileimage" style={profileimage}>
                        <img src={this.props.message.users.profile_image}/>
                    </div> 
                    <div className="media-body message-body">
                        <div className="media-heading message-header">
                            <div className="flair"><i className={this.state.flairClass}></i></div>
                            <div style={username}>{this.props.message.users.username}</div>
                            <div style={time}>
                              {'on ' + moment(this.props.message.created).format('MMMM Do YYYY, h:mm:ss a')}
                            </div>
                        </div>
                        <blockquote>
                            <div dangerouslySetInnerHTML={markdown}/>
                        </blockquote>
                    </div>

                    <div className="message-footer">
                      <a href={"/users/#!/messages/"+this.props.message.room_id+"/"+this.props.message.id}><i className="fa fa-link" style={link}></i></a>
                      <i className={this.state.iconClass} style={heart} onClick={this.handleLikeClicked}> {like_text}</i>
                    </div>

                   </div>
                </li>
                )
        }
});
module.exports = Message;
