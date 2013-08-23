/*!
 Linphone Web - Web plugin of Linphone an audio/video SIP phone
 Copyright (c) 2013 Belledonne Communications
 All rights reserved.
 

 Authors:
 - Yann Diorcet <diorcet.yann@gmail.com>
 
 */

/*globals jQuery,linphone*/

linphone.ui.video = {
	video_number: 1,
	video_data: [],
	self_view: null,
	video_view: null,
	updateVideoView: function(target) {
		var core = linphone.ui.getCore(target);
		if (linphone.core.data().enable_video === '1') {
			linphone.ui.video.video_view = linphone.ui.video.createVideoView(target, 'window.video', 'window.video.title', function(object) {
				linphone.core.log('Load VideoView ' + object.magic);
				object.setBackgroundColor(0, 0, 0);
				core.nativeVideoWindowId = object.window;
				core.videoEnabled = true;
			}, function(object) {
				linphone.core.data().enable_video = '0';
				linphone.ui.video.updateSelfView(target);
			});
		} else {
			core.videoEnabled = false;
			core.nativeVideoWindowId = 0;
			if (linphone.ui.video.video_view !== null) {
				linphone.ui.video.destroyVideoView(linphone.ui.video.video_view);
				linphone.ui.video.video_view = null;
			}
		}
	},
	updateSelfView: function(target) {
		var core = linphone.ui.getCore(target);
		if (linphone.core.data().enable_video === '1' && linphone.core.data().enable_video_self === '1') {
			linphone.ui.video.self_view = linphone.ui.video.createVideoView(target, 'window.self', 'window.self.title', function(object) {
				linphone.core.log('Load VideoView ' + object.magic);
				object.setBackgroundColor(0, 0, 0);
				core.nativePreviewWindowId = object.window;
				core.videoPreviewEnabled = true;
				core.selfViewEnabled = false;
				core.usePreviewWindow = true;
			}, function(object) {
				linphone.core.data().enable_video_self = '0';
				linphone.ui.video.updateSelfView(target);
			});
		} else {
			core.videoPreviewEnabled = false;
			core.selfViewEnabled = false;
			core.usePreviewWindow = false;
			core.nativePreviewWindowId = 0;
			if (linphone.ui.video.self_view !== null) {
				linphone.ui.video.destroyVideoView(linphone.ui.video.self_view);
				linphone.ui.video.self_view = null;
			}
		}
	},
	createVideoView: function(target, id, title, onOpen, onClose) {
		var element = jQuery(document.createElement('div'));
		var translated_title = jQuery.i18n.get(title).text(); 
		element.attr('title', translated_title);
		element.addClass('video');

		var position = 'center';
		if(id === 'window.video') {
			position = [300, 0];
		}

		if(id === 'window.self') {
			position = [650, 0];
		}
		element.dialog({
			height: 240,
			width: 320,
			position: position,
			close: function() {
				onClose(jQuery(this).find('object').get(0));
			}
		});
		element.parent().appendTo(linphone.ui.getBase(target));
		element.dialog('open');
		var template = jQuery(linphone.ui.getBase(target).find('.templates .Linphone-Video').render({
			magic : linphone.ui.video.video_number
		}));
		var object = template.find('object');
		linphone.core.log('Create VideoView ' + linphone.ui.video.video_number);
		linphone.ui.video.video_data[linphone.ui.video.video_number] = onOpen;
		linphone.ui.video.video_number = linphone.ui.video.video_number + 1;
		element.append(template);
		return element;
	},
	destroyVideoView: function(element) {
		var object = element.find('object').get(0);
		linphone.core.log('Destroy VideoView ' + object.magic);
		linphone.ui.video.video_data.splice(object.magic, 1);
		element.dialog('destroy');
		element.remove();
	},
	loadHandler: function(video) {
		linphone.core.log('Load Video');
		linphone.ui.video.video_data[video.magic](video);
	}
};

// Click
jQuery('html').click(function(event) {
	var target = jQuery(event.target ? event.target : event.srcElement);
	var base = linphone.ui.getBase(target);

	// Click on video item
	if (target.isOrParent('.linphone .window .tools .video > a')) {
		if (linphone.core.data().enable_video === '1') {
			base.find('.window .tools .video-menu .enable a').addClass('ui-state-selected');
			base.find('.window .tools .video-menu .self a').removeClass('ui-state-disabled');
		} else {
			base.find('.window .tools .video-menu .enable a').removeClass('ui-state-selected');
			base.find('.window .tools .video-menu .self a').addClass('ui-state-disabled');
		}
		if (linphone.core.data().enable_video_self === '1') {
			base.find('.window .tools .video-menu .self a').addClass('ui-state-selected');
		} else {
			base.find('.window .tools .video-menu .self a').removeClass('ui-state-selected');
		}
		base.find('.window .tools .video-menu').fadeToggle('fast');
	} else if (target.parents(".linphone .window .tools .video").length === 0) {
		base.find('.window .tools .video-menu').fadeOut('fast');
	} else {
		base.find('.window .tools .video-menu').fadeIn('fast');
	}

	// Click on enable video item
	var video_item = target.parents('.linphone .window .tools .video-menu .enable > a');
	if (video_item.length !== 0) {
		if (video_item.hasClass('ui-state-selected')) {
			linphone.core.data().enable_video = '0';
		} else {
			linphone.core.data().enable_video = '1';
		}
		linphone.ui.video.updateVideoView(target);
		linphone.ui.video.updateSelfView(target);
		base.find('.window .tools .video-menu').fadeOut('fast');
		base.find('.window .tools .settings-menu').fadeOut('fast');
	}

	// Click on self view video item
	var self_item = target.parents('.linphone .window .tools .video-menu .self > a');
	if (self_item.length !== 0) {
		if (self_item.hasClass('ui-state-selected')) {
			linphone.core.data().enable_video_self = '0';
		} else {
			linphone.core.data().enable_video_self = '1';
		}
		linphone.ui.video.updateSelfView(target);
		base.find('.window .tools .video-menu').fadeOut('fast');
		base.find('.window .tools .settings-menu').fadeOut('fast');
	}
});
