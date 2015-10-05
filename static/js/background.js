window.counts = {};
window.latest = 0;
window.latest_read = 0;
window.num_unread = 0;
window.friendRequestCount = 0;
window.oldFriendRequestCount = 0;

$(function() {
    var interval = 5000;

	var latest_num_unread = 0;
	var latest_unseen_msg = 0;
    
    var check = function() {
        $.get('https://www.facebook.com/desktop_notifications/counts.php?latest=' + latest  + '&latest_read=' + latest_read, function(res) {
            try {
                window.counts = res;
                
                var notifs = res.notifications;
                
                if(!notifs.no_change) {
                    num_unread = 0;
                    latest_read = notifs.latest_read;
                    latest = notifs.latest;
                    
                    $.each(notifs.unread, function() {
                        (this == 1) && (num_unread++);
                    });
                }
                
                notifs.num_unread = num_unread;
                
				if (latest_unseen_msg != res.inbox.unseen) {
					if (latest_unseen_msg < res.inbox.unseen) {
						var notification = new Notification('New Message', {
							icon: 'static/icons/messages.png',
							body: "Hey there! You have a new message on facebook",
						});
					}
					latest_unseen_msg = res.inbox.unseen;
				}
				
				if (latest_num_unread != num_unread) {
					if (latest_num_unread < num_unread) {
						var notification = new Notification('New Notification', {
							icon: 'static/icons/notifications.png',
							body: "Hey there! You have a new notification on facebook",
						});
					}
					latest_num_unread = num_unread;
				}
				
                var count = res.inbox.unseen + (num_unread || 0);
				
                if(count) {
                    chrome.browserAction.setBadgeText({text: count + ''});
                    chrome.browserAction.setBadgeBackgroundColor({color: [255,0,0,255]});
                } else {
                    chrome.browserAction.setBadgeText({text: ''});
                    chrome.browserAction.setBadgeBackgroundColor({color: [255,0,0,100]});
                }
            } catch(e) {
                window.counts = {};
                
                chrome.browserAction.setBadgeText({text: ''});
                chrome.browserAction.setBadgeBackgroundColor({color: [255,0,0,100]});
            }
            setTimeout(check, interval);
        }, 'json').error(function() {
            window.counts = {};
            
            chrome.browserAction.setBadgeText({text: ''});
            setTimeout(check, interval);
        });
    };
    
    check();
    
    var friendRequests = function() {
        $.get('https://www.facebook.com/friends/requests/', function(res) {
            try {
                var page = $(res);
                friendRequestCount = parseInt(page.find('h2').eq(0).text().match(/[0-9]+/)[0]);
                setTimeout(friendRequests, 120000);
				if (oldFriendRequestCount != friendRequestCount) {
					oldFriendRequestCount = friendRequestCount;
				}
            } catch(e) {
                friendRequestCount = 0;
				oldFriendRequestCount = 0;
                setTimeout(friendRequests, 120000);
            }
        }).error(function() {
            friendRequestCount = 0;
			oldFriendRequestCount = 0;
            setTimeout(friendRequests, 120000);
        });
    }
    
    friendRequests();
});