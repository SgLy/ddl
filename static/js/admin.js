'use strict';
let baseUrl = 'http://localhost:5000';
$('.ui.tabular.menu .item').tab();

function loadUser() {
    $.get('/api/admin/user', { admin_token }, (data) => {
        let el = '';
        data.users.forEach(d => {
            el += `<tr><td>${d.id}</td><td>${d.username}</td><td>${d.nickname}</td><td>${d.password}</td><td></td></tr>`;
        });
        $('#user_list>tbody').html(el);
    });
}
$('#user').on('click', loadUser);
$('#add_user').on('click', () => {
    const data = {
        admin_token,
        username: $('#user_username').val(),
        nickname: $('#user_nickname').val(),
        password: $('#user_password').val()
    };
    $.ajax({
        url: '/api/user',
        method: 'PUT',
        data: data,
        success: loadUser
    });
});

function loadDeadline() {
    $.get('/api/admin/deadline', { admin_token }, (data) => {
        let el = '';
        data.deadlines.forEach(d => {
            el += `<tr>
                <td>${d.id}</td>
                <td>${d.title}</td>
                <td>${d.description}</td>
                <td>${d.time}</td>
                <td>${d.done}</td>
                <td>${d.course_id}</td>
                <td>${d.user_id}</td>
                <td></td>
            </tr>`;
        });
        $('#deadline_list>tbody').html(el);
    });
}
$('#deadline').on('click', loadDeadline);
$('#add_deadline').on('click', () => {
    const data = {
        admin_token,
        title: $('#deadline_title').val(),
        description: $('#deadline_description').val(),
        time: $('#deadline_time').val(),
        course_id: $('#deadline_course_id').val()
    };
    $.post('/api/admin/deadline', data, loadDeadline);
});

function loadNotice() {
    $.get('/api/admin/notice', { admin_token }, (data) => {
        let el = '';
        data.notices.forEach(d => {
            el += `<tr>
                <td>${d.id}</td>
                <td>${d.title}</td>
                <td>${d.description}</td>
                <td>${d.course_id}</td>
                <td>${d.user_id}</td>
                <td></td>
            </tr>`;
        });
        $('#notice_list>tbody').html(el);
    });
}
$('#notice').on('click', loadNotice);
$('#add_notice').on('click', () => {
    const data = {
        admin_token,
        title: $('#notice_title').val(),
        description: $('#notice_description').val(),
        course_id: $('#notice_course_id').val()
    };
    $.post('/api/admin/notice', data, loadNotice);
});

function loadCourse() {
    $.get('/api/admin/course', { admin_token }, (data) => {
        let el = '';
        data.courses.forEach(d => {
            el += `<tr><td>${d.id}</td><td>${d.name}</td><td>${d.semester}</td><td></td></tr>`;
        });
        $('#course_list>tbody').html(el);
    });
}
$('#course').on('click', loadCourse);
$('#add_course').on('click', () => {
    const data = {
        admin_token,
        name: $('#course_name').val(),
        semester: $('#course_semester').val()
    };
    $.post('/api/admin/course', data, loadCourse);
});

function loadUserCourse() {
    $.get('/api/admin/course/user', { admin_token }, (data) => {
        let el = '';
        data.user_courses.forEach(d => {
            el += `<tr>
                <td>${d.user_id}</td>
                <td>${d.course_id}</td>
                <td></td>
            </tr>`;
        });
        $('#user_course_list>tbody').html(el);
    });
}
$('#user_course').on('click', loadUserCourse);
$('#add_user_course').on('click', () => {
    const user_id = $('#user_course_user_id').val();
    const course_id = $('#user_course_course_id').val();
    $.post(`/api/admin/course/${course_id}/user/${user_id}`, { admin_token }, loadUserCourse);
});

$(loadCourse);