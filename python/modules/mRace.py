from .moduleBase import *
from .utils import Units_counter

class mRace(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Race tracker Module"
        self.outName="race"
    def _setupPDC(self):
        return {'race':""}
    def _feed(self,ev,pdc):
        if(pdc['race']==""):
            if(ev.name=="UnitBornEvent" or ev.name=="UnitInitEvent"):
                uname=resolve(ev.unit)
                if(uname==u"Probe"):
                    pdc['race']=u"Protoss"
                if(uname==u"Drone"):
                    pdc['race']=u"Zerg"
                if(uname==u"SCV"):
                    pdc['race']=u"Terran"
        return
    def _finish(self,pdc):
        return pdc['race']

