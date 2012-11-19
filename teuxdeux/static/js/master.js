var DEBUG = false;
function debug(string) {
    if (DEBUG === true) {
        console.log(string);
    }
}

/* Popup page { */
    var username = localStorage['username'],
        password = localStorage['password'],
        token = btoa(username+":"+password);
        api_url = "https://www.teuxdeux.com/api/";

    function sort_by_position(a, b){
        if (a.position < b.position)
            return -1;
        if (a.position > b.position)
            return 1;
        return 0;
    }
    function render_todos(todos) {
        debug("render_todos()");
        if (todos instanceof Array === false) {
            todos = [todos]
        }
        debug(todos);

        todos.sort(sort_by_position);

        var list = $("#popup_list_items");
        for (var i = 0 ; i < todos.length ; i++) {
            var todo = todos[i],
                li = $("#popup_todo_skeleton").clone();

            li.attr("id", todo['id']);
            li.attr("do_on", todo['do_on']);
            li.attr("position", todo['position']);
            li.attr("done", todo['done'])

            li.find(".todo").text(todo['todo']);

            if (todo["todo"] !== "") {
                list.append(li);
            } else {
                api_delete(todo["id"])
            }
        }
    }
    function restore_list(target) {
        $("input.edit_todo_input").hide();
        $(".todo_item").removeClass("edit");
        $(".todo_item .todo").show();
    }
    function today() {
        var d = new Date(),
            year = d.getFullYear(),
            month = d.getMonth()+1,
            date = d.getDate();
            list = $("#popup_list_items");

        if (month < 10) {
            month = "0"+month;
        }
        if (date < 10) {
            date = "0"+date;
        }

        return year+"-"+month+"-"+date
    }

    /* CREATE  { */
        function create_todo() {
            debug("create_todo()");
            var input = $("#popup_add_input"),
                todo = input.val();

            if (todo.length === 0){
                return;
            }

            // Clear the input. \\o/
            input.val("");

            // Put together the todo
            todo_item = {
                "todo": todo,
                "do_on": today(),
                "done": 0,
                "position": 0
            }
            api_create(todo_item)
        }
        function api_create_callback(todo) {
            debug("create_callback()");
            render_todos(todo);
        }
        function api_create(todo_item){
            var data = {
                "todo_item": todo_item
            };
            $.ajax({
                'type': 'POST',
                'url': api_url + 'todo.json',
                'data': data,
                'beforeSend': function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Basic '+token);
                },
                'complete': function(json) {
                    if (json.status === 200) {
                        var todo = $.parseJSON(json.responseText)
                        api_create_callback(todo);
                    }
                }
            });
        }
    /* } */
    /* READ { */
        function api_read_callback(json) {
            debug("api_read_callback()");

            today_string = today();

            var todos = [];
            $.each(json, function(key, todo) {
                if (todo['do_on'] === today_string) {
                    todos.push(todo);
                }
            });

            render_todos(todos);

            // show list if not already visible
            if (list.not(":visible")) {
                $("#popup_loader").fadeOut('fast', function(){
                    list.fadeIn('slow');
                });
            }
        }
        function api_read_failed(json) {
            debug("api_read_fail()");
            $("#popup_loader").fadeOut("fast", function(){
                var msg = $("<p class='red center'>Somethign went wrong.</p>");
                if (json.status === 401) {
                    msg = $("<p class='red center'>You need to add your account details in the <a href='/options.html' target='_blank' class='red bold'>options page</a>.</p>")
                }
                $("#popup_wrapper").append(msg);
            });
        }
        function api_read(date_string) {
            debug("api_read()");
            $.ajax({
                'url': api_url + "list.json",
                'dataType': "json",
                'beforeSend': function(xhr) {
                    xhr.setRequestHeader('Authorization', "Basic "+token);
                },
                'complete': function(json) {
                    if (json.status === 200) {
                        data = $.parseJSON(json.responseText)
                        api_read_callback(data);
                    } else {
                        api_read_failed(json);
                    }
                }
            });
        }
    /* } */
    /* UPDATE  { */
        function toggle_done(todo_id){
            debug("toggle_done()");
            var todo = $("#"+todo_id),
                todo_item = {};

            todo_item[todo_id] = {}
            if (todo.attr("done") === "true") {
                todo.attr("done", false);
                todo_item[todo_id]['done'] = 0;
            } else {
                todo.attr("done", true);
                todo_item[todo_id]['done'] = 1;
            }
            api_update(todo_item);
        }
        function update_todo(todo_id, new_todo){
            debug("update_todo()");
            var todo = $("#"+todo_id),
                text = todo.find("span.todo"),
                todo_item = {};

            restore_list();
            text.text(new_todo);

            todo_item[todo_id] = {}
            if (new_todo !== "") {
                todo_item[todo_id]['todo'] = new_todo;
                api_update(todo_item);
            } else {
                api_delete(todo.attr("id"));
            }
        }
        function update_position(todo_id, new_position){
            debug("update_position()");
            var todo = $("#"+todo_id),
                todo_item = {};

            todo_item[todo_id] = {}
            todo_item[todo_id]["position"] = new_position;
            api_update(todo_item);
        }
        function api_update_callback(json) {
            debug("api_update_callback()");
        }
        function api_update(todo_item) {
            debug("api_update_todo()");
            $.ajax({
                'type': 'POST',
                'url': api_url + "update.json",
                'data': {"todo_item": todo_item},
                'beforeSend': function(xhr) {
                    xhr.setRequestHeader('Authorization', "Basic "+token);
                },
                'complete': function(json) {
                    api_update_callback(json);
                }
            });
        }
    /* } */
    /* DELETE  { */
        function api_delete_callback() {
            debug("delete_callback()");
        }
        function api_delete(todo_id) {
            debug("api_delete_todo()");
            $("#"+todo_id).remove();
            $.ajax({
                'type': "DELETE",
                'url': api_url + "todo/"+todo_id,
                'beforeSend': function(xhr) {
                    xhr.setRequestHeader('Authorization', "Basic "+token);
                },
                'success': function() {
                    api_delete_callback();
                }
            });
        }
    /* } */

    $(document).ready(function(){
        if ($("#popup_body").length > 0) {
            // Make sure that the javascript for this page is only loaded when
            // #popup_body is present.
            debug('POPUP PAGE LOADED');

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
            $("#popup_username").text(username);


            // Close if header is clicked.
            $("#popup_header").click(function(){
                window.close();
            });

            // Initial read of todos.
            api_read();

            // Make sortable
            $("#popup_list_items").sortable({
                'update': function(event, ui) {
                    var todo_id = ui.item.attr("id"),
                        new_position = ui.item.index();
                    update_position(todo_id, new_position);
                }
            });

            // Bind EDIT
            $("#popup_wrapper").click(function(e){
                target = $(e.target);
                if (!target.hasClass("edit_todo_input")) {
                    restore_list(e.target.id);
                }
            });
            $("span.edit_todo").live('click', function(){
                restore_list();
                var todo = $(this).parent(),
                    text = todo.find("span.todo"),
                    input = todo.find("input.edit_todo_input");

                todo.addClass("edit");
                text.hide();
                input.val(text.text()).show().focus();
            });
            $(".edit_todo_input").live('keypress', function(e){
                if (e.keyCode === 13) {
                    var todo_id = $(this).parent().attr("id"),
                        new_todo = $(this).val();
                    update_todo(todo_id, new_todo);
                }
            });

            // Bind CREATE
            $("#popup_add_input").bind('keypress', function(e){
                if (e.keyCode === 13) {
                    create_todo();
                }
            });

            // Bind UPDATE
            $(".todo_item .todo").live('click', function(){
                toggle_done($(this).parent().attr("id"));
            });

            // Bind DELETE
            $(".todo_item .remove_todo").live('click', function(){
                api_delete($(this).parent().attr("id"));
            });

        }
    });
/* } */

/* Options page { */
    function save_options() {
        debug("save_options()");
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
        if ($("#options_body").length > 0) {
            // Make sure that the javascript for this page is only loaded when
            // #popup_body is present.
            debug('OPTIONS PAGE LOADED');

            // diplay the username
            $("#options_username").watermark('teuxdeux username');
            $("#options_password").watermark('teuxdeux password');

            // Bind the save button
            $("#options_save").live('click', save_options);

            // Bind enter on inputs
            $("#options_form input").bind('keypress', function(e){
                if (e.keyCode === 13) {
                    save_options();
                }
            });
        }
    });
/* } */
