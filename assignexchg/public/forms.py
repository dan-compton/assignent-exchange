from flask_wtf import Form
from wtforms.fields import *

from wtforms.validators import DataRequired
from flask.ext.admin.form import widgets
from assignexchg.user.models import User

from wtforms import TextField, PasswordField, IntegerField, TextAreaField, DateTimeField
from wtforms.validators import DataRequired, Email, EqualTo, Length, NumberRange
from wtforms.widgets import HTMLString, html_params, TextArea
from flask.ext.admin.form import widgets

from assignexchg.user.models import User

class StudentRegistrationForm(Form):
    username = TextField('Username',
            validators=[DataRequired(), Length(min=3, max=25)])
    email = TextField('Email',
            validators=[DataRequired(), Email(), Length(min=8, max=40)])
    password = PasswordField('Password',
            validators=[DataRequired(), Length(min=8, max=40)])
    confirm = PasswordField('Verify password',
            [DataRequired(), EqualTo('password', message='Passwords must match')])

    def __init__(self, *args, **kwargs):
        super(StudentRegistrationForm, self).__init__(*args, **kwargs)
        self.user = None

    def validate(self):
        initial_validation = super(StudentRegistrationForm, self).validate()
        if not initial_validation:
            return False
        user = User.query.filter_by(username=self.username.data).first()
        if user:
            self.username.errors.append("Username already registered")
            return False
        user = User.query.filter_by(email=self.email.data).first()
        if user:
            self.email.errors.append("Email already registered")
            return False
        return True

class TutorRegistrationForm(Form):
    '''
        All tutors must be approved

        This will create an account that we can look over

        TODO: Only .edu email addresses
    '''
    username = TextField('Username',
            validators=[DataRequired(), Length(min=3, max=25)])
    email = TextField('Email',
            validators=[DataRequired(), Email(), Length(min=8, max=40)])
    password = PasswordField('Password',
            validators=[DataRequired(), Length(min=8, max=40)])
    confirm = PasswordField('Verify password',
            [DataRequired(), EqualTo('password', message='Passwords must match')])
    resume = FileField('Your Resume', validators=[])

    def __init__(self, *args, **kwargs):
        super(TutorRegistrationForm, self).__init__(*args, **kwargs)
        self.user = None

    def validate(self):
        initial_validation = super(TutorRegistrationForm, self).validate()
        if not initial_validation:
            return False
        user = User.query.filter_by(username=self.username.data).first()
        if user:
            self.username.errors.append("Username already registered")
            return False
        user = User.query.filter_by(email=self.email.data).first()
        if user:
            self.email.errors.append("Email already registered")
            return False
        return True

class LoginForm(Form):
    username = TextField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
        self.user = None

    def validate(self):
        initial_validation = super(LoginForm, self).validate()
        if not initial_validation:
            return False

        self.user = User.query.filter_by(username=self.username.data).first()
        if not self.user:
            self.username.errors.append('Unknown username')
            return False

        if not self.user.check_password(self.password.data):
            self.password.errors.append('Invalid password')
            return False

        if not self.user.active:
            self.username.errors.append('User not activated')
            return False

        return True
