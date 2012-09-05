function logoutLocally() {

    $.get('/logout', function() {
        $.popup.cas_logout_popup.close();
        window.location.reload(true);
    })


}

function o2html (o) {
    var html = '';
    for(var k in o) {
        html += '<p>' + k + ':' + o[k] + '</p>'
    }
    return html;
}

var render = {
    raw: function(d) {
        $('#echo').val(d).show();
    },
    errror: function(o) {
        $('p.error').html(o2html(o)).show();
    },
    user: function(o) {
        $('p.user').html(o2html(o)).show();
    }
}
$(function() {

    $('a#login').popup({
        height: 500,
        width: 500,
        centerBrowser: 1,
        windowName: 'cas_login_popup'
    });


    $('a#logout').popup({
        height: 500,
        width: 500,
        centerBrowser: 1,
        windowName: 'cas_logout_popup',
        afterOpen: logoutLocally
    });

    $('#makerest').click(function() {
        $('#echo').val('');
        $('p.error').html('').hide();
        $('p.user').html('').hide();


        $.get('/rest/user').success(function(data) {
            if (data.success) {
                var res = JSON.parse(data.data);
                render.user(res.response.content)
            } else {
                render.raw(data.raw)
            }

        }).error(function(err) {
            render.error(err)
            render.raw(err.raw)
        })
    });


})