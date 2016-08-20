var React = require('react/addons');
var io = require('socket.io-client');
var moment = require('moment');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var FileUpload = require('./Tools/FileUpload.jsx');

var Assignment = require('./Chat/Assignment.jsx');
var Message = require('./Chat/Message.jsx');
var File = require('./Chat/File.jsx');
var ChatOptsModal = require('./Chat/ChatOptsModal.jsx');
var ChatHeader = require('./Chat/ChatHeader.jsx');

//TODO Why can't it find this as a node module?
var marked = require('marked');
require('../libs/epiceditor/epiceditor/js/epiceditor.js');


var ChatWidget = React.createClass({
    getInitialState: function(){
        return {
            epicEditor: null,
            epicEditorDefaultContent: "shift+enter to send a message",
            messages: [],
            assignments: [],
            files: [],
            combined: [],
            focus_message_id: this.props.focus_message_id,
            force_message_focus: true,
            chatOptsModal:<ChatOptsModal showModal={false} room_id={this.props.channel} />,
            page: 0, 
        }
    },

    handleLoadFiles: function(data){
        this.setState({files:data});
        this.sortMessages();
    },


    hitTop: function(){
        this.loadMessage();
    },

    loadFiles: function(){
        // TODO room id from server
       var self=this;
       $.ajax({
             url: '/api/files',
             data: 'q='+ JSON.stringify({"filters":[{"name": "room_id", "op":"eq", "val":this.props.channel}], "order_by": [{"field":"created", "direction":"desc"}]}),
             dataType: "json",
             contentType: "application/json",
             success: function(data) { 
                 self.handleLoadFiles(data.objects);
             }
       });
    },

    handleLoadMessages: function(data){
        this.setState({messages:data});
        this.loadAssignments();
    },

    loadMessages: function(){
        // TODO room id from server
       var self=this;
       $.ajax({
             url: '/api/messages',
             data: 'q='+ JSON.stringify({"filters":[{"name": "room_id", "op":"eq", "val":this.props.channel}], "order_by": [{"field":"created", "direction":"desc"}]}),
             dataType: "json",
             contentType: "application/json",
             success: function(data) { 
                 self.handleLoadMessages(data.objects);
             }
       });
    },


    handleLoadFile: function(file){
        nextMessages = this.state.combined;
        nextMessages.push(<File file={file} />);
        this.setState({combined:nextMessages});
        this.forceUpdate();
    },

    /*
        Load a single assignment upon notification
        from the server via socketio
    */
    loadFile: function(id){
       var self=this;
       var filters = {};
       $.ajax({
             url: '/api/files/' + id,
             data: {"q": JSON.stringify({"filters": filters})},
             dataType: "json",
             contentType: "application/json",

             success: function(data) { 
                 self.handleLoadFile(data);
             }
       });
    },

    handleLoadMessage: function(message){
        nextMessages = this.state.combined;
        nextMessages.push(<Message message={message} />);
        this.setState({combined:nextMessages});
        this.forceUpdate();
    },

    /*
        Load a single assignment upon notification
        from the server via socketio
    */
    loadMessage: function(id){
       var self=this;
       var filters = {};
       $.ajax({
             url: '/api/messages/' + id,
             data: {"q": JSON.stringify({"filters": filters})},
             dataType: "json",
             contentType: "application/json",

             success: function(data) { 
                 self.handleLoadMessage(data);
             }
       });
    },

    handleLoadAssignments: function(data){
        this.setState({assignments:data});
        this.loadFiles()
    },

    loadAssignments: function(){
        // TODO room id from server
       var self=this;

       $.ajax({
             url: '/api/assignments',
             data: 'q='+ JSON.stringify({"filters":[{"name": "subject_id", "op":"eq", "val":this.props.channel}], "order_by": [{"field":"created"}]}),
             dataType: "json",
             contentType: "application/json",
             success: function(data) { 
                 self.handleLoadAssignments(data.objects);
             }
       });
    },

    /*
        handles returned data from loadAssignment
    */
    handleLoadAssignment: function(assignment){
        nextAssignments = this.state.combined;
        nextAssignments.push(<Assignment assignment={assignment} renderContext={"asMessage"} key={assignment.id}/>);
        this.setState({combined:nextAssignments});
        this.forceUpdate();
    },

    /*
        Load a single assignment upon notification
        from the server via socketio
    */
    loadAssignment: function(id){
       var self=this;
       var filters = {};
       $.ajax({
             url: '/api/assignments/' + id,
             data: {"q": JSON.stringify({"filters": filters})},
             dataType: "json",
             contentType: "application/json",
             success: function(data) { 
                 self.handleLoadAssignment(data);
             }
       });
    },

    /*
        Component is about to unmount
        kill sockets
    */
    componentWillUnmount: function(){ 
        this.leaveChannel(this.props.channel);  
        this.state.socket.removeAllListeners();
    },

    componentWillReceiveProps: function(nextProps){
        if(this.state.focus_message_id != nextProps.focus_message_id)
        {
            this.setState({force_message_focus:true});
        }
    },

    shouldComponentUpdate: function(nextProps, nextState){
        if(this.state.force_message_focus == true && nextState.force_message_focus == false)
        {
            console.log("do not rerender");
            return false;
        }
        else
            return true;
    },

    componentDidUpdate: function(){
          if(this.state.force_message_focus && this.state.focus_message_id !="0")
            {
                var id = String(this.state.focus_message_id);
                if (typeof $("#message_"+id).offset() != 'undefined' ){
                    $('.chat-panel .panel-body').scrollTop(0);
                    var scrollHeight = $('.chat-panel .panel-body')[0].scrollHeight;
                    var offset = $("#message_"+id).offset();
                    var totalHeight = $('.chat-panel .panel-body')[0].scrollHeight;

                    $("#message_"+id).css('padding','20px 20px 20px 20px').css('border-radius','2px').css('background-color', 'rgba(255,208,0,0.2)');
                    $('.chat-panel .panel-body').scrollTop($('#message_' + id).offset().top);
                    this.setState({force_message_focus:false});
                }
            }
            else
            {
                $('.chat-panel .panel-body').scrollTop($('.chat-panel .panel-body')[0].scrollHeight);
            }
    },

    /*
        On Mount:
        Load Messages
        Load Assignments 
        Load Files
        Sort based on timestamp
    */
    componentWillMount: function(){
        this.loadMessages();
    },  

    /*
        Temporally sort all messages and display them in the chat widget
    */
    sortMessages: function(){
        rows = new Array();

 
        // Add all Recent Messages
        var x = this.state.messages.map(function(message){
                var users = new Array();

                message.likes.map(function(like){
                    users.push(like.id.toString());
                });

                // TODO Fix liked-iconClass association
                if(!$.inArray($('#user_id').text(), users))
                {
                    rows.push(
                        <Message message={message} timestamp={message.created} liked={true} />
                    );
                }
                else
                {
                    rows.push(
                        <Message message={message} timestamp={message.created} liked={false} />
                    );
                }
        });

        // Add all Recent Assignments
        var y = this.state.assignments.map(function(assignment){
           rows.push(
                <Assignment assignment={assignment} timestamp={assignment.created} />
            );
        });

        // Add all recent Files
        var z = this.state.files.map(function(file){
           rows.push(
                <File file={file} timestamp={file.created} />
            );
        });

        
        // Sort based on timestamp
        rows.sort(function(x,y){
            date1 = new Date(x.props.timestamp);
            date2 = new Date(y.props.timestamp);
            return date1 - date2 ;
        })

        this.setState({combined:rows}); 
    },

    initEpicEditor: function(){
        var opts = {
            container: 'epiceditor',
            textarea: null,
            basePath: '/libs/epiceditor',
            clientSideStorage: true,
            localStorageName: 'epiceditor',
            useNativeFullscreen: true,
            parser: marked,
            file: {
            name: 'epiceditor',
            defaultContent: this.state.epicEditorDefaultContent,
            autoSave: false
        },
        theme: {
            base: '/epiceditor/themes/base/epiceditor.css',
            preview: '/epiceditor/themes/preview/github.css',
            editor: '/epiceditor/themes/editor/epic-light.css'
        },
        button: {
            preview: true,
            fullscreen: true,
            bar: "auto"
        },
        focusOnLoad: false,
        shortcut: {
            modifier: 18,
            fullscreen: 70,
            preview: 80
        },
        string: {
            togglePreview: 'Toggle Preview Mode',
            toggleEdit: 'Toggle Edit Mode',
            toggleFullscreen: 'Enter Fullscreen'
        },
        autogrow: false
        }

        var editor = new EpicEditor(opts).load();
        this.initSockets(editor);
    },

    componentDidMount: function(){
        this.initEpicEditor();
   },

    leaveChannel: function(){
        this.state.socket.emit('left', {room:this.props.channel});
    },

    joinChannel: function(){
        this.state.socket.emit('joined', {room:this.props.channel});
    },

    initSockets: function(editor){
            var sock = io.connect('http://' + document.domain + ':' + location.port, {'force new connection':true})

            sock.on('connect', function(){
                //console.log('connected');
                this.joinChannel();
            }.bind(this));

            // Recieve Assignment
            // TODO Move into message object
            sock.on('assignment', function(assignment) {
                // Load assignment from REST api (/api/assignments/<id>)
                this.loadAssignment(assignment.assignment_id);
            }.bind(this));

            // Recieve Message
            sock.on('message', function(message) {
                this.loadMessage(message.message_id);
            }.bind(this));

            // Recieve File Upload
            sock.on('file', function(file) {
                //console.log('load a file');
                this.loadFile(file.file_id);
            }.bind(this));

            // Recieve Status
            sock.on('status', function(data) {
                $('#chat').append('<li><div class="chat-notification alert alert-info">' + data.msg + '</div></li>\n');
                $('.chat-panel .panel-body').scrollTop($('.chat-panel .panel-body')[0].scrollHeight);
            }.bind(this));

            var editor_element = editor.getElement('editor');

            editor_element.body.innerHTML = this.state.epicEditorDefaultContent;

            editor_element.addEventListener('click', function (e) {
                if(editor_element.body.innerHTML == this.state.epicEditorDefaultContent){
                    console.log("content is the same");
                    editor_element.body.innerHTML = "";
                }
                    
            }.bind(this));
            editor_element.addEventListener('keydown', function (e) {
                if (e.keyCode == 13 && e.shiftKey) {
                    this.state.epicEditor.save();
                    var content = this.state.epicEditor.exportFile();
                    editor_element.body.innerHTML = "";
                    sock.emit('message', {user_id: $('#user_id').html(), body: content, room: this.props.channel});
                }
            }.bind(this));

            this.setState({epicEditor:editor, socket:sock});
     },

    showChatOpts: function(){
        this.setState({chatOptsModal:<ChatOptsModal showModal={true} room_id={this.props.channels} fileUploaded={this.fileUploaded} />});
    },


    render: function(){
       return (
            <ReactCSSTransitionGroup transitionName="example" transitionAppear={true}>
               <div className="panel panel-default chat-panel" id={"channel_"+this.props.channel}>
                    <div className="panel-header" id="ChannelHeader">
                        <ChatHeader channel={this.props.channel} />
                    </div>
                    <div className="panel-body">
                        <ul className="panel-list" id="chat">
                            {this.state.combined}
                        </ul>
                    </div>
                    <div className="panel-footer chat-footer">
                        <div className="chat-input-row">
                                <div className="row divein-chat-controls">
                                    <div className="divein-chat-control" onClick={this.showChatOpts}>upload <i className="ion-paperclip"></i></div>
                                </div>

                            <div id="epiceditor">
                            </div>
                        </div>
                    </div>
                </div>
                {this.state.chatOptsModal}
            </ReactCSSTransitionGroup>
        ); 
    }
}); 


module.exports = ChatWidget;
