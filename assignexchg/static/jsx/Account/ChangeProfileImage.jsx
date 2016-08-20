var React = require('react/addons');
var ReactS3Uploader = require('react-s3-uploader');
var ValidationMixin = require('react-validation-mixin');
var Joi = require('joi');
var jui = require('jquery-ui');


var ChangeProfileImage = React.createClass({
      mixins: [ValidationMixin, React.addons.LinkedStateMixin],

    validatorTypes:  {
      },

      getInitialState: function() {
        return {
            profile_image:""
        };
      },

  handleLoadUserData: function(data){
        this.setState({profile_image:data.profile_image});
  }, 
    
    componentWillMount: function(){
        this.loadUserData();
    }, 

  loadUserData: function(){
        $.getJSON('/api/users/' + $('#user_id').html(), this.handleLoadUserData);
  },

    componentDidMount: function(){
    },
    
  render: function() {
    return (
      <section className="profile-image-settings"  id="ChangeProfileImage">
        <form onSubmit={this.updateProfileImage} className='form-horizontal'>
            <div >
                <div className='profile-image-preview'>
                        <img src={this.state.profile_image} />
                </div>
                <div className='profile-image-uploader'>
                    <ReactS3Uploader 
                        key={"profile_uploader"}
                        signingUrl="/files/sign_s3/profile_images" 
                        accept="*/*"
                        onFinish={this.handleImageUpload}
                    /> 
                </div>
            </div>
            <div className='text-center form-group'>
              <button type='submit' className='btn btn-large btn-primary'>Change Profile Image</button>
              {' '}
            </div>
        </form>
      </section>
    )
  },

  handleImageUpload: function(signResult){
    console.log(signResult);
    this.setState({profile_image:signResult.url});
  },
    
  // update profile data
  updateProfileImage: function(signResult){
        console.log(signResult);
        var user = {
            profile_image:this.state.profile_image
        };
        $.ajax({
            type: 'PATCH',
            headers: {
                Accept: "text/plain; charset=utf-8",
                "Content-Type" : "application/json; charset=utf-8"
            },

            url: '/api/users/' + $('#user_id').html(),
            data:JSON.stringify(user),
            success: function(data){
                $('#SubmitNotification').append('<div class="alert alert-success">Profile Image Updated</div>');
            }.bind(this),
            error: function(data){
                $('#SubmitNotification').append('<div class="alert alert-failure">Could Not Update Profile Image</div>');
        }.bind(this)
    });
  },

});

module.exports = ChangeProfileImage;
