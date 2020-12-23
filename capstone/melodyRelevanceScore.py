import copy

def transpose(notes, amount):
    for i in range(len(notes)):
        notes[i]["note"]+=amount
    return notes

def stretch(notes, amount):
    for i in range(len(notes)):
        notes[i]["pressTime"]*=amount
        notes[i]["releaseTime"]*=amount
    return notes

def time_displace(notes, amount):
    for i in range(len(notes)):
        notes[i]["pressTime"]+=amount
        notes[i]["releaseTime"]+=amount
    return notes

def melody_info(notes):
    highest_note=notes[0]["note"]
    lowest_note=highest_note
    for i in range(len(notes)):
        if notes[i]["note"]>highest_note:
            highest_note=notes[i]["note"]
        elif notes[i]["note"]<lowest_note:
            lowest_note=notes[i]["note"]
    return (lowest_note, highest_note)


def score(melody_notes, song_notes, used_notes):
    if len(melody_notes)>16:
        new_melody_notes=copy.deepcopy(melody_notes[len(melody_notes)-16:])
        new_melody_notes=time_displace(new_melody_notes, -new_melody_notes[0]["pressTime"])
    else:
        new_melody_notes=copy.deepcopy(melody_notes)
    info=melody_info(new_melody_notes)
    lowest_note=info[0]
    highest_note=info[1]
    net_length=new_melody_notes[-1]["releaseTime"]
    end_time=song_notes[-1]["releaseTime"]
    # print(end_time)
    best_best_best_score=0
    best_best_best_info=[0,1,0]
    for transpose_amt in range(-21-lowest_note, 16-highest_note):
        active_notes=0
        chance=0
        for i in range(len(new_melody_notes)):
            if new_melody_notes[i]["note"]+transpose_amt in used_notes:
                active_notes+=1
                if active_notes/len(new_melody_notes)>0.6:
                    chance=1
                    break
            if (i-active_notes)/len(new_melody_notes)>0.4:
                break
        if not chance:
            continue
        best_best_score=0
        best_best_info=[0,1,0]
        new_notes_t=transpose(copy.deepcopy(new_melody_notes), transpose_amt)
        for stretch_amt in range(3, 7):
            best_score=0
            best_info=[0,1,0]
            new_notes_s=stretch(copy.deepcopy(new_notes_t), stretch_amt/5.0)
            for p in new_notes_s:
                for q in song_notes:
                    score=0
                    time_displacement=q["pressTime"]-p["pressTime"]
                    if time_displacement<0 or new_notes_s[-1]["pressTime"]+time_displacement>end_time:
                        continue
                    new_notes=time_displace(copy.deepcopy(new_notes_s), time_displacement)
                    n=0
                    for i in range(len(new_notes)):
                        press_time=new_notes[i]["pressTime"]
                        if i+1==len(new_notes):
                            release_time=new_notes[i]["releaseTime"]
                        else:
                            release_time=new_notes[i+1]["pressTime"]
                        while n<len(song_notes):
                            if song_notes[n]["pressTime"]<release_time:
                                if n+1<len(song_notes):
                                    if song_notes[n+1]["pressTime"]>press_time:
                                        if song_notes[n]["note"]==new_notes[i]["note"]:
                                            score+=(release_time-press_time)-((song_notes[n]["pressTime"]-press_time)*int((song_notes[n]["pressTime"]-press_time)>0))-((release_time-song_notes[n+1]["pressTime"])*int((release_time-song_notes[n+1]["pressTime"])>0))
                                            # print(score)
                                    if song_notes[n+1]["pressTime"]>release_time:
                                        break
                                else:
                                    if song_notes[n]["releaseTime"]>press_time:
                                        if song_notes[n]["note"]==new_notes[i]["note"]:
                                            score+=(release_time-press_time)-(song_notes[n]["pressTime"]-press_time)*int((song_notes[n]["pressTime"]-press_time)>0)-((release_time-song_notes[n]["releaseTime"])*int((release_time-song_notes[n]["releaseTime"])>0))
                                            # print(score)
                                    if song_notes[n]["releaseTime"]>release_time:
                                        break
                                n+=1
                            else:
                                break
                    if score>best_score:
                        best_score=score
                        best_info[0]=transpose_amt
                        best_info[1]=stretch_amt
                        best_info[2]=time_displacement
            if best_score>best_best_score:
                best_best_score=best_score
                best_best_info[0]=best_info[0]
                best_best_info[1]=best_info[1]
                best_best_info[2]=best_info[2]
        if best_best_score>best_best_best_score:
            best_best_best_score=best_best_score
            best_best_best_info[0]=best_best_info[0]
            best_best_best_info[1]=best_best_info[1]
            best_best_best_info[2]=best_best_info[2]
    print("Best Score: ", best_best_best_score/net_length, "\n", best_best_best_info)
    return (best_best_best_score/(net_length*best_best_best_info[1]/5.0), best_best_best_info[0], best_best_best_info[2]/(best_best_best_info[1]/5.0))
