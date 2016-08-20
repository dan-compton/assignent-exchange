var React = require('react/addons');
var ValidationMixin = require('react-validation-mixin');
var marked = require('marked');
var jui = require('jquery-ui');
var Editor = require('react-md-editor');


var MarkdownEditor = React.createClass({
    getInitialState: function() {
        return {
            code: ""
        };
    },
    updateCode: function(newCode) {
        this.setState({
            code: newCode
        });
    },
    render: function render() {
        var preview = marked(this.state.code);
        console.log(this.props.preview_div);
        $('#'+this.props.preview_div).html(preview);

        return React.createElement(
            'div',
            { className: 'example' },
            React.createElement(
                'div',
                { className: 'hint' },
                ''
            ),
            React.createElement(
                'div',
                { className: 'editor' },
                React.createElement(Editor, { value: this.state.code, onChange: this.updateCode })
            ) 
        );
    }
  });
module.exports = MarkdownEditor;
