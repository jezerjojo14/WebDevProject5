from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render
from .models import Song
from django.http import HttpResponse, HttpResponseRedirect, Http404, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .melodyRelevanceScore import score
from mido import Message, MidiFile, MidiTrack, MetaMessage
from django.contrib.staticfiles.storage import staticfiles_storage
from django.contrib.staticfiles import finders
import os
from django.contrib.auth.models import User
from django.db import IntegrityError

# Create your views here.

def upload_melody(request):
    data=json.loads(request.body.decode('utf-8'))
    if request.user.is_authenticated and data["title"]!="":
        title=data['title']
        artist=data['artist']
        if artist=="":
            artist="Unknown Artist"
        notes=json.loads(data['notes'])
        user=request.user
        used_notes=[]
        for note in notes:
            if note["note"] not in used_notes:
                used_notes+= [note["note"]]
        try:
            song=Song(title=title, artist=artist, user=user, notes=json.dumps(notes), used_notes=json.dumps(used_notes))
            song.save()
            return HttpResponse(status=201)
        except:
            return HttpResponse(status=500)
    else:
        return HttpResponse(json.dumps({"message": "Upload unsuccessful", "status": 403}), status=403)

def search_melody(request):
    data=json.loads(request.GET.get('jsontext'))
    notes=json.loads(data["notes"])
    print("Original notes: ", notes)
    d={}
    for song in Song.objects.all():
        print(song.title)
        d[song.id]=int(song.credibility>0.01)*(score(notes, json.loads(song.notes), json.loads(song.used_notes))[0])*(song.credibility**(0.5))
    if len(d)==0:
        print({"title": ""})
        return JsonResponse({"title": ""})
    d=dict(sorted(d.items(), key=lambda item: item[1], reverse=True))
    song=Song.objects.get(id=list(d)[0])
    if d[song.id]==0:
        print({"title": ""})
        return JsonResponse({"title": ""})
    response={"voted": int((request.user in song.votes.all()) or (not request.user.is_authenticated)), "id": song.id, "title": song.title, "artist": song.artist, "uploader": song.user.username, "notes": json.loads(song.notes), "score": d[song.id], "transpose": score(notes, json.loads(song.notes), json.loads(song.used_notes))[1], "time": score(notes, json.loads(song.notes), json.loads(song.used_notes))[2]}
    print(response)
    return JsonResponse(response)

def download_melody(request):
    data=json.loads(request.GET.get('jsontext'))
    notes=json.loads(data["notes"])
    mid = MidiFile(type=1, ticks_per_beat=5000)
    track = MidiTrack()
    mid.tracks.append(track)
    track.append(Message('program_change', program=12, time=0))
    track.append(Message('note_on', note=notes[0]["note"]+69, velocity=64, time=int(10000*notes[0]["pressTime"])))
    track.append(Message('note_off', note=notes[0]["note"]+69, velocity=127, time=int(10000*(notes[0]["releaseTime"]-notes[0]["pressTime"]))))
    for i in range(1, len(notes)):
        track.append(Message('note_on', note=notes[i]["note"]+69, velocity=64, time=int(10000*(notes[i]["pressTime"]-notes[i-1]["releaseTime"]))))
        track.append(Message('note_off', note=notes[i]["note"]+69, velocity=127, time=int(10000*(notes[i]["releaseTime"]-notes[i]["pressTime"]))))
    j=0
    while os.path.isfile(staticfiles_storage.url('temp_midi/temp'+str(j))):
        j+=1
    file=open(os.path.join(finders.find(os.path.join('capstone','temp_midi')),'temp'+str(j)+'.mid'), 'wb')
    mid._save(file)
    mid.save("melody.mid")
    file.close()
    file=open(os.path.join(finders.find(os.path.join('capstone','temp_midi')),'temp'+str(j)+'.mid'), 'rb')
    response = HttpResponse(file.read())
    response['Content-Type'] = 'text/plain'
    response['Content-Disposition'] = 'attachment; filename=melody.mid'
    file.close()
    return response



def index(request):
    return render(request, "capstone/index.html")


def login_view(request):

    # Attempt to sign user in

    data=json.loads(request.body.decode('utf-8'))
    username = data["username"]
    password = data["password"]
    user = authenticate(request, username=username, password=password)

    # Check if authentication successful
    if user is not None:
        login(request, user)
        return HttpResponse(json.dumps({"message": "Login successful", "status": 201}), status=201)
    else:
        return HttpResponse(json.dumps({"message": "Login unsuccessful", "status": 401}), status=401)


def logout_view(request):
    logout(request)
    return HttpResponse(status=204)


def register(request):
    data=json.loads(request.body.decode('utf-8'))

    username = data["username"]

    # Ensure password matches confirmation
    password = data["password"]
    confirmation = data["confirmation"]
    if password != confirmation:
        return HttpResponse(json.dumps({"message": "Passwords must match"}), status=401)
    if len(password) < 8:
        return HttpResponse(json.dumps({"message": "Passwords must have at least 8 characters"}), status=401)

    if username=="":
        return HttpResponse(json.dumps({"message": "Username can't be left blank"}), status=401)

    # Attempt to create new user
    try:
        user = User.objects.create_user(username, password=password)
        user.save()
    except IntegrityError:
        return HttpResponse(json.dumps({"message": "Username already taken"}), status=401)
    login(request, user)
    return HttpResponse(status=201)

def vote(request):
    data=json.loads(request.body.decode('utf-8'))
    song=Song.objects.get(id=data["id"])
    song.credibility=(song.credibility*(len(song.votes.all())+2)+data["helpful"])/(len(song.votes.all())+3)
    song.votes.add(request.user)
    if song.credibility<=0.01:
        song.delete()
    return HttpResponse(status=200)


# #Profile
#
#
# def profile(request, username, page=1):
#     user=User.objects.get(username=username)
#     songs=Paginator(Song.objects.all().filter(user=user).order_by("-time"), 10)
#     if page not in songs.page_range:
#         raise Http404
#     return render(request, "capstone/profile.html", {"profile_user": user, "uploads": songs.page(page), "page": page, "pagecount": posts.num_pages})
#
# def profile_page(request, username, page):
#     if page==1:
#         return HttpResponseRedirect(reverse("profile", kwargs={'username':username}))
#     return profile(request, username, page)
