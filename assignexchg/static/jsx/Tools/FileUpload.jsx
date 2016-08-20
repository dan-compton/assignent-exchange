var React = require('react/addons');
var ReactS3Uploader = require('react-s3-uploader');

var FileUpload = React.createClass({

    getInitialState: function(){
        return{
            filename: ""
        };
    },

    handleFile: function(e) {
        var reader = new FileReader();
        var file = e.target.files[0];

        if (!file) return;

        this.setState({filename:file.name});

        reader.onload = function(file) {
            React.findDOMNode(this.refs.in).value = '';
        }.bind(this);

        reader.readAsDataURL(file);
    },

    render: function() {
        return (
            <div className="file-uploader">
                <div className="button">
                    <div className="fileUpload btn btn-primary">
                        <span><i className="fa fa-paperclip"></i></span>
                        <input ref="in" className="upload" type="file" accept="/*" onChange={this.handleFile} />       
                    </div>
                </div>

                <div className="filename">
                    {this.state.filename}
                </div>
            </div>
           );
    }
});


module.exports = FileUpload;



