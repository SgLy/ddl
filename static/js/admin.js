'use strict';

/* global admin_token */

$('.ui.tabular.menu .item').tab();
$('.ui.dropdown').dropdown();
$('table').on('click', 'i.close.link.icon', function() {
    let type = $(this).data('type');
    let id = $(this).data('id');
    $.ajax({
        url: `/api/admin/${type}`,
        method: 'DELETE',
        data: { admin_token, id },
        success: reload[type]
    });
});

function del(type, id) {
    return `<i class="close link icon" data-id="${id}" data-type="${type}"></i>`;
}

function load(type, keys, api_name = type) {
    return () => {
        $.get(`/api/admin/${api_name}`, { admin_token }, (data) => {
            let el = '';
            data[`${type}s`].forEach(d => {
                let cells = keys.map(k => `<td>${d[k]}</td>`).join('');
                cells += `<td>${del(type, d.id)}</td>`;
                el += `<tr>${cells}</tr>`;
            });
            $(`#${type}_list>tbody`).html(el);
            $(`.ui.dropdown[type=${type}]`).dropdown({
                values: data[`${type}s`].map(d => ({
                    name: d[keys[1]],
                    value: d.id
                }))
            });
        });
    };
}
const reload = {
    user: load('user', ['id', 'username', 'nickname', 'stuid', 'password']),
    deadline: load('deadline', ['id', 'title', 'description', 'time', 'done', 'course_id', 'user_id']),
    notice: load('notice', ['id', 'title', 'description', 'course_id', 'user_id']),
    course: load('course', ['id', 'name', 'teacher', 'semester']),
    userCourse: load('user_course', ['id', 'user_id', 'course_id'], 'course/user')
};

$('#user').on('click', reload.user);
$('#add_user').on('click', () => {
    const data = {
        admin_token,
        username: $('#user_username').val(),
        nickname: $('#user_nickname').val(),
        stuid: $('#user_stuid').val(),
        password: $('#user_password').val()
    };
    $.ajax({
        url: '/api/user',
        method: 'PUT',
        data: data,
        success: reload.user
    });
});

$('#deadline').on('click', reload.deadline);
$('#add_deadline').on('click', () => {
    const data = {
        admin_token,
        title: $('#deadline_title').val(),
        description: $('#deadline_description').val(),
        time: $('#deadline_time').val(),
        course_id: $('#deadline_course_id').val()
    };
    $.post('/api/admin/deadline', data, reload.deadline);
});

$('#notice').on('click', reload.notice);
$('#add_notice').on('click', () => {
    const data = {
        admin_token,
        title: $('#notice_title').val(),
        description: $('#notice_description').val(),
        course_id: $('#notice_course_id').val()
    };
    $.post('/api/admin/notice', data, reload.notice);
});

$('#course').on('click', reload.course);
$('#add_course').on('click', () => {
    const data = {
        admin_token,
        name: $('#course_name').val(),
        teacher: $('#course_teacher').val(),
        semester: $('#course_semester').val()
    };
    $.post('/api/admin/course', data, reload.course);
});

$('#user_course').on('click', reload.userCourse);
$('#add_user_course').on('click', () => {
    const user_id = $('#user_course_user_id').val();
    const course_id = $('#user_course_course_id').val();
    $.post(`/api/admin/course/${course_id}/user/${user_id}`, { admin_token }, reload.userCourse);
});

let fileReader = new FileReader();
fileReader.onload = () => { batchImportUserCourse(fileReader.result); };
$('#import_user_course').on('click', function() {
    $('#fileupload').trigger('click');
});
$('#fileupload').on('change', function() {
    fileReader.readAsText($('#fileupload')[0].files[0]);
});
function batchImportUserCourse(csv) {
    let stuids = [];
    csv.split('\n').forEach((r, i) => {
        if (r === '' || i === 0)
            return;
        stuids.push(r.split(',')[0]);
    });
    const course_id = $('#user_course_course_id').val();
    $.post(`/api/admin/course/${course_id}/user/-1`, { admin_token, stuids }, reload.userCourse);
}

$(reload.course);
