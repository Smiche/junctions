var musicArray = [];

function initMusic(successCallback) {

	var context = new AudioContext();

	$.ajax({
		url: "https://api.vk.com/method/wall.get",
		data: {
			"method":"wall.get",
			"param_count":20,
			"param_domain":"tgradio",
			"param_extended":0,
			"param_filter":"owner",
			"param_offset":0,
			"param_v":5.60,
			"owner_id":-105963629
		},
		dataType: "jsonp",
		complete: function(data) {
			if(data.statusText != "success") {
				throw new Error("Request to VK doesn't work");
			}

			var posts = data.responseJSON.response;
			var attachments = _.map(posts, function(post) {
				if(!post.attachments) {
					return [];
				} else {
					return _.filter(post.attachments, function(attachment) {
						return attachment.type == 'audio' && attachment.audio.url;
					})
				}
			})

			attachments = _.filter(attachments, function(array) { return array.length > 0 })
			var songcounter = 0;
			console.log("Will load " + attachments.length + " tracks from Tiger Style group.");
			_.each(attachments, function(audios, i) {
				var rand = parseInt(Math.floor(Math.random() * audios.length));

				_.each(audios, function(audioNode, j) {

					if (songcounter <= 3 && audioNode.audio.duration <= 360) {
						var url = audioNode.audio.url;
						songcounter++;
						setTimeout(function () {
							var request = new XMLHttpRequest();
							request.open('GET', url, true);
							request.responseType = 'arraybuffer';

							// Decode asynchronously
							request.onload = function () {
								context.decodeAudioData(request.response, function (buffer) {
									musicArray.push(buffer);
									if (musicArray.length == 1) {
										successCallback();
									}
								}, function () {
									console.error("Decode from " + url + " failed");
								});
							};

							request.send();

						}, i * 20000);
					}else{
					}
				});
			})
		}
	})
}
