from flask_wtf import Form

from wtforms.fields import *
from wtforms import TextField, PasswordField, IntegerField, TextAreaField, DateTimeField
from wtforms.validators import DataRequired, Email, EqualTo, Length, NumberRange
from wtforms.widgets import HTMLString, html_params, TextArea
from flask.ext.admin.form import widgets

from assignexchg.user.models import User

class LaunchNotificationForm(Form):
    email = TextField('Email',
            validators=[DataRequired(), Email(), Length(min=6, max=40)])

    def __init__(self, *args, **kwargs):
        super(LaunchNotificationForm, self).__init__(*args, **kwargs)
        self.user = None

    def validate(self):
        initial_validation = super(LaunchNotificationForm, self).validate()
        if not initial_validation:
            return False
        return True


