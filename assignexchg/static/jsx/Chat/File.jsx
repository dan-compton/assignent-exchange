
var React = require('react/addons');
var moment = require('moment');
var marked = require('marked');
/*
    Represents a File sent in a chatroom
    

*/
var File = React.createClass({
        getInitialState: function(){
            return {
                file_id:"file_" + this.props.file.id,

                flairClass:"fa fa-education-cap"
            }
        },

        componentWillMount: function(){
            // Set flair icon
            if(this.props.file.users.account_type == "student")
                this.setState({flairClass: "fa fa-child"});
            else if(this.props.file.users.account_type == "tutor")
                this.setState({flairClass: "fa fa-graduation-cap"});
            else if(this.props.file.users.account_type == "admin")
                this.setState({flairClass: "fa fa-exclamation"});

        },  

        componentDidMount: function(){
        },

        escapeMarkdown: function(str){
           var str=str.replace(/\)/g, "");
           var str=str.replace(/\(/g, "");
           return str; 
        },

        getmarkdown: function(){

            var filename = this.escapeMarkdown(this.props.file.filename);
            var extension = this.props.file.extension.substr(this.props.file.extension.lastIndexOf('.')+1);
            var url = this.props.file.url;
            var markdown = "[Uploaded File](" + this.props.file.url + ")";

            // 
            switch(extension){
                case 'png':
                case 'jpg':
                case 'svg':
                case 'gif':
                    markdown = "[![Uploaded Image](" + url + ")](" + url + ")";
                    break;
                case 'aac':
                case 'ai':
                case 'aiff':
                case 'avi':
                case 'c':
                case 'cpp':
                case 'css':
                case 'dat':
                case 'dmg':
                case 'doc':
                case 'exe':
                case 'flv':
                case 'gif':
                case 'h':
                case 'hpp':
                case 'html':
                case 'ics':
                case 'java':
                case 'jpg':
                case 'key':
                case 'mid':
                case 'mp3':
                case 'mp4':
                case 'mpg':
                case 'pdf':
                case 'php':
                case 'png':
                case 'ppt':
                case 'psd':
                case 'py':
                case 'qt':
                case 'rar':
                case 'rb':
                case 'rtf':
                case 'sql':
                case 'tiff':
                case 'txt':
                case 'wav':
                case 'xls':
                case 'xml':
                case 'yml':
                case 'zip':
                    markdown='![fileicon](https://s3-us-west-2.amazonaws.com/assignment-exchange/icons/'+ extension + '.png)[' + filename + ']('+ url + ')'; 
                    break;

                default:
                    markdown='![fileicon](https://s3-us-west-2.amazonaws.com/assignment-exchange/icons/_blank.png)[' + filename + ']('+ url + ')'; 
                    break;

            }
            return markdown;                    
        },

        /*
            Renders somewhat like file on slack
        */
        componentDidMount: function(){
                var self = this;
                $(document).ready(function(){
                    $('#'+self.state.file_id).find('img').load(function() {
                        var item = $('#'+self.state.file_id).find('img');
                        var img_height = $(item).height();
                        var img_width = $(item).width();
                        var div_height = $(item).parent().parent().height();
                        var div_width = $(item).parent().parent().width();
                        $(item).parent().css({'height': img_height });

                        if(img_width > div_width){
                            $(item).css({'width': div_width, 'height': 'auto' });
                            var img_height = $(item).height();
                            var div_height = $(item).parent().parent().height();
                            $(item).parent().parent().css({'height': img_height });
                        }
                    
                    }).error(function(){
                        src = $(this).attr("src");
                        $(this).removeAttr('src').delay(800).attr("src", src);
                    });
            });

        },
        render:function(){
            var time = {
                color:'#ccc',
                fontSize:'10px'
            }; 
             var username= {
                float:'left',
                color:'#333',
                fontSize:'10px'
            }; 
            var profileimage={
                paddingTop:'10px'
            };

            var markdown = {__html: marked(this.getmarkdown(), sanitize=true).toString()};

            return(
                <li>
                 <div className="media message">
                    <div className="media-left message-profileimage" style={profileimage}>
                        <img src={this.props.file.users.profile_image}/>
                    </div> 
                    <div className="media-body message-body" >
                        <div className="media-heading message-header">

                            <div className="flair"><i className={this.state.flairClass}></i></div>
                            <div style={username}>{this.props.file.users.username + ' '}</div>
 
                            <div style={time}>
                             @ {moment(this.props.file.created).format('MMMM Do YYYY, h:mm:ss a')}
                            </div>
                        </div>

                        <blockquote id={this.state.file_id}>
                            <div dangerouslySetInnerHTML={markdown} ></div>
                        </blockquote>
                    </div>
                   </div>
                </li>
                )
        }
});
module.exports = File;
