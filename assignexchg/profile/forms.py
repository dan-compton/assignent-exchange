from flask_wtf import Form

from wtforms.fields import *
from wtforms import TextField, PasswordField, IntegerField, TextAreaField, DateTimeField
from wtforms.validators import DataRequired, Email, EqualTo, Length, NumberRange
from wtforms.widgets import HTMLString, html_params, TextArea
from flask.ext.admin.form import widgets

from assignexchg.user.models import User

