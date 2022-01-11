import json,os,sys,pprint
import s2pinterpreter_p3
from modules.mRace import mRace
from modules.mUnits import mUnits
from modules.mBuildings import mBuildings
from modules.mUpgrades import mUpgrades
from modules.mEarlyUnitsLost import mEarlyUnitsLost
from modules.mLossesTracker import mLossesTracker

mods=[mRace(),mUnits(),mBuildings(),mUpgrades(),mEarlyUnitsLost(),mLossesTracker()]

def parse(repFile,myName="Fedak"):
    
    try:
        replay=s2pinterpreter_p3.load_replay(repFile,myName)
    except:
        print(repFile+' not valid replay file')
        return 0
    out={}
    out['header']=replay.header
    out['players']=replay.players

    for m in mods:
        m.reset(replay.pOrder)

    for e in replay.trackerEvents:
        if(e.pid in replay.pOrder):
            for m in mods:
                m.feed(e)
    
    for m in mods:
        m.finish(out)
    
    return out


def main(args):
    pRep=parse(args[1])
    pprint.pprint(pRep)
    json.dump(pRep,open("test.json","w"),indent=4)
    #print(json.dumps(pRep,indent=4))

if __name__=="__main__":
    main(sys.argv)