var React = require('react/addons');
var Keen = require('keen-js');
var LineChart = require("react-chartjs").Line;
var moment = require('moment');

var DataWidget = React.createClass({

    getInitialState: function(){
        return{
            user:null,
            messages:null,
            client: new Keen({
              projectId: "",
              readKey:""
            }),
        }
 
    },

    // load the users that are subscribed to the room
    handleLoadUser: function(data){
        this.setState({user:data});
    },

    // load rooms we aren't subbed to
    loadUser: function(id){
        $.getJSON("/api/users/" + $('#user_id').text(), this.handleLoadUser);
    },

    drawRoomJoinFrequencyChart: function(){
        self=this;
        Keen.ready(function(){
          var query = new Keen.Query("sum", {
                  eventCollection: "join_room",
                  filters: [{"operator":"eq","property_name":"user_id","property_value":$("#user_id").text()}],
                  groupBy: "room_name",
                  interval: "daily",
                  targetProperty: "room_id",
                  timeframe: "this_14_days",
            });
            
            self.state.client.draw(query, document.getElementById("room-frequency"), {
                title: "Rooms Frequented",
                chartType: "columnchart"
           });
         });

    },

    drawMessageDistributionChart: function(){
        self=this;
        Keen.ready(function(){
          // Messages by subject
          var query = new Keen.Query("count", {
                eventCollection: "messages",
                filters: [{"operator":"eq","property_name":"user_id","property_value":$("#user_id").text()}],
                groupBy: "room_name",
                timeframe: "this_14_days",
                timezone: "UTC"
            });

            var piechart = self.state.client.draw(query, document.getElementById("messages-by-subject-pie"), {
                title: "messages sent by subject",
                charttype: "piechart"
              });
          });
    },

    drawMessageActivityChart: function(){
            self = this;
             var query = new Keen.Query("count_unique", {
            eventCollection: "messages",
            filters: [{"operator":"eq","property_name":"user_id","property_value":$("#user_id").text()}],
            groupBy: "room_name",
            interval: "daily",
            targetProperty: "keen.timestamp",
            timeframe: "this_1_months",
            timezone: "UTC"
          });
          
          self.state.client.draw(query, document.getElementById("messages-activity-line"), {
                title: "Messaging Activity by Room",
                chartType: "linechart"
          });    
    },

    drawMyMessagesLikedByRoomChart: function(){
            var self=this;
          var query = new Keen.Query("count_unique", {
              eventCollection: "heart",
              filters: [{"operator":"eq","property_name":"liked_by_id","property_value":$("#user_id").text()}],
              groupBy: "room_name",
              targetProperty: "message_id",
              timeframe: "this_1_year",

            });

            var piechart = self.state.client.draw(query, document.getElementById("messages-liked-by-room-pie"), {
                title: "Messages Others Liked By Room",
                chartType: "piechart"
              });
    },
    
    componentDidMount: function(){
        this.loadUser();
        this.drawMessageActivityChart();
        this.drawMessageDistributionChart();
        this.drawRoomJoinFrequencyChart();
        this.drawMyMessagesLikedByRoomChart()
    },

    render: function(){
        return (
                <div>
                    <div className="chart-container">
                        <div className="chart" id="messages-by-subject-pie"></div>
                    </div>
                    <div className="chart-container">
                        <div className="chart" id="messages-activity-line"></div>
                    </div>
                    <div className="chart-container">
                        <div className="chart" id="room-frequency"></div>
                    </div>
                    <div className="chart-container">
                        <div className="chart" id="messages-liked-by-room-pie"></div>
                    </div>
                </div>
            );
    }

});

module.exports = DataWidget;
