document.addEventListener("DOMContentLoaded", ()=>{



_TOUCHED_POINTS = [], // This array will hold the active touch points

window.addEventListener('pointerdown', function(e) {
	_TOUCHED_POINTS.push({ pointer_id: e.pointerId});
});

window.addEventListener('pointerup', function(e) {
	// On each pointerup we find the current pointer from the array (pointer id helps in finding the specific pointer)
	var index = _TOUCHED_POINTS.findIndex(function(point, index) {
		if(point.pointer_id == e.pointerId)
			return true;
	});

	// Current pointer is removed from the array
	_TOUCHED_POINTS.splice(index, 1);

});



  function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;}

  let audioCtx = new AudioContext();
  let osc = audioCtx.createOscillator();
  var gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  osc.start();
  document.getElementById('content').style.opacity=1;

  var isRecording = false;
  var isPlaying = false;
  let recordedNotes = [];
  let songResultNotes = [];
  let recordBtn=document.getElementById('record-btn');
  let playBtn=document.getElementById('play-btn');
  let songPlayBtn=document.getElementById('song-play-btn');
  let searchBtn=document.getElementById('search-btn');
  let uploadBtn=document.getElementById('upload-btn');
  let pseudoUploadBtn=document.getElementById('pseudo-upload-btn');
  let downloadBtn=document.getElementById('download-btn');
  let songDownloadBtn=document.getElementById('song-download-btn');
  let resultsBackBtn=document.getElementById('results-back-btn');

  document.getElementsByClassName('left-arrow')[0].onclick=()=>{
    if (document.getElementById('narrow-keyboard-container').dataset.oct>3)
    {
      for(const key of document.getElementsByClassName('narrowkey'))
      {
        key.setAttribute('data-oct', parseInt(key.dataset.oct)-1);
      }
      document.getElementById('narrow-keyboard-container').setAttribute('data-oct', parseInt(document.getElementById('narrow-keyboard-container').dataset.oct)-1)
    }
    if (document.getElementById('narrow-keyboard-container').dataset.oct<=3)
    {
      document.getElementsByClassName('left-arrow')[0].firstElementChild.style.opacity=0.5;
    }
    else {
      document.getElementsByClassName('right-arrow')[0].firstElementChild.style.opacity=1;
    }
  }

  document.getElementsByClassName('right-arrow')[0].onclick=()=>{
    if (document.getElementById('narrow-keyboard-container').dataset.oct<5)
    {
      for(const key of document.getElementsByClassName('narrowkey'))
      {
        key.setAttribute('data-oct', parseInt(key.dataset.oct)+1);
      }
      document.getElementById('narrow-keyboard-container').setAttribute('data-oct', parseInt(document.getElementById('narrow-keyboard-container').dataset.oct)+1)
    }
    if (document.getElementById('narrow-keyboard-container').dataset.oct>=5)
    {
      document.getElementsByClassName('right-arrow')[0].firstElementChild.style.opacity=0.5;
    }
    else {
      document.getElementsByClassName('left-arrow')[0].firstElementChild.style.opacity=1;
    }
  }

  recordBtn.onclick=()=>{
    if (!isPlaying)
    {
      if (isRecording)
      {
        if (recordedNotes.length>0)
        {
          if (recordedNotes[recordedNotes.length-1]["releaseTime"]==0)
          {
            recordedNotes[recordedNotes.length-1]["releaseTime"]=audioCtx.currentTime;
          }
          var startTime = recordedNotes[0]["pressTime"];
          for (var i = 0; i < recordedNotes.length; i++) {
            recordedNotes[i]["pressTime"]-=startTime;
            recordedNotes[i]["releaseTime"]-=startTime;
          }
          let j=0;
          while (j<recordedNotes) {
            if (recordedNotes[j]["releaseTime"]<0) {
              delete recordedNotes[j];
            }
            else {
              j+=1;
            }
          }
          playBtn.style.backgroundColor="black";
          searchBtn.style.backgroundColor="#00cccc";
          pseudoUploadBtn.style.backgroundColor="#ff8800";
          downloadBtn.style.backgroundColor="#8800ff";
        }
        console.log(recordedNotes);
        isRecording=false;
        recordBtn.style.backgroundColor="black";
      }
      else {
        document.getElementById('count').innerHTML="0";
        document.getElementById('count').style.color="black";
        window.scrollBy(0, -(document.getElementById('counter').getBoundingClientRect())["height"]);
        document.getElementById('counter').style.display="none";
        recordedNotes = [];
        playBtn.style.backgroundColor="#888888";
        searchBtn.style.backgroundColor="#888888";
        pseudoUploadBtn.style.backgroundColor="#888888";
        downloadBtn.style.backgroundColor="#888888";
        isRecording=true;
        recordBtn.style.backgroundColor="red";
      }
    }
  }
  var playEnd;
  playBtn.onclick=()=>{
    if (!isRecording)
    {
      console.log(recordedNotes);
      if (isPlaying)
      {
        clearTimeout(playEnd);
        osc.stop()
        osc = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        osc.start();
        isPlaying=false;
        playBtn.style.backgroundColor="black";
        recordBtn.style.backgroundColor="black";
        searchBtn.style.backgroundColor="#00cccc";
        pseudoUploadBtn.style.backgroundColor="#ff8800";
        downloadBtn.style.backgroundColor="#8800ff";
      }
      else {
        if(recordedNotes.length>0)
        {
          isPlaying=true;
          searchBtn.style.backgroundColor="#888888";
          pseudoUploadBtn.style.backgroundColor="#888888";
          downloadBtn.style.backgroundColor="#888888";
          recordBtn.style.backgroundColor="#888888";
          playBtn.style.backgroundColor="green";
          gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
          osc.frequency.setValueAtTime(440*(2**(recordedNotes[0]["note"]/12.0)), audioCtx.currentTime)
          for (var i = 0; i < recordedNotes.length; i++) {
            f=440*(2**(recordedNotes[i]["note"]/12.0))
            osc.frequency.setValueAtTime(f, audioCtx.currentTime+recordedNotes[i]["pressTime"])
            gainNode.gain.setValueAtTime(1, audioCtx.currentTime+recordedNotes[i]["pressTime"]);
            if(i==recordedNotes.length-1)
            {
              gainNode.gain.setValueAtTime(0, audioCtx.currentTime+recordedNotes[i]["releaseTime"]);
            }
            else if (recordedNotes[i]["releaseTime"]!=recordedNotes[i+1]["pressTime"]) {
              gainNode.gain.setValueAtTime(0, audioCtx.currentTime+recordedNotes[i]["releaseTime"]);
            }
          }
          playEnd=setTimeout(()=>{
            osc.stop()
            osc = audioCtx.createOscillator();
            gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            osc.start();
            isPlaying=false;
            playBtn.style.backgroundColor="black";
            recordBtn.style.backgroundColor="black";
            searchBtn.style.backgroundColor="#00cccc";
            pseudoUploadBtn.style.backgroundColor="#ff8800";
            downloadBtn.style.backgroundColor="#8800ff";
          }, 1000*recordedNotes[recordedNotes.length-1]["releaseTime"]);
        }
      }
    }
  }
  songPlayBtn.onclick=()=>{
    if (isPlaying)
    {
      clearTimeout(playEnd);
      osc.stop()
      osc = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      osc.start();
      isPlaying=false;
      songPlayBtn.style.backgroundColor="black";
      songDownloadBtn.style.backgroundColor="#8800ff";
    }
    else {
      if(songResultNotes.length>0)
      {
        isPlaying=true;
        songDownloadBtn.style.backgroundColor="#888888";
        songPlayBtn.style.backgroundColor="green";
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
        osc.frequency.setValueAtTime(440*(2**(songResultNotes[0]["note"]/12.0)), audioCtx.currentTime)
        for (var i = 0; i < songResultNotes.length; i++) {
          f=440*(2**(songResultNotes[i]["note"]/12.0))
          osc.frequency.setValueAtTime(f, audioCtx.currentTime+songResultNotes[i]["pressTime"])
          gainNode.gain.setValueAtTime(1, audioCtx.currentTime+songResultNotes[i]["pressTime"]);
          if(i==songResultNotes.length-1)
          {
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime+songResultNotes[i]["releaseTime"]);
          }
          else if (songResultNotes[i]["releaseTime"]!=songResultNotes[i+1]["pressTime"]) {
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime+songResultNotes[i]["releaseTime"]);
          }
        }
        playEnd=setTimeout(()=>{
          osc.stop()
          osc = audioCtx.createOscillator();
          gainNode = audioCtx.createGain();
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          osc.start();
          isPlaying=false;
          songPlayBtn.style.backgroundColor="black";
          songDownloadBtn.style.backgroundColor="#8800ff";
        }, 1000*songResultNotes[songResultNotes.length-1]["releaseTime"]);
      }
    }
  }
  songDownloadBtn.onclick=()=>{
    if(!isPlaying && songResultNotes.length>0)
    {
      window.open(downloadViewURL+'?jsontext='+JSON.stringify({"notes":JSON.stringify(songResultNotes)}), '_blank')
    }
  }
  if (document.getElementById('logout-btn'))
  {
    pseudoUploadBtn.onclick=()=>{
      if (!isRecording && !isPlaying && recordedNotes.length>0)
      {
        if (document.getElementById('err-message'))
        {
          console.log("Here!");
          document.getElementById('err-message').remove();
        }
        document.getElementById('upload-details').style.display="block";
        pseudoUploadBtn.style.display="none";
      }
    }
  }
  document.getElementById('upload-details').addEventListener('click', e=>{
    if((!document.getElementById('upload-details-card').contains(e.target) && e.target.closest('button')!=pseudoUploadBtn) || e.target.closest('button')==document.getElementById('cancel-upload-btn'))
    {
      console.log(e.target);
      document.getElementById('upload-details').style.display="none";
      pseudoUploadBtn.style.display="inline";
    }
  });
  uploadBtn.onclick=()=>{
    let title=document.getElementById('title').value;
    let artist=document.getElementById('artist').value;
    fetch(uploadViewURL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        "X-CSRFToken": getCookie("csrftoken")
      },
      body: JSON.stringify({"notes": JSON.stringify(recordedNotes), "title": title, "artist": artist})
    })
    .then(function(res){
      if (res.ok) {
        document.getElementById('upload-details').style.display="none";
        pseudoUploadBtn.style.display="inline";
        document.getElementById('upload-details').style.display="none";
        pseudoUploadBtn.style.display="inline";
      }
      else {
        res.json().then(res=>{
          throw new Error()
        })
        .catch(()=>{
          if (!document.getElementById('err-message')) {
            let errMessage=document.createElement("P")
            errMessage.id="err-message";
            errMessage.style.color="red";
            errMessage.innerHTML="Upload failed";
            document.getElementById('upload-details-card').insertBefore(errMessage, document.getElementById('upload-details-card').childNodes[0]);;
          }
        })
      }
    })
  }
  downloadBtn.onclick=()=>{
    if(!isPlaying && !isRecording && recordedNotes.length>0)
    {
      window.open(downloadViewURL+'?jsontext='+JSON.stringify({"notes":JSON.stringify(recordedNotes)}), '_blank')
    }
  }
  searchBtn.onclick=()=>{
    if(!isPlaying && !isRecording && recordedNotes.length>0)
    {
      fetch(searchViewURL+'?jsontext='+JSON.stringify({"notes":JSON.stringify(recordedNotes)}))
        .then(response => {
          console.log(response)
          return response.json()
        })
        .then(data => {
          console.log(data);
          setTimeout(()=>{
            document.getElementById('loading').style.opacity=0;
            setTimeout(()=>{
              document.getElementById('loading').style.height=0;
              document.getElementById('result').style.height="auto";
              var innerCode;
              if (data["title"]=="")
              {
                document.getElementById('result-text').innerHTML="<p>No results found</p>";
                document.getElementById('result-button-tray').style.display="none";
              }
              else {
                document.getElementById('result-button-tray').style.display="block";
                songResultNotes=data["notes"]
                innerCode="<p class='result-header'>Best Match: <b>"+data["title"]+"</b></p><p>There's a "+(data["score"]*100).toFixed(2).toString()+"% chance that this melody was played "+(Math.abs(data["transpose"])).toString()+" semitones ";
                if (data["transpose"]>=0)
                {
                  innerCode+="higher";
                }
                else {
                  innerCode+="lower"
                }
                innerCode+=" at the "+(data["time"]).toFixed(2).toString()+" second mark in '"+data["title"]+"' by "+data["artist"]+"</p>"
                if (data["voted"]==0)
                {
                  innerCode+='<div id="feedback"><br><p style="font-size: 20px; color: #888;">Was this result helpful?</p><button id="helpful" type="button" class="btn btn-secondary" name="button">Yes</button>&nbsp;&nbsp;<button id="unhelpful" type="button" class="btn btn-secondary" name="button">No</button></div>';
                }
                document.getElementById('result-text').innerHTML=innerCode;
                if (document.getElementById('feedback'))
                {
                  document.getElementById('helpful').onclick=()=>{
                    fetch(voteURL, {
                      method: "PUT",
                      headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFToken": getCookie("csrftoken")
                      },
                      body: JSON.stringify({"helpful": true, "id": data["id"]})
                    })
                    .then(res=>{
                      if (res.ok) {
                        document.getElementById('feedback').innerHTML='<br><p style="font-size: 20px; color: #888;">Thank you for your input</p>';
                      }
                      else {
                        throw new Error();
                      }
                    })
                    .catch(()=>{
                      document.getElementById('feedback').innerHTML='<p>Was this result helpful?</p><button id="helpful" type="button" class="btn btn-secondary" name="button">Yes</button><button id="unhelpful" type="button" class="btn btn-secondary" name="button">No</button><p><small>Something went wrong. Try again.</small></p>'
                    })
                  }
                  document.getElementById('unhelpful').onclick=()=>{
                  fetch(voteURL, {
                    method: "PUT",
                    headers: {
                      'Content-Type': 'application/json',
                      "X-CSRFToken": getCookie("csrftoken")
                    },
                    body: JSON.stringify({"helpful": false, "id": data["id"]})
                  })
                  .then(res=>{
                    if (res.ok) {
                      document.getElementById('feedback').innerHTML='<br><p style="font-size: 20px; color: #888;">Thank you for your input</p>';
                    }
                    else {
                      throw new Error();
                    }
                  })
                  .catch(()=>{
                    document.getElementById('feedback').innerHTML='<p>Was this result helpful?</p><button id="helpful" type="button" class="btn btn-secondary" name="button">Yes</button><button id="unhelpful" type="button" class="btn btn-secondary" name="button">No</button><p><small>Something went wrong. Try again.</small></p>'
                  })
                }
                }
              }
              document.getElementById('result').style.opacity=1;
            }, 500);
          }, 1500);
        })
        .catch(() => {
          setTimeout(()=>{
            document.getElementById('loading').style.opacity=0;
            setTimeout(()=>{
              document.getElementById('loading').style.height=0;
              document.getElementById('result').style.height="auto";
              let innerCode="Something went wrong";
              document.getElementById('result-text').innerHTML=innerCode;
              document.getElementById('result').style.opacity=1;
            }, 500);
          }, 1500);
        })
      document.getElementById('content').style.opacity=0;
      document.getElementById('content').style.height=0;
      setTimeout(()=>{
        // document.getElementById('content').style.display="none";
        document.getElementById('loading').style.height="100vh";
        document.getElementById('loading').style.opacity=1;
      }, 1000);

    }
  }

  resultsBackBtn.onclick=()=>{
    document.getElementById('result').style.opacity=0;
    setTimeout(()=>{
      document.getElementById('result-text').innerHTML="";
      document.getElementById('result').style.height=0;
      document.getElementById('content').style.height="auto";
      document.getElementById('content').style.opacity=1;
    }, 1000);
  }


  var leftMouseButtonOnlyDown = false;
  function setLeftButtonState(e) {
    leftMouseButtonOnlyDown = e.buttons === undefined
      ? e.which === 1
      : e.buttons === 1;
  }

  document.body.onpointerdown = setLeftButtonState;
  document.body.onpointermove = setLeftButtonState;
  document.body.onpointerup = setLeftButtonState;

  let keyList=document.querySelectorAll("rect")


  let activeKey = keyList[0]

  window.addEventListener('pointerdown', function(e){
    if(e.target.classList.contains("key") && isPlaying==false && _TOUCHED_POINTS.length==1)
    {
      if(activeKey.classList.contains("white"))
      {
        activeKey.style.fill="#ffffff";
      }
      else
      {
        activeKey.style.fill="#000000";
      }
      e.target.style.fill="#ffff00";
      activeKey=e.target;
      let f = 440*(2**((parseInt(e.target.dataset.note, 10)+12*parseInt(e.target.dataset.oct, 10)-58)/12));
      osc.frequency.setValueAtTime(f, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      if(isRecording)
      {
        recordedNotes.push({"note":(parseInt(e.target.dataset.note, 10)+12*parseInt(e.target.dataset.oct, 10)-58), "pressTime": audioCtx.currentTime, "releaseTime": 0});
        if (document.getElementById('count').innerHTML=="0")
        {
          document.getElementById('counter').style.display="block";
          window.scrollBy(0, (document.getElementById('counter').getBoundingClientRect())["height"]);
        }
        document.getElementById('count').innerHTML=parseInt(document.getElementById('count').innerHTML)+1;
        if (parseInt(document.getElementById('count').innerHTML)>16) {
          document.getElementById('count').style.color="red";
        }
      }
    }
  });

  window.addEventListener('pointerup', function(e){
    if (e.target==activeKey)
    {
      if(gainNode.gain.value && isPlaying==false)
      {
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        if(isRecording && recordedNotes[recordedNotes.length-1]["releaseTime"]==0)
        {
          recordedNotes[recordedNotes.length-1]["releaseTime"]=audioCtx.currentTime;
        }
      }
      if(activeKey.classList.contains("white"))
      {
        activeKey.style.fill="#ffffff";
      }
      else
      {
        activeKey.style.fill="#000000";
      }
    }
  });

  window.addEventListener('pointercancel', function(){
    if(gainNode.gain.value && isPlaying==false)
    {
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      if(isRecording && recordedNotes[recordedNotes.length-1]["releaseTime"]==0)
      {
        recordedNotes[recordedNotes.length-1]["releaseTime"]=audioCtx.currentTime;
      }
    }
    if(activeKey.classList.contains("white"))
    {
      activeKey.style.fill="#ffffff";
    }
    else
    {
      activeKey.style.fill="#000000";
    }
  });

  for (const key of keyList)
  {
    key.addEventListener('pointerleave', function(e){
      if (activeKey==e.target)
      {
        if(gainNode.gain.value && isPlaying==false)
        {
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          if(isRecording && recordedNotes[recordedNotes.length-1]["releaseTime"]==0)
          {
            recordedNotes[recordedNotes.length-1]["releaseTime"]=audioCtx.currentTime;
          }
        }
        if(activeKey.classList.contains("white"))
        {
          activeKey.style.fill="#ffffff";
        }
        else
        {
          activeKey.style.fill="#000000";
        }
      }
    });
    key.addEventListener('pointerenter', function(e){
      if(activeKey.classList.contains("white"))
      {
        activeKey.style.fill="#ffffff";
      }
      else
      {
        activeKey.style.fill="#000000";
      }
      if (e.target.classList.contains("key"))
      {
        activeKey=e.target;
      }
      if(recordedNotes.length)
      {
        if(isRecording && (leftMouseButtonOnlyDown || _TOUCHED_POINTS>0))
        {
          recordedNotes[recordedNotes.length-1]["releaseTime"]=audioCtx.currentTime;
          recordedNotes.push({"note":(parseInt(activeKey.dataset.note, 10)+12*parseInt(activeKey.dataset.oct, 10)-58), "pressTime": audioCtx.currentTime, "releaseTime": 0});
          if (document.getElementById('count').innerHTML=="0")
          {
            document.getElementById('counter').style.display="block";
            window.scrollBy(0, (document.getElementById('counter').getBoundingClientRect())["height"]);
          }
          document.getElementById('count').innerHTML=parseInt(document.getElementById('count').innerHTML)+1;
          if (parseInt(document.getElementById('count').innerHTML)>16) {
            document.getElementById('count').style.color="red";
          }
        }
      }
      let f = 440*(2**((parseInt(e.target.dataset.note, 10)+12*parseInt(e.target.dataset.oct, 10)-58)/12));
      if ((leftMouseButtonOnlyDown || _TOUCHED_POINTS>0) && isPlaying==false)
      {
        e.target.style.fill="#ffff00";
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      }
      if (!isNaN(f) && isPlaying==false)
      {
        osc.frequency.linearRampToValueAtTime(f, audioCtx.currentTime);
      }
    });

    document.getElementById('narrow-keyboard-container').addEventListener('contextmenu', e=>{
      e.preventDefault();
    });

    document.getElementById('wide-keyboard-container').addEventListener('contextmenu', e=>{
      e.preventDefault();
    });
  }
  if (document.getElementById('pseudo-login-btn'))
  {
    document.getElementById('pseudo-login-btn').onclick=()=>{
      document.getElementById('register-error-message').innerHTML="";
      document.getElementById('login-error-message').innerHTML="";
      document.getElementById('user-control').style.display="block";
      document.getElementById('login-tab').classList.add("active");
      document.getElementById('register-tab').classList.remove("active");
      document.getElementById('login-wrapper').style.display="block";
      document.getElementById('register-wrapper').style.display="none";
    }
  }

  document.getElementById('login-tab').onclick=()=>{
    document.getElementById('register-error-message').innerHTML="";
    document.getElementById('login-error-message').innerHTML="";
    document.getElementById('login-tab').classList.add("active");
    document.getElementById('register-tab').classList.remove("active");
    document.getElementById('login-wrapper').style.display="block";
    document.getElementById('register-wrapper').style.display="none";
  }

  document.getElementById('register-tab').onclick=()=>{
    document.getElementById('register-error-message').innerHTML="";
    document.getElementById('login-error-message').innerHTML="";
    document.getElementById('register-tab').classList.add("active");
    document.getElementById('login-tab').classList.remove("active");
    document.getElementById('register-wrapper').style.display="block";
    document.getElementById('login-wrapper').style.display="none";
  }

  document.getElementById('user-control').addEventListener('click', e=>{
    if((!document.getElementById('user-control-card').contains(e.target) && e.target.closest('a')!='pseudo-login-btn') || e.target.closest('button')==document.getElementById('cancel-login-btn') || e.target.closest('button')==document.getElementById('cancel-register-btn'))
    {
      console.log(e.target);
      document.getElementById('user-control').style.display="none";
      document.getElementById('register-error-message').innerHTML="";
      document.getElementById('login-error-message').innerHTML="";
    }
  });

  if (document.getElementById('logout-btn'))
  {
    document.getElementById('logout-btn').onclick=()=>{
      fetch(logoutViewURL, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          "X-CSRFToken": getCookie("csrftoken")
        },
      })
        .then(res => {
          document.getElementById('enter-user-control').innerHTML='<a id="pseudo-login-btn" href="#">Log In / Register</a>';
          pseudoUploadBtn.style.display="none";
          pseudoUploadBtn.onclick=()=>{return false};
          document.getElementById('pseudo-login-btn').onclick=()=>{
            document.getElementById('register-error-message').innerHTML="";
            document.getElementById('login-error-message').innerHTML="";
            document.getElementById('user-control').style.display="block";
            document.getElementById('login-tab').classList.add("active");
            document.getElementById('register-tab').classList.remove("active");
            document.getElementById('login-wrapper').style.display="block";
            document.getElementById('register-wrapper').style.display="none";
          }
        }) // or res.json()
        .catch(res => console.log(res))
    }
  }

  document.getElementById('login-btn').onclick=()=>{
    let username=document.getElementById('login-username').value;
    document.getElementById('login-username').value="";
    let password=document.getElementById('login-password').value;
    document.getElementById('login-password').value="";
    fetch(loginViewURL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        "X-CSRFToken": getCookie("csrftoken")
      },
      body: JSON.stringify({"username": username, "password": password})
    })
    .then(function(res){
      if(!res.ok) {
        res.json().then(res=>{
          throw new Error(res.message)
        })
       .catch(function(message){
         document.getElementById('login-error-message').innerHTML=message;
       })
      }
      else {
        document.getElementById('user-control').style.display="none";
        document.getElementById('enter-user-control').innerHTML='<a id="logout-btn" href="#">Log Out</a>';
        pseudoUploadBtn.style.display="inline-block";
        pseudoUploadBtn.onclick=()=>{
          if (!isRecording && !isPlaying && recordedNotes.length>0)
          {
            if (document.getElementById('err-message'))
            {
              console.log("Here!");
              document.getElementById('err-message').remove();
            }
            document.getElementById('upload-details').style.display="block";
            pseudoUploadBtn.style.display="none";
          }
        }
        document.getElementById('logout-btn').onclick=()=>{
          fetch(logoutViewURL, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
              "X-CSRFToken": getCookie("csrftoken")
            },
          })
            .then(res => {
              document.getElementById('enter-user-control').innerHTML='<a id="pseudo-login-btn" href="#">Log In / Register</a>';
              pseudoUploadBtn.style.display="none";
              pseudoUploadBtn.onclick=()=>{return false};
              document.getElementById('pseudo-login-btn').onclick=()=>{
                document.getElementById('register-error-message').innerHTML="";
                document.getElementById('login-error-message').innerHTML="";
                document.getElementById('user-control').style.display="block";
                document.getElementById('login-tab').classList.add("active");
                document.getElementById('register-tab').classList.remove("active");
                document.getElementById('login-wrapper').style.display="block";
                document.getElementById('register-wrapper').style.display="none";
              }
            })
            .catch(res => console.log(res))
        }
      }
     })
  }

  document.getElementById('register-btn').onclick=()=>{
    let username=document.getElementById('register-username').value;
    document.getElementById('register-username').value="";
    let password=document.getElementById('register-password').value;
    document.getElementById('register-password').value="";
    let confirmation=document.getElementById('confirm-password').value;
    document.getElementById('confirm-password').value="";
    fetch(registerViewURL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        "X-CSRFToken": getCookie("csrftoken")
      },
      body: JSON.stringify({"username": username, "password": password, "confirmation": confirmation})
    })
    .then(function(res){
      if(!res.ok) {
        res.json().then(res=>{
          throw new Error(res.message)
        })
       .catch(function(message){
         document.getElementById('register-error-message').innerHTML=message;
       })
      }
      else {
        document.getElementById('user-control').style.display="none";
        document.getElementById('enter-user-control').innerHTML='<a id="logout-btn" href="#">Log Out</a>';
        pseudoUploadBtn.style.display="inline-block";
        pseudoUploadBtn.onclick=()=>{
          if (!isRecording && !isPlaying && recordedNotes.length>0)
          {
            if (document.getElementById('err-message'))
            {
              console.log("Here!");
              document.getElementById('err-message').remove();
            }
            document.getElementById('upload-details').style.display="block";
            pseudoUploadBtn.style.display="none";
          }
        }
        document.getElementById('logout-btn').onclick=()=>{
          fetch(logoutViewURL, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
              "X-CSRFToken": getCookie("csrftoken")
            },
          })
            .then(res => {
              document.getElementById('enter-user-control').innerHTML='<a id="pseudo-login-btn" href="#">Log In / Register</a>';
              pseudoUploadBtn.style.display="none";
              pseudoUploadBtn.onclick=()=>{return false};
              document.getElementById('pseudo-login-btn').onclick=()=>{
                document.getElementById('register-error-message').innerHTML="";
                document.getElementById('login-error-message').innerHTML="";
                document.getElementById('user-control').style.display="block";
                document.getElementById('login-tab').classList.add("active");
                document.getElementById('register-tab').classList.remove("active");
                document.getElementById('login-wrapper').style.display="block";
                document.getElementById('register-wrapper').style.display="none";
              }
            })
            .catch(res => console.log(res))
        }
      }
     })
  }
})
