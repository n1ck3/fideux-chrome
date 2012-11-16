/* Popup page { */
    var username = localStorage['username'],
        password = localStorage['password'],
        token = btoa(username+":"+password);
        api_url = "https://www.teuxdeux.com/api/";

    /* CREATE  { */
        function create_callback(json) {
            console.log("create_callback()");
            // XXX: This should really just check if the request was successful
            // and then prepend the todo to the list. To save on the requests
            // and bandwidth and whatnot. :) For now, though, re-read the whole
            // thing.
            read_todos();
        }
        function create_todo() {
            console.log("create_todos()");
            var input = $("#popup_add_input"),
                todo = input.val();

            if (todo.length === 0){
                return;
            }

            // Clear the input. \\o/
            input.val("");

            // Put together the todo
            var data = {
                "todo_item": {
                    "todo": todo,
                    "do_on": "2012-11-15",
                    "done": 0,
                    "position": 0
                }
            };

            // Fire the ajax request
            $.ajax({
                'type': 'POST',
                'url': api_url + 'todo.json',
                'data': data,
                'beforeSend': function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Basic '+token);
                },
                'complete': function(json) {
                    create_callback(json);
                }
            });
        }
    /* } */
    /* READ { */
        function sort_by_position(a, b){
            if (a.position < b.position)
                return -1;
            if (a.position > b.position)
                return 1;
            return 0;
        }
        function read_callback(json) {
            $("#popup_list_items li:visible").remove();
            console.log("read_callback()");
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

            var today_string = year+"-"+month+"-"+date

            var todos = [];
            $.each(json, function(key, todo) {
                if (todo['do_on'] === today_string) {
                    todos.push(todo);
                }
            });

            todos.sort(sort_by_position);

            var list = $("#popup_list_items");
            $.each(todos, function(key, todo){
                var li = $("#popup_list_items .todo_item.skeleton").clone();
                li.removeClass("skeleton");

                li.attr("todo_id", todo['id']);

                if (todo['done'] === true){
                    li.addClass("done")
                }

                li.find(".todo").text(todo['todo']);
                list.append(li);
            })

            // Show list if not already visible
            if (list.not(":visible")) {
                $("#popup_loader").fadeOut('fast', function(){
                    list.fadeIn('slow');
                });
            }
        }
        function read_todos() {
            console.log("read_todos()");
            $.ajax({
                'url': api_url + "list.json",
                'dataType': "json",
                'beforeSend': function(xhr) {
                    xhr.setRequestHeader('Authorization', "Basic "+token);
                },
                'success': function(json) {
                    read_callback(json);
                }
            });
        }
    /* } */
    /* UPDATE  { */
        function update_callback(json) {
            console.log("update_callback()");
            console.log(json)
        }
        function mark_ad_done(todo){
            console.log("mark_as_done()");
            var todo_id = todo.attr("todo_id"),
                todo_item = {}
            if (todo.hasClass('done')) {
                todo.removeClass('done');
                todo_item[todo_id]['done'] = 0;
            } else {
                todo.addClass('done');
                todo_item[todo_id]['done'] = 0;
            }
            update_todo(todo_item)
        }
        function update_todo(todo_item) {
            console.log("update_todo()");
            $.ajax({
                'url': api_url + "todo.json",
                'data': {
                    "todo_item": todo_item
                },
                'beforeSend': function(xhr) {
                    xhr.setRequestHeader('Authorization', "Basic "+token);
                },
                'complete': function(json) {
                    update_callback(json);
                }
            });
        }
    /* } */
    /* DELETE  { */
        function delete_callback() {
            console.log("delete_callbacki()");
        }
        function delete_todo(todo_id) {
            console.log("delete_todo()");
            $.ajax({
                'type': "DELETE",
                'url': api_url + "todo/"+todo_id,
                'beforeSend': function(xhr) {
                    xhr.setRequestHeader('Authorization', "Basic "+token);
                },
                'success': function() {
                    delete_callback();
                }
            });
        }
    /* } */

    $(document).ready(function(){
        if ($("#popup_body").length > 0) {
            // Make sure that the javascript for this page is only loaded when
            // #popup_body is present.
            console.log('POPUP PAGE LOADED');

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
            read_todos();

            // Bind CREATE
            $("#popup_add_input").bind('keypress', function(e){
                if (e.keyCode === 13) {
                    create_todo();
                }
            });

            // Bind UPDATE
            $(".todo_item .todo").live('click', function(){
                mark_as_done($(this).parent());
            });

            // Bind DELETE
            $(".todo_item .remove_todo").live('click', function(){
                $(this).parent().fadeOut('fast;');
                delete_todo($(this).parent().attr("todo_id"));
            });
        }
    });
/* } */

/* Options page { */
    function save_options() {
        console.log("save_options()");
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
            console.log('OPTIONS PAGE LOADED');

            // diplay the username
            $("#options_username").watermark('username');
            $("#options_password").watermark('password');

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
