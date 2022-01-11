# This Python file uses the following encoding: utf-8

# Ez a script felelős az s2protocol különfajta macerás structjaiból
# kigyűjteni a hasznos adatokat
#
# Egyenlőre ezt szedi ki:
# Header infók
# Játékosok (előreszedve a favPlayer-t) és a pid-jük
# Tracker events, fókuszálva pár hasznos infóra
#
# Tracker event attribs:
# pid,frame,name,unit,upgrade ; original,killer 
# workers,food,totalmined
#
# Ez később bővíthető, csak szórakozni kell a main adatstruktúrákkal
# az eredet struktok a ['raw']-ba vannak rakva

import mpyq,sys,math,os
from s2protocol import versions
import datetime
from stat import ST_CTIME

class Event():
    def __init__(self):
        self.name=""

class Unit():
    def __init__(self,name="",pid=0):
        self.name=name
        self.pid=pid

class Replay():
    def __init__(self):
        self.header={}
        self.players=[]
        self.pOrder=[]
        self.trackerEvents=[]

unitbank={}
def pushUnit(uid,name,pid):
    #print("unit stored:["+str(uid)+"]"+name)
    unitbank[uid].name=name
    unitbank[uid].pid=pid

TYPERESOLVER={
    "NNet.Replay.Tracker.SPlayerStatsEvent":"PlayerStatsEvent",
    "NNet.Replay.Tracker.SUnitBornEvent":"UnitBornEvent",
    "NNet.Replay.Tracker.SUnitDiedEvent":"UnitDiedEvent",
    "NNet.Replay.Tracker.SUnitTypeChangeEvent":"UnitTypeChangeEvent",
    "NNet.Replay.Tracker.SUnitInitEvent":"UnitInitEvent",
    "NNet.Replay.Tracker.SUnitDoneEvent":"UnitDoneEvent",
    "NNet.Replay.Tracker.SUpgradeEvent":"UpgradeEvent",
}
def resolveTEType(t):
    return TYPERESOLVER.get(t,"unknownType")

def format_loop(loop):
    REALTIME_GAMELOOP_SECONDS=1/22.4
    time=int(math.floor(loop*REALTIME_GAMELOOP_SECONDS))
    out=str(math.floor(time/60))+":"+str(math.floor(time%60/10))+str(math.floor(time%10))
    return(out)

# Python 3's sylliness
def p3str(bytestring):
    return(str(bytestring,'utf-8'))

def convert_tracker_event(te):
    ite=Event()
    ite.name=resolveTEType(te['_event'])
    ite.pid=0
    ite.frame=te['_gameloop']
    if(ite.name=="UnitBornEvent" or ite.name=="UnitInitEvent"):
        ite.pid=te['m_controlPlayerId']
        ite.unit=p3str(te['m_unitTypeName'])
        if('m_creatorAbilityName' in te and te['m_creatorAbilityName']):
            if(p3str(te['m_creatorAbilityName']).startswith("Halluc")):
                ite.unit="Hallucination"
        if(te['m_unitTagIndex'] not in unitbank):
            unitbank[te['m_unitTagIndex']]=Unit()
        pushUnit(te['m_unitTagIndex'],ite.unit,ite.pid)
    elif(ite.name=="UnitDiedEvent" or ite.name=="UnitDoneEvent"):
        uid=te['m_unitTagIndex']
        ite.pid=unitbank[uid].pid
        ite.unit=unitbank[uid].name
        if(ite.name=="UnitDiedEvent"):
            ite.killer=te['m_killerPlayerId']
    elif(ite.name=="UnitTypeChangeEvent"):
        uid=te['m_unitTagIndex']
        ite.pid=unitbank[uid].pid
        ite.original=unitbank[uid].name
        ite.unit=p3str(te['m_unitTypeName'])
        pushUnit(uid,ite.unit,ite.pid)
    elif(ite.name=="UpgradeEvent"):
        ite.pid=te['m_playerId']
        ite.upgrade=p3str(te['m_upgradeTypeName'])
    elif(ite.name=="PlayerStatsEvent"):
        ite.pid=te['m_playerId']
        ite.workers=te['m_stats']['m_scoreValueWorkersActiveCount']
        ite.food=te['m_stats']['m_scoreValueFoodUsed']/4096
        ite.losses=te['m_stats']['m_scoreValueMineralsLostArmy']
        ite.losses+=te['m_stats']['m_scoreValueMineralsLostEconomy']
        ite.losses+=te['m_stats']['m_scoreValueMineralsLostTechnology']
        ite.losses+=te['m_stats']['m_scoreValueVespeneLostArmy']
        ite.losses+=te['m_stats']['m_scoreValueVespeneLostEconomy']
        ite.losses+=te['m_stats']['m_scoreValueVespeneLostTechnology']
        ite.losses+=te['m_stats']['m_scoreValueMineralsFriendlyFireArmy']
        ite.losses+=te['m_stats']['m_scoreValueMineralsFriendlyFireEconomy']
        ite.losses+=te['m_stats']['m_scoreValueMineralsFriendlyFireTechnology']
        ite.losses+=te['m_stats']['m_scoreValueVespeneFriendlyFireArmy']
        ite.losses+=te['m_stats']['m_scoreValueVespeneFriendlyFireEconomy']
        ite.losses+=te['m_stats']['m_scoreValueVespeneFriendlyFireTechnology']

        ite.totalmined=0
        for key in te['m_stats']:
            if("Killed" not in key and ("Minerals" in key or "Vespene" in key)):
                ite.totalmined+=te['m_stats'][key]


    return ite

def load_replay(repFile,myName):
    replay=Replay()
    # s2prot
    archive=mpyq.MPQArchive(repFile)

    contents= archive.header['user_data_header']['content']
    header=versions.latest().decode_replay_header(contents)
    baseBuild=int(header['m_version']['m_baseBuild'])
    #protocol=versions.build(baseBuild) # a baseBuildnek kéne lennie, crappy workaround
    protocol=versions.latest()

    contents= archive.read_file("replay.tracker.events")
    trackerEvents=protocol.decode_replay_tracker_events(contents)

    contents= archive.read_file("replay.details")
    details=protocol.decode_replay_details(contents)

    contents= archive.read_file("replay.initData")
    initData=protocol.decode_replay_initdata(contents)

    # players fill up
    def res(r):
        if(r==1):
            return "Win"
        elif(r==2):
            return "Loss"
        else:
            return "Tie"
    myName="Fedak"
    plOrder=[]
    plData=[]
    pnum=0
    for p in details['m_playerList']:
        pnum=pnum+1
        pref,succ,pname=p3str(p['m_name']).partition("<sp/>")
        if not succ: pname=pref

        if(pname==myName):
            plOrder.insert(0,pnum)
            plData.insert(0,{'name':pname,'race':p3str(p['m_race']),'result':res(p['m_result'])})
        else:
            plOrder.append(pnum)
            plData.append({'name':pname,'race':p3str(p['m_race']),'result':res(p['m_result'])})
    replay.players=plData
    replay.pOrder=plOrder

    # header fill up

    isLadder=initData['m_syncLobbyState']['m_gameDescription']['m_gameOptions']['m_competitive']
    typ="Other"
    for p in plData:
        if(p['name']==myName):
            typ=="Custom"
            if(isLadder): typ="Ladder"
            if(len(plData)==1): typ="Practice"
        if("A.I." in p['name']): typ="Practice"
    mu="custom"
    if(len(plData)==1): mu=plData[0]['race'][0]
    if(len(plData)==2): mu=plData[0]['race'][0]+"v"+plData[1]['race'][0]
    mapname=p3str(details['m_title'])
    date_=datetime.datetime.fromtimestamp(os.path.getmtime(repFile))
    #date_=datetime.datetime.fromtimestamp(details['m_timeUTC']+details['m_timeLocalOffset'])
    #print(date.fromtimestamp(date_))
    length=format_loop(header['m_elapsedGameLoops'])
    result=plData[0]['result']

    replay.header={
        'date':date_.strftime("%Y-%m-%d %H:%M:%S"),
        'map':mapname,
        'length':length,
        'file':repFile,
        'type':typ,
        'result':result,
        'mu':mu
    }
    #Tracker events fill
    unitbank={}
    replay.trackerEvents=[]
    for te in trackerEvents:
        replay.trackerEvents.append(convert_tracker_event(te))

    return replay

def main(args):
    out=open("testIP.json","w")
    print(args[1])
    rep=load_replay(args[1],"Fedak")
    tmp=[]
    for te in rep.trackerEvents:
        tmp.append(te.__dict__)
    rep.trackerEvents=tmp
    import json
    json.dump(rep.__dict__,out,indent=4)
    out.close()
    return
    #print(json.dumps(pRep,indent=4))

if __name__=="__main__":
    main(sys.argv)