$(function() {
	$("#showMore").hide();
	$("#loading").hide();
	
	var home = "http://mbasic.facebook.com";
	var active_tab = null;
	
	// Set the badge text for messages and notifs
    var counts = chrome.extension.getBackgroundPage().counts,
        friendRequests = chrome.extension.getBackgroundPage().friendRequestCount,
        oldFriendRequestCount = chrome.extension.getBackgroundPage().oldFriendRequestCount;
    if(counts) {
        $('#notifs .icon_inner_wrap').append('<div class="badge">' + counts.notifications.num_unread + '</div>');
        $('#messages .icon_inner_wrap').append('<div class="badge">' + counts.inbox.unseen + '</div>');
    }
    if(friendRequests) {
        $('#friends .icon_inner_wrap').append('<div class="badge">' + friendRequests + '</div>');
    } else {
        $('#friends .icon_inner_wrap').append('<div class="badge">0</div>');
    }
	
	// Handle the item click
    $('#icons li').click(function() {
		var me = $(this);
		active_tab = me;
		if(me.hasClass('active'))
			return false;
		
		me.addClass("active");
		$('#icons li').not(this).removeClass("active");
		$("#notifContentList").html("");
		$("#showMore").hide();
		
		$("#loading").show();
		me.css({'background-color':'#FBFBFB'});
		 $('#icons li').not(this).css({'background-color':'#E8E8E8'});
		$("#notifContent").css({'height': '180px'});
		var dataUrl = home + me.data('target');
		var content = "";
		
		if ( me.attr('id') === "friends" && friendRequests > 0 ) {
			$.get( dataUrl, function(data) {
				var html = data, fb = $.parseHTML(html);
				var item_counts = 0;
				
				$(fb).find("#friend_requests_section > div").last().remove();
				$(fb).find("#friend_requests_section > div").last().remove();
				itemId = 0;
				
				$(fb).find("#friend_requests_section > div").each(function(){
					item_counts++; itemId++;
					imageSrc = $(this).find("table tr td div a img").attr("src");
					profileHref = home + $(this).find("table tr td div a").attr("href");
					profileName = $(this).find("table tr td div strong").text();
					
					requestForm = $(this).find("table tr td div div form");
					requestForm.attr("action", home + requestForm.attr("action"));
					requestForm.attr("style", "display:none;");
					
					content += "<li id='req"+itemId+"'><a href='#" + "' ><div class='profileImg' style='background:url("+ imageSrc +") no-repeat;'></div><div class='profileName'>"+ profileName +"</div></a>";
					content += requestForm.wrapAll('<div>').parent().html() + "</li>";
					
					if(item_counts == 9) {
						return false;
					}
				});
				
				$("#notifContent").removeAttr("style");
				$("#loading").hide();
				$("#notifContentList").html(content);
				if (item_counts>4) {
					$("#showMore").show();
				}
			});
		} else if (me.attr('id') === "messages" && counts.inbox.unseen > 0) {
			$.get( dataUrl, function(data) {
				var html = data, fb = $.parseHTML(html);
				var itm=0;
				$(fb).find("#objects_container #root table").first().remove();
				$(fb).find("#objects_container #root table").each(function(){
					if (itm >= counts.inbox.unseen) {
						return false;
					}
					name = $(this).find("h3").first().find("a").text();
					msg = $(this).find("h3").first().next().find("span").text();
					time = $(this).find("h3").last().find("abbr").text();
					content += "<li id='msg" + itm + "'><div>"+name+"</div><div>"+msg+"</div><div>"+time+"</div></li>";
					itm++;
				});
				
				$("#notifContent").removeAttr("style");
				$("#loading").hide();
				$("#notifContentList").html(content);
				$("#showMore span").text("Show All");
				$("#showMore").show();
			});
		} else if (me.attr('id') === "notifs" && counts.notifications.num_unread > 0) {
			$.get( dataUrl, function(data) {
				var html = data, fb = $.parseHTML(html);
				var itm=0;
				
				$(fb).find("#notifications_list h5").siblings().each(function(){
					if (itm > counts.notifications.num_unread) {
						return false;
					}
					$(this).find("a").attr("href", home + $(this).find("a").attr("href") );
					$(this).find("a").attr( "target", "_blank" )
					content += "<li id='notif" + itm + "'>" + $(this).html() + "</li>";
					itm++;
				});
				
				$("#notifContent").removeAttr("style");
				$("#loading").hide();
				$("#notifContentList").html(content);
				$("#showMore span").text("Show All");
				$("#showMore").show();
			});
		} else {
			if (me.attr('id') === "friends") {
				content = "<p style='margin-top:75px;font-size:18px;'>No friend request for now...</p>";
			}
			if (me.attr('id') === "messages") {
				content = "<p style='margin-top:75px;font-size:18px;'>No new messages for now...<br/>Cool ! ;)</p>";
			}
			if (me.attr('id') === "notifs") {
				content = "<p style='margin-top:75px;font-size:18px;'>No new notifications for now...<br/>Cool ! ;)</p>";
			}
			$("#loading").hide();
			$("#notifContentList").html(content);
		}
    });
	$("#notifContentList").on("click", "li[id^='req'] a", function(){
		$(this).hide();
		$(this).next().fadeIn(500);
		$("#notifContentList li a").not(this).each(function(){
			$(this).fadeIn(500);
			$(this).next().hide();
		});
	});
	$("#notifContent #showMore").on('click', function(){
		if (active_tab !== null) window.open(home + active_tab.data('target'));
		return false;
	});
});