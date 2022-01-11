# This is base module
# you are supposed to overwrite feed and output
import math

#Some predef values every module wants to use
WORKERS=(u"Drone",u"SCV",u"Probe")
OPBUILDINGS=(
            u"Barracks",u"Refinery",u"Factory",u"EngineeringBay",u"CommandCenter",
            u"MissileTurret",u"Bunker",u"SensorTower",u"GhostAcademy",u"Armory",
            u"Starport",u"FusionCore",
            u"Gateway",u"CyberneticsCore",u"Forge",u"Nexus",u"Stargate",u"TwilightCouncil",u"RoboticsFacility",
            u"PhotonCannon",u"ShieldBattery",u"TemplarArchives",u"DarkShrine",u"RoboticsBay",u"FleetBeacon",
            u"Hatchery",u"Extractor",u"SpawningPool",u"EvolutionChamber",u"RoachWarren",u"BanelingNest",
            u"SpineCrawler",u"SporeCrawler",u"HydraliskDen",u"Spire",u"InfestationPit",u"NydusNetwork",
            u"UltraliskDen",u"GreaterSpire",u"LurkerDenMP",u"Lair",u"Hive")
BUILDINGS=OPBUILDINGS+(u"Pylon",u"SupplyDepot",u"Assimilator",u"TechLab",u"Reactor")
UNITS=(
            u"Marine",u"Marauder",u"Reaper",u"Ghost",u"Hellion",u"WidowMine",u"SiegeTank",u"Cyclone",u"Thor",
            u"Medivac",u"Viking",u"Banshee",u"Raven",u"Battlecruiser",u"Liberator",
            u"Zealot",u"Stalker",u"Sentry",u"Adept",u"HighTemplar",u"DarkTemplar",u"Immortal",u"WarpPrism",u"Observer",
            u"Disruptor",u"Colossus",u"Phoenix",u"Oracle",u"VoidRay",u"Tempest",u"Carrier",u"Mothership",u"Archon",
            u"Zergling",u"Roach",u"Ravager",u"Baneling",u"Queen",u"Hydralisk",u"Mutalisk",u"Infestor",u"Swarmhost",
            u"Lurker",u"Viper",u"Ultralisk",u"BroodLord",u"Corruptor",u"Overseer"    )
ALL_VALID=WORKERS+UNITS+BUILDINGS+(u"Overlord",u"wtf")
NAMESRESOLVER={
            u"VikingFighter":u"Viking",
            u"LurkerMP":u"Lurker"
        }
def resolve(r):
            return(NAMESRESOLVER.get(r,r))
UNSUSPICIOUSUNITS=WORKERS+(u"MULE",u"AutoTurret",u"KD8Charge",u"Larva",u"Overlord",u"Broodling",u"Changeling",
                                    u"AdeptPhaseShift",u"ChangelingMarine",u"ChangelingZealot",u"ChangelingZerglilng",
                                    u"BroodlingEscort")


class ModuleBase:
    def __init__(self):
        self.name="Required"
        self.outName='required'
        REALTIME_GAMELOOP_SECONDS=1/22.4
        self.toSec=lambda t:math.floor(t*REALTIME_GAMELOOP_SECONDS)
        self.reset([])
    def reset(self,players):
        self._players=players
        self._pdc={}
        for p in players:
            self._pdc[p]=self._setupPDC()
    def feed(self,event):
        if(event.pid in self._players):
            self._feed(event,self._pdc[event.pid])
    def finish(self,out):
        sv=[]
        for pl in self._players:
            sv.append(self._finish(self._pdc[pl]))
        out[self.outName]=sv

    def _setupPDC(self):
        return {}
    def _feed(self,event,pdc):
        return 'a'
        #needs to be implemented
    def _finish(self,pdc):
        return 'a'
        #needs to be implemented