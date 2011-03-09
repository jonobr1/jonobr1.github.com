/**
 * @author jonobr1 / http://jonobr1.com/
 */

google.load("jquery", "1.5.1");
google.setOnLoadCallback(function() {

	var input = $("input");
	var value = input.attr("value");

		input.focus(function() {
			if($(this).attr("value") == value) {
				$(this).attr("value", "");
			}
		});

		input.blur(function() {
			if($(this).attr("value") == "") {
				$(this).attr("value", value);
				$(".validation").html("&nbsp;");
			} else {
				var result = validateEmail($(this).attr("value"));
				if(result == null) {
					$(".validation").html("").append("<img src = 'i/block.png' class = 'block' tabindex = '2' alt = '' />");
				} else {
					$(".validation").html("").append("<img src = 'i/allow.png' class = 'allow' tabindex = '2' alt = '' />");
					$(".allow").click(function() {
						$("#subForm").submit();
					});
					$(".allow").keypress(function(e) {
						if(e.keyCode == 13) {
							$("#subForm").submit();
						}
					});
				}
			}
		});

		input.keydown(function(e) {
			if(e.keyCode == 13) {
				e.preventDefault();
				var result = validateEmail($(this).attr("value"));
				if(result == null) {
					$(".validation").html("").append("<img src = 'i/block.png' class = 'block' alt = '' />");
				} else {
					$(".validation").html("").append("<img src = 'i/allow.png' class = 'allow' alt = '' />");
					$("#subForm").submit();
				}
				$(this).blur();
			}
		});

		$(".validation").focus(function() {
			$(this).blur();
		});
});

function validateEmail(email) { return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) }