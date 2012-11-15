/* Popup page { */
    $(document).ready(function(){
        // We need to get some date data
        var d = new Date();
        var months = [
            "JANUARY",
            "FEBRUARY",
            "MARCH",
            "APRIL",
            "MAY",
            "JUNE",
            "JULY",
            "AUGUST",
            "SEPTEMBER",
            "OCTOBER",
            "NOVEMBER",
            "DECEMBER"
        ]
        var weekdays = [
            "SUNDAY",
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
        ]

        var today = weekdays[d.getDay()]
        var date = months[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear()
        $("#popup_today").text("dsdsda");
        $("#popup_today").text(today);
        $("#popup_date").text(date);
        $("#popup_username").text(localStorage['username']);

        // Close if header is clicked.
        $("#popup_header").click(function(){
            window.close();
        });
    });
    /* Get and parse json { */
    function sort_by_position(a, b){
        if (a.position < b.position)
            return -1;
        if (a.position > b.position)
            return 1;
        return 0;
    }


    function parse_todos(data) {
        var d = new Date(),
            year = d.getFullYear(),
            month = d.getMonth()+1,
            date = d.getDate();


        if (month < 10) {
            month = "0"+month;
        }
        if (date < 10) {
            date = "0"+date;
        }

        var today_string = year+"-"+month+"-"+date

        var todos = [];
        $.each(data, function(key, todo) {
            if (todo['do_on'] === today_string) {
                todos.push(todo);
            }
        });

        todos.sort(sort_by_position);

        $.each(todos, function(key, todo){
            var li = $("#popup_list_items .todo_item.skeleton").clone();
            li.removeClass("skeleton");

            if (todo['done'] === true){
                li.addClass("done")
            }

            li.text(todo['todo']);
            $("#popup_list_items").append(li);
        })
        $("#popup_loader").fadeOut('fast', function(){
            $("#popup_list_items").fadeIn('slow');
        });
    }

    var username = localStorage['username'],
        password = localStorage['password'],
        token = btoa(username+":"+password);
    $.ajax({
        'url': "https://www.teuxdeux.com/api/list.json",
        'username': localStorage['username'],
        'password': localStorage['password'],
        'dataType': "json",
        'beforeSend': function(xhr) {
            xhr.setRequestHeader('Authorization', "Basic "+token);
        },
        'success': function(data) {
            parse_todos(data);
        }
    });
    /* } */
/* } */

/* Options page { */
    function save_options() {
        var button = $("#options_save"),
            username = $("#options_username").val(),
            password = $("#options_password").val(),
            message = $("#options_save .message");

        localStorage["username"] = username;
        localStorage["password"] = password;

        // Update status to let user know options were saved.
        message.fadeIn('fast', function(){
            setTimeout(function() {
                message.fadeOut('fast');
            }, 500);
        });
    }
    $(document).ready(function(){
        // diplay the username
        $("#options_username").val(localStorage['username'])

        // Bind the save button
        $("#options_save").live('click', save_options);

        // Bind enter on inputs
        $("#options_form input").bind('keypress', function(e){
            if (e.keyCode === 13) {
                save_options();
            }
        });
    });
/* } */
