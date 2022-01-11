from .moduleBase import *
from .utils import Units_counter

class mUpgrades(ModuleBase):
    def __init__(self):
        ModuleBase.__init__(self)
        self.name="Upgrades Module"
        self.outName="upgrades"
    def _setupPDC(self):
        return {'unms':[],'out':[]}
    def _feed(self,ev,pdc):
        if(ev.name=="UpgradeEvent"):
            uname=resolve(ev.upgrade)
            if(ev.frame>0):
                if(uname not in pdc['unms']):
                    pdc['unms'].append(uname)
                    pdc['out'].append({'name':uname,'timing':self.toSec(ev.frame)})

        return
    def _finish(self,pdc):
       return pdc['out']

