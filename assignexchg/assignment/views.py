# -*- coding: utf-8 -*-
'''Public section, including homepage and signup.'''
import datetime as dt
from flask import (Blueprint, request, render_template, flash, url_for,
                    redirect, session, jsonify)
from flask.ext.login import login_user, login_required, logout_user, current_user

from assignexchg.extensions import login_manager
from assignexchg.assignment.models import Assignment, Claim, Solution
from assignexchg.subject.models import Subject
from assignexchg.public.forms import LoginForm
from assignexchg.assignment.forms import AssignmentForm, SolutionForm
from assignexchg.utils import flash_errors, s3_upload
from assignexchg.subject.models import Subject
from assignexchg.database import db

blueprint = Blueprint('assignment', __name__, static_folder="../static")

@blueprint.route("/submit-assignment/", methods=['GET', 'POST'])
@login_required
def submit_assignment():
    """
        View for submitting an assignment via a WTForm
        I do not plan to move this over to ajax and restful api

    """
    form = AssignmentForm(request.form, csrf_enabled=False)
    form.subject_id.choices = [(s.id, s.title) for s in Subject.query.order_by('title')]

    if form.validate_on_submit():
        # Check To See if the student has enough minutes
        if int(current_user.minutes) >= int(form.minutes.data) and int(form.minutes.data) > 0:
            s3_filename = s3_upload(request.files['assignment_files'], '/assignments/')
            assignment = Assignment(subject_id=form.subject_id.data,created_by=current_user.id, title=form.title.data, description=form.description.data, due_date=form.due_date.data, minutes=form.minutes.data, assignment_files=s3_filename)
            current_user.assignments.append(assignment)
            current_user.minutes -= form.minutes.data
            db.session.commit()

            flash("Your assignment has been created.", 'success')
            return redirect(url_for('user.members')) #TODO
        else:
            flash_errors(form)
    else:
        flash_errors(form)

    return render_template('private/submit-assignment.html', form=form) #TODO: Should this be private?

@blueprint.route("/view-assignment/<assignment_id>", methods=['GET', 'POST'])
@login_required
def view_assignment(assignment_id):
    """
        Page which displays an assignment in the appropriate way given the user type

        #TODO consider moving this into AJAX in a future release?
    """
    assignment=Assignment.query.filter_by(id=assignment_id).first()
    form = SolutionForm(request.form, csrf_enabled=False)

    if request.method == 'POST':
        if current_user.account_type == "tutor":
            if current_user.claim == assignment.claim:
                if form.validate_on_submit():
                    # Check To See if the student has enough minutes
                        s3_filename = s3_upload(request.files['solution_files'], '/solutions/')
                        solution = Solution(description=form.description.data, solution_files=s3_filename)

                        # Save assignment solution
                        assignment.solution = solution
                        assignment.active = False

                        # submit the solution
                        current_user.solution.append(solution)
                        current_user.minutes += assignment.minutes

                        # delete the claim
                        db.session.delete(current_user.claim)
                        db.session.commit()

                        flash("Your solution has been submitted.", 'success')
                        return redirect(url_for('user.members')) #TODO
                else:
                    flash_errors(form)
    else:
        if current_user.account_type == "tutor":
            if current_user.claim != None and assignment.claim != None:
                if current_user.claim.id == assignment.claim.id:
                    return render_template('private/tutor-view-assignment.html', assignment=assignment, form=form)
            else:
                return render_template('private/tutor-view-assignment.html', assignment=assignment)
        elif current_user.id == assignment.created_by and current_user.account_type == "student":
            return render_template('private/student-view-assignment.html', assignment=assignment)
        else:
            return redirect(url_for('public.home'))
    return redirect(url_for('public.home'))

@blueprint.route("/claim-assignment/<assignment_id>", methods=['GET', 'POST'])
@login_required
def claim_assignment(assignment_id):
    """
    """
    # get expiration time for assignment claim
    assignment=Assignment.query.filter_by(id=assignment_id).first()
    if current_user.account_type=="tutor" and current_user.claim == None and assignment.claim == None:
        #Build claim

        #Calculate Claim Expiration Time
        #TODO: Determine if model needs a claim expiration time
        delta = dt.timedelta(minutes = assignment.minutes)

        t = dt.datetime.utcnow()+delta
        #expiration = (dt.datetime.combine(dt.date(1,1,1), t) + delta)

        expiration = t
        claim = Claim(claim_expiration=expiration, assignment_id=assignment_id, tutor_id=current_user.id)
        current_user.claim = claim
        assignment.claim = claim

        db.session.commit()
        flash("You have claimed this assignment.", "success")
        return view_assignment(assignment.id)

    else:
        flash("Please unclaim your currently claimed assignment before claiming another one.", "warning")
        return redirect(url_for('public.home'))

@blueprint.route("/unclaim-assignment/<assignment_id>", methods=['GET', 'POST'])
@login_required
def unclaim_assignment(assignment_id):
    """
    """
    # get expiration time for assignment claim
    assignment=Assignment.query.filter_by(id=assignment_id).first()
    if current_user.account_type=="tutor" and current_user.claim != None and current_user.claim == assignment.claim:
        db.session.delete(current_user.claim) # Should also delete from assignment
        db.session.commit()
        flash("You have unclaimed this assignment.", "info")
        return redirect(url_for('public.home'))
    else:
        flash("You cannot unclaim this assignment.  Contact support if you believe this to be in error.", "warning")
        return view_assignment(assignment.id)

@blueprint.route("/delete-assignment/<assignment_id>", methods=['GET', 'POST'])
@login_required
def delete_assignment(assignment_id):
    """
    """
    # get expiration time for assignment claim
    assignment=Assignment.query.filter_by(id=assignment_id).first()
    if current_user.account_type=="student" and current_user.id == assignment.created_by:
        assignment.active=False
        db.session.commit()
        flash("You have unclaimed this assignment.", "info")
    else:
        flash("You cannot unclaim this assignment.  Contact support if you believe this to be in error.", "warning")
    return redirect(url_for('public.home'))

