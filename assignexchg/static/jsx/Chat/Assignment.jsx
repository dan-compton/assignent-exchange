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

var Assignment = React.createClass({
    getInitialState: function(){
        return{
            arrowClass: "ion-ios-arrow-down"

        }
    },

    initFirepad: function(){
        var firepadRef =  new Firebase('https://radiant-fire-5723.firebaseio.com/');

        var codeMirror = CodeMirror(document.getElementById('firepad'), {
            lineNumbers: true,
            mode: 'javascript'
        });

        //// Create Firepad.
        var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
            defaultText: '// JavaScript Editing with Firepad!\nfunction go() {\n  var message = "Hello, world.";\n  console.log(message);\n}'
        });

    },

    componentWillUnmount: function(){
    },


    componentWillMount: function(){
    },

    componentDidMount: function(){
        $("#"+this.props.assignment.id+"_body").slideUp();   
        $("#firepad").hide();

    },

    handleShowFirepad: function(){
        if($("#firepad").css('display') != 'none'){
            $("#firepad").slideUp();
            newHeight = $(window).height()-50;
            $("#content-widgets").attr('style', "height: " + newHeight + "px !important;");
            $("#channel_" +this.props.assignment.id).attr('style', "height: calc(100vh - 150px) !important;");
        }
        else
        {
            $("#firepad").slideDown();
            $("#channel_" +this.props.assignment.id).attr('style', "height: calc(100vh - 450px) !important;");
        }
        console.log("reset height");
    },


    toggleAssignmentBody: function(){
        //reverse the arrow class                
        var arrowClass = $("#"+this.props.assignment.id + "_body").is(":visible") ? "ion-ios-arrow-down" : "ion-ios-arrow-up"; 
        $("#"+this.props.assignment.id +"_body").slideToggle();   
        this.setState({arrowClass:arrowClass});
    },

    /* Render an assignment with context in mind */
    render: function(){

        var markdown = {__html: marked(this.props.assignment.description, sanitize=true).toString()};

        if(this.props.renderContext == "asLesson")
        {
            return(
                <li className="assignment-list-item">
                    <div className="assignment-top-heading">
                        <div className="assignment-value-minutes">
                            <i className="ion-android-time" /> = {this.props.assignment.minutes} minutes
                        </div>

                        <div className="assignment-title">
                            {this.props.assignment.title}
                        </div>

                        <div className="controls">

                            <div onClick={this.handleShowFirepad} className="assignment-control-chat btn">
                                code editor <i className="ion-code-working" />
                            </div>

                            <div className="assignment-control-chat btn">
                                claim <i className="ion-ios-unlocked-outline" />
                            </div>

                            <div className="assignment-control-dropdown">
                                <i onClick={this.toggleAssignmentBody} className={this.state.arrowClass}/>
                            </div>
                        </div>

                    </div>
                    <div className="media message assignment">
                        <div className="media-left message-profileimage">
                        </div>

                        <div className="media-body message-body" id={this.props.assignment.id+ "_body"}>
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
                                )
        }

        else
        {
            return(
                <li className="assignment-list-item">
                    <div className="assignment-top-heading">
                        <div className="assignment-value-minutes">
                            New Assignment
                        </div>
                        <div className="assignment-value-minutes">
                            <i className="ion-android-time" /> = {this.props.assignment.minutes} minutes
                        </div>

                        <div className="assignment-title">
                            {this.props.assignment.title}
                        </div>

                        <div className="controls">
                            <div className="assignment-control-chat btn">
                                <a href={ "/users/#!/assignments/"+this.props.assignment.id}> discuss <i className="ion-ios-chatboxes-outline"/></a>
                            </div>
                            <div className="assignment-control-dropdown">
                                <i onClick={this.toggleAssignmentBody} className={this.state.arrowClass}/>
                            </div>
                        </div>

                    </div>
                    <div className="media message assignment assignment-hidden">
                        <div className="media-body message-body" id={this.props.assignment.id+ "_body"}>
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

module.exports = Assignment; 
