# -*- coding: utf-8 -*-
from flask import (Blueprint, render_template, request, url_for, redirect)
from flask.ext.login import login_required, current_user

from assignexchg.landing.models import LaunchNotification
from assignexchg.landing.forms import LaunchNotificationForm
from assignexchg.database import db

blueprint = Blueprint('notify', __name__, static_folder="../static", url_prefix="/landing/")

@blueprint.route("/notify/", methods=['GET', 'POST'])
def notify():
    form = LaunchNotificationForm(request.form, csrf_enabled=False)
    if form.validate_on_submit():
        emails = [x for x in LaunchNotification.query.filter_by(email=form.email.data)]
        print emails
        if len(emails) == 0:
                email = LaunchNotification.create(email=form.email.data)
                flash("Thank you for checking us out.  We'll let you know when we're ready.", 'success')
        else:
            flash("We've already got you in our system.  We'll let you know when we're ready.", 'success')
        return redirect(url_for('public.home'))
    else:
        flash_errors(form)
    return render_template('public/landing.html', form=form)
