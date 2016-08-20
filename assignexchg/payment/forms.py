from flask_wtf import Form
from wtforms.fields import *

from wtforms.validators import DataRequired
from flask.ext.admin.form import widgets

from assignexchg.user.models import User

from wtforms.validators import ValidationError
import re

def isMMYY(form, field):
    m = re.match("\d\d\d\d")
    if m is None:
        raise ValidationError('Must be MMYY format')


class PaymentForm(Form):
    cvc = TextField('CVC')#, validators=[DataRequired()])
    card_number = TextField('Card Number')#, validators=[DataRequired()])
    expiration = TextField('Expiration')#, validators=[DataRequired(), isMMYY])
    minutes_purchased = IntegerField('Minutes Purchased')

    def __init__(self, *args, **kwargs):
        super(PaymentForm, self).__init__(*args, **kwargs)
        self.user = None

    def validate(self):
        initial_validation = super(PaymentForm, self).validate()
        if not initial_validation:
            return False

        return True


