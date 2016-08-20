var React = require('react');
var Routes = require('./Routes.jsx');
var ChannelsWidget = require('./ChannelsWidget.jsx');
var UserListWidget = require('./UserListWidget.jsx');
var AssignmentsWidget = require('./AssignmentsWidget.jsx');
var AccountWidget = require('./AccountWidget.jsx');

$(document).ready(function(){
    
    React.render(
            <Routes />, 
                document.getElementById('content-widgets')
    );
    // Render Channel Sidebar Widget
    React.render(
            <ChannelsWidget />,
            document.getElementById('tutor-channels')
    );

    // Render User List Sidebar Widget
    /*
    React.render(
            <UserListWidget />,
            document.getElementById('user-list')
    );
    */

    // Render Channel Sidebar Widget
    React.render(
            <AssignmentsWidget />,
            document.getElementById('assignment-channels')
    );

    // Render Channel Sidebar Widget
    React.render(
            <AccountWidget />,
            document.getElementById('account')
    );
    
});
