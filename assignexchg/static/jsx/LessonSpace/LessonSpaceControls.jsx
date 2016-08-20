/*
    Displays an individual assignment as a row of a table
*/                 
var React = require('react');
var marked = require('marked');
var moment = require('moment');

// Test syntax highlighting
marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});
 
var LessonSpaceControls = React.createClass({
        getInitialState: function(){
                return{
                }
           },
           componentDidMount: function(){
           },

          /* Render an assignment with context in mind */
            render: function(){

                    return(
                        <li className="assignment-list-item">
                            <div className="assignment-top-heading">
                              <div className="assignment-value-minutes">
                                   New LessonSpaceControls  
                               </div>
                               <div className="assignment-value-minutes">
                                    <i className="ion-android-time"/> = {this.props.assignment.minutes} minutes
                               </div>
                               
                                <div className="assignment-title">
                                    {this.props.assignment.title}                                 
                                </div>

                                <div className="controls">
                                    <div className="assignment-control-chat btn">
                                        <a href={"/users/#!/assignments/"+this.props.assignment.id}> discuss <i className="ion-ios-chatboxes-outline"/></a> 
                                    </div>
                                   <div className="assignment-control-dropdown">
                                       <i onClick={this.toggleLessonSpaceControlsBody} className={this.state.arrowClass}/> 
                                    </div>
                                </div>
                               
                             </div>
                             <div className="media message assignment">
                                <div className="media-left message-profileimage">
                                </div> 
                                
                                <div className="media-body message-body" id={this.props.assignment.id+"_body"}>
                                        <h4 className="media-heading message-header">

                                                <div className="assignment-datetime">
                                                    created on {moment(this.props.assignment.created).format('MMMM Do YYYY, h:mm:ss a')}
                                                </div>     
                                        </h4>
                                    <div className="well">
                                         <div dangerouslySetInnerHTML={markdown}/>
                                    </div>
                               </div>
                            </div>
                        </li>
                    );
                }
            }
});

module.exports = LessonSpaceControls; 
