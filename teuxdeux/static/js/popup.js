/* Setup { */
    $(document).ready(function(){
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

        $("#today").text("dsdsda");
        $("#today").text(today);
        $("#date").text(date);
        $("#username").text(localStorage['username']);
    });
/* } */


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
        var li = $("#list_items .todo_item.skeleton").clone();
        li.removeClass("skeleton");

        if (todo['done'] === true){
            li.addClass("done")
        }

        li.text(todo['todo']);
        $("#list_items").append(li);
    })
    $("#loader").fadeOut('fast', function(){
        $("#list_items").fadeIn('slow');
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
