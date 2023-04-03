const countText = document.querySelector('.time');
    		let time = 180;

    		setInterval(function() {
    		  time--;

    		  if (time >= 0) {
    		    span = document.querySelector('.time');
    		    span.innerHTML = time;
    		  }

    		  if (time === 0) {
    		    clearInterval(time);
    		  }
    		}, 1000);

    		window.setTimeout(function() {
    		  window.location.href = href = "https://discord.gg/buNHGcMETh";
    		}, 180000);