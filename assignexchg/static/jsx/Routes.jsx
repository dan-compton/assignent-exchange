
var React = require('react'), RouterMixin = require('react-mini-router').RouterMixin;
var ChatWidget = require('./ChatWidget.jsx');
var LessonSpaceWidget = require('./LessonSpaceWidget.jsx');
var FourOhFour = require('./FourOhFour.jsx');
var DataWidget = require('./DataWidget.jsx');


var Routes = React.createClass({
    mixins: [RouterMixin],
    
   routes: {
        '/': 'home',
        '/messages/:id/:message_id': 'messages',
        '/assignments/:id': 'assignments',
    },

    home: function() {
        $(".navbar-page-info").html('<div class="page-title">Assignment Exchange'+'</div> <div class="page-description">tutor dashboard'  + '</div>');
        return <DataWidget />;
        $('#firepad').hide();
    },

    setRoomTitle: function(data){
        var titlelim = 30;
        var descrlim = 60;
        var title = (data.title.length > titlelim ? data.title.slice(1,titlelim) + "..." : data.title);
        var description = (data.description.length > descrlim ? data.description.slice(1, descrlim) + "..." : data.description);
        $(".navbar-page-info").html('<div class="page-title">#' + title + '</div> <div class="page-description">' + description + '</div>');
    },

    messages: function(id, message_id) {
        $('#firepad').hide();
        return <ChatWidget key={id} channel={id} focus_message_id={message_id}/>;
    },


    assignments: function(id) {
        $('#firepad').hide();
        return <LessonSpaceWidget key={id} channel={id} />;
    },

    notFound: function(path) {
        $('#firepad').hide();
        return <FourOhFour />;
    },

    render: function() {
        return (
            this.renderCurrentRoute()
        );
    }
});
 
module.exports = Routes;
