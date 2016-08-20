from flask_wtf import Form
from wtforms.fields import *
from flask.ext.pagedown.fields import PageDownField
from wtforms.validators import DataRequired, Length, NumberRange

from flask.ext.admin.form import widgets

from assignexchg.assignment.models import Assignment
from assignexchg.subject.models import Subject

# For the datepicker
# TODO move into another spot
class AssignmentForm(Form):
    '''
    assignment_id = Column(db.Integer, primary_key=True) # a username, userid ?
    created_by = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE')) #TODO: ondelete cascade?
    description = Column(db.String(500), nullable=False) # a username, userid ?
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    due_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    price = Column(db.Integer, nullable=False)
    active = Column(db.Boolean(), default=False)
    '''

    title = TextField('Title',
            validators=[DataRequired(), Length(min=3, max=40)])
    description = PageDownField('Description',validators=[DataRequired(), Length(min=1, max=1024)])

    due_date = DateTimeField('Due Date', widget=widgets.DateTimePickerWidget())
    assignment_files = FileField('Associated Project Files', validators=[])
    subject_id = SelectField('Computer Science Topic', coerce=int)

    #TODO add file uplaoder to amazon
    minutes = IntegerField('Minutes Allotted to Tutor ($20/hr)',      validators=[DataRequired('num required.'), NumberRange(min=1, max=900)])

    def __init__(self, *args, **kwargs):
        super(AssignmentForm, self).__init__(*args, **kwargs)
        self.assignment = None

    # For the time being, pretty much just create it
    def validate(self):
        initial_validation = super(AssignmentForm, self).validate()
        if not initial_validation:
            return False
        else:
            return True

class SolutionForm(Form):
    '''
    '''
    description = PageDownField('Tutor Notes',
            validators=[DataRequired(), Length(min=1, max=1024)])
    solution_files = FileField('Associated Project Files', validators=[])

    #TODO add file uplaoder to amazon
    def __init__(self, *args, **kwargs):
        super(SolutionForm, self).__init__(*args, **kwargs)

    # For the time being, pretty much just create it
    def validate(self):
        initial_validation = super(SolutionForm, self).validate()
        if not initial_validation:
            return False
        else:
            return True


