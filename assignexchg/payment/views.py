# -*- coding: utf-8 -*-
'''Public section, including homepage and signup.'''
from flask import (Blueprint, request, render_template, flash, url_for,
                    redirect, session, jsonify)
from flask.ext.login import login_user, login_required, logout_user, current_user

from assignexchg.extensions import login_manager
from assignexchg.user.models import User
from assignexchg.assignment.models import Assignment
from assignexchg.payment.forms import PaymentForm
from assignexchg.utils import flash_errors, s3_upload
from assignexchg.database import db
from flask import current_app as app
import stripe
import json

blueprint = Blueprint('payment', __name__, static_folder="../static")

@blueprint.route('/payment/charge/', methods=['POST'])
def charge():
# Amount in cents
    if request.method == 'POST':
        amount = 3000
        minutes = 60

        if amount > 0:
            try:
                current_user.exchange_account.minutes += minutes
                db.session.commit()

                charge = stripe.Charge.create(
                    customer=customer.id,
                    amount=amount,
                    source=request.form['stripeToken'],
                    currency='usd',
                    description='AssignmentExchange, purchase of 60 minutes'
                )

            except:
                return json.dumps({'result':'failure', 'message':'error charging card'})

            return json.dumps({'result': 'success', 'message':'60 minutes has been added to your account'})
    return json.dumps({'result':'failure'})


@blueprint.route("/payment/cash-out/<tutor_id>", methods=["GET", "POST"])
@login_required
def cash_out(tutor_id):
    if current_user.account_type=="tutor" and current_user.id == int(tutor_id):

        # Do payment stuff
        prev_mins = current_user.exchange_account.minutes
        current_user.exchange_account.minutes = 0
        db.session.commit()

        message = "Your payment for " + str((prev_mins/60)*20) + "USD has been sent.  It should be received within the next 24 hours."

        return json.dumps({'result': 'success', 'message':message})
    return json.dumps({'result':'failure'})

