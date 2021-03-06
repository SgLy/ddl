'use strict';

var token = "";

var random_colors = ["#0277bd", "#c62828", "#512da8", "#ef6c00", "#00695c",
  "#ad1457", "#33691e"];

var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

// initalize

Vue.component("timeline-line", {
  props: ["date"],
  template: '<div v-bind:class="[h-line, outofData ? h-line-out, h-line-new]"></div>',
  data: function () {
    return {
      date: date,
      outofData: true
    }
  }
});

var vm = new Vue({
  el: "#app_bar",
  data: {
    logined: false,
    nickname: "",
    snackbar: false,
    snackbar_text: "",
    snackbar_color: "",

    // login related
    login_dialog: false,
    show_register: false,
    requireRule: [
      (v) => !!v || 'Please fill this field',
    ],
    login_password: "",
    login_username: "",

    // register
    regi_username: "",
    regi_nickname: "",
    regi_stuid: "",
    regi_password: "",
    
    // add ddl
    add_ddl_dialog: false,
    add_title: "",
    add_description: "",
    add_date: new Date().toISOString().substring(0, 10),

		pages: [
      {
        name: "DDLS",
        icon: "assignment"
      }, 
      {
        name: "Notice",
        icon: "dashboard"
      },
      {
        name: "Groups",
        icon: "group"
      }
		],
    current_page: 0,

    // ddls
    ddls: [],
    today_last: false
  },
  computed: {
    
  },
  watch: {
    logined: function (val) {
      if (val) {
        this.login_dialog = false;
        $.ajax({
          url: "/api/user?token=" + token,
          type: "get",
          dataType: "json",
          success: function (res) {
            if (res.status == 1) {
              vm.nickname = res.nickname;
            } else {
              show_message(res.reason, 0);
            }
          }
        })
      } else {
        this.login_dialog = true;
      }
    }
  },
  methods: {
    _refresh: function (event) {
      refresh();
    },
    _getMonth: function (i) {
      return monthNames[i];
    },

    submit_login: function (event) {
      let that = this;
      if (this.login_username != "" && this.login_password != "") {
        $.ajax({
          url: "/api/login?username=" + this.login_username + "&password=" + this.login_password,
          type: "get",
          dataType: "json",
          success: function (res) {
            if (res.status == 1) {
              that.logined = true;
              token = res.token;
              Cookies.set("token", res.token);
              refresh();
            } else {
              show_message(res.reason, 0);
            }
          }
        });
      }
    },
    logout: function (event) {
      this.logined = false;
      Cookies.remove("token");
      refresh();
    },

    submit_register: function (event) {
      let that = this;
      if (this.regi_username != "" && this.regi_nickname != "" && this.regi_password != "" && this.regi_stuid != "") {
        $.ajax({
          url: "/api/user",
          type: "put",
          data: {
            username: that.regi_username,
            password: that.regi_password,
            nickname: that.regi_nickname,
            stuid: that.regi_stuid
          },
          dataType: "json",
          success: function (res) {
            if (res.status == 1) {
              show_message("Registered successfully!", 1);
              that.show_register = false;
            } else {
              show_message(res.reason + " You may submitted a duplicated username or studentID", 0);
            }
          }
        });
      }
    },

    finish_ddl: function (ddl_id) {
      $.ajax({
        url: '/api/deadline/' + ddl_id,
        type: 'put',
        data: {
          token: token,
          done: 1
        },
        dataType: 'json',
        success: function (res) {
          if (res.status == 1) {
            show_message("Finished successfully!", 1);
            refresh();
          } else {
            show_message(res.reason, 0);
          }
        }
      });
    },
    unfinish_ddl: function (ddl_id) {
      $.ajax({
        url: '/api/deadline/' + ddl_id,
        type: 'put',
        data: {
          token: token,
          done: 0
        },
        dataType: 'json',
        success: function (res) {
          if (res.status == 1) {
            show_message("Unfinished successfully!", 1);
            refresh();
          } else {
            show_message(res.reason, 0);
          }
        }
      });
    },
    delete_ddl: function (ddl_id) {
      $.ajax({
        url: '/api/deadline/' + ddl_id,
        type: 'delete',
        data: {
          token: token
        },
        dataType: 'json',
        success: function (res) {
          if (res.status == 1) {
            show_message("Deleted successfully!", 1);
            refresh();
          } else {
            show_message(res.reason, 0);
          }
        }
      });
    },
    add_ddl: function (event) {
      let that = this;
      if (this.add_title != "") {
        $.ajax({
          url: "/api/deadline",
          type: "post",
          data: {
            token: token,
            title: that.add_title,
            description: that.add_description,
            time: new Date(that.add_date).getTime()
          },
          dataType: "json",
          success: function (res) {
            if (res.status == 1) {
              show_message("DDL added successfully!", 1);
              that.add_ddl_dialog = false;
              refresh();
            } else {
              show_message(res.reason, 0);
            }
          }
        });
      }

    }
  }
});

vm.$vuetify.theme.primary = '#1976d2';

function refresh_ddl() {
  vm.today_last = false;
  if (!vm.logined) {
    vm.ddls = []
    return;
  }
  $.ajax({
    url: "/api/deadline?token=" + token,
    type: "get",
    dataType: "json",
    success: function (res) {
      if (res.status == 1) {
        let ddl = res.deadlines;
        ddl.sort(function (a, b) {
          return parseInt(b.time) - parseInt(a.time)});
        let last_time = Infinity;
        let greater_today = true;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        for(let i = 0; i < ddl.length; ++i) {
          ddl[i].time = new Date(parseInt(ddl[i].time));
          ddl[i].time.setHours(0, 0, 0, 0);

          if (i == 0 || ddl[i].time < last_time) {
            ddl[i].show_time = true;
            last_time = ddl[i].time;
          }
          // check today
          if (greater_today && ddl[i].time <= today) {
            ddl[i].showToday = true;
            greater_today = false;
          }

          ddl[i].color = random_colors[i % random_colors.length];
          if (ddl[i].done) {
            ddl[i].color = "#546e7a";
          }
        }
        if (greater_today) {
          vm.today_last = true;
        }
        vm.ddls = ddl;
      }
    }});
}

function refresh () {
  refresh_ddl()
}

function show_message(s, i = 2) {
  // i = 1 for success, 0 for error, 2 for info
  if (i == 0) {
    vm.snackbar_color = 'error';
  } else if (i == 1){
    vm.snackbar_color = 'success';
  } else {
    vm.snackbar_color = 'info'; 
  }
  vm.snackbar_text = s;
  vm.snackbar = true;
}


$(document).ready(function () {
  if (typeof Cookies.get("token") != 'undefined') {
    token = Cookies.get("token");
    vm.logined = true;
    refresh();
  } else {
    vm.login_dialog = true;
  }
});
