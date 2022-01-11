from stat import ST_CTIME
import sc2reader,json,os,math,hashlib,pymongo

class Units_counter:
    def __init__(self,startUnits={}):
        self.units=dict(startUnits)
    def push(self,unit,num):
        if(unit not in self.units.keys()):
            self.units[unit]=0
        self.units[unit]+=num

class Fight:
    def __init__(self,startTime,startUnits):
        self.start=startTime
        self.finish=startTime
        self.units_start=[0,Units_counter(startUnits[1].units),Units_counter(startUnits[2].units)]
        self.units_lost=[0,Units_counter(),Units_counter()]
    def checkFinish(self,time):
        if(time>self.finish+15):
            return(True)
        else:
            return(False)
    def pushUnitLost(self,time,player,unit):
        self.finish=time
        self.units_lost[player].push(unit,-1)
    def get_dict(self):
        return({
            "start":self.start,
            "end":self.finish,
            "start_units":[self.units_start[1].units,self.units_start[2].units],
            "lost_units":[self.units_lost[1].units,self.units_lost[2].units],
    })

class Player_data_collector:
    def __init__(self,name,race,win):
        self.name=name
        self.race=race
        self.result=win
        self.start_bo=[]
        self.units=[]
        self.units_t=[]
        self.killed_early_units=Units_counter()
        self.workers=0
        self.bestworkers=0
        self.lastworker=0
        self.worker_stops=""

        self.unit_list=[]
        self.build_list=[]
        self.upgrade_list=[]
        self.worker_active_graph=[]
        self.supply_graph=[]

        self.fights=[]
        self.lastfight=False
        self.unit_count_track_for_fight_starts=Units_counter()
    #Setters for managing fights
    def track_unit(self,unit,num):
        self.unit_count_track_for_fight_starts.push(unit,num)
    def track_unit_lost(self,unit,timing):
        if(not self.lastfight):
            self.lastFight=Fight(timing,self.unit_count_track_for_fight_starts)
        if(self.lastFight.checkFinish(timing)):
            self.fights.append(self.lastFight)
            self.lastFight=Fight(timing,self.unit_count_track_for_fight_starts)
        self.lastFight.pushUnitLost(timing,0,unit)
    #Setters for details
    def push_unit(self,unit,timing):
        self.unit_list.append({'timing':timing,'unit':unit})
    def push_building(self,unit,timing):
        self.build_list.append({'timing':timing,'unit':unit})
    def push_upgrade(self,unit,timing):
        self.upgrade_list.append({'timing':timing,'unit':unit})
    def push_workers_active(self,num,timing):
        self.worker_active_graph.append([timing,num])
    def push_supply(self,num,timing):
        self.supply_graph.append([timing,num])
    #Setters for start bo, units made, killed early and worker stops
    def add_to_start_bo(self,unit):
        if(len(self.start_bo)<6):
            self.start_bo.append(unit)
    def add_to_units(self,unit,timing):
        if(unit not in self.units):
            self.units.append(unit)
            self.units_t.append({'name':unit,'timing':timing})
    def add_to_killed_early(self,unit):
        self.killed_early_units.push(unit,-1)
    def add_worker(self,timing):
        if(self.lastworker+60<timing and self.workers==self.bestworkers):
            self.worker_stops+=str(self.workers)+">"
        self.lastworker=timing
        self.workers+=1
        if(self.workers>self.bestworkers):
            self.bestworkers=self.workers
    def kill_worker(self):
        self.workers-=1
    #Get a usable dict from the collected data
    def get_dict(self):
        self.worker_stops+=str(self.bestworkers)
        return( {
            'name':self.name,
            'start_bo':self.start_bo,
            'units':self.units_t,
            'killed_early':self.killed_early_units.units,
            'worker_stops':self.worker_stops,
            'details':{
                'unit_list':self.unit_list,
                'build_list':self.build_list,
                'upgrade_list':self.upgrade_list,
                'worker_graph':self.worker_active_graph,
                'supply_graph':self.supply_graph
            }
        })
class RepParser:
    def __init__(self,repFile):
        self.replay=sc2reader.load_replay(repFile)
        self.repFile=repFile
        self.fullAnal()
    def format_time(self,time):
        out=str(time/60)+":"+str(time%60/10)+str(time%10)
        return(out)
    def fullAnal(self):
        replay=self.replay
        out={}
        out['file']=self.repFile
        myname="Fedak"
        REALTIME_GAMELOOP_SECONDS=1/22.4
        toSec=lambda t:math.floor(t*REALTIME_GAMELOOP_SECONDS)
        # Lets parse the fcking replay....
        # First basic info, like dat, map, mu, result, opponent
        # Also get the replay type. Allowed types: 
        # Practice (vs ai) ; Ladder 1v1 ; Custom 1v1 ; Obs
        out['date']=unicode(replay.end_time)
        out['map']=replay.map_name
        out['length']=unicode(replay.game_length)
        #figure out rep type, return if not interesting type
        #also figure out players
        if(len(replay.players)!=2):
            print("not supported replay: not 1v1")
            return(False)
        pld=[0,0,0]
        for p in replay.players:
            pld[p.pid]=Player_data_collector(p.name,p.play_race,p.result)
        pls=[pld[1],pld[2]]
        if(pls[1].name==myname):
            pls=[pls[1],pls[0]]
        out['type']="Custom"
        if(replay.is_ladder):
            out['type']="Ladder"
        if(pls[0].name!=myname):
            out['type']="Other"
        if("A.I." in pls[1].name):
            out['type']="Practice"
        
        out['mu']=pls[0].race[0]+"v"+pls[1].race[0]
        out['result']=pls[0].result
        # Ok, now cometh the juicy part... tracker events!
        # Some predefined sets are necessary
        # Also my target is: starting units, tech timings, worker graph+army graph, units lost @ beginning @4,@6,@10m
        workers=(u"Drone",u"SCV",u"Probe")
        opbuildings=(
            u"Barracks",u"Refinery",u"Factory",u"EngineeringBay",u"CommandCenter",
            u"MissileTurret",u"Bunker",u"SensorTower",u"GhostAcademy",u"Armory",
            u"Starport",u"FusionCore",
            u"Gateway",u"CyberneticsCore",u"Forge",u"Nexus",u"Stargate",u"TwilightCouncil",u"RoboticsFacility",
            u"Cannon",u"ShieldBattery",u"TemplarArchives",u"DarkShrine",u"RoboticsBay",u"FleetBeacon",
            u"Hatchery",u"Extractor",u"SpawningPool",u"EvolutionChamber",u"RoachWarren",u"BanelingNest",
            u"SpineCrawler",u"SporeCrawler",u"HydraliskDen",u"Spire",u"InfestationPit",u"NydusNetwork",
            u"UltraliskDen",u"GreaterSpire")
        buildings=opbuildings+(u"Pylon",u"SupplyDepot",u"Assimilator",u"TechLab",u"Reactor")
        units=(
            u"Marine",u"Marauder",u"Reaper",u"Ghost",u"Hellion",u"WidowMine",u"SiegeTank",u"Cyclone",u"Thor",
            u"Medivac",u"Viking",u"Banshee",u"Raven",u"Battlecruiser",u"Liberator",
            u"Zealot",u"Stalker",u"Sentry",u"Adept",u"HighTemplar",u"DarkTemplar",u"Immortal",u"WarpPrism",u"Observer",
            u"Disruptor",u"Colossus",u"Phoenix",u"Oracle",u"VoidRay",u"Tempest",u"Carrier",u"Mothership",u"Archon",
            u"Zergling",u"Roach",u"Ravager",u"Baneling",u"Queen",u"Hydralisk",u"Mutalisk",u"Infestor",u"Swarmhost",
            u"Lurker",u"Viper",u"Ultralisk",u"Broodlord",u"Corruptor",u"Overseer"    )
        allValid=workers+units+buildings
        namesResolver={
            u"VikingFighter":u"Viking"
        }
        def resolve(r):
            return(namesResolver.get(r,r))
        unsuspiciousUnits=workers+(u"MULE",u"AutoTurret",u"KD8Charge",u"Larva",u"Overlord",u"Broodling",u"Changeling",
                                    u"AdeptPhaseShift",u"ChangelingMarine",u"ChangelingZealot",u"ChangelingZerglilng",
                                    u"BroodlingEscort")

        # Structures for the fights tracking function
        fights=[]
        lastFight=False
        trackUnitsForFight=[0,Units_counter(),Units_counter()]

        # Go through the tracker events
        for tr in replay.tracker_events:
            if(tr.name=="UnitInitEvent" and tr.control_pid>0):
                uname=resolve(tr.unit_type_name)
                #Op buildings func
                if(uname in opbuildings):
                    pld[tr.control_pid].add_to_start_bo(uname)
                elif(uname in units):
                    #Op units func
                    pld[tr.control_pid].add_to_units(uname,toSec(tr.frame))
                    #Unit details func
                    pld[tr.control_pid].push_unit(uname,toSec(tr.frame))
                    #Fights func
                    trackUnitsForFight[tr.control_pid].push(uname,1)
                #Buildings detail func
                if(uname in buildings): 
                    pld[tr.control_pid].push_building(uname,toSec(tr.frame))

            if(tr.name=="UnitBornEvent" and tr.control_pid>0):
                uname=resolve(tr.unit_type_name)
                if(uname in units):
                    #Rep unit types
                    pld[tr.control_pid].add_to_units(uname,toSec(tr.frame))
                    #Units detail func
                    pld[tr.control_pid].push_unit(uname,toSec(tr.frame))
                    #Fights func
                    trackUnitsForFight[tr.control_pid].push(uname,1)
                #Worker stops func
                elif(uname in workers):
                    pld[tr.control_pid].add_worker(toSec(tr.frame))
                elif(uname not in unsuspiciousUnits and tr.second>0):
                    print("Suspicious unit:"+uname)
            if(tr.name=="UpgradeCompleteEvent" and tr.frame>0):
                #Upgrade details func
                if("Spray" not in tr.upgrade_type_name):
                    pld[tr.pid].push_upgrade(tr.upgrade_type_name,toSec(tr.frame))

            if(tr.name=="UnitDiedEvent"):
                if(tr.unit.owner and tr.unit.owner.pid>0):
                    uname=resolve(tr.unit.name)
                    if(uname in allValid and toSec(tr.frame)<480):
                        #Starting units lost func
                        pld[tr.unit.owner.pid].add_to_killed_early(uname)
                        #Fights func
                        if(tr.killer_pid):
                            timing=toSec(tr.frame)
                            pid=tr.unit.owner.pid
                            if(not lastFight):
                                lastFight=Fight(timing,trackUnitsForFight)
                            if(lastFight.checkFinish(timing)):
                                fights.append(lastFight)
                                lastFight=Fight(timing,trackUnitsForFight)
                            lastFight.pushUnitLost(timing,pid,uname)
                            if(not uname in workers):
                                trackUnitsForFight[pid].push(uname,-1)
                    #Worker stops func
                    if(uname in workers):
                        pld[tr.unit.owner.pid].kill_worker()


            #Detail graphs func
            if(tr.name=="PlayerStatsEvent"):
                pld[tr.pid].push_workers_active(tr.workers_active_count,toSec(tr.frame))
                pld[tr.pid].push_supply(tr.food_used,toSec(tr.frame))

        #Fights finishing touch
        if(not lastFight==False):
            fights.append(lastFight)
        out['fights']=[]
        for f in fights:
            out['fights'].append(f.get_dict())
        out['units_finishing']=[trackUnitsForFight[1].units,trackUnitsForFight[2].units]
        # Output the result
        out['players']=[pls[0].get_dict()]
        if(out['type']!="Practice"):
            out['players'].append(pls[1].get_dict())
        self.parsed=out
    def trackEvts(self):
        print('Tracking events:')
        out=[]
        for x in self.replay.tracker_events:
            print("["+str(x.__dict__.get('control_pid',''))+"] @"+str(x.second)+":"+x.name+" "+x.__dict__.get('unit_type_name',''))
        print('Finished listing')
        return(out)
    def dump(self):
        return(json.dumps(self.parsed,indent=4))

def main():
    #Settings (cause i dont wanna args)
    with open('rpSettings.json') as setFile:
        settings=json.load(setFile)

    #Testing mode
    if(settings["test"]=="on"):
        print("Test mode: parsing replay - "+settings["testReplay"])
        parser=RepParser(settings["testReplay"])
        if('parsed' in parser.__dict__):
            json.dumps(parser.parsed)
            json.dump(parser.parsed,open("test.json","wb"),indent=4)

            return()
    #mongodb
    cli=pymongo.MongoClient("mongodb://localhost:27017/")
    db=cli['RepParser']
    colReps=db['reps']
    colDirs=db['dirs']
    fd=colDirs.find_one({"name":"/Fedak"})

    hasher=hashlib.md5()

    path=fd['path']+"\\"
    files=os.listdir(path)
    oldFiles=fd.get('fileNames',[])
    repFiles=fd.get('reps',[])
    parsedFiles=[]
    numNewFiles=0
    for f in files:
        if(f not in oldFiles):
            print("Parsing replay:"+f)
            parser=RepParser(path+f)
            with open(path+f, 'rb') as afile:
                buf = afile.read()
                hasher.update(buf)
                afile.close()    
            hs=hasher.hexdigest()
            if('parsed' in parser.__dict__):
                parser.parsed['md5']=hs
                parser.parsed['dir']="/Fedak"
                res=colReps.replace_one({'md5':hs},parser.parsed,True)
                print(res.upserted_id)
            numNewFiles=numNewFiles+1
            parsedFiles.append(f)
    #Update parsed files
    oldFiles.extend(parsedFiles)
    colDirs.update_one({"name":"/Fedak"},{"$set":{"fileNames":oldFiles}})
    print(str(numNewFiles)+" new files found")
    #parsedreps.sort(key=lambda pr:pr['date'],reverse=True)
    #f=open('../public/replay.json','w')
    #json.dump(parsedreps,f,sort_keys=True,ensure_ascii=False)
    #parser.trackEvts()
if __name__=="__main__":
    main()