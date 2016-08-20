# -*- coding: utf-8 -*-
from flask.ext.assets import Bundle, Environment

css = Bundle(
    "libs/bootstrap/dist/css/bootstrap.min.css",
    "libs/ionicons/css/ionicons.min.css",
    "css/main.css",
    "css/footer.css",
    "css/nav.css",
    "css/landing.css",
    "css/error_pages.css",
    "css/payment.css",
    "css/bootstrap-datetimepicker.min.css",
    "css/restlessPagination.css",
)

js = Bundle(
    "js/tutor-dashboard.js",
    "libs/jQuery/dist/jquery.js",
    "libs/jquery-ui/jquery-ui.js",
    "libs/bootstrap/dist/js/bootstrap.js",
    "libs/moment/moment.js",
    "libs/startbootstrap-sb-admin-2/dist/js/sb-admin-2.js",
)

js_dashboards = Bundle(
    "libs/jQuery/dist/jquery.js",
    "libs/jquery-ui/jquery-ui.min.js",
    "libs/bootstrap/dist/js/bootstrap.js",
    "libs/startbootstrap-sb-admin-2/dist/js/sb-admin-2.js",
    "libs/codemirror/codemirror.js",
    "libs/metisMenu/dist/metisMenu.js",
    "js/tutor-dashboard.js",
)

css_dashboards = Bundle(
    "libs/bootstrap/dist/css/bootstrap.min.css",
    "libs/ionicons/css/ionicons.min.css",
    "libs/startbootstrap-sb-admin-2/dist/css/sb-admin-2.css",
    "css/dashboards/dashboard-defaults.css",
    "css/dashboards/markdown-config.css",
    "libs/jquery-ui/themes/base/jquery-ui.css",
    "libs/jquery-ui/themes/base/core.css",
    "libs/jquery-ui/themes/base/theme.css",
    "libs/jquery-ui/themes/base/menu.css",
    "libs/font-awesome/css/font-awesome.css",
    "css/dashboards/tutor_dashboard/chat-panel.css",
    "css/dashboards/tutor_dashboard/account-settings.css",
    "css/github.css",
    "css/firepad.css",
    "css/react-s3-uploader.css",
)

assets = Environment()

assets.register("js_all", js)
assets.register("css_all", css)
assets.register("css_dashboards_all", css_dashboards)
assets.register("js_dashboards_all", js_dashboards)
